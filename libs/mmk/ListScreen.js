import * as hmUI from '@zos/ui'
import {
  BASE_FONT_SIZE,
  IS_ROUND,
  SCREEN_HEIGHT,
  SCREEN_MARGIN_X,
  SCREEN_MARGIN_Y,
  SCREEN_WIDTH
} from './UiParams'
import { RowEntry } from './ListScreenParts/RowEntry'

let lastPosY = -1000

export class ListScreen {
  constructor (rtl, yOffset = 0) {
    this._init(rtl, yOffset)
  }

  _init (rtl, yOffset) {
    this.positionY = SCREEN_MARGIN_Y + yOffset
    this.fontSize = BASE_FONT_SIZE
    this.entries = []
    // this.realEntriesNum = 0
    this.rtl = rtl
    this.vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, { bounce: 0 })
    this.scrollBar = hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
      target: this.vc
    })

    lastPosY = -1000
    if (this.scrollInterval) return

    if (IS_ROUND) {
      this.scrollInterval = setInterval(() => {
        const yOffset = this.vc.getProperty(hmUI.prop.POS_Y)
        if (lastPosY === yOffset) return
        lastPosY = yOffset
        this.onScroll(yOffset)
      }, 20)
    }
  }

  finalize (listIndex) {
    this.vc.setProperty(hmUI.prop.POS_Y, 0)
    this.realEntriesNum = listIndex - 1
    const lastRow = this.entries[this.realEntriesNum]
    if (lastRow.setVisible) lastRow.setVisible(true)
    const excessEntries = this.entries.slice(this.realEntriesNum + 1)
    excessEntries.forEach(entry => { if (entry.setVisible) entry.setVisible(false) })
  }

  row (userConfig) {
    return this._classBasedEntry(RowEntry, userConfig)
  }

  replaceOrCreateRow (userConfig, index) {
    if (index >= this.entries.length) {
      return this.row(userConfig)
    }

    this.entries[index]._update(userConfig)
  }

  _classBasedEntry (ClassEntry, userConfig) {
    const entry = new ClassEntry(userConfig, this, this.positionY)
    entry._init()
    this._registerRow(entry)
    return entry
  }

  _registerRow (data) {
    data._lastHeight = data.viewHeight
    data._index = this.entries.length
    this.entries.push(data)
    this.positionY += data.viewHeight
  }

  get baseRowHeight () {
    if (this.fontSize !== this._brh_lastheight) {
      this._brh_lastheight = this.fontSize
      this._brh_cached = hmUI.getTextLayout(' ', {
        text_size: this.fontSize,
        text_width: 96
      }).height + 18
    }
    return this._brh_cached
  }

  onScroll (scrollTop) {
    if (!IS_ROUND) return

    let entryY = SCREEN_MARGIN_Y - SCREEN_HEIGHT / 2
    this.entries.slice(0, this.realEntriesNum + 1).forEach((entry, i) => {
      entryY += entry.viewHeight / 2
      const y = entryY + scrollTop
      entryY += entry.viewHeight / 2
      const maxY = SCREEN_HEIGHT / 2 // + this.baseRowHeight
      const hidden = y < -maxY || y > maxY
      if (hidden) {
        if (entry.setVisible && i < this.realEntriesNum) {
          entry.setVisible(false)
        }
        return
      }

      const r = SCREEN_WIDTH / 2
      const x = (this.rtl ? 1 : -1) * (Math.sqrt(r * r - y * y) - SCREEN_WIDTH / 2) + SCREEN_MARGIN_X
      if (entry.updateX) entry.updateX(x)
      if (entry.setVisible && i < this.realEntriesNum && !hidden) entry.setVisible(true)
    })
  }
}
