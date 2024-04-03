/* global getApp, Page */
import hmUI from '@zos/ui'
import { log as Logger, px } from '@zos/utils'
import { setWakeUpRelaunch } from '@zos/display'
import { exit } from '@zos/router'
import * as Styles from './style.r.layout.js'
import { parseQuery, restorePlayer } from '../libs/utils.js'
import {
  START,
  EXIT,
  PLAY,
  PAUSE,
  STOP,
  PREVIOUS,
  NEXT,
  DECREASE_VOLUME,
  INCREASE_VOLUME,
  QuranPlayer
} from '../components/quranPlayer'
import { getVerseInfo, getVerseText, setPlayerInfo } from '../libs/storage/localStorage.js'
import { ICON_SIZE_MEDIUM, MAIN_COLOR, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import { NUM_VERSES } from '../libs/constants'
import { _ } from '../libs/i18n/lang'
import { Time } from '@zos/sensor'

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
  },
  onResume () {
    logger.log('page on resume invoke')
    restorePlayer()
  },
  onDestroy () {
    logger.log('page on destroy invoke')

    delete getApp()._options.globalData.playerInfo.verseStartTime
    delete getApp()._options.globalData.playerInfo.curDownloadedVerse
    logger.log('Saving Player Info' + JSON.stringify(getApp()._options.globalData.playerInfo))
    setPlayerInfo(getApp()._options.globalData.playerInfo)

    logger.log('Exiting Player')
    getApp()._options.globalData.player.doAction(this.getServiceParam(EXIT))
    getApp()._options.globalData.player = undefined
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

  getSurahLabel (verseInfo) {
    return `${_('Surah')}: ${_(verseInfo.split(':')[0].toString())}`
  },

  getDownloadLabel (verse) {
    return `${_('Downloading')} ${_('Verse')} ${verse ? this.getVerseLabel(verse) : '...'}`
  },

  getVerseLabel (verseInfo) {
    return `${_(verseInfo.split(':')[1].padStart(3, '0'))}/${_(NUM_VERSES[parseInt(verseInfo.split(':')[0]) - 1].toString().padStart(3, '0'))}`
  },

  getVerseTextParts (verse) {
    return {
      texts: getVerseText(verse),
      mapping: getVerseInfo(verse)
    }
  },

  build () {
    const surahInfo = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.SURAH_PLAYER_LABEL
    })

    // const verseBg =
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      ...Styles.VERSE_PLAYER_TEXT,
      color: 0x004400,
      radius: px(4)
    })
    const verseText = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.VERSE_PLAYER_TEXT
    })

    const verseInfo = hmUI.createWidget(hmUI.widget.TEXT, {
      ...Styles.VERSE_PLAYER_LABEL,
      text: ''
    })

    let verse
    let verseTextText
    let lastVerse
    let lastVerseText = ''
    let lastVerseInfo
    let lastVersePartIndex
    let elapsed
    this.state.interval = setInterval(() => {
      verse = getApp()._options.globalData.playerInfo.curVerse
      if (verse !== undefined) {
        // A verse is being played
        if (lastVerse !== verse) {
          // A new verse is played
          lastVerseInfo = this.getVerseTextParts(verse)
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
        verseTextText = this.getDownloadLabel(verse)
        return
      }

      surahInfo.setProperty(hmUI.prop.TEXT, this.getSurahLabel(verse))
      verseInfo.setProperty(hmUI.prop.TEXT, this.getVerseLabel(verse))
      verseText.setProperty(hmUI.prop.TEXT, verseTextText)
    }, 20)

    const playerButtons = [
      { src: 'volume-dec.png', action: DECREASE_VOLUME, left: true },
      { src: 'play.png', action: PLAY, left: true },
      { src: 'pause.png', action: PAUSE, left: true },
      { src: 'back.png', action: PREVIOUS, left: true },
      { src: 'volume-inc.png', action: INCREASE_VOLUME, left: false },
      { src: 'stop.png', action: STOP, left: false },
      { src: 'cancel.png', action: EXIT, left: false },
      { src: 'forward.png', action: NEXT, left: false }
    ]

    let startYLeft = 0
    let startYRight = 0
    playerButtons.forEach((playerButton) => {
      const x = playerButton.left ? Styles.PLAYER_BTN_X : (SCREEN_WIDTH - Styles.PLAYER_BTN_X - Styles.PLAYER_BTN_W)
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
      hmUI.createWidget(hmUI.widget.IMG, {
        ...Styles.PLAYER_BTN,
        x,
        y,
        w: ICON_SIZE_MEDIUM,
        h: ICON_SIZE_MEDIUM,
        src: playerButton.src
      }).addEventListener(hmUI.event.CLICK_UP, () => {
        bg.setProperty(hmUI.prop.VISIBLE, true)
        setTimeout(() => bg.setProperty(hmUI.prop.VISIBLE, false), 200)

        if (playerButton.action === EXIT) {
          exit()
          return
        }

        getApp()._options.globalData.player.doAction(this.getServiceParam(playerButton.action))
      })
    })

    getApp()._options.globalData.player.doAction(this.getServiceParam(START))
  }
})
