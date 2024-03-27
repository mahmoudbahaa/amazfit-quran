import * as hmUI from '@zos/ui'
import { px } from '@zos/utils'
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "../../libs/mmk/UiParams";

let loadingAnim

export function createLoadingWidget (vc = hmUI, y) {
  loadingAnim = vc.createWidget(hmUI.widget.IMG_ANIM, {
    anim_path: 'loading-ani',
    anim_prefix: 'ani',
    anim_ext: 'png',
    anim_fps: 30,
    anim_size: 54,
    repeat_count: 0,
    anim_repeat: true,
    anim_status: hmUI.anim_status.START,
    x: SCREEN_WIDTH / 2 - px(80),
    y: y === undefined ? SCREEN_HEIGHT / 2 - px(80) : y,
    anim_complete_call: () => {
      console.log('animation complete')
    }
  })
}

export function deleteLoadingWidget (vc = hmUI) {
  if (loadingAnim) vc.deleteWidget(loadingAnim)
}
