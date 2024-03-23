import { getDeviceInfo } from '@zos/device';
import { scrollTo } from '@zos/page';
import { push } from '@zos/router';
import * as hmUI from '@zos/ui';

import {
  IS_MI_BAND_7,
  SCREEN_WIDTH,
  SCREEN_MARGIN_X,
  WIDGET_WIDTH,
  SCREEN_MARGIN_Y, BASE_FONT_SIZE, SCREEN_HEIGHT
} from "./UiParams";
import {deviceName, deviceClass, isLowRamDevice} from "./DeviceIdentifier";

const info = getDeviceInfo();
const DEVICE_INFO_DATA = `
Model: ${info.deviceName}
Source: ${info.deviceSource}
Screen: ${info.width}x${info.height}
Identified as: ${deviceName} (${deviceClass}${isLowRamDevice ? ", low-ram" : ""})`;

export class BaseAboutScreen {
  constructor() {
    this.appId = 0;
    this.appName = "AppName";
    this.version = "1.0";
    this.infoRows = [
      ["melianmiko", "Developer"]
    ];

    this.iconSize = 80;

    this.donateText = "";
    this.donateUrl = null;
    this.hiddenInfo = "";

    this.posY = SCREEN_MARGIN_Y;
  }

  drawBasement() {
    const iconSize = IS_MI_BAND_7 ? 100 : this.iconSize;
    const lineHeight = Math.floor(BASE_FONT_SIZE * 2);

    let clickCount = 5;
    hmUI.createWidget(hmUI.widget.IMG, {
      x: (SCREEN_WIDTH - iconSize) / 2,
      y: SCREEN_MARGIN_Y,
      src: "icon.png",
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      if(clickCount > 0) return clickCount--;
      this.deviceInfoGroup.setProperty(hmUI.prop.VISIBLE, true);
    })
    this.posY += 100;

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: this.posY,
      w: WIDGET_WIDTH,
      h: 48,
      text: this.appName,
      text_size: BASE_FONT_SIZE * 1.5,
      color: 0xFFFFFF,
      align_h: hmUI.align.CENTER_H
    });
    this.posY += lineHeight;

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: this.posY,
      w: WIDGET_WIDTH,
      h: 32,
      text: this.version,
      text_size: BASE_FONT_SIZE,
      color: 0xAAAAAA,
      align_h: hmUI.align.CENTER_H
    });
    this.posY += lineHeight;

    if (this.donateText) {
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: SCREEN_MARGIN_X + 16,
        y: this.posY,
        w: WIDGET_WIDTH - 32,
        h: BASE_FONT_SIZE * 3,
        text: this.donateText,
        text_size: BASE_FONT_SIZE - 2,
        radius: 24,
        color: 0xF48FB1,
        normal_color: 0x17030e,
        press_color: 0x380621,
        click_func: () => this.openDonate()
      });
      this.posY += BASE_FONT_SIZE * 3 + 16;
    }
  }

  openDonate() {
    if(typeof this.donateUrl == "function") 
      return this.donateUrl();

    push({
      url: this.donateUrl
    })
  }

  drawInfo() {
    const fontMpx = 1.2;

    for (let [name, info] of this.infoRows) {
      const metrics = hmUI.getTextLayout(name, {
        text_width: WIDGET_WIDTH,
        text_size: BASE_FONT_SIZE
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: SCREEN_MARGIN_X,
        y: this.posY,
        w: WIDGET_WIDTH,
        h: BASE_FONT_SIZE * fontMpx,
        text_size: BASE_FONT_SIZE - 4,
        color: 0xAAAAAA,
        text: info,
        align_h: hmUI.align.CENTER_H
      });

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: SCREEN_MARGIN_X,
        y: this.posY + BASE_FONT_SIZE * fontMpx,
        w: WIDGET_WIDTH,
        h: metrics.height + 24,
        text_size: BASE_FONT_SIZE,
        color: 0xFFFFFF,
        text: name,
        text_style: hmUI.text_style.WRAP,
        align_h: hmUI.align.CENTER_H
      });

      this.posY += metrics.height + BASE_FONT_SIZE * fontMpx;
    }

    hmUI.createWidget(hmUI.widget.IMG, {
      x: SCREEN_MARGIN_X,
      y: this.posY + 64,
      w: SCREEN_WIDTH,
      h: 2,
      src: ""
    })
  }

  buildDeviceInfo() {
    this.deviceInfoGroup = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    });

    this.deviceInfoGroup.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    });

    this.deviceInfoGroup.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: SCREEN_MARGIN_Y,
      w: WIDGET_WIDTH,
      text: DEVICE_INFO_DATA + "\n" + this.hiddenInfo,
      text_style: hmUI.text_style.WRAP,
      text_size: BASE_FONT_SIZE,
      color: 0xFFFFFF
    })

    this.deviceInfoGroup.setProperty(hmUI.prop.VISIBLE, false);
  }

  start() {
    this.drawBasement();
    this.drawInfo();
    this.buildDeviceInfo();
  }
}
