/* global getApp */
import * as hmUI from 'zeppos-cross-api/ui'
import { px } from 'zeppos-cross-api/utils'
import { MIN_TIMEOUT_DURATION } from '../lib/constants'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_COLOR_TXT } from '../lib/mmk/UiParams'

export function createLoadingWidget (onLoadingComplete) {
  const loadingAnim = {}
  getApp()._options.globalData.loadingAnim = loadingAnim
  loadingAnim.anim = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
    x: 0,
    y: 0,
    h: SCREEN_HEIGHT,
    w: SCREEN_WIDTH,
    z_index: 1000
  })

  loadingAnim.anim.createWidget(hmUI.widget.FILL_RECT, {
    x: 0,
    y: 0,
    h: SCREEN_HEIGHT,
    w: SCREEN_WIDTH,
    color: 0x000000
  })

  loadingAnim.anim.createWidget(hmUI.widget.IMG_ANIM, {
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

  loadingAnim.onLoadingComplete = onLoadingComplete

  loadingAnim.status = loadingAnim.anim.createWidget(hmUI.widget.TEXT, {
    x: 0,
    y: SCREEN_HEIGHT / 2 + px(80),
    w: SCREEN_WIDTH,
    h: this.fontSize * 1.5,
    text: '',
    text_size: this.fontSize * 1.25,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    color: STATUS_COLOR_TXT
  })
}

export function updateStatus (text) {
  if (getApp()._options.globalData.loadingAnim?.status) getApp()._options.globalData.loadingAnim.status.setProperty(hmUI.prop.TEXT, text)
}

export function deleteLoadingWidget (data) {
  const loadingAnim = getApp()._options.globalData.loadingAnim
  getApp()._options.globalData.loadingAnim = undefined
  if (loadingAnim) {
    hmUI.deleteWidget(loadingAnim.anim)
    if (loadingAnim.onLoadingComplete) {
      setTimeout(() => loadingAnim.onLoadingComplete(data), MIN_TIMEOUT_DURATION)
    }
  }
}
