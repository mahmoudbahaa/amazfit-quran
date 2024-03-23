import hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../libs/utils";

export const MAIN_TITLE_STYLE = {
    x: px(0),
    y: px(0),
    w: DEVICE_WIDTH,
    h: px(45),
    text_size: px(18),
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
    color: 0xffffff,
};

export const MAIN_BUTTON_TEXT_SIZE = px(32);
export const MAIN_BUTTON_W = DEVICE_WIDTH - px(80);
export const MAIN_BUTTON_H = MAIN_BUTTON_TEXT_SIZE * 2 + px(10);
export const MAIN_BUTTON_X = (DEVICE_WIDTH - MAIN_BUTTON_W) / 2;
export const MAIN_BUTTON_Y = px(60);
export const MAIN_BUTTON_OY = MAIN_BUTTON_H + px(5);
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
    normal_color: 0xef5350,
};

export const VIEW_CONTAINER = {
    x: px(0),
    y: px(60),
    w: DEVICE_WIDTH,
    h: DEVICE_HEIGHT,
};

export const PLAYER_TEXT = {
    x: px(40),
    y: px(80),
    w: DEVICE_WIDTH - px(40) * 2,
    h: px(120),
    text_size: px(32),
    align_h: hmUI.align.CENTER_H,
    color: 0xffffff,
};
export const PLAYER_LABEL = {
    x: px(40),
    y: DEVICE_HEIGHT * 3 / 4 - px(40),
    w: DEVICE_WIDTH - px(40) * 2,
    h: px(120),
    text_size: px(32),
    align_h: hmUI.align.CENTER_H,
    color: 0xffffff,
};

export const PLAYER_BTN_X = px(16);
export const PLAYER_BTN_Y = DEVICE_HEIGHT / 2 - px(32);
export const PLAYER_BTN_OX = px(64);
export const PLAYER_BTN = {
    x: PLAYER_BTN_X,
    y: PLAYER_BTN_Y,
    text: '',
    w: -1,
    h: -1,
};