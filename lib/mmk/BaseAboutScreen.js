import { getDeviceInfo } from 'zeppos-cross-api/device'
import * as hmUI from 'zeppos-cross-api/ui'

import { deviceClass, deviceName, isLowRamDevice } from './DeviceIdentifier'
import {
  BASE_FONT_SIZE,
  IS_MI_BAND_7,
  SCREEN_HEIGHT,
  SCREEN_MARGIN_X,
  SCREEN_MARGIN_Y,
  SCREEN_WIDTH,
  SECONDARY_COLOR_TXT,
  WIDGET_WIDTH
} from './UiParams'

const info = getDeviceInfo()
const DEVICE_INFO_DATA = `
Model: ${info.deviceName}
Source: ${info.deviceSource}
Screen: ${info.width}x${info.height}
Identified as: ${deviceName} (${deviceClass}${isLowRamDevice ? ', low-ram' : ''})`

export class BaseAboutScreen {
  constructor () {
    this.rtl = false
    this.appName = 'AppName'
    this.version = '1.0'
    this.infoRows = [
      ['DeveloperName', 'Developer']
    ]

    this.headerText = []
    this.headerFontSize = []
    this.infoHeaderWidth = WIDGET_WIDTH / 2

    this.iconSize = 80
    this.hiddenInfo = ''
    this.fontSize = BASE_FONT_SIZE
    this.posY = SCREEN_MARGIN_Y
    this.headerPos = []
    this.headerHeight = []
  }

  get lineHeight () {
    return Math.floor(this.fontSize * 2)
  }

  drawHeader (pos) {
    if (!this.headerText) return

    this.headerText.forEach((headerText, i) => {
      if (this.headerPos[i] !== pos) return
      const metrics = hmUI.getTextLayout(headerText.toString(), {
        text_size: this.headerFontSize[i],
        text_width: WIDGET_WIDTH
      })

      const height = this.headerHeight[i] ? this.headerHeight[i] : metrics.height
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: SCREEN_MARGIN_X,
        y: this.posY,
        w: WIDGET_WIDTH,
        h: height,
        text: headerText,
        text_size: this.headerFontSize[i],
        color: SECONDARY_COLOR_TXT,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V
      })
      this.posY += height + 8
    })
  }

  drawBasement () {
    const iconSize = IS_MI_BAND_7 ? 100 : this.iconSize

    let clickCount = 5
    hmUI.createWidget(hmUI.widget.IMG, {
      x: (SCREEN_WIDTH - iconSize) / 2,
      y: this.posY,
      w: iconSize,
      h: iconSize,
      auto_scale: true,
      src: 'icon.png'
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      if (clickCount > 0) return clickCount--
      this.deviceInfoGroup.setProperty(hmUI.prop.VISIBLE, true)
    })
    this.posY += iconSize + 8

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: this.posY,
      w: WIDGET_WIDTH,
      h: 48,
      text: this.appName + ' ' + this.version,
      text_size: this.fontSize * 1.5,
      color: 0xFFFFFF,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    })

    this.posY += this.lineHeight
  }

  drawInfo () {
    for (const [name, info] of this.infoRows) {
      const metrics = hmUI.getTextLayout(name.toString(), {
        text_size: this.fontSize,
        text_width: WIDGET_WIDTH
      })

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: this.rtl ? SCREEN_WIDTH - SCREEN_MARGIN_X - this.infoHeaderWidth : SCREEN_MARGIN_X,
        y: this.posY,
        w: this.infoHeaderWidth,
        h: metrics.height + 24,
        text_size: Math.floor(this.fontSize * 0.85),
        color: 0xAAAAAA,
        text: info,
        align_h: this.rtl ? hmUI.align.LEFT : hmUI.align.RIGHT,
        align_v: hmUI.align.CENTER_V
      })

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: this.rtl ? 0 : SCREEN_MARGIN_X + this.infoHeaderWidth + 18,
        y: this.posY,
        w: WIDGET_WIDTH - this.infoHeaderWidth,
        h: metrics.height + 24,
        text_size: this.fontSize,
        color: 0xFFFFFF,
        text: name,
        // text_style: hmUI.text_style.WRAP,
        align_h: this.rtl ? hmUI.align.RIGHT : hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V
      })

      this.posY += metrics.height + 8
    }
  }

  buildDeviceInfo () {
    this.deviceInfoGroup = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })

    this.deviceInfoGroup.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })

    this.deviceInfoGroup.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: SCREEN_MARGIN_Y,
      w: WIDGET_WIDTH,
      text: `${DEVICE_INFO_DATA}\n${this.hiddenInfo}`,
      text_style: hmUI.text_style.WRAP,
      text_size: this.fontSize,
      color: 0xFFFFFF,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    })

    this.deviceInfoGroup.setProperty(hmUI.prop.VISIBLE, false)
  }

  start () {
    this.drawHeader('top')
    this.drawBasement()
    this.drawHeader('middle')
    this.drawInfo()
    this.drawHeader('bottom')
    this.buildDeviceInfo()
  }
}
