/* global Page */
import { showToast } from 'zeppos-cross-api/ui';
import { createLoadingWidget, deleteLoadingWidget } from '../../components/loadingWidget';
import { SettingsLangScreen } from '../../components/settingsLangScreen';
import { getChaptersLang, setChaptersLang } from '../../lib/config/default';
import { getGlobal } from '../../lib/global';
Page({
  onInit() {
    createLoadingWidget();

    console.log('Getting languages');
    const { basePage } = getGlobal();
    basePage
      .request({
        method: 'get.chapters.langs',
        params: '',
      })
      .then(result => {
        this.onLangsReceived(result.languages);
      })
      .catch(() => {
        this.onErrorReceived();
      });
  },

  onErrorReceived() {
    deleteLoadingWidget();
    console.log('Error while retrieving languages');
    showToast({ text: 'Error while retrieving languages, Try again later' });
    // SetTimeout(() => back(), 5000)
  },

  onLangsReceived(languages) {
    deleteLoadingWidget();
    if (languages) {
      this.screen = new SettingsLangScreen(languages, getChaptersLang(), setChaptersLang);
      this.screen.start();
    } else {
      this.onLangsReceived();
    }
  },
});
