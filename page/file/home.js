/* global Page */
import { back } from 'zeppos-cross-api/router';
import { getFontSize } from '../../lib/config/default';
import { _ } from '../../lib/i18n/lang';
import { ListScreen } from '../../lib/mmk/ListScreen';
import { openPage } from '../../lib/utils';

class SettingsHomePage extends ListScreen {
  constructor() {
    super();
    this.fontSize = getFontSize();
  }

  start() {
    this.row({
      text: _('Back'),
      icon: 'menu/back.png',
      card: { callback: () => back() },
    });
    this.row({
      text: _('File manager'),
      icon: 'menu/files.png',
      card: { callback: () => openPage('page/file/manager') },
    });
    this.row({
      text: _('Disk usage'),
      icon: 'menu/storage.png',
      card: { callback: () => openPage('page/file/storageInfo') },
    });
    this.finalize();
  }
}

Page({
  onInit() {
    this.screen = new SettingsHomePage();
    this.screen.start();
  },
});
