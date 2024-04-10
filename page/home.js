/* global Page */
import { setWakeUpRelaunch } from '@zos/display'
import { exit } from '@zos/router'
import { showToast } from '@zos/ui'
import { clearConfig, clearData, getFontSize } from '../libs/config/default'
import { _ } from '../libs/i18n/lang'
import { ListScreen } from '../libs/mmk/ListScreen'
import { openPage } from '../libs/utils'

class HomePage extends ListScreen {
  constructor () {
    super()
    this.fontSize = getFontSize()
  }

  start () {
    this.row({
      text: _('Next'),
      icon: 'menu/next.png',
      card: { callback: () => openPage('page/select') }
    })
    this.row({
      text: _('Settings'),
      icon: 'menu/ui.png',
      card: { callback: () => openPage('page/settings/home') }
    })
    this.row({
      text: _('Tools'),
      icon: 'menu/toolbox.png',
      card: { callback: () => openPage('page/file/home') }
    })
    this.row({
      text: _('Clear Configurations and exit'),
      icon: 'menu/delete.png',
      card: {
        callback: () => {
          const result = clearConfig()
          showToast({ text: result ? 'cleared' : 'not cleared\n try again later' })
          setTimeout(() => exit(), 5000)
        }
      }
    })
    this.row({
      text: _('Clear Data and exit'),
      icon: 'menu/delete.png',
      card: {
        callback: () => {
          const result = clearData()
          showToast({ text: result ? 'cleared' : 'not cleared\n try again later' })
          setTimeout(() => exit(), 5000)
        }
      }
    })
    this.row({
      text: _('About'),
      icon: 'menu/info.png',
      card: { callback: () => openPage('page/about') }
    })
    this.finalize()
  }
}

Page({
  onInit () {
    setWakeUpRelaunch({
      relaunch: true
    })
  },

  build () {
    this.screen = new HomePage()
    this.screen.start()
  },

  onDestroy () {
    console.log('Home page onDestroy')
    this.screen.stop()
  }
})
