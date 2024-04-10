/* global getApp, Page */
import { BasePage } from '@zeppos/zml/base-page'
import { replace } from '@zos/router'
import { log } from '@zos/utils'
import { deleteLoadingWidget, updateStatus } from '../components/loadingWidget'
import { quranComApiModule } from '../components/quran-com-api-module'
import {
  getChaptersLang,
  getSavedChaptersLang,
  removeChaptersListRows,
  setChapters,
  setSavedChaptersLang
} from '../libs/config/default.js'
import { setEnChapters } from '../libs/config/enChapters.js'
import { setVerseInfo } from '../libs/config/verse.js'
import { MIN_TIMEOUT_DURATION } from '../libs/constants'
import { DEVICE_LANG, _ } from '../libs/i18n/lang'

const logger = log.getLogger('start.page')

Page(
  BasePage({
    onInit () {
      getApp()._options.globalData.basePage = this

      replace({
        url: 'page/home'
      })
    },

    onDestroy () {
      logger.log('start page on destroy invoke')
    },

    onCall (data) {
      if (getApp()._options.globalData.player === undefined) {
        deleteLoadingWidget(data)
      } else {
        if (data.curDownVerse !== undefined) {
          getApp()._options.globalData.player.updateStatus(data.curDownVerse)
        } else if (data.verse !== undefined) {
          setVerseInfo(data.verse, data.mapping)
        }
      }
    },

    getChapters () {
      const savedChaptersLang = getSavedChaptersLang()
      const chaptersLang = getChaptersLang() || DEVICE_LANG().split('-')[0]
      console.log('savedChaptersLang=' + savedChaptersLang)
      console.log('chaptersLang=' + chaptersLang)
      updateStatus(_('Getting Chapters'))
      if (savedChaptersLang === chaptersLang) {
        deleteLoadingWidget()
        return
      }

      if (chaptersLang === 'en' || chaptersLang === 'ar') {
        setTimeout(() => {
          removeChaptersListRows()
          setSavedChaptersLang(chaptersLang)
          setEnChapters()
          deleteLoadingWidget()
        }, MIN_TIMEOUT_DURATION)
      } else {
        quranComApiModule.getChapters(this, chaptersLang, (theChapters) => {
          removeChaptersListRows()
          setSavedChaptersLang(chaptersLang)
          setChapters(theChapters.map(chapter => {
            return {
              name_simple: chapter.name_simple,
              name_complex: chapter.name_complex,
              name_arabic: chapter.name_arabic,
              translated_name: chapter.translated_name.name
            }
          }))
          deleteLoadingWidget()
        })
      }
    }
    // start () {
    //   unDefChapters()
    //   deleteLoadingWidget()
    // }
  })
)
