import { BaseApp } from "@zeppos/zml/base-app";
import { EventBus } from "@zos/utils";

const bus = new EventBus();

App(
  BaseApp({
    globalData: {
      bus,
      isDownloadTransfer: false,
      surahDuration: NaN,
      playerDuration: NaN,
    },
    onCreate() {
      console.log("app on create invoke");
    },

    onDestroy() {
      console.log("app on destroy invoke");
    },
  })
);
