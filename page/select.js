/* global getApp, Page */
import { log } from '@zos/utils'
import { createLoadingWidget } from '../components/loadingWidget'
import { ChaptersScreen } from '../components/chaptersList'
import { setWakeUpRelaunch } from '@zos/display'
import { restorePlayer } from '../libs/utils'

const logger = log.getLogger('select.page')

Page({
  onInit () {
    setWakeUpRelaunch({
      relaunch: true
    })

    if (getApp()._options.globalData.restorePlayer) {
      getApp()._options.globalData.restorePlayer = false
      restorePlayer()
    }
  },

  createWidgets () {
    logger.log('Inside Create Widgets')
    new ChaptersScreen(this.state.rtl).start()
  },

  build () {
    createLoadingWidget()
    setTimeout(() => this.createWidgets(), 50)
  }
})
