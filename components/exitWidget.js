import hmUI from '@zos/ui'

export function createExitButton (x, y, w, onClick) {
  hmUI.createWidget(hmUI.widget.CIRCLE, {
    center_x: x + w / 2,
    center_y: y + w / 2,
    radius: w / 2,
    color: 0xfc6950
  }).addEventListener(hmUI.event.CLICK_UP, onClick)

  hmUI.createWidget(hmUI.widget.TEXT, {
    x,
    y,
    w,
    h: w,
    color: 0xffffff,
    text_size: 36,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text: 'X'
  })
}
