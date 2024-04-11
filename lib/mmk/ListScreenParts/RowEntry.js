import * as hmUI from 'zeppos-cross-api/ui'
import {
  ICON_SIZE_SMALL,
  SCREEN_WIDTH,
  WIDGET_WIDTH
} from '../UiParams'
import { CardEntry } from './CardEntry'

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
    if (this.rowConfig.icon) {
      this.iconView = this.group.createWidget(hmUI.widget.IMG, this._iconViewConfig)
    } else {
      this.iconBg = this.group.createWidget(hmUI.widget.CIRCLE, this._iconBgConfig)
      this.iconView = this.group.createWidget(hmUI.widget.TEXT, this._iconTextConfig)
    }
    this.descView = this.group.createWidget(hmUI.widget.TEXT, this._descrViewConfig)
  }

  get _iconWidth () {
    return this.rowConfig.iconWidth === undefined ? ICON_SIZE_SMALL : this.rowConfig.iconWidth
  }

  get _iconX () {
    return this.rowConfig.rtl ? (SCREEN_WIDTH - this._groupConfig.x * 2 - Math.floor(this._iconWidth * 1.5)) : Math.floor(this._iconWidth / 2)
  }

  get _iconY () {
    return Math.floor((this.rowViewHeight - this._iconWidth) / 2)
  }

  get _iconViewConfig () {
    return {
      x: this._iconX,
      y: this._iconY,
      src: this.rowConfig.icon
    }
  }

  get _iconTextConfig () {
    return {
      x: this._iconX,
      y: this._iconY,
      w: this._iconWidth,
      h: this._iconWidth,
      text: this.rowConfig.iconText,
      text_size: this.screen.fontSize,
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
    const h = this.descriptionHeight
    return {
      x: this.textX,
      y: 9 + this.textHeight,
      w: this.textWidth,
      h: h || this.textHeight,
      align_h: this.rowConfig.alignH,
      text_style: hmUI.text_style.WRAP,
      text_size: this.rowConfig.fontSize - 2,
      color: 0x999999,
      text: this.rowConfig.description
    }
  }

  get textX () {
    const textX = this._iconWidth * 2
    return this.rowConfig.rtl ? 0 : textX
  }

  get textWidth () {
    return (this.config.width ? this.config.width : WIDGET_WIDTH) - this._iconWidth * 2 - 8
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
    const { height } = hmUI.getTextLayout(this.rowConfig.description.toString(), {
      text_size: this.rowConfig.fontSize - 2,
      text_width: this.textWidth
    })
    return height
  }

  get rowViewHeight () {
    return Math.max(this.screen.baseRowHeight, this.textHeight + this.descriptionHeight + 18)
  }
}
