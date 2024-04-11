/* global getApp, Page */
import { log } from 'zeppos-cross-api/utils'
import { ChaptersScreen } from '../components/chaptersList'
import { createLoadingWidget } from '../components/loadingWidget'
import { restorePlayer } from '../lib/utils'

const logger = log.getLogger('select.page')

Page({
  // onInit () {
  //   setWakeUpRelaunch({
  //     relaunch: true
  //   })
  // },

  createWidgets () {
    logger.log('Inside Create Widgets')
    this.screen = new ChaptersScreen()
    this.screen.start()
  },

  build () {
    if (getApp()._options.globalData.restorePlayer) {
      getApp()._options.globalData.restorePlayer = false
      if (restorePlayer()) return
    }

    createLoadingWidget(() => this.createWidgets())
    getApp()._options.globalData.basePage.getChapters()
  },

  onDestroy () {
    if (this.screen) this.screen.stop()
  }
})
