/* global Page */
import { getDiskInfo } from 'zeppos-cross-api/device'
import hmUI from 'zeppos-cross-api/ui'
import { px } from 'zeppos-cross-api/utils'
import { getFontSize, getStorageInfoLine, setStorageInfoLine } from '../../lib/config/default'
import { MIN_TIMEOUT_DURATION } from '../../lib/constants'
import { _ } from '../../lib/i18n/lang'
import { FsTools } from '../../lib/mmk/Path'
import {
  BLACK, MAIN_COLOR,
  SCREEN_HEIGHT,
  SCREEN_MARGIN_X,
  SCREEN_MARGIN_Y,
  SCREEN_WIDTH,
  WIDGET_WIDTH
} from '../../lib/mmk/UiParams'
import { openPage } from '../../lib/utils'

const thisPage = 'page/file/storageInfo'
class StorageInfoScreen {
  constructor () {
    this.fontSize = getFontSize() - 6
  }

  renderVerticalCup (config, storage) {
    const cupStyle = {
      x: SCREEN_MARGIN_X + px(56),
      y: px(48),
      w: px(32),
      h: SCREEN_HEIGHT - px(96),
      color: 0x222222
    }

    hmUI.createWidget(hmUI.widget.FILL_RECT, cupStyle)

    let usedY = 0
    for (const i in config) {
      const currentRow = config[i]
      if (!storage[currentRow.key]) continue

      if (currentRow.key !== 'free' && currentRow.key !== 'total') {
        const height = Math.round(
          cupStyle.h * (storage[currentRow.key] / storage.total)
        )
        if (height < 2) continue

        hmUI.createWidget(hmUI.widget.FILL_RECT, {
          ...(cupStyle),
          y: cupStyle.y + cupStyle.h - usedY - height,
          h: height,
          color: currentRow.color
        })

        usedY += height
      }
    }

    this.posX = SCREEN_MARGIN_X + px(104)
    this.posY = px(8)
  }

  renderLineCup (config, storage) {
    const cupStyle = {
      x: SCREEN_MARGIN_X,
      y: SCREEN_MARGIN_Y + px(24),
      w: WIDGET_WIDTH,
      h: px(32),
      color: 0x222222
      // color: 0xFF0000
    }

    hmUI.createWidget(hmUI.widget.FILL_RECT, cupStyle)

    let usedX = 0
    for (const i in config) {
      const currentRow = config[i]
      if (!storage[currentRow.key]) continue

      if (currentRow.key !== 'free' && currentRow.key !== 'total') {
        const width = Math.round(
          cupStyle.w * (storage[currentRow.key] / storage.total)
        )
        if (width < 2) continue

        hmUI.createWidget(hmUI.widget.FILL_RECT, {
          ...(cupStyle),
          x: cupStyle.x + usedX,
          w: width,
          color: currentRow.color
        })

        usedX += width
      }
    }

    this.posX = SCREEN_MARGIN_X
    this.posY = SCREEN_MARGIN_Y + px(72)
  }

  start () {
    const storage = getDiskInfo()
    const rows = [
      {
        key: 'total',
        label: _('Total'),
        color: 0x999999
      },
      {
        key: 'free',
        label: _('Free'),
        color: 0xAAAAAA
      },
      {
        key: 'system',
        label: _('System'),
        color: 0xFFCC80
      },
      {
        key: 'app',
        label: _('Apps'),
        color: 0xFFAB91
      },
      {
        key: 'watchface',
        label: _('Watch faces'),
        color: 0x4fc3f7
      },
      {
        key: 'music',
        label: _('Media'),
        color: 0xF8BBD0
      },
      {
        key: 'unknown',
        label: _('Unknown'),
        color: 0x616161
      }
    ]

    // Calc unknown
    storage.unknown = storage.total
    for (const i in rows) {
      if (rows[i].key !== 'total' && rows[i].key !== 'unknown') { storage.unknown -= storage[rows[i].key] }
    }

    storage.unknown = Math.max(0, storage.unknown)

    const isLine = getStorageInfoLine()
    if (isLine) {
      this.renderLineCup(rows, storage)
    } else {
      this.renderVerticalCup(rows, storage)
    }

    // Text
    const rowWidth = SCREEN_WIDTH / 2 - SCREEN_MARGIN_X
    const columns = isLine ? 2 : 1

    let i = 0
    let savedY
    for (const currentRow of rows) {
      if (!storage[currentRow.key]) continue

      // Text
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: this.posX + (i % columns) * (rowWidth + 4) - 2,
        y: this.posY,
        w: rowWidth,
        h: this.fontSize * 1.5,
        text_size: this.fontSize,
        color: currentRow.color,
        text: currentRow.label,
        align_h: hmUI.align.CENTER_H
      })

      savedY = this.posY
      this.posY += this.fontSize * 1.5
      const text = FsTools.printBytes(storage[currentRow.key])

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: this.posX + (i % columns) * (rowWidth + 4),
        y: this.posY,
        w: rowWidth,
        h: (this.fontSize + 2) * 1.5,
        text_size: this.fontSize + 2,
        color: 0xffffff,
        text,
        align_h: hmUI.align.CENTER_H
      })

      if (i % 2 === 0 && isLine) {
        this.posY = savedY
      } else {
        this.posY += (this.fontSize + 2) * 1.6
      }
      i++
    }

    // Change Orientation
    const changeOrientationBg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: (isLine ? SCREEN_WIDTH / 2 - px(16) : SCREEN_MARGIN_X / 2 + px(24)) - px(16),
      y: (isLine ? (SCREEN_MARGIN_Y / 2 + px(16)) : (SCREEN_HEIGHT / 2 - px(16))) - px(16),
      w: px(64),
      h: px(64),
      color: BLACK
    })

    const callback = () => {
      changeOrientationBg.setProperty(hmUI.prop.COLOR, MAIN_COLOR)
      setTimeout(() => {
        changeOrientationBg.setProperty(hmUI.prop.COLOR, BLACK)
        setStorageInfoLine(!getStorageInfoLine())
        openPage(thisPage, undefined, true)
      }, MIN_TIMEOUT_DURATION)
    }

    hmUI.createWidget(hmUI.widget.IMG, {
      x: isLine ? SCREEN_WIDTH / 2 - px(16) : SCREEN_MARGIN_X / 2 + px(24),
      y: isLine ? (SCREEN_MARGIN_Y / 2 + px(16)) : (SCREEN_HEIGHT / 2 - px(16)),
      src: isLine ? 'vertical.png' : 'horizontal.png'
    }).addEventListener(hmUI.event.CLICK_UP, callback)
    changeOrientationBg.addEventListener(hmUI.event.CLICK_UP, callback)
  }
}

Page({
  onInit () {
    new StorageInfoScreen().start()
  }
})
