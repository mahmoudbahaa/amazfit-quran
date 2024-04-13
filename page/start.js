/* global Page */
import { BasePage } from 'zeppos-cross-api/zml-base-page';
import { setVerseInfo } from '../lib/config/verse.js';
import { getGlobal } from '../lib/global.js';
import { openPage } from '../lib/utils.js';

Page(
  BasePage({
    state: {
      player: undefined,
    },

    onInit() {
      getGlobal().basePage = this;
      openPage('page/home', undefined, true);
    },

    onCall(data) {
      if (data.params.curDownVerse) {
        this.state.player?.updateStatus(data.params.curDownVerse);
      } else if (data.params.verse) {
        setVerseInfo(data.params.verse, data.params.mapping);
      }
      // RequestHandler.onRequest(ctx, request)

      // if (getGlobal().player !== undefined) {
      //   if (data.params.curDownVerse !== undefined) {
      //     getGlobal().player.updateStatus(data.params.curDownVerse);
      //   } else if (data.params.verse !== undefined) {
      //     setVerseInfo(data.params.verse, data.params.mapping);
      //   }
      // }
    },

  // Start () {
  //   unDefChapters()
  //   deleteLoadingWidget()
  // }
  }),
);
