/* global getApp, Page */
import { log } from '@zos/utils'
import { scrollTo } from '@zos/page'
import { BasePage } from '../libs/zml/dist/zml-page'
import { setWakeUpRelaunch } from '@zos/display'
import {
  getLang,
  setChapters,
  setLang,
  setRecitation
} from '../libs/storage/localStorage.js'
import { createLoadingWidget, deleteLoadingWidget } from '../components/loading-anim'
import { DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { NUM_PAGES } from '../libs/constants'
import { quranComApiModule } from '../components/quran-com-api-module'
import { ListScreen } from '../libs/mmk/ListScreen'
import { addNextPreviousButton, getRows } from '../libs/chaptersListRows'

const logger = log.getLogger('select.page')
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
      const langCode = lang ? lang.split(',')[1] : DEVICE_LANG()
      console.log(JSON.stringify(langCode))
      getApp()._options.globalData.langCode = langCode
      rtl = isRtlLang(langCode)
      const caller = this
      if (lastLangCode !== langCode) {
        quranComApiModule.getChapters(this, langCode, (theChapters) => {
          setLang(langCode)
          setChapters(theChapters)
          caller.createWidgets()
        })
      } else {
        this.createWidgets()
      }
    },

    getSideAppSettings () {
      this.getSettings(['lang', 'recitation'])
        .then(settings => {
          settings.recitation = settings.recitation || 'Mishari Rashid al-`Afasy,7'
          getApp()._options.globalData.settings = settings
          this.onSettings()
        }).catch(error => {
          logger.log('Error while retrieving settings ' + error)
        })
    },

    createWidgets () {
      console.log('Inside Create Widgets')
      new ChaptersScreen(getRows()).start()
    },

    build () {
      createLoadingWidget()

      if (getApp()._options.globalData.settings) {
        setTimeout(() => this.onSettings(), 50)
      } else {
        this.getSideAppSettings()
      }

      // setRecitation('Mishari Rashid al-`Afasy,7,0')
      // setChapters(CHAPTERS)
      // this.createWidgets()
    }
  })
)

class ChaptersScreen extends ListScreen {
  constructor (rows) {
    super(rtl)
    this.rows = rows
    const numPerPage = Math.floor(this.rows.length / NUM_PAGES)
    this.boundaries = Array.from({ length: NUM_PAGES + 1 })
    this.boundaries[0] = 0
    this.boundaries[NUM_PAGES] = this.rows.length
    for (let i = 1; i < NUM_PAGES; i++) {
      this.boundaries[i] = i * numPerPage
    }
  }

  start () {
    this.render()
  }

  render () {
    const pageNumber = getApp()._options.globalData.pageNumber
    const start = this.boundaries[pageNumber]
    const end = this.boundaries[pageNumber + 1]
    let pos = 0
    if (start > 0) {
      const prev = addNextPreviousButton('Previous', pageNumber - 1, rtl)
      this.replaceOrCreateRow(prev, pos++)
    }

    this.renderRow(start, pos, end, pageNumber)
  }

  renderRow (idx, pos, end, pageNumber) {
    if (idx >= end) {
      if (end < this.rows.length) {
        const next = addNextPreviousButton('Next', pageNumber + 1, rtl)
        this.replaceOrCreateRow(next, pos++)
      }

      this.finalize(pos)
      scrollTo({
        y: getApp()._options.globalData.scrollTop
      })
      deleteLoadingWidget()
      return
    }

    this.replaceOrCreateRow(this.rows[idx], pos)
    setTimeout(() => this.renderRow(idx + 1, pos + 1, end, pageNumber), 1)
  }
}
