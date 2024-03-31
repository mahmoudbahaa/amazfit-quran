/* global getApp */
import { getChapter, getChaptersListRows, setChaptersListRows, useSimpleSurahName } from '../libs/storage/localStorage'
import { JUZS } from '../page/test-data/juzs'
import { _, isRtlLang } from '../libs/i18n/lang'
import {
  BLACK,
  MAIN_COLOR,
  MAIN_COLOR_TXT,
  SECONDARY_COLOR,
  SECONDARY_COLOR_TXT,
  WARNING_COLOR,
  WARNING_COLOR_TXT
} from '../libs/mmk/UiParams'
import { push } from '@zos/router'
import { ListScreen } from '../libs/mmk/ListScreen'
import { NUM_PAGES } from '../libs/constants'
import { deleteLoadingWidget } from './loadingWidget'
import hmUI from '@zos/ui'
import { PLAYER_TYPE_CHAPTER, PLAYER_TYPE_JUZ } from './quranPlayer'

const playerPage = 'page/player'

export class ChaptersScreen extends ListScreen {
  constructor () {
    super(isRtlLang(getApp()._options.globalData.langCode))
    this.rows = this.#getRows()
    const numPerPage = Math.floor(this.rows.length / NUM_PAGES)
    this.boundaries = Array.from({ length: NUM_PAGES + 1 })
    this.boundaries[0] = 0
    this.boundaries[NUM_PAGES] = this.rows.length
    for (let i = 1; i < NUM_PAGES; i++) {
      this.boundaries[i] = i * numPerPage
    }
  }

  start () {
    this.#render()
  }

  #render () {
    const pageNumber = getApp()._options.globalData.pageNumber
    const start = this.boundaries[pageNumber]
    const end = this.boundaries[pageNumber + 1]
    let pos = 0
    if (start > 0) {
      const prev = this.#addNextPreviousButton('Previous', pageNumber - 1)
      this.replaceOrCreateRow(prev, pos++)
    }

    this.#renderRow(start, pos, end, pageNumber)
  }

  #renderRow (idx, pos, end, pageNumber) {
    if (idx >= end) {
      if (end < this.rows.length) {
        const next = this.#addNextPreviousButton('Next', pageNumber + 1)
        this.replaceOrCreateRow(next, pos++)
      }

      this.replaceOrCreateRow({ }, pos++)
      this.finalize(pos, getApp()._options.globalData.scrollTop)
      deleteLoadingWidget()
      return
    }

    this.replaceOrCreateRow(this.rows[idx], pos)
    setTimeout(() => this.#renderRow(idx + 1, pos + 1, end, pageNumber), 1)
  }

  #getRows () {
    return getRows()
  }

  #addNextPreviousButton (label, pageNumber) {
    return {
      text: _(label),
      color: WARNING_COLOR_TXT,
      card: {
        color: 0x123456,
        callback: () => {
          getApp()._options.globalData.pageNumber = pageNumber
          this.#render()
        }
      },
      iconText: this.rtl ? label === 'Next' ? '←' : '→' : label === 'Next' ? '→' : '←',
      iconColor: WARNING_COLOR
    }
  }
}

export function getRows () {
  console.log('Getting rows')
  let rows = getChaptersListRows()
  if (rows !== undefined) {
    console.log('Got Rows')
    return rows
  }

  rows = []
  const ar = getApp()._options.globalData.langCode === 'ar'
  const useSimpleNames = useSimpleSurahName() === 'true'
  const nameKey = ar ? 'name_arabic' : useSimpleNames ? 'name_simple' : 'name_complex'
  let lastSurahNumber = -1
  JUZS.forEach((juz) => {
    rows.push(addJuzRow(juz.juz_number))
    const verseMapping = juz.verse_mapping
    for (const surahNumber in verseMapping) {
      if (lastSurahNumber === surahNumber) continue

      const chapter = getChapter(surahNumber - 1)
      const name = chapter[nameKey]
      const translation = ar ? '' : chapter.translated_name.name
      rows.push(addChapterRow(surahNumber, name, translation))
      lastSurahNumber = surahNumber
    }
  })

  setChaptersListRows(rows)
  console.log('Got Rows')

  return rows
}

function addJuzRow (juzNumber) {
  return {
    text: `${_('Juz\'')} ${_(`${juzNumber}`)}`,
    color: MAIN_COLOR_TXT,
    card: {
      callback: () => {
        getApp()._options.globalData.scrollTop = this.vc.getProperty(hmUI.prop.POS_Y)
        push({
          url: playerPage,
          params: `type=${PLAYER_TYPE_JUZ}&number=${juzNumber}`
        })
      }
    },
    iconColor: MAIN_COLOR
  }
}

function addChapterRow (surahNumber, name, translation) {
  return {
    text: `${_('Surah')} ${name}`,
    color: SECONDARY_COLOR_TXT,
    card: {
      callback: () => {
        getApp()._options.globalData.scrollTop = this.vc.getProperty(hmUI.prop.POS_Y)
        push({
          url: playerPage,
          params: `type=${PLAYER_TYPE_CHAPTER}&number=${surahNumber}`
        })
      }
    },

    description: translation,
    iconText: _(surahNumber),
    iconColor: SECONDARY_COLOR
  }
}
