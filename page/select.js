/* global getApp, Page */
import { log } from '@zos/utils'
import { ChaptersScreen } from '../components/chaptersList'
import { setWakeUpRelaunch } from '@zos/display'
import { restorePlayer } from '../libs/utils'

const logger = log.getLogger('select.page')

Page({
  onInit () {
    setWakeUpRelaunch({
      relaunch: true
    })
  },

  createWidgets () {
    logger.log('Inside Create Widgets')
    new ChaptersScreen(this.state.rtl).start()
  },

  build () {
    if (getApp()._options.globalData.restorePlayer) {
      getApp()._options.globalData.restorePlayer = false
      if (restorePlayer()) return
    }

    this.createWidgets()
  }
})
