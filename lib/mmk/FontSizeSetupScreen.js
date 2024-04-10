import { ListScreen } from './ListScreen'
import { WIDGET_WIDTH, SCREEN_MARGIN_X, SCREEN_HEIGHT } from './UiParams'
import hmUI from '@zos/ui'
import { _ } from '../i18n/lang'
import { px } from '@zos/utils'

export class FontSizeSetupScreen extends ListScreen {
  constructor () {
    super()
    this.minFontSize = px(24)
    this.maxFontSize = px(40)
  }

  start () {
    this.fontSize = this.getSavedFontSize(this.fontSize)
    this.fontLabel = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: 0,
      w: WIDGET_WIDTH,
      h: 48,
      text: this.fontSize,
      align_h: hmUI.align.CENTER_H,
      text_size: this.maxFontSize,
      color: 0xFFFFFF
    })

    this.decrFontButton = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: SCREEN_MARGIN_X,
      y: 48,
      w: WIDGET_WIDTH,
      h: 72,
      text: '-',
      text_size: 48,
      radius: 32,
      normal_color: 0x222222,
      press_color: 0x333333,
      click_func: () => {
        if (this.fontSize <= this.minFontSize) return
        this.fontSize -= 1
        this.reload()
        this.onChange(this.fontSize)
      }
    })

    this.preview = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: 128,
      w: WIDGET_WIDTH,
      h: SCREEN_HEIGHT - 200,
      text_size: this.fontSize,
      text_style: hmUI.text_style.WRAP,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.TOP,
      color: 0xFFFFFF,
      text: _('The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.')
    })

    this.incrFontButton = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: SCREEN_MARGIN_X,
      y: SCREEN_HEIGHT - 72,
      w: WIDGET_WIDTH,
      text_size: 48,
      h: 72,
      text: '+',
      radius: 32,
      normal_color: 0x222222,
      press_color: 0x333333,
      click_func: () => {
        if (this.fontSize >= this.maxFontSize) return

        this.fontSize += 1
        this.reload()
        this.onChange(this.fontSize)
      }
    })

    this.reload()
  }

  reload () {
    this.preview.setProperty(hmUI.prop.TEXT_SIZE, this.fontSize)
    this.fontLabel.setProperty(hmUI.prop.TEXT, this.fontSize + '')
    this.decrFontButton.setProperty(hmUI.prop.VISIBLE, this.fontSize > this.minFontSize)
    this.incrFontButton.setProperty(hmUI.prop.VISIBLE, this.fontSize < this.maxFontSize)
  }

  getSavedFontSize (fallback) {
    return fallback
  }

  onChange (val) {
    // Override
  }
}
