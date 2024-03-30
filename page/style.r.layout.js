import hmUI from '@zos/ui'
import { px } from '@zos/utils'
import { BASE_FONT_SIZE, BLACK, MAIN_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../libs/mmk/UiParams'

export const MAIN_TITLE_STYLE = {
  x: px(0),
  y: px(0),
  w: SCREEN_WIDTH,
  h: px(45),
  text_size: px(18),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.NONE,
  color: 0xffffff
}

export const ROW_STYLE = {
  text: '',
  color: BLACK,
  outlineColor: MAIN_COLOR,
  card: {
    color: BLACK,
    radius: 0
  },
  description: '',
  iconWidth: BASE_FONT_SIZE * 2,
  iconText: '',
  iconAlignH: hmUI.align.CENTER_H,
  iconAlignV: hmUI.align.CENTER_V,
  iconColor: BLACK,
  alignH: hmUI.align.CENTER_H
}

export const MAIN_BUTTON_TEXT_SIZE = px(32)
export const MAIN_BUTTON_W = SCREEN_WIDTH - px(80)
export const MAIN_BUTTON_H = MAIN_BUTTON_TEXT_SIZE * 2 + px(10)
export const MAIN_BUTTON_X = (SCREEN_WIDTH - MAIN_BUTTON_W) / 2
export const MAIN_BUTTON_Y = px(60)
export const MAIN_BUTTON_OY = MAIN_BUTTON_H + px(5)
export const MAIN_BUTTON = {
  x: MAIN_BUTTON_X,
  y: MAIN_BUTTON_Y,
  w: MAIN_BUTTON_W,
  h: MAIN_BUTTON_H,
  text_size: MAIN_BUTTON_TEXT_SIZE,
  text_style: hmUI.text_style.NONE,
  radius: 8,
  color: 0xffffff,
  press_color: 0x1976d2,
  normal_color: 0xef5350
}

export const VIEW_CONTAINER = {
  x: px(0),
  y: px(60),
  w: SCREEN_WIDTH,
  h: SCREEN_HEIGHT
}

export const SURAH_PLAYER_LABEL = {
  x: px(40),
  y: px(0),
  w: SCREEN_WIDTH - px(40) * 2,
  h: px(40),
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  color: 0xffffff
}

export const VERSE_PLAYER_LABEL = {
  x: px(40),
  y: SCREEN_HEIGHT - px(50),
  w: SCREEN_WIDTH - px(40) * 2,
  h: px(40),
  text_size: px(32),
  align_h: hmUI.align.CENTER_H,
  color: 0xffffff
}

export const PLAYER_BTN_X = px(16)
export const PLAYER_BTN_W = px(64)
export const PLAYER_BTN_H = px(64)
export const PLAYER_BTN_Y = SCREEN_HEIGHT / 2 - PLAYER_BTN_H * 2
export const PLAYER_BTN_OY = px(64)
export const PLAYER_BTN = {
  x: PLAYER_BTN_X,
  y: PLAYER_BTN_Y,
  text: '',
  w: -1,
  h: -1
}

export const VERSE_PLAYER_TEXT = {
  x: PLAYER_BTN_W + PLAYER_BTN_X,
  y: px(40),
  w: SCREEN_WIDTH - PLAYER_BTN_W * 2 - PLAYER_BTN_X * 2,
  h: SCREEN_HEIGHT - px(80),
  text_size: px(48),
  text_style: hmUI.text_style.WRAP,
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  color: 0xffffff
}
