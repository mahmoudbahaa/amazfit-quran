/* global Page */
import { showToast } from 'zeppos-cross-api/ui';
import { createLoadingWidget, deleteLoadingWidget } from '../../components/loadingWidget';
import { SettingsLangScreen } from '../../components/settingsLangScreen';
import { getChaptersLang, setChaptersLang } from '../../lib/config/default';
import { messageBuilder } from '../../lib/messageBuilderHolder';
Page({
  onInit() {
    createLoadingWidget();

    console.log('Getting languages');
    messageBuilder()
      .request({
        method: 'get.chapters.langs',
        params: '',
      })
      .then(data => {
        if (data.languages) {
          this.onLangsReceived(data.languages);
        } else {
          this.onErrorReceived();
        }
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
