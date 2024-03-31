import * as hmUI from '@zos/ui'
import { CardEntry } from './CardEntry'
import {
  BASE_FONT_SIZE, ICON_SIZE_SMALL, ICON_TEXT_SEPARATOR_WIDTH, SCREEN_MARGIN_X, SCREEN_WIDTH, WIDGET_WIDTH
} from '../UiParams'

export class RowEntry extends CardEntry {
  constructor (config, screen, positionY) {
    super(config.card ? config.card : {}, screen, positionY)
    this.rowConfig = {
      color: 0xFFFFFF,
      fontSize: this.screen.fontSize,
      ...config
    }

    this.config.height = this.rowViewHeight
  }

  _update (config) {
    this.rowConfig.text = config.text
    this.rowConfig.color = config.color

    this.rowConfig.iconText = config.iconText
    this.rowConfig.iconColor = config.iconColor
    this.rowConfig.description = config.description

    this.config.color = config.card.color
    this.config.callback = config.card.callback

    this.textView.setProperty(hmUI.prop.MORE, {
      text: config.text,
      color: config.color,
      h: this.textHeight
    })

    this.bg.setProperty(hmUI.prop.COLOR, config.card.color || 0x000000)
    if (this.mod_callback) this.bg.removeEventListener(hmUI.event.CLICK_UP, this.mod_callback)
    this._setCallback()

    this.descView.setProperty(hmUI.prop.MORE, {
      text: config.description ? config.description : '',
      y: 9 + this.textHeight
    })
    this.iconBg.setProperty(hmUI.prop.COLOR, config.iconColor)
    this.iconView.setProperty(hmUI.prop.TEXT, config.iconText)
    this.separator.setProperty(hmUI.prop.COLOR, config.outlineColor)
  }

  _init () {
    super._init()

    this.textView = this.group.createWidget(hmUI.widget.TEXT, this._textViewConfig)
    this.iconBg = this.group.createWidget(hmUI.widget.CIRCLE, this._iconBgConfig)
    this.iconView = this.group.createWidget(hmUI.widget.TEXT, this._iconViewConfig)
    this.descView = this.group.createWidget(hmUI.widget.TEXT, this._descrViewConfig)
    this.separator = this.group.createWidget(hmUI.widget.FILL_RECT, this._separatorConfig)
  }

  get _iconWidth () {
    return this.rowConfig.iconWidth === undefined ? ICON_SIZE_SMALL : this.rowConfig.iconWidth
  }

  get _iconX () {
    return this.rowConfig.rtl ? this.textWidth + ICON_TEXT_SEPARATOR_WIDTH : 0
  }

  get _iconY () {
    return Math.floor((this.rowViewHeight - this._iconWidth) / 2)
  }

  get _iconViewConfig () {
    return {
      x: this._iconX,
      y: this._iconY,
      w: this._iconWidth,
      h: this._iconWidth,
      text: this.rowConfig.iconText,
      text_size: BASE_FONT_SIZE,
      align_h: this.rowConfig.iconAlignH,
      align_v: this.rowConfig.iconAlignV,
      color: 0xFFFFFF
    }
  }

  get _iconBgConfig () {
    return {
      center_x: this._iconX + this._iconWidth / 2,
      center_y: this._iconY + this._iconWidth / 2,
      radius: this._iconWidth / 2,
      color: this.rowConfig.iconColor
    }
  }

  get _textViewConfig () {
    return {
      x: this.textX,
      y: 9,
      w: this.textWidth,
      h: this.textHeight,
      align_h: this.rowConfig.alignH,
      align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.WRAP,
      text_size: this.rowConfig.fontSize,
      color: this.rowConfig.color,
      text: this.rowConfig.text
    }
  }

  get _descrViewConfig () {
    return {
      x: this.textX,
      y: 9 + this.textHeight,
      w: this.textWidth,
      h: this.descriptionHeight,
      align_h: this.rowConfig.alignH,
      text_style: hmUI.text_style.WRAP,
      text_size: this.rowConfig.fontSize - 2,
      color: 0x999999,
      text: this.rowConfig.description
    }
  }

  get _separatorConfig () {
    return {
      x: -SCREEN_WIDTH / 2,
      y: -4,
      w: SCREEN_WIDTH * 2,
      h: 4,
      color: this.rowConfig.outlineColor
    }
  }

  get textX () {
    const textX = this._iconWidth + SCREEN_MARGIN_X + ICON_TEXT_SEPARATOR_WIDTH
    return this.rowConfig.rtl ? 0 : textX
  }

  get textWidth () {
    return (this.config.width ? this.config.width : WIDGET_WIDTH) - this._iconWidth - ICON_TEXT_SEPARATOR_WIDTH
  }

  get textHeight () {
    // Don't Remove toString() cause issues with some bidi strings returning undefined
    const { height } = hmUI.getTextLayout(this.rowConfig.text.toString(), {
      text_size: this.rowConfig.fontSize,
      text_width: this.textWidth
    })

    return this.rowConfig.description ? height : height * 2
  }

  get descriptionHeight () {
    if (!this.rowConfig.description) return 0
    const { height } = hmUI.getTextLayout(this.rowConfig.description, {
      text_size: this.rowConfig.fontSize - 2,
      text_width: this.textWidth
    })
    return height
  }

  get rowViewHeight () {
    return Math.max(this.screen.baseRowHeight, this.textHeight + this.descriptionHeight + 18)
  }
}
