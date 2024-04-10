/* global Page */
import { back } from '@zos/router'
import { getFontSize } from '../../libs/config/default'
import { _ } from '../../libs/i18n/lang'
import { ListScreen } from '../../libs/mmk/ListScreen'
import { openPage } from '../../libs/utils'

class SettingsHomePage extends ListScreen {
  constructor () {
    super()
    this.fontSize = getFontSize()
  }

  start () {
    this.row({
      text: _('Back'),
      icon: 'menu/back.png',
      card: { callback: () => back() }
    })
    this.row({
      text: _('File manager'),
      icon: 'menu/files.png',
      card: { callback: () => openPage('page/file/manager') }
    })
    this.row({
      text: _('Disk usage'),
      icon: 'menu/storage.png',
      card: { callback: () => openPage('page/file/storageInfo') }
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
