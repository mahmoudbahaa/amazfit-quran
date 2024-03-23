import hmUI from "@zos/ui";
import {BasePage} from "@zeppos/zml/base-page";
import { log as Logger } from "@zos/utils";
import {push, replace} from "@zos/router";
import {DEVICE_HEIGHT, DEVICE_WIDTH} from "../libs/utils";
import {getSurahInfo} from "../libs/localStorage";
import { apiCall } from "../components/api-caller";

const logger = Logger.getLogger("download page");

Page(
  BasePage({
    updateProgress(numProgress, msg) {
      // readjust angle based on the coordinate system
      let end_angle = numProgress * 360 / 100;
      end_angle -= 90;

      // update the text and the arc with each tick
      this.arc.setProperty(hmUI.prop.MORE, { end_angle });
      this.text.setProperty(hmUI.prop.TEXT, msg + numProgress + '%');
    },

    download() {
      const surah_info = getSurahInfo(); 
      const fileName = surah_info.fileName;
      const relativePath = surah_info.recitation.split(",")[2];
      console.log("Downloading: " + fileName);
      getApp()._options.globalData.isDownloadTransfer = true;
      apiCall("getRecitation", this, { fileName, relativePath }, err => getApp()._options.globalData.isDownloadTransfer = false);
    },
    
    onCall({ result }) {
      this.updateProgress(result.progress, result.action + " ")
      if (result.progress === 100 && result.action === "Copy") {
        getApp()._options.globalData.isDownloadTransfer = false;
        replace({
          url: 'page/player',
        });
      }
    },
    
    build() {
      this.arc = hmUI.createWidget(hmUI.widget.ARC, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        start_angle: -90,
        end_angle: -90,
        color: 0xfc6950,
        line_width: 20
      })
      
      this.text = hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: DEVICE_HEIGHT / 2,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT / 4,
        color: 0xffffff,
        text_size: 36,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        text: '0%'
      })

      this.download();
    }
  })
);