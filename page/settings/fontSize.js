/* global Page */
import hmUI from 'zeppos-cross-api/ui'
import { getFontSize, setFontSize } from '../../lib/config/default'
import { FontSizeSetupScreen } from '../../lib/mmk/FontSizeSetupScreen'

class ConfiguredFontSizeSetupScreen extends FontSizeSetupScreen {
  constructor () {
    super()
    this.fontSize = getFontSize()
  }

  getSavedFontSize (fallback) {
    return getFontSize() || fallback
  }

  onChange (value) {
    setFontSize(value)
  }
}

Page({
  onInit () {
    hmUI.setStatusBarVisible(true)
    hmUI.updateStatusBarTitle('')

    new ConfiguredFontSizeSetupScreen().start()
  }
})
