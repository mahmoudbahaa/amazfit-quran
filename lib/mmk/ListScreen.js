import { getScrollTop } from 'zeppos-cross-api/page'
import * as hmUI from 'zeppos-cross-api/ui'
import * as Styles from '../../page/style.r.layout'
import { RowEntry } from './ListScreenParts/RowEntry'
import {
  BASE_FONT_SIZE,
  IS_ROUND,
  SCREEN_HEIGHT,
  SCREEN_MARGIN_X,
  SCREEN_MARGIN_Y,
  SCREEN_WIDTH,
  WIDGET_WIDTH
} from './UiParams'

export class ListScreen {
  /**
   * @param {boolean} [rtl]
   */
  constructor (rtl) {
    this.rtl = rtl
    this.positionY = SCREEN_MARGIN_Y
    this.fontSize = BASE_FONT_SIZE
    this.accentColor = 0x0077AA
    this.entries = []
  }

  /**
   * @param {number} [listIndex]
   * @param {number} [posY]
   * @param {number} [scrollUpdateDuration]
   */
  finalize (listIndex = undefined, posY = undefined, scrollUpdateDuration = undefined) {
    if (!IS_ROUND) return

    let lastPosY = -1000
    this.scrollInterval = setInterval(() => {
      const yOffset = getScrollTop()
      if (lastPosY === yOffset) return
      lastPosY = yOffset
      this._onScroll(yOffset)
    }, scrollUpdateDuration || 50)

    if (listIndex === undefined) {
      this.realEntriesNum = this.entries.length - 1
    } else {
      this.realEntriesNum = listIndex - 1
      const lastRow = this.entries[this.realEntriesNum]
      if (lastRow.setVisible) lastRow.setVisible(true)
      const excessEntries = this.entries.slice(this.realEntriesNum + 1)
      excessEntries.forEach(entry => { if (entry.setVisible) entry.setVisible(false) })
    }
    this._onScroll(posY)
  }

  stop () {
    if (this.scrollInterval) clearInterval(this.scrollInterval)
  }

  build () {}

  /**
   * @param {string} text
   */
  headline (text) {
    const font = this.fontSize + 4
    const lineHeight = Math.floor(font * 1.5)
    const config = {
      x: SCREEN_MARGIN_X + 4,
      w: WIDGET_WIDTH - 8,
      h: lineHeight,
      color: this.accentColor,
      align_v: hmUI.align.CENTER_V,
      y: this.positionY,
      text_size: font,
      text
    }
    const widget = hmUI.createWidget(hmUI.widget.TEXT, config)
    const entry = {
      widget,
      viewHeight: lineHeight,
      positionY: this.positionY,
      _setPositionY: (/** @type {number} */ y) => {
        entry.positionY = y
        widget.setProperty(hmUI.prop.MORE, {
          ...config,
          y
        })
      }
    }

    this._registerRow(entry)
    return entry
  }

  /**
   * @param {string} text
   * @param {string} description
   */
  headlineRow (text, description = undefined) {
    this.row({
      text,
      description,
      color: this.accentColor,
      text_size: this.fontSize - 4,
      card: {
        color: 0x000000,
        radius: 0
      }
    })
  }

  offset (height = SCREEN_MARGIN_Y) {
    const config = {
      x: 0,
      y: this.positionY,
      w: SCREEN_WIDTH,
      h: height
    }

    const entry = {
      widget: hmUI.createWidget(hmUI.widget.IMG, config),
      positionY: this.positionY,
      viewHeight: height,
      /**
       * @param {number} y
       */
      _setPositionY (y) {
        entry.positionY = y
        entry.widget.setProperty(hmUI.prop.MORE, { ...config, y })
      }
    }

    this._registerRow(entry)
    return entry
  }

  /**
   * @param {{ text?: any; icon?: any; outlineColor?: number; callback?: any; card?: any, description?: any; color?: number; text_size?: number; alignH?: number; }} userConfig
   * @returns {RowEntry}
   */
  row (userConfig) {
    if (userConfig.alignH === undefined) userConfig.alignH = this.rtl ? hmUI.align.RIGHT : hmUI.align.LEFT
    return this._classBasedEntry(RowEntry, userConfig)
  }

  replaceOrCreateRow (userConfig, index) {
    userConfig = {
      ...Styles.ROW_STYLE,
      ...userConfig,
      card: {
        ...Styles.ROW_STYLE.card,
        ...userConfig.card
      }
    }

    if (index >= this.entries.length) {
      return this.row(userConfig)
    }

    if (!this.entries[index]) {
      console.log('Index=' + index)
    }
    this.entries[index]._update(userConfig)
  }

  /**
   * @param {typeof RowEntry} ClassEntry
   * @param {any} userConfig
   * @returns {any} // {CardEntry | RowEntry}
   */
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

  _onScroll (scrollTop) {
    const entriesLength = this.realEntriesNum | this.entries.length - 1
    let entryY = SCREEN_MARGIN_Y - SCREEN_HEIGHT / 2
    this.entries.slice(0, this.realEntriesNum + 1).forEach((entry, i) => {
      entryY += entry.viewHeight / 2
      const y = entryY + scrollTop
      entryY += entry.viewHeight / 2
      const maxY = SCREEN_HEIGHT / 2 // + this.baseRowHeight
      const hidden = y < -maxY || y > maxY
      if (hidden) {
        if (entry.setVisible && i < entriesLength) {
          entry.setVisible(false)
        }
        return
      }

      const r = SCREEN_WIDTH / 2
      const x = (this.rtl ? 1 : -1) * (Math.sqrt(r * r - y * y) - SCREEN_WIDTH / 2) + (this.rtl ? SCREEN_MARGIN_X * 2 : 0)
      if (entry.updateX) entry.updateX(x)
      if (entry.setVisible && i < entriesLength && !hidden) entry.setVisible(true)
    })
  }
}
