/* global getApp, Page */
import { showToast } from 'zeppos-cross-api/interaction'
import { createLoadingWidget } from '../../components/loadingWidget'
import { SettingsLangScreen } from '../../components/settingsLangScreen'
import { getChaptersLang, setChaptersLang } from '../../lib/config/default'
Page({
  onInit () {
    createLoadingWidget((data) => this.onLoadingComplete(data))

    console.log('Getting languages')
    getApp()._options.globalData.basePage.request({
      method: 'get.chapters.langs',
      params: ''
    })
  },

  onLoadingComplete (data) {
    if (data.languages) {
      this.onLangsReceived(data.languages)
    } else {
      this.onErrorReceived()
    }
  },

  onErrorReceived () {
    console.log('Error while retrieving languages')
    showToast({ content: 'Error while retrieving languages, Try again later' })
    // setTimeout(() => back(), 5000)
  },

  onLangsReceived (languages) {
    if (languages) {
      this.screen = new SettingsLangScreen(languages, getChaptersLang(), setChaptersLang)
      this.screen.start()
    } else {
      this.onLangsReceived()
    }
  }
})
