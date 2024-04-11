import hmUI from 'zeppos-cross-api/ui'
import { px } from 'zeppos-cross-api/utils'

export function createSwitch (rtl, x, y, initialState, checkedChangeFunc) {
  return hmUI.createWidget(hmUI.widget.SLIDE_SWITCH, {
    x,
    y,
    w: px(100),
    h: px(56),
    select_bg: 'switch_on.png',
    un_select_bg: 'switch_off.png',
    slide_src: 'radio_select.png',
    slide_select_x: rtl ? px(10) : px(50),
    slide_un_select_x: rtl ? px(50) : px(10),
    checked: initialState,
    checked_change_func: checkedChangeFunc
  })
}
