/* global Page */
import { setWakeUpRelaunch } from 'zeppos-cross-api/display'
import { exit } from 'zeppos-cross-api/router'
import { Time } from 'zeppos-cross-api/sensor'
import { createWidget, event, prop, setStatusBarVisible, widget } from 'zeppos-cross-api/ui'
import { log } from 'zeppos-cross-api/utils'
import { PlayerInfo } from '../components/player/playerInfoHolder'
import { Player } from '../components/player/quranPlayerHolder'
import { createEmulatorScreen } from '../components/screenEmulator'
import { getVerseInfo, setPlayerInfo } from '../lib/config/default'
import { getVerseJuz } from '../lib/config/juzs'
import { getVerseText } from '../lib/config/verse'
import { DECREASE_VOLUME, EXIT, INCREASE_VOLUME, MIN_TIMEOUT_DURATION, NEXT, NUM_VERSES, PAUSE, PLAY, PREVIOUS, START, STOP } from '../lib/constants'
import { _, isRtlLang } from '../lib/i18n/lang'
import { ICON_SIZE_MEDIUM, MAIN_COLOR, SCREEN_WIDTH } from '../lib/mmk/UiParams'
import { parseQuery } from '../lib/utils'
import * as Styles from './style.r.layout'

const logger = log.getLogger('player page')
const time = new Time()

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

    setStatusBarVisible(false)

    Player.init()
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
    setPlayerInfo({
      type: PlayerInfo.type,
      number: PlayerInfo.number,
      curVerse: PlayerInfo.curVerse
    })

    logger.log('Exiting Player')
    const player = Player.clear()
    if (player) {
      player.doAction(this.getServiceParam(EXIT))
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
    return _(getVerseJuz(v).toString())
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
    createEmulatorScreen()
    createWidget(widget.STROKE_RECT, {
      ...Styles.VERSE_PLAYER_BORDER
    })

    createWidget(widget.CIRCLE, {
      ...Styles.JUZ_CIRCLE
    })

    const juzLabel = createWidget(widget.TEXT, {
      ...Styles.JUZ_TEXT
    })

    createWidget(widget.CIRCLE, {
      ...Styles.CHAPTER_CIRCLE
    })

    const chapterLabel = createWidget(widget.TEXT, {
      ...Styles.CHAPTER_TEXT
    })

    const verseText = createWidget(widget.TEXT, {
      ...Styles.VERSE_PLAYER_TEXT
    })

    const verseInfo = createWidget(widget.TEXT, {
      ...Styles.VERSE_PLAYER_LABEL,
      text: ''
    })

    createWidget(widget.IMG, {
      ...Styles.CLEAR_DISPLAY_ICON
    }).addEventListener(event.CLICK_UP, () => {
      if (this.state.interval) {
        juzLabel.setProperty(prop.TEXT, '')
        chapterLabel.setProperty(prop.TEXT, '')
        verseInfo.setProperty(prop.TEXT, '')
        verseText.setProperty(prop.TEXT, '')
        clearInterval(this.state.interval)
        this.state.interval = undefined
      } else {
        this.state.interval = setInterval(() => updater(this), MIN_TIMEOUT_DURATION)
      }
    })

    createWidget(widget.IMG, {
      ...Styles.EXIT_ICON
    }).addEventListener(event.CLICK_UP, () => {
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
      verse = PlayerInfo.curVerse
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
          elapsed = time.getTime() - PlayerInfo.verseStartTime
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
        verse = PlayerInfo.curDownloadedVerse
        if (verse === undefined) return
        verseTextText = that.getDownloadLabel(verse)
      }

      verseInfo.setProperty(prop.TEXT, that.getVerseLabel(verse))
      juzLabel.setProperty(prop.TEXT, that.getJuz(verse))
      chapterLabel.setProperty(prop.TEXT, that.getChapter(verse))
      verseText.setProperty(prop.TEXT, verseTextText)
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

      const bg = createWidget(widget.FILL_RECT, {
        ...Styles.PLAYER_BTN,
        x,
        y,
        w: ICON_SIZE_MEDIUM,
        h: ICON_SIZE_MEDIUM,
        color: MAIN_COLOR
      })

      bg.setProperty(prop.VISIBLE, false)
      const img = createWidget(widget.IMG, {
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
      img.addEventListener(event.CLICK_UP, () => {
        bg.setProperty(prop.VISIBLE, true)
        setTimeout(() => bg.setProperty(prop.VISIBLE, false), MIN_TIMEOUT_DURATION)
        Player.get().doAction(this.getServiceParam(playerButton.action))

        if (playerButton.action === PLAY) {
          playPauseButton.action = PAUSE
          playPauseButton.img.setProperty(prop.SRC, 'pause.png')
        } else if (playerButton.action === PAUSE || playerButton.action === STOP) {
          playPauseButton.action = PLAY
          playPauseButton.img.setProperty(prop.SRC, 'play.png')
        }
      })
    })

    Player.get().doAction(this.getServiceParam(START))
  }
})
