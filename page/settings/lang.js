/* global Page */
import { SettingsLangScreen } from '../../components/settingsLangScreen'

Page({
  state: {
    screen: undefined
  },

  onInit () {
    this.state.screen = new SettingsLangScreen()
    this.state.screen.start()
  }
})
