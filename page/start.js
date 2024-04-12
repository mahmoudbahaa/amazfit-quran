/* global getApp, Page */
import { setVerseInfo } from '../lib/config/verse.js'

Page({
  onCall (data) {
    if (getApp()._options.globalData.player !== undefined) {
      if (data.curDownVerse !== undefined) {
        getApp()._options.globalData.player.updateStatus(data.curDownVerse)
      } else if (data.verse !== undefined) {
        setVerseInfo(data.verse, data.mapping)
      }
    }
  }

  // start () {
  //   unDefChapters()
  //   deleteLoadingWidget()
  // }
})
