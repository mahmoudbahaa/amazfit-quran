/* global getApp */
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { setWakeUpRelaunch } from '@zos/display'
import {
  getLang,
  setChapters,
  setLang,
  setRecitation
} from '../libs/storage/localStorage.js'
import { DEVICE_LANG } from '../libs/i18n/lang'
import { quranComApiModule } from '../components/quran-com-api-module'

const logger = log.getLogger('start.page')

export function SelectPage (extraOptions) {
  return BasePage({
    onInit () {
      setWakeUpRelaunch({
        relaunch: true
      })
    },

    onDestroy () {
      logger.log('start page on destroy invoke')
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
        this.onGettingChapters()
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
        const settings = result.data
        settings.recitation = settings.recitation || 'Mishari Rashid al-`Afasy,7'
        getApp()._options.globalData.settings = settings
        this.onSettings()
      }).catch(error => {
        logger.log('Error while retrieving settings ' + error)
      })
    },
    onGettingChapters () {},
    createWidgets () {},

    ...extraOptions
  })
}
