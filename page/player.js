/* global getApp, Page */
import { setWakeUpRelaunch } from '@zos/display'
import { exit } from '@zos/router'
import { Time } from '@zos/sensor'
import hmUI from '@zos/ui'
import { log as Logger } from '@zos/utils'
import {
  DECREASE_VOLUME,
  EXIT,
  INCREASE_VOLUME,
  NEXT,
  PAUSE,
  PLAY,
  PREVIOUS,
  QuranPlayer,
  START,
  STOP
} from '../components/quranPlayer'
import { getVerseInfo, setPlayerInfo } from '../libs/config/default'
import { getVerseJuz } from '../libs/config/juzs.js'
import { getVerseText } from '../libs/config/verse'
import { MIN_TIMEOUT_DURATION, NUM_VERSES } from '../libs/constants.js'
import { _, isRtlLang } from '../libs/i18n/lang'
import { ICON_SIZE_MEDIUM, MAIN_COLOR, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import { parseQuery } from '../libs/utils.js'
import * as Styles from './style.r.layout'

const time = new Time()
const logger = Logger.getLogger('player page')

Page({
  state: {
    interval: undefined,
    type: undefined,
    number: -1,
    verse: undefined,
    verseInfo: {}
  },

  onInit (paramsString) {
    setWakeUpRelaunch({
      relaunch: true
    })

    getApp()._options.globalData.player = new QuranPlayer()
    const params = parseQuery(paramsString)
    this.state.number = parseInt(params.number)
    this.state.type = params.type
    if (params.verse !== undefined) this.state.verse = params.verse
  },
  onPause () {
    logger.log('page on pause invoke')
    // if (getApp()._options.globalData.player) {
    //   getApp()._options.globalData.player.doAction(this.getServiceParam(EXIT))
    //   getApp()._options.globalData.player = undefined
    // }
  },
  onResume () {
    logger.log('page on resume invoke')
    // restorePlayer()
  },
  onDestroy () {
    logger.log('page on destroy invoke')

    delete getApp()._options.globalData.playerInfo.verseStartTime
    delete getApp()._options.globalData.playerInfo.curDownloadedVerse
    logger.log('Saving Player Info' + JSON.stringify(getApp()._options.globalData.playerInfo))
    setPlayerInfo(getApp()._options.globalData.playerInfo)

    logger.log('Exiting Player')
    if (getApp()._options.globalData.player) {
      getApp()._options.globalData.player.doAction(this.getServiceParam(EXIT))
      getApp()._options.globalData.player = undefined
    }
    if (this.state.interval) {
      clearInterval(this.state.interval)
    }
  },

  getServiceParam (action) {
    let extraParams = ''
    if (action === START) {
      extraParams = `&type=${this.state.type}&number=${this.state.number}`
      if (this.state.verse !== undefined) extraParams += `&verse=${this.state.verse}`
    }

    return `action=${action}${extraParams}`
  },

  getDownloadLabel (verse) {
    return `${_('Downloading')} ${_('Verse')} ${this.getVerseLabel(verse)}`
  },

  getJuz (v) {
    return _(getVerseJuz(v))
  },

  getChapter (v) {
    return _(v.split(':')[0])
  },

  getVerseLabel (v) {
    const label = `${_(v.split(':')[1])}${_('/')}${_(NUM_VERSES[parseInt(v.split(':')[0]) - 1])}`
    if (!isRtlLang()) return label
    return '‏؜' + label
  },

  getVerseTextParts (verse) {
    return {
      texts: getVerseText(verse),
      mapping: getVerseInfo(verse)
    }
  },

  build () {
    hmUI.createWidget(hmUI.widget.STROKE_RECT, {
      ...Styles.VERSE_PLAYER_BORDER
    })

    hmUI.createWidget(hmUI.widget.CIRCLE, {
      ...Styles.JUZ_CIRCLE
    })

    const juzLabel = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.JUZ_TEXT
    })

    hmUI.createWidget(hmUI.widget.CIRCLE, {
      ...Styles.CHAPTER_CIRCLE
    })

    const chapterLabel = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.CHAPTER_TEXT
    })

    const verseText = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.VERSE_PLAYER_TEXT
    })

    const verseInfo = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.VERSE_PLAYER_LABEL,
      text: ''
    })

    hmUI.createWidget(hmUI.widget.IMG, {
      ...Styles.CLEAR_DISPLAY_ICON
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      if (this.state.interval) {
        juzLabel.setProperty(hmUI.prop.TEXT, '')
        chapterLabel.setProperty(hmUI.prop.TEXT, '')
        verseInfo.setProperty(hmUI.prop.TEXT, '')
        verseText.setProperty(hmUI.prop.TEXT, '')
        clearInterval(this.state.interval)
        this.state.interval = undefined
      } else {
        this.state.interval = setInterval(() => updater(this), MIN_TIMEOUT_DURATION)
      }
    })

    hmUI.createWidget(hmUI.widget.IMG, {
      ...Styles.EXIT_ICON
    }).addEventListener(hmUI.event.CLICK_UP, () => {
      exit()
    })

    let verse
    let verseTextText
    let lastVerse
    let lastVerseText = ''
    let lastVerseInfo
    let lastVersePartIndex
    let elapsed
    const updater = (that) => {
      verse = getApp()._options.globalData.playerInfo.curVerse
      if (verse !== undefined) {
        // A verse is being played
        if (lastVerse !== verse) {
          // A new verse is played
          lastVerseInfo = that.getVerseTextParts(verse)
          lastVersePartIndex = 0
          verseTextText = lastVerseText = lastVerseInfo.texts[0]
          lastVerse = verse
        } else if (lastVersePartIndex >= lastVerseInfo.mapping.length) {
          // Reached the last part of the verse no need to check elapsed
          verseTextText = lastVerseText
        } else {
          // There is still more parts of the verse check the need to go to next part
          elapsed = time.getTime() - getApp()._options.globalData.playerInfo.verseStartTime
          if (elapsed > lastVerseInfo.mapping[lastVersePartIndex]) {
            // Need to go to next part
            lastVersePartIndex++
            verseTextText = lastVerseText = lastVerseInfo.texts[lastVersePartIndex]
          } else {
            // Remain on the same part
            verseTextText = lastVerseText
          }
        }
      } else {
        // Still Downloading
        verse = getApp()._options.globalData.playerInfo.curDownloadedVerse
        if (verse === undefined) return
        verseTextText = that.getDownloadLabel(verse)
      }

      verseInfo.setProperty(hmUI.prop.TEXT, that.getVerseLabel(verse))
      juzLabel.setProperty(hmUI.prop.TEXT, that.getJuz(verse))
      chapterLabel.setProperty(hmUI.prop.TEXT, that.getChapter(verse))
      verseText.setProperty(hmUI.prop.TEXT, verseTextText)
    }

    this.state.interval = setInterval(() => updater(this), MIN_TIMEOUT_DURATION)

    const playPauseButton = { src: 'pause.png', action: PAUSE, left: true }
    const playerButtons = [
      { src: 'volume-dec.png', action: DECREASE_VOLUME, left: true },
      playPauseButton,
      { src: 'back.png', action: PREVIOUS, left: true },
      { src: 'volume-inc.png', action: INCREASE_VOLUME, left: false },
      { src: 'stop.png', action: STOP, left: false },
      { src: 'forward.png', action: NEXT, left: false }
    ]

    let startYLeft = 0
    let startYRight = 0
    const rtl = isRtlLang()
    playerButtons.forEach((playerButton) => {
      const left = (playerButton.left && !rtl) || (!playerButton.left && rtl)
      const x = left ? Styles.PLAYER_BTN_X : (SCREEN_WIDTH - Styles.PLAYER_BTN_X - Styles.PLAYER_BTN_W)
      const y = Styles.PLAYER_BTN_Y + Styles.PLAYER_BTN_OY * (playerButton.left ? startYLeft++ : startYRight++)

      const bg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
        ...Styles.PLAYER_BTN,
        x,
        y,
        w: ICON_SIZE_MEDIUM,
        h: ICON_SIZE_MEDIUM,
        color: MAIN_COLOR
      })

      bg.setProperty(hmUI.prop.VISIBLE, false)
      const img = hmUI.createWidget(hmUI.widget.IMG, {
        ...Styles.PLAYER_BTN,
        x,
        y,
        w: ICON_SIZE_MEDIUM,
        h: ICON_SIZE_MEDIUM,
        src: playerButton.src,
        angle: rtl ? 180 : 0,
        center_x: ICON_SIZE_MEDIUM / 2,
        center_y: ICON_SIZE_MEDIUM / 2
      })

      playerButton.img = img
      img.addEventListener(hmUI.event.CLICK_UP, () => {
        bg.setProperty(hmUI.prop.VISIBLE, true)
        setTimeout(() => bg.setProperty(hmUI.prop.VISIBLE, false), MIN_TIMEOUT_DURATION)
        getApp()._options.globalData.player.doAction(this.getServiceParam(playerButton.action))

        if (playerButton.action === PLAY) {
          playPauseButton.action = PAUSE
          playPauseButton.img.setProperty(hmUI.prop.SRC, 'pause.png')
        } else if (playerButton.action === PAUSE || playerButton.action === STOP) {
          playPauseButton.action = PLAY
          playPauseButton.img.setProperty(hmUI.prop.SRC, 'play.png')
        }
      })
    })

    getApp()._options.globalData.player.doAction(this.getServiceParam(START))
  }
})
