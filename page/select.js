/* global Page */
import { setWakeUpRelaunch } from 'zeppos-cross-api/display';
import { showToast } from 'zeppos-cross-api/ui';
import { log } from 'zeppos-cross-api/utils';
import { ChaptersScreen } from '../components/chaptersList';
import { createLoadingWidget, deleteLoadingWidget, updateStatus } from '../components/loadingWidget';
import {
  getChaptersLang, getSavedChaptersLang, removeChaptersListRows, setChapters, setSavedChaptersLang,
} from '../lib/config/default';
import { setEnChapters } from '../lib/config/enChapters';
import { MIN_TIMEOUT_DURATION } from '../lib/constants';
import { DEVICE_LANG, _ } from '../lib/i18n/lang';
import { messageBuilder } from '../lib/messageBuilderHolder';

const logger = log.getLogger('select.page');

class SelectScreen {
  getChapters() {
    const savedChaptersLang = getSavedChaptersLang();
    const chaptersLang = getChaptersLang() || DEVICE_LANG().split('-')[0];
    console.log('savedChaptersLang=' + savedChaptersLang);
    console.log('chaptersLang=' + chaptersLang);

    updateStatus(_('Getting Chapters'));

    if (savedChaptersLang === chaptersLang) {
      deleteLoadingWidget();
      this.createWidgets();
      return;
    }

    if (chaptersLang === 'en' || chaptersLang === 'ar') {
      setTimeout(() => {
        removeChaptersListRows();
        setSavedChaptersLang(chaptersLang);
        setEnChapters();
        deleteLoadingWidget();
        this.createWidgets();
      }, MIN_TIMEOUT_DURATION);
    } else {
      messageBuilder().request({
        method: 'get.chapters',
        params: { lang: chaptersLang },
      }).then(data => {
        if (data.status === 'error') {
          this.onError();
          return;
        }

        removeChaptersListRows();
        setSavedChaptersLang(chaptersLang);
        setChapters(data.chapters);
        deleteLoadingWidget();
        this.createWidgets();
      }).catch(error => {
        this.onError(error);
      });
    }
  }

  onError(_error = undefined) {
    deleteLoadingWidget();
    showToast({ text: 'Error Error Error' });
  }

  createWidgets() {
    logger.log('Inside Create Widgets');
    this.screen = new ChaptersScreen();
    this.screen.start();
  }

  start() {
    setWakeUpRelaunch({
      relaunch: true,
    });

    // If (getApp()._options.globalData.restorePlayer) {
    //   getApp()._options.globalData.restorePlayer = false
    //   if (restorePlayer()) return
    // }

    createLoadingWidget();
    setTimeout(() => this.getChapters(), MIN_TIMEOUT_DURATION);
  }

  stop() {
    if (this.screen) {
      this.screen.stop();
    }
  }
}

Page({
  state: {
    /**
     * @type {SelectScreen}
     */
    screen: undefined,
  },

  onInit() {
    this.state.screen = new SelectScreen();
    this.state.screen.start();
  },

  onDestroy() {
    if (this.state.screen) {
      this.state.screen.stop();
    }
  },
});
