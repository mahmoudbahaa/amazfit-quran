/* global Page */
import { bin2str } from 'zeppos-cross-api/data-conversion';
import { resetPageBrightTime, setPageBrightTime } from 'zeppos-cross-api/display';
import { O_RDONLY, closeSync, readSync } from 'zeppos-cross-api/fs';
import hmUI from 'zeppos-cross-api/ui';
import { getFontSize } from '../../../lib/config/default';
import { Path } from '../../../lib/mmk/Path';
import {
  SCREEN_HEIGHT, SCREEN_MARGIN_X, SCREEN_MARGIN_Y, SCREEN_WIDTH, WIDGET_WIDTH,
} from '../../../lib/mmk/UiParams';

class TextViewScreen {
  constructor(data) {
    this.PAGE_SIZE = 256;

    this.fontSize = getFontSize();
    this.position = 0;
    this.bufferSize = 0;
    this.backStack = [];
    this.entry = new Path('full', data);
  }

  start() {
    setPageBrightTime({
      brightTime: 1800,
    });

    hmUI.setLayerScrolling(false);
    hmUI.setStatusBarVisible(false);

    // Prepare file
    const st = this.entry.stat();
    this.file = this.entry.open(O_RDONLY);
    this.fileSize = st.size;

    // Init
    this.makeWidgets();
    this.displayForward();
  }

  makeWidgets() {
    // Text view
    this.textView = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: SCREEN_MARGIN_Y,
      w: WIDGET_WIDTH,
      h: SCREEN_HEIGHT - (SCREEN_MARGIN_Y * 2),
      text_size: this.fontSize,
      color: 0xffffff,
      text_style: hmUI.text_style.WRAP,
      text: '',
    });

    // Position view
    this.posView = hmUI.createWidget(hmUI.widget.TEXT, {
      x: SCREEN_MARGIN_X,
      y: 0,
      w: WIDGET_WIDTH,
      h: SCREEN_MARGIN_Y,
      text_size: 20,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      color: 0x999999,
      text: '',
    });

    // Next btn
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: SCREEN_HEIGHT / 2,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT / 2,
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      this.pageNext();
    });

    // Back btn
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT / 2,
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      this.pageBack();
    });
  }

  getTextHeight(text) {
    return hmUI.getTextLayout(text, {
      text_size: this.fontSize,
      text_width: WIDGET_WIDTH,
      wrapped: 1,
    }).height;
  }

  pageNext() {
    if (this.position + this.bufferSize >= this.fileSize) {
      return;
    }

    this.backStack.push(this.position);
    this.position += this.bufferSize;
    this.displayForward();
  }

  pageBack() {
    if (this.backStack.length < 1) {
      return;
    }

    this.position = this.backStack.pop();
    this.displayForward();
  }

  displayForward() {
    this._displayForward();
  }

  _displayForward() {
    const temp = new Uint8Array(15 * 4);
    const boxHeight = SCREEN_HEIGHT - (SCREEN_MARGIN_Y * 2);
    const readLimit = this.fileSize - this.position;
    let readSinceLastSpace = 0;
    let result = '';
    let readBytes = 0;

    for (let step = 15; step > 0; step = Math.floor(step / 2)) {
      while (readBytes < readLimit) {
        readSync({
          fd: this.file,
          buffer: temp.buffer,
          options: {
            position: this.position + readBytes,
            offset: 0,
            length: step * 4,
          },
        });

        const char = bin2str(temp.slice(step));
        const byteLength = char.length;
        // const [char, byteLength] = FsTools.decodeUtf8(temp, step, 0);

        // Check screen fit
        if (this.getTextHeight(result + char) > boxHeight) {
          if (char !== ' ' && char !== '\n' && readBytes - readSinceLastSpace > 0) {
            readBytes -= readSinceLastSpace;
            result = result.substring(0, result.lastIndexOf(' '));
          }

          break;
        }

        readBytes += byteLength;
        const spaceIndex = char.indexOf(' ');
        if (spaceIndex > -1) {
          readSinceLastSpace = spaceIndex;
        } else {
          readSinceLastSpace += byteLength;
        }

        result += result.length === 0 ? char.trim() : char;
      }
    }

    this.bufferSize = readBytes;
    this.textView.setProperty(hmUI.prop.TEXT, result);

    const progress = Math.floor((this.position + this.bufferSize) / this.fileSize * 100);
    this.posView.setProperty(hmUI.prop.TEXT, progress + '%');
  }

  finish() {
    resetPageBrightTime();
    closeSync({ fd: this.file });
  }
}

Page({
  onInit(p) {
    p ||= '/storage/js_apps/00008470/README.txt';
    new TextViewScreen(p).start();
  },
});
