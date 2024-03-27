import { getDeviceInfo } from '@zos/device'

import { deviceClass, isLowRamDevice } from './DeviceIdentifier'

const info = getDeviceInfo()

export const SCREEN_WIDTH = info.width
export const SCREEN_HEIGHT = info.height

export const IS_MI_BAND_7 = deviceClass === 'miband'
export const IS_LOW_RAM_DEVICE = isLowRamDevice
export const MAIN_COLOR = 0x0986D4
export const MAIN_COLOR_TXT = 0x4FCAF8
export const SECONDARY_COLOR = 0x006400
export const SECONDARY_COLOR_TXT = 0x88FF88
export const WARNING_COLOR = 0xAD3C23
export const WARNING_COLOR_TXT = 0xAD3C23
export const BLACK = 0x000000
let SCREEN_MARGIN_Y = 0
let SCREEN_MARGIN_X = 0
export const ICON_TEXT_SEPARATOR_WIDTH = 24
let ICON_SIZE_SMALL = 24
const ICON_SIZE_MEDIUM = 48
let BASE_FONT_SIZE = 32
let IS_ROUND = false

switch (deviceClass) {
  case 'miband': // mb7
    SCREEN_MARGIN_Y = 96
    break
  case 'band': // ab7
    SCREEN_MARGIN_Y = 48
    break
  case 'square': // gts series
    SCREEN_MARGIN_Y = 64
    BASE_FONT_SIZE = 24
    ICON_SIZE_SMALL = 32
    break
  case 'circle': // gtr/falcon/t-rex
    IS_ROUND = true
    SCREEN_MARGIN_Y = 32
    SCREEN_MARGIN_X = 24
    BASE_FONT_SIZE = 36
    ICON_SIZE_SMALL = 24
    break
}

export {
  SCREEN_MARGIN_Y,
  SCREEN_MARGIN_X,
  ICON_SIZE_SMALL,
  ICON_SIZE_MEDIUM,
  BASE_FONT_SIZE,
  IS_ROUND
}

export const WIDGET_WIDTH = SCREEN_WIDTH - SCREEN_MARGIN_X * 2
