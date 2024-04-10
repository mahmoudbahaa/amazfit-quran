/* global Page */
import { SettingsLangScreen } from '../../components/settingsLangScreen'

Page({
  onInit () {
    console.log('hello')

    this.screen = new SettingsLangScreen()
    this.screen.start()
  }
})
