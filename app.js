import {BaseApp} from '@zeppos/zml/base-app'
import {EventBus} from "@zos/utils";

const bus = new EventBus();

App(
  BaseApp({
    globalData: {
      bus,
      startParams: undefined,
      isDownloadTransfer: false,
      surahDuration: NaN,
      playerDuration: NaN,
      verses: undefined,
      settings: undefined,
    },
    onCreate(options) {
      console.log('app on create invoke')
      this.globalData.startParams = params;
    },
    onDestroy(options) {
      console.log('app on destroy invoke')
    }
  })
);
