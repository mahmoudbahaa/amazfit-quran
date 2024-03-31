import * as hmUI from '@zos/ui'
import { MAIN_COLOR, SCREEN_MARGIN_X, SCREEN_WIDTH, WIDGET_WIDTH } from '../UiParams'

export class CardEntry {
  constructor (config, screen, positionY) {
    this.screen = screen
    this.positionY = positionY
    this.config = {
      color: 0x111111,
      offsetX: 0,
      radius: 8,
      width: WIDGET_WIDTH,
      hiddenIcon: null,
      ...config
    }
  }

  _setCallback () {
    if (!this.config.callback) return

    this.mod_callback = () => {
      this.bg.setProperty(hmUI.prop.COLOR, MAIN_COLOR)
      setTimeout(() => {
        this.bg.setProperty(hmUI.prop.COLOR, this.config.color)
        this.config.callback()
      }, 200)
    }

    this.group.addEventListener(hmUI.event.CLICK_UP, this.mod_callback)
  }

  _init () {
    this.group = this.screen.vc.createWidget(hmUI.widget.GROUP, this._groupConfig)
    this.bg = this.group.createWidget(hmUI.widget.FILL_RECT, this._bgConfig)
    this._setCallback()
  }

  get _groupConfig () {
    return {
      x: SCREEN_MARGIN_X + this.config.offsetX,
      y: this.positionY,
      w: this.config.width,
      h: this.config.height
    }
  }

  get _bgConfig () {
    return {
      x: -SCREEN_WIDTH / 2,
      y: 0,
      w: SCREEN_WIDTH * 2,
      h: this.config.height,
      color: this.config.color,
      radius: this.config.radius
    }
  }

  get viewHeight () {
    return this.config.height
  }

  setVisible (visible) {
    this.group.setProperty(hmUI.prop.VISIBLE, visible)
  }

  updateX (x) {
    this.setVisible(true)
    this.group.setProperty(hmUI.prop.X, x)
  }
}
