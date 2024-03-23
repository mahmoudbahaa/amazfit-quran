import hmUI from "@zos/ui";
import * as appService from "@zos/app-service";
import {BasePage} from "@zeppos/zml/base-page";
import { log as Logger } from "@zos/utils";
import { onDigitalCrown, KEY_HOME } from '@zos/interaction'
import { queryPermission, requestPermission } from "@zos/app";
import * as Styles from "./style.r.layout.js";
import { humanizeTime, route } from "../libs/utils.js";
import { getChapters, getSurahInfo } from "../libs/localStorage.js";
import { getText } from "@zos/i18n";
import { replace } from "@zos/router";

let thisFile = "page/player";
const serviceFile = "app-service/player_service";
const logger = Logger.getLogger("player page");
const permissions = ["device:os.bg_service"];

function permissionRequest(vm) {
  const [result2] = queryPermission({
    permissions,
  });

  if (result2 === 0) {
    requestPermission({
      permissions,
      callback([result2]) {
        if (result2 === 2) {
          startPlayerService(vm);
        }
      },
    });
  } else if (result2 === 2) {
    startPlayerService(vm);
  }
}

function startPlayerService(vm) {
  logger.log(`=== start service: ${serviceFile} ===`);
  const result = appService.start({
    url: serviceFile,
    param: `fileName=${getSurahInfo().fileName}&action=${vm.state.action}`,
    complete_func: (info) => {
      logger.log(`startService result: ` + JSON.stringify(info));
      // hmUI.showToast({ text: `start result: ${info.result}` });
      if (info.result) {
        vm.state.running = true;
      }
    },
  });

  if (result) {
    logger.log("startService result: ", result);
  }
}

Page({
  state: {
    running: false,
    action: "start",
  },

  build() {
    const vm = this;
    const surahInfo = getSurahInfo();
    let services = appService.getAllAppServices();
    vm.state.running = services.includes(serviceFile);

    logger.log("service status %s", vm.state.running);

    const chapterInfo = getChapters()[surahInfo.number - 1];
    hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.PLAYER_TEXT,
      text: "Surah: " + surahInfo.fileName + "\n" + chapterInfo.name_simple + "[" + chapterInfo.translated_name.name + "]",
    });

    const playerButtons = [
      { src: "volume-decrease.png", action:"dec-vol", service:true },
      { src: "back.png", action:"previous", service:false  },
      { src: "play.png", action: "play", service:true },
      { src: "pause.png", action: "pause", service:true },
      { src: "stop.png", action: "stop", service:true },
      { src: "forward.png", action: "next", service:false },
      { src: "volume-increase.png", action:"inc-vol", service:true  },
    ];


    playerButtons.forEach((playerButton, index) => {
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...Styles.PLAYER_BTN,
        x: Styles.PLAYER_BTN_X + Styles.PLAYER_BTN_OX * index,
        normal_src: playerButton.src,
        press_src: playerButton.src,
        click_func: function () {
          vm.state.action = playerButton.action;
          console.log(playerButton.action + ' button click')
          if (playerButton.service) {
            permissionRequest(vm);
          } else {
            let offset = undefined;
            switch (playerButton.action) {
              case "previous": offset = -1; break;
              case "next": offset = 1; break;
            }

            route(vm.state.surahIndex + offset);
          }
        },
      });
    });

    const playerLabel = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.PLAYER_LABEL,
      text: "00/" + humanizeTime(getApp()._options.globalData.surahDuration),
    });

    const interval = setInterval(() => {
      const elapsed = humanizeTime(getApp()._options.globalData.playerDuration);
      const total = humanizeTime(getApp()._options.globalData.surahDuration);
      playerLabel.setProperty(hmUI.prop.TEXT, elapsed + "/" + total);
    }, 500)

    console.log("fileName: " + surahInfo.fileName);
    permissionRequest(vm);
  },
  onPause() {
    logger.log("page on pause invoke");
  },
  onResume() {
    logger.log("page on resume invoke");
    replace({ url: `${thisFile}`});
  },
  onDestroy() {
    logger.log("page on destroy invoke");
    this.state.action = "exit";
    permissionRequest(this);
  },
});