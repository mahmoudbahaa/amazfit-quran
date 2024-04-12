/* global Page */
import { back } from 'zeppos-cross-api/router'
import { getFontSize } from '../../lib/config/default'
import { _, isRtlLang } from '../../lib/i18n/lang'
import { ListScreen } from '../../lib/mmk/ListScreen'
import { openPage } from '../../lib/utils'

class SettingsHomePage extends ListScreen {
  constructor () {
    super(isRtlLang())
    this.fontSize = getFontSize()
  }

  start () {
    this.row({
      text: _('Back'),
      icon: 'menu/back.png',
      card: { callback: () => back() }
    })
    this.row({
      text: _('Font size'),
      icon: 'menu/font_size.png',
      card: { callback: () => openPage('page/settings/fontSize') }
    })
    this.row({
      text: _('UI Language'),
      icon: 'menu/lang.png',
      card: { callback: () => openPage('page/settings/lang') }
    })
    this.row({
      text: _('Chapters Language'),
      icon: 'menu/lang.png',
      card: { callback: () => openPage('page/settings/chaptersLang') }
    })
    this.finalize()
  }
}

Page({
  onInit () {
    this.screen = new SettingsHomePage()
    this.screen.start()
  }
})
