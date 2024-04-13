import hmUI from 'zeppos-cross-api/ui';
import { px } from 'zeppos-cross-api/utils';
import { isRtlLang } from '../lib/i18n/lang';
import {
  BASE_FONT_SIZE,
  BLACK,
  MAIN_COLOR,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SECONDARY_COLOR,
} from '../lib/mmk/UiParams';

const ICON_WIDTH = BASE_FONT_SIZE * 2;
export const ROW_STYLE = {
  text: '',
  color: BLACK,
  outlineColor: MAIN_COLOR,
  card: {
    color: BLACK,
    radius: 0,
  },
  description: '',
  iconWidth: ICON_WIDTH,
  iconText: '',
  iconAlignH: hmUI.align.CENTER_H,
  iconAlignV: hmUI.align.CENTER_V,
  iconColor: BLACK,
  // AlignH: hmUI.align.CENTER_H
};

export const PLAYER_BTN_X = px(8);
export const PLAYER_BTN_W = px(64);
export const PLAYER_BTN_H = px(64);
export const PLAYER_BTN_Y = (SCREEN_HEIGHT - (PLAYER_BTN_H * 3)) / 2;
export const PLAYER_BTN_OY = PLAYER_BTN_H;
export const PLAYER_BTN = {
  x: PLAYER_BTN_X,
  y: PLAYER_BTN_Y,
  text: '',
  w: -1,
  h: -1,
};

const VERSE_PLAYER_BORDER_WIDTH = px(3);
const VERSE_PLAYER_TEXT_HEIGHT = px(336) + (VERSE_PLAYER_BORDER_WIDTH * 2);
const VERSE_PLAYER_TEXT_WIDTH = Math.floor(Math.sqrt((SCREEN_WIDTH * SCREEN_WIDTH) - (VERSE_PLAYER_TEXT_HEIGHT * VERSE_PLAYER_TEXT_HEIGHT))) - (VERSE_PLAYER_BORDER_WIDTH * 2);
const INFO_FONT_SIZE = px(26);
const INFO_ICON_WIDTH = INFO_FONT_SIZE * 2;
const INFO_OFFSET_X = px(26);
const INFO_OFFSET_Y = px(4);
const rtl = isRtlLang();
const leftIconX = (SCREEN_WIDTH / 2) - (INFO_ICON_WIDTH / 2) - px(80);
const rightIconX = (SCREEN_HEIGHT / 2) + (INFO_ICON_WIDTH / 2) + px(16);
export const CLEAR_DISPLAY_ICON = {
  x: rtl ? rightIconX : leftIconX,
  y: px(5),
  src: 'clear.png',
  rotate: rtl ? 180 : 0,
};

export const EXIT_ICON = {
  x: rtl ? leftIconX : rightIconX,
  y: px(5),
  src: 'exit.png',
};

export const JUZ_CIRCLE = {
  center_x: SCREEN_WIDTH / 2,
  center_y: (SCREEN_HEIGHT / 2) - INFO_OFFSET_Y - (VERSE_PLAYER_TEXT_HEIGHT / 2) - VERSE_PLAYER_BORDER_WIDTH - (INFO_ICON_WIDTH / 2),
  radius: INFO_ICON_WIDTH / 2,
  color: MAIN_COLOR,
};

export const JUZ_TEXT = {
  x: (SCREEN_WIDTH / 2) - (INFO_ICON_WIDTH / 2),
  y: (SCREEN_HEIGHT / 2) - INFO_OFFSET_Y - (VERSE_PLAYER_TEXT_HEIGHT / 2) - VERSE_PLAYER_BORDER_WIDTH - INFO_ICON_WIDTH,
  w: INFO_ICON_WIDTH,
  h: INFO_ICON_WIDTH,
  text_size: INFO_FONT_SIZE,
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  color: 0xFFFFFF,
};

const offsetX = (SCREEN_WIDTH / 2) - INFO_OFFSET_X - INFO_ICON_WIDTH;
export const CHAPTER_CIRCLE = {
  center_x: rtl ? (SCREEN_WIDTH - offsetX - (INFO_ICON_WIDTH / 2)) : (offsetX + (INFO_ICON_WIDTH / 2)),
  center_y: (SCREEN_HEIGHT / 2) + INFO_OFFSET_Y + (VERSE_PLAYER_TEXT_HEIGHT / 2) + VERSE_PLAYER_BORDER_WIDTH + (INFO_ICON_WIDTH / 2),
  radius: INFO_ICON_WIDTH / 2,
  color: SECONDARY_COLOR,
};

export const CHAPTER_TEXT = {
  x: rtl ? SCREEN_WIDTH - offsetX - INFO_ICON_WIDTH : offsetX,
  y: (SCREEN_HEIGHT / 2) + INFO_OFFSET_Y + (VERSE_PLAYER_TEXT_HEIGHT / 2) + VERSE_PLAYER_BORDER_WIDTH,
  w: INFO_ICON_WIDTH,
  h: INFO_ICON_WIDTH,
  text_size: INFO_FONT_SIZE,
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  color: 0xFFFFFF,
};

export const VERSE_PLAYER_LABEL = {
  x: rtl ? 0 : (SCREEN_WIDTH / 2) - INFO_OFFSET_X + px(8),
  y: CHAPTER_TEXT.y,
  w: SCREEN_WIDTH - offsetX - CHAPTER_TEXT.w - px(8),
  h: INFO_ICON_WIDTH,
  text_size: BASE_FONT_SIZE,
  align_h: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT,
  align_v: hmUI.align.CENTER_V,
  color: 0xFFFFFF,
};

export const VERSE_PLAYER_TEXT = {
  x: (SCREEN_WIDTH - VERSE_PLAYER_TEXT_WIDTH) / 2,
  y: (SCREEN_HEIGHT - VERSE_PLAYER_TEXT_HEIGHT) / 2,
  w: VERSE_PLAYER_TEXT_WIDTH,
  h: VERSE_PLAYER_TEXT_HEIGHT,
  text_size: BASE_FONT_SIZE,
  text_style: hmUI.text_style.WRAP,
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  color: 0xFFFFFF,
};

export const VERSE_PLAYER_BORDER = {
  x: ((SCREEN_WIDTH - VERSE_PLAYER_TEXT_WIDTH) / 2) - (VERSE_PLAYER_BORDER_WIDTH * 2),
  y: ((SCREEN_HEIGHT - VERSE_PLAYER_TEXT_HEIGHT) / 2) - (VERSE_PLAYER_BORDER_WIDTH * 2),
  w: VERSE_PLAYER_TEXT_WIDTH + (VERSE_PLAYER_BORDER_WIDTH * 4),
  h: VERSE_PLAYER_TEXT_HEIGHT + (VERSE_PLAYER_BORDER_WIDTH * 4),
  color: 0xAAAAAA,
  line_width: VERSE_PLAYER_BORDER_WIDTH,
  radius: VERSE_PLAYER_BORDER_WIDTH,
};
