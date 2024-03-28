/* global getApp */
import { getChapter, useSimpleSurahName } from './storage/localStorage'
import { JUZS } from '../page/test-data/juzs'
import { _ } from './i18n/lang'
import {
  MAIN_COLOR,
  MAIN_COLOR_TXT,
  SECONDARY_COLOR,
  SECONDARY_COLOR_TXT,
  WARNING_COLOR,
  WARNING_COLOR_TXT
} from './mmk/UiParams'
import { getScrollTop } from '@zos/page'
import { push } from '@zos/router'
import { getChapterVerses } from './utils'

const playerPage = 'page/player'

export function getRows () {
  const rows = []

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

  return rows
}

export function addNextPreviousButton (label, pageNumber, rtl) {
  return {
    text: _(label),
    color: WARNING_COLOR_TXT,
    card: {
      color: 0x123456,
      callback: () => {
        getApp()._options.globalData.pageNumber = pageNumber
        this.render()
      }
    },
    iconText: rtl ? label === 'Next' ? '←' : '→' : label === 'Next' ? '→' : '←',
    iconColor: WARNING_COLOR
  }
}

function addJuzRow (juzNumber) {
  return {
    text: `${_('Juz\'')} ${_(`${juzNumber}`)}`,
    color: MAIN_COLOR_TXT,
    card: {
      callback: () => {
        getApp()._options.globalData.scrollTop = getScrollTop()
        push({
          url: playerPage,
          params: getJuzVerses(juzNumber).join(',')
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
        getApp()._options.globalData.scrollTop = getScrollTop()
        push({
          url: playerPage,
          params: getChapterVerses(surahNumber).join(',')
        })
      }
    },

    description: translation,
    iconText: _(surahNumber),
    iconColor: SECONDARY_COLOR
  }
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
