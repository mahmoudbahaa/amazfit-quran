import * as hmUI from '@zos/ui'
import { px } from '@zos/utils'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../libs/mmk/UiParams'

let loadingAnim
export function createLoadingWidget () {
  loadingAnim = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
    x: 0,
    y: 0,
    h: SCREEN_HEIGHT,
    w: SCREEN_WIDTH,
    z_index: 1000
  })

  loadingAnim.createWidget(hmUI.widget.FILL_RECT, {
    x: 0,
    y: 0,
    h: SCREEN_HEIGHT,
    w: SCREEN_WIDTH,
    color: 0x000000
  })

  loadingAnim.createWidget(hmUI.widget.IMG_ANIM, {
    anim_path: 'loading-ani',
    anim_prefix: 'ani',
    anim_ext: 'png',
    anim_fps: 30,
    anim_size: 54,
    repeat_count: 0,
    anim_repeat: true,
    anim_status: hmUI.anim_status.START,
    x: SCREEN_WIDTH / 2 - px(80),
    y: SCREEN_HEIGHT / 2 - px(80),
    anim_complete_call: () => {
      console.log('animation complete')
    }
  })
}

export function deleteLoadingWidget () {
  if (loadingAnim) hmUI.deleteWidget(loadingAnim)
}
