/* global getApp */
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { setWakeUpRelaunch } from '@zos/display'
import {
  getLang,
  setChapters,
  setEnChapters,
  setLang,
  setRecitation, setVerseInfo
} from '../libs/storage/localStorage.js'
import { DEVICE_LANG } from '../libs/i18n/lang'
import { quranComApiModule } from '../components/quran-com-api-module'
import { unDefChapters } from './data/chapters'

const logger = log.getLogger('start.page')

export function StartPage (extraOptions) {
  return BasePage({
    onInit () {
      setWakeUpRelaunch({
        relaunch: true
      })

      getApp()._options.globalData.basePage = this
    },

    onDestroy () {
      logger.log('start page on destroy invoke')
    },

    onCall (data) {
      if (getApp()._options.globalData.player === undefined) return

      if (data.curDownVerse !== undefined) {
        getApp()._options.globalData.player.updateStatus(data.curDownVerse)
      } else if (data.verse !== undefined) {
        setVerseInfo(data.verse, data.mapping)
      }
    },

    onSettings () {
      const { settings } = getApp()._options.globalData
      setRecitation(settings.recitation)
      const lastLangCode = getLang()
      console.log(JSON.stringify(lastLangCode))
      const { lang } = settings
      console.log(JSON.stringify(settings))
      const langCode = lang ? lang.split(',')[1] : DEVICE_LANG().split('-')[0]
      console.log(JSON.stringify(langCode))
      getApp()._options.globalData.langCode = langCode
      const caller = this
      if (lastLangCode !== langCode) {
        this.onGettingChapters()
        if (langCode === 'en' || langCode === 'ar') {
          setTimeout(() => {
            setLang(langCode)
            setEnChapters()
            this.start()
          }, 50)
        } else {
          quranComApiModule.getChapters(this, langCode, (theChapters) => {
            setLang(langCode)
            setChapters(theChapters.map(chapter => {
              return {
                name_simple: chapter.name_simple,
                name_complex: chapter.name_complex,
                name_arabic: chapter.name_arabic,
                translated_name: chapter.translated_name.name
              }
            }))
            caller.start()
          })
        }
      } else {
        this.start()
      }
    },

    getSideAppSettings () {
      this.onGettingSetting()
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

    initialize () {
      this.getSideAppSettings()
    },

    start () {
      unDefChapters()
      this.createWidgets()
    },

    onGettingChapters () {},
    onGettingSetting () {},
    createWidgets () {},

    ...extraOptions
  })
}
