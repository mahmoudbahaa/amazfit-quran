/* global getApp, Page */
import hmUI from '@zos/ui'
import { log } from '@zos/utils'
import { push } from '@zos/router'
import { BasePage } from '@zeppos/zml/base-page'
import { setWakeUpRelaunch } from '@zos/display'
import { nextChapterEnd, nextChapterStart } from '../libs/utils.js'
import {
  getChapter,
  getLang,
  setChapters,
  setLang,
  setRecitation,
  useSimpleSurahName
} from '../libs/storage/localStorage.js'
import { createLoadingWidget, deleteLoadingWidget } from '../components/loading-anim'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { JUZS } from './test-data/juzs'
import { CHAPTERS } from './test-data/chapters'
import { NUM_CHAPTERS, NUM_VERSES } from '../libs/constants'
import { quranComApiModule } from '../components/quran-com-api-module'
import {
  MAIN_COLOR,
  MAIN_COLOR_TXT,
  SECONDARY_COLOR,
  SECONDARY_COLOR_TXT,
  WARNING_COLOR,
  WARNING_COLOR_TXT
} from '../libs/mmk/UiParams'
import { apiCall } from '../components/api-caller'
import * as Styles from './style.r.layout.js'
import { ListScreen } from '../libs/mmk/ListScreen'

const logger = log.getLogger('select.page')
const thisPage = 'page/select'
const playerPage = 'page/player'
let rtl

Page(
  BasePage({
    onInit () {
      setWakeUpRelaunch({
        relaunch: true
      })
    },

    onDestroy () {
      logger.log('select page on destroy invoke')
    },

    onSettings () {
      const { settings } = getApp()._options.globalData
      setRecitation(settings.recitation)
      const lastLangCode = getLang()
      console.log(JSON.stringify(lastLangCode))
      const { lang } = settings
      console.log(JSON.stringify(settings))
      const langCode = lang ? lang.isoCode : DEVICE_LANG()
      console.log(JSON.stringify(langCode))
      getApp()._options.globalData.langCode = langCode
      rtl = isRtlLang(langCode)
      const caller = this
      if (lastLangCode !== langCode) {
        quranComApiModule.getChapters(this, langCode, (theChapters) => {
          this.state.chapters = theChapters
          setLang(langCode)
          setChapters(theChapters)
          caller.createWidgets()
        })
      } else {
        this.createWidgets()
      }
    },

    onCall (result) {
      const { req } = result

      if (!result.success || req.params.page !== thisPage) return

      switch (req.method) {
        case 'getSettings': {
          if (getApp()._options.globalData.settings) break
          getApp()._options.globalData.settings = result.settings
          this.onSettings()
          break
        }
      }
    },

    createWidgets () {
      new ChaptersScreen().start(0, nextChapterEnd(0))
      deleteLoadingWidget()
    },

    build () {
      createLoadingWidget(hmUI)

      if (getApp()._options.globalData.settings) {
        setTimeout(this.onSettings, 200)
      } else {
        apiCall('getSettings', this, thisPage)
      }

      // setRecitation('Mishari Rashid al-`Afasy,7,0')
      // setChapters(CHAPTERS)
      // this.createWidgets()
    }
  })
)

let lastSurahNumber = -1

class ChaptersScreen extends ListScreen {
  constructor () {
    super(rtl)
  }

  start (start, end) {
    render(this, start, end)
  }
}

function render (screen, start, end) {
  let listIndex = 0

  if (start > 0) {
    addNextPreviousButton(screen, 'Previous', nextChapterStart(start), start, listIndex++)
  }

  const ar = getApp()._options.globalData.settings.lang.isoCode === 'ar'
  const useSimpleNames = useSimpleSurahName() === 'true'
  const nameKey = ar ? 'name_arabic' : useSimpleNames ? 'name_simple' : 'name_complex'

  let verseMapping
  let surahNumber
  let chapter
  let name
  let translation
  JUZS.slice(start, end).forEach((juz) => {
    addJuzRow(screen, juz.juz_number, listIndex++)

    verseMapping = juz.verse_mapping
    for (surahNumber in verseMapping) {
      if (lastSurahNumber === surahNumber) continue

      chapter = getChapter(surahNumber - 1)
      name = chapter[nameKey]
      translation = ar ? '' : chapter.translated_name.name
      addChapterRow(screen, surahNumber, name, translation, listIndex++)
      lastSurahNumber = surahNumber
    }
  })

  if (end < NUM_CHAPTERS) {
    addNextPreviousButton(screen, 'Next', end, nextChapterEnd(end), listIndex++)
  }

  screen.finalize(listIndex)
}

function addNextPreviousButton (listScreen, label, newStart, newEnd, listIndex) {
  listScreen.replaceOrCreateRow({
    ...Styles.ROW_STYLE,
    text: _(label),
    rtl,
    color: WARNING_COLOR_TXT,
    card: {
      ...Styles.ROW_STYLE.card,
      color: 0x123456,
      callback: () => {
        render(listScreen, newStart, newEnd)
      }
    },
    iconText: rtl ? label === 'Next' ? '←' : '→' : label === 'Next' ? '→' : '←',
    iconColor: WARNING_COLOR,
    alignH: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT
  }, listIndex)
}

function addJuzRow (listScreen, juzNumber, listIndex) {
  listScreen.replaceOrCreateRow({
    ...Styles.ROW_STYLE,
    text: `${_('Juz\'')} ${_(`${juzNumber}`)}`,
    color: MAIN_COLOR_TXT,
    rtl,
    card: {
      ...Styles.ROW_STYLE.card,
      callback: () => {
        getApp()._options.globalData.verses = getJuzVerses(juzNumber)
        push({
          url: playerPage
        })
      }
    },
    iconColor: MAIN_COLOR,
    alignH: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT
  }, listIndex)
}

function addChapterRow (listScreen, surahNumber, name, translation, listIndex) {
  listScreen.replaceOrCreateRow({
    ...Styles.ROW_STYLE,
    text: `${_('Surah')} ${name}`,
    color: SECONDARY_COLOR_TXT,
    rtl,
    card: {
      ...Styles.ROW_STYLE.card,
      callback: () => {
        getApp()._options.globalData.verses = getChapterVerses(surahNumber)
        push({
          url: playerPage
        })
      }
    },

    description: translation,
    iconText: _(surahNumber),
    iconColor: SECONDARY_COLOR,
    alignH: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT
  }, listIndex)
}

function getJuzVerses (juzNumber) {
  const verseMapping = JUZS[juzNumber - 1].verse_mapping
  const verses = []
  const surahes = []
  for (const surah in verseMapping) {
    surahes.push(parseInt(surah))
  }

  surahes.sort()
  surahes.forEach((surah) => {
    const verseSingleMapping = verseMapping[surah + '']
    const start = verseSingleMapping.split('-')[0]
    const end = verseSingleMapping.split('-')[1]
    for (let i = start; i <= end; i++) {
      verses.push(surah + ':' + i)
    }
  })

  return verses
}

function getChapterVerses (surahNumber) {
  const verses = []
  for (let i = 1; i <= NUM_VERSES[surahNumber - 1]; i++) {
    verses.push(`${surahNumber}:${i}`)
  }

  return verses
}
