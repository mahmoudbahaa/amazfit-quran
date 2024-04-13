import hmUI from 'zeppos-cross-api/ui';
import { ListScreen } from './ListScreen';
import {
  SCREEN_HEIGHT, SCREEN_MARGIN_X, SCREEN_MARGIN_Y, WIDGET_WIDTH,
} from './UiParams';

export class FontSizeSetupScreen extends ListScreen {
  constructor(minFontSize, maxFontSize, lorem) {
    super();
    this.minFontSize = minFontSize || 18;
    this.maxFontSize = maxFontSize || 46;
    this.lorem = lorem || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacinia metus ornare lacus gravida vestibulum.';
  }

  start() {
    this.fontSize = this.getSavedFontSize(this.fontSize);
    const margin = Math.min(64, SCREEN_MARGIN_Y);

    this.fontLabel = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: 0,
      w: WIDGET_WIDTH,
      h: margin,
      text: this.fontSize,
      align_h: hmUI.align.CENTER_H,
      text_size: Math.floor(margin / 1.3),
      color: 0xFFFFFF,
    });

    this.decrFontButton = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: SCREEN_MARGIN_X,
      y: margin,
      w: WIDGET_WIDTH,
      h: 64,
      text: '-',
      text_size: 48,
      radius: 32,
      normal_color: 0x222222,
      press_color: 0x333333,
      click_func: () => {
        if (this.fontSize <= this.minFontSize) {
          return;
        }

        this.fontSize -= 1;
        this.reload();
        this.onChange(this.fontSize);
      },
    });

    this.preview = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: margin + 72,
      w: WIDGET_WIDTH,
      h: SCREEN_HEIGHT - 144 - (margin * 2),
      text_size: this.fontSize,
      text_style: hmUI.text_style.WRAP,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.TOP,
      color: 0xFFFFFF,
      text: this.lorem,
    });

    this.incrFontButton = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: SCREEN_MARGIN_X,
      y: SCREEN_HEIGHT - margin - 64,
      w: WIDGET_WIDTH,
      text_size: 48,
      h: 64,
      text: '+',
      radius: 32,
      normal_color: 0x222222,
      press_color: 0x333333,
      click_func: () => {
        if (this.fontSize >= this.maxFontSize) {
          return;
        }

        this.fontSize += 1;
        this.reload();
        this.onChange(this.fontSize);
      },
    });

    this.reload();
  }

  reload() {
    this.preview.setProperty(hmUI.prop.TEXT_SIZE, this.fontSize);
    this.fontLabel.setProperty(hmUI.prop.TEXT, String(this.fontSize));
    this.decrFontButton.setProperty(hmUI.prop.VISIBLE, this.fontSize > this.minFontSize);
    this.incrFontButton.setProperty(hmUI.prop.VISIBLE, this.fontSize < this.maxFontSize);
  }

  getSavedFontSize(fallback) {
    return fallback;
  }

  onChange(_val) {
    // Override
  }
}
