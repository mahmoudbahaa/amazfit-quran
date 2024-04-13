import {
  align, anim_status, createWidget, deleteWidget, prop, widget,
} from 'zeppos-cross-api/ui';
import { px } from 'zeppos-cross-api/utils';
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_COLOR_TXT } from '../lib/mmk/UiParams';

let loadingAnim = { bg: undefined, anim: undefined, status: undefined };
loadingAnim = undefined;

export function createLoadingWidget() {
  if (loadingAnim) {
    return;
  }

  const bg = createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    h: SCREEN_HEIGHT,
    w: SCREEN_WIDTH,
    color: 0x000000,
  });

  const anim = createWidget(widget.IMG_ANIM, {
    anim_path: 'icons/loading-ani',
    anim_prefix: 'ani',
    anim_ext: 'png',
    anim_fps: 30,
    anim_size: 54,
    repeat_count: 0,
    anim_repeat: true,

    // eslint-disable-next-line camelcase
    anim_status: anim_status.START,
    x: (SCREEN_WIDTH / 2) - px(80),
    y: (SCREEN_HEIGHT / 2) - px(80),
    anim_complete_call() {
      console.log('animation complete');
    },
  });

  const status = createWidget(widget.TEXT, {
    x: 0,
    y: (SCREEN_HEIGHT / 2) + px(80),
    w: SCREEN_WIDTH,
    h: this.fontSize * 1.5,
    text: '',
    text_size: this.fontSize * 1.25,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    color: STATUS_COLOR_TXT,
  });

  loadingAnim = {
    bg,
    anim,
    status,
  };
}

export function updateStatus(text) {
  if (loadingAnim?.status) {
    loadingAnim.status.setProperty(prop.TEXT, text);
  }
}

export function deleteLoadingWidget() {
  const curLoadingAnim = loadingAnim;
  loadingAnim = undefined;
  if (curLoadingAnim) {
    deleteWidget(curLoadingAnim.bg);
    deleteWidget(curLoadingAnim.anim);
    deleteWidget(curLoadingAnim.status);
  }
}
