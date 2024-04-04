/* global getApp */
import { getChapter, getChaptersListRow, setChaptersListRow, useSimpleSurahName } from '../libs/storage/localStorage'
import { getVerseMapping } from '../page/data/juzs'
import { _, isRtlLang } from '../libs/i18n/lang'
import {
  MAIN_COLOR,
  MAIN_COLOR_TXT,
  SECONDARY_COLOR,
  SECONDARY_COLOR_TXT,
  WARNING_COLOR,
  WARNING_COLOR_TXT
} from '../libs/mmk/UiParams'
import { push } from '@zos/router'
import { ListScreen } from '../libs/mmk/ListScreen'
import { NUM_JUZS, NUM_PAGES } from '../libs/constants'
import hmUI from '@zos/ui'
import { PLAYER_TYPE_CHAPTER, PLAYER_TYPE_JUZ } from './quranPlayer'

const playerPage = 'page/player'
const NUM_ROWS = 144
const NUM_PER_PAGE = Math.ceil(NUM_ROWS / NUM_PAGES)
export class ChaptersScreen extends ListScreen {
  #pageNumber
  #start
  #end

  constructor () {
    super(isRtlLang())
  }

  start () {
    this.#render()
  }

  #render () {
    this.#pageNumber = getApp()._options.globalData.pageNumber
    this.#start = this.#pageNumber * NUM_PER_PAGE
    this.#end = this.#start + pageLength(this.#pageNumber)
    let pos = 0
    if (this.#pageNumber > 0) {
      this.replaceOrCreateRow(this.#addNextPreviousButton('Previous', this.#pageNumber - 1), pos++)
    }

    for (let i = this.#start; i < this.#end; i++) {
      this.replaceOrCreateRow(this.#getRow(i), pos++)
    }

    if (this.#pageNumber < (NUM_PAGES - 1)) {
      this.replaceOrCreateRow(this.#addNextPreviousButton('Next', this.#pageNumber + 1), pos++)
    }

    this.replaceOrCreateRow({ }, pos++)
    this.finalize(pos, getApp()._options.globalData.scrollTop)
  }

  #getRow (rowNumber) {
    const row = getRow(rowNumber)
    row.card = {
      callback: () => {
        getApp()._options.globalData.scrollTop = this.vc.getProperty(hmUI.prop.POS_Y)
        push({
          url: playerPage,
          params: `type=${row.type}&number=${row.number}`
        })
      }
    }

    return row
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

function pageLength (pageNumber) {
  return pageNumber === (NUM_PAGES - 1) ? (((NUM_ROWS - 1) % NUM_PER_PAGE) + 1) : NUM_PER_PAGE
}

export function getRow (rowNumber) {
  const row = getChaptersListRow(rowNumber)
  if (row !== undefined) return row

  const rows = []
  const ar = getApp()._options.globalData.langCode === 'ar'
  const useSimpleNames = useSimpleSurahName() === 'true'
  const nameKey = ar ? 'name_arabic' : useSimpleNames ? 'name_simple' : 'name_complex'
  let lastSurahNumber = -1
  for (let i = 0; i < NUM_JUZS; i++) {
    rows.push(addJuzRow(i + 1))
    const verseMapping = getVerseMapping(i)
    for (const surahNumber in verseMapping) {
      if (lastSurahNumber === surahNumber) continue

      const chapter = getChapter(surahNumber - 1)
      const name = chapter[nameKey]
      const translation = ar ? '' : chapter.translated_name
      rows.push(addChapterRow(surahNumber, name, translation))
      lastSurahNumber = surahNumber
    }
  }

  for (let i = 0; i < rows.length; i++) {
    setChaptersListRow(i, rows[i])
  }

  console.log('Initialized Rows')
  return rows[rowNumber]
}

function addJuzRow (juzNumber) {
  return {
    type: PLAYER_TYPE_JUZ,
    number: juzNumber,
    text: `${_('Juz\'')} ${_(`${juzNumber}`)}`,
    color: MAIN_COLOR_TXT,
    iconColor: MAIN_COLOR
  }
}

function addChapterRow (surahNumber, name, translation) {
  return {
    type: PLAYER_TYPE_CHAPTER,
    number: surahNumber,
    text: `${_('Surah')} ${name}`,
    color: SECONDARY_COLOR_TXT,
    description: translation,
    iconText: _(surahNumber),
    iconColor: SECONDARY_COLOR
  }
}
