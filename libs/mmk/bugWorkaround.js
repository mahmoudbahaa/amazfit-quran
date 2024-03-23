import { back } from '@zos/router';
import { scrollTo } from '@zos/page';
import { GESTURE_RIGHT } from '@zos/interaction';
import * as hmUI from '@zos/ui';

import {IS_LOW_RAM_DEVICE, SCREEN_HEIGHT, SCREEN_WIDTH} from "./UiParams";

export function goBack() {
  if(!IS_LOW_RAM_DEVICE) return back();
  
  scrollTo(0);
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN_WIDTH,
    h: SCREEN_HEIGHT,
    color: 0x0
  });
  setTimeout(() => back(), 350);
}

export function goBackGestureCallback(ev) {
  if(ev === GESTURE_RIGHT) {
  	goBack();
    return true;
  }

  return false;
}
