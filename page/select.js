/* global getApp, Page */
import { log } from '@zos/utils'
// import { BasePage } from '../libs/zml/dist/zml-page'
import { BasePage } from '@zeppos/zml/base-page'
import { setWakeUpRelaunch } from '@zos/display'
import {
  getLang,
  setChapters,
  setLang,
  setRecitation
} from '../libs/storage/localStorage.js'
import { createLoadingWidget } from '../components/loadingWidget'
import { DEVICE_LANG } from '../libs/i18n/lang'
import { quranComApiModule } from '../components/quran-com-api-module'
import { ChaptersScreen } from '../components/chaptersList'

const logger = log.getLogger('select.page')

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
      this.request({
        method: 'get.settings',
        params: ['lang', 'recitation']
      }).then(result => {
        console.log(JSON.stringify(result))
        const settings = result.data
        settings.recitation = settings.recitation || 'Mishari Rashid al-`Afasy,7'
        getApp()._options.globalData.settings = settings
        this.onSettings()
      }).catch(error => {
        logger.log('Error while retrieving settings ' + error)
      })
    },

    createWidgets () {
      console.log('Inside Create Widgets')
      new ChaptersScreen(this.state.rtl).start()
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
