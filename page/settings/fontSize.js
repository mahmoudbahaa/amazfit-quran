/* global Page */
import hmUI from '@zos/ui'
import { getFontSize, setFontSize } from '../../libs/config/default'
import { FontSizeSetupScreen } from '../../libs/mmk/FontSizeSetupScreen'

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
