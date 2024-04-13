/* global Page */
import { setWakeUpRelaunch } from 'zeppos-cross-api/display';
import { exit } from 'zeppos-cross-api/router';
import { showToast } from 'zeppos-cross-api/ui';
import { clearConfig, clearData, getFontSize } from '../lib/config/default';
import { _, isRtlLang } from '../lib/i18n/lang';
import { ListScreen } from '../lib/mmk/ListScreen';
import { openPage } from '../lib/utils';

class HomePage extends ListScreen {
  constructor() {
    super(isRtlLang());
    this.fontSize = getFontSize();
  }

  start() {
    this.row({
      text: _('Next'),
      icon: 'menu/next.png',
      card: { callback: () => openPage('page/select') },
    });
    this.row({
      text: _('Settings'),
      icon: 'menu/ui.png',
      card: { callback: () => openPage('page/settings/home') },
    });
    this.row({
      text: _('Tools'),
      icon: 'menu/toolbox.png',
      card: { callback: () => openPage('page/file/home') },
    });
    this.row({
      text: _('Clear Configurations and exit'),
      icon: 'menu/delete.png',
      card: {
        callback() {
          const result = clearConfig();
          showToast({ text: result ? 'cleared' : 'not cleared\n try again later' });
          setTimeout(() => exit(), 5000);
        },
      },
    });
    this.row({
      text: _('Clear Data and exit'),
      icon: 'menu/delete.png',
      card: {
        callback() {
          const result = clearData();
          showToast({ text: result ? 'cleared' : 'not cleared\n try again later' });
          setTimeout(() => exit(), 5000);
        },
      },
    });
    this.row({
      text: _('About'),
      icon: 'menu/info.png',
      card: { callback: () => openPage('page/about') },
    });
    this.finalize();
  }
}

Page({
  state: {
    /**
     * @type {HomePage}
     */
    screen: undefined,
  },

  onInit() {
    setWakeUpRelaunch({
      relaunch: true,
    });
  },

  build() {
    this.state.screen = new HomePage();
    this.state.screen.start();
  },

  onDestroy() {
    console.log('Home page onDestroy');
    if (this.state.screen) {
      this.state.screen.stop();
    }
  },
});
