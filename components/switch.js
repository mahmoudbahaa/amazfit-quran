import hmUI from '@zos/ui'
import { px } from '@zos/utils'

export function createSwitch (x, y, initialState, checkedChangeFunc) {
  return hmUI.createWidget(hmUI.widget.SLIDE_SWITCH, {
    x,
    y,
    w: px(100),
    h: px(56),
    select_bg: 'switch_on.png',
    un_select_bg: 'switch_off.png',
    slide_src: 'radio_select.png',
    slide_select_x: px(50),
    slide_un_select_x: px(10),
    // slide_y: px(-7),
    checked: initialState,
    checked_change_func: checkedChangeFunc
  })
}
