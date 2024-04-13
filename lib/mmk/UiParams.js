import { getDeviceInfo } from 'zeppos-cross-api/device';

import { px } from 'zeppos-cross-api/utils';
import { deviceClass, isLowRamDevice } from './DeviceIdentifier';

const info = getDeviceInfo();

export const SCREEN_WIDTH = info.width;
export const SCREEN_HEIGHT = info.height;

export const IS_MI_BAND_7 = deviceClass === 'miband';
export const IS_LOW_RAM_DEVICE = isLowRamDevice;
export const MAIN_COLOR = 0x0986D4;
export const MAIN_COLOR_TXT = 0x4FCAF8;
export const SECONDARY_COLOR = 0x006400;
export const SECONDARY_COLOR_TXT = 0x88FF88;
export const WARNING_COLOR = 0xAD3C23;
export const WARNING_COLOR_TXT = 0xAD3C23;
export const STATUS_COLOR_TXT = 0xFF7F50;
export const BLACK = 0x000000;
let SCREEN_MARGIN_Y = 0;
let SCREEN_MARGIN_X = 0;
let ICON_SIZE_SMALL = 24;
const ICON_SIZE_MEDIUM = 64;
let BASE_FONT_SIZE = px(32);
let IS_ROUND = false;

switch (deviceClass) {
  case 'miband': // Mb7
    SCREEN_MARGIN_Y = 96;
    break;
  case 'band': // Ab7
    SCREEN_MARGIN_Y = 48;
    break;
  case 'square': // Gts series
    SCREEN_MARGIN_Y = 64;
    BASE_FONT_SIZE = 24;
    ICON_SIZE_SMALL = 32;
    break;
  case 'circle': // Gtr/falcon/t-rex
    IS_ROUND = true;
    SCREEN_MARGIN_Y = 96;
    SCREEN_MARGIN_X = 48;
    BASE_FONT_SIZE = px(32);
    ICON_SIZE_SMALL = 32;
    break;
  default: break;
}

export {
  // eslint-disable-next-line comma-dangle
  BASE_FONT_SIZE, ICON_SIZE_MEDIUM, ICON_SIZE_SMALL, IS_ROUND, SCREEN_MARGIN_X, SCREEN_MARGIN_Y
};

export const WIDGET_WIDTH = SCREEN_WIDTH - (SCREEN_MARGIN_X * 2);
