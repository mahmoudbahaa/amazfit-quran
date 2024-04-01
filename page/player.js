/* global getApp, Page */
import hmUI from '@zos/ui'
import { log as Logger, px } from '@zos/utils'
import { setWakeUpRelaunch } from '@zos/display'
import { exit } from '@zos/router'
import { BasePage } from '@zeppos/zml/base-page'
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
import { getVerseInfo, getVerseText, setPlayerInfo, setVerseInfo, setVerseText } from '../libs/storage/localStorage.js'
import { ICON_SIZE_MEDIUM, MAIN_COLOR, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import { MAX_WORDS_PER_PAGE, NUM_VERSES } from '../libs/constants'
import { _ } from '../libs/i18n/lang'
import { Time } from '@zos/sensor'

const time = new Time()
const logger = Logger.getLogger('player page')

Page(
  BasePage({
    state: {
      interval: undefined,
      player: undefined,
      type: undefined,
      number: -1,
      verse: undefined,
      verseInfo: {}
    },

    onInit (paramsString) {
      setWakeUpRelaunch({
        relaunch: true
      })

      this.state.player = new QuranPlayer(this)
      const params = parseQuery(paramsString)
      this.state.number = parseInt(params.number)
      this.state.type = params.type
      this.state.verse = params.verse
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

      delete getApp()._options.globalData.player.verseStartTime
      delete getApp()._options.globalData.player.curDownloadedVerse
      logger.log('Saving Player Info' + JSON.stringify(getApp()._options.globalData.player))
      setPlayerInfo(getApp()._options.globalData.player)

      logger.log('Exiting Player')
      this.state.player.doAction(this.getServiceParam(EXIT))
      this.state.player = undefined
      if (this.state.interval) {
        clearInterval(this.state.interval)
      }
    },

    onCall (data) {
      if (this.state.player === undefined) return

      if (data.curDownVerse !== undefined) {
        this.state.player.updateStatus(data.curDownVerse)
      } else if (data.verse !== undefined) {
        setVerseText(data.verse, data.verseText)
        setVerseInfo(data.verse, data.verseInfo)
      }
    },

    getServiceParam (action) {
      let extraParams = ''
      if (action === START) {
        extraParams = `&type=${this.state.type}&number=${this.state.number}&verse=${this.state.verse}`
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
      this.state.verseInfo.text = getVerseText(verse)
      this.state.verseInfo.mapping = getVerseInfo(verse)
      if (this.state.verseInfo.mapping.length <= 1) return [[this.state.verseInfo.text, 0]]

      const result = []
      this.state.verseInfo.words = this.state.verseInfo.text.split(' ')

      for (let i = 0; i < this.state.verseInfo.words.length; i += MAX_WORDS_PER_PAGE) {
        result.push([this.state.verseInfo.words.slice(i, i + MAX_WORDS_PER_PAGE).join(' '),
          this.state.verseInfo.mapping[i / MAX_WORDS_PER_PAGE]])
      }

      return result
    },

    build () {
      const surahInfo = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.SURAH_PLAYER_LABEL
      })

      // const verseBg =
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        ...Styles.VERSE_PLAYER_TEXT,
        color: 0x004400,
        radius: px(80)
      })
      const verseText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.VERSE_PLAYER_TEXT,
        text: ''
      })

      const verseInfo = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.VERSE_PLAYER_LABEL,
        text: ''
      })

      let verse
      let verseTextText
      let lastVerse
      let lastVerseText = ''
      let lastVerseParts
      let lastVersePartIndex
      let elapsed
      this.state.interval = setInterval(() => {
        verse = getApp()._options.globalData.player.curVerse
        if (verse !== undefined) {
          // A verse is being played
          if (lastVerse !== verse) {
            // A new verse is played
            lastVerseParts = this.getVerseTextParts(verse)
            lastVersePartIndex = 0
            verseTextText = lastVerseText = lastVerseParts[0][0]
            lastVerse = verse
          } else if (lastVersePartIndex >= lastVerseParts.length - 1) {
            // Reached the last part of the verse no need to check elapsed
            verseTextText = lastVerseText
          } else {
            // There is still more parts of the verse check the need to go to next part
            elapsed = time.getTime() - getApp()._options.globalData.player.verseStartTime
            if (elapsed > lastVerseParts[lastVersePartIndex + 1][1]) {
              // Need to go to next part
              lastVersePartIndex++
              verseTextText = lastVerseText = lastVerseParts[lastVersePartIndex][0]
            } else {
              // Remain on the same part
              verseTextText = lastVerseText
            }
          }
        } else {
          // Still Downloading
          verse = getApp()._options.globalData.player.curDownloadedVerse
          if (verse === undefined) return
          verseTextText = this.getDownloadLabel(verse)
        }

        surahInfo.setProperty(hmUI.prop.TEXT, this.getSurahLabel(verse))
        verseInfo.setProperty(hmUI.prop.TEXT, this.getVerseLabel(verse))
        verseText.setProperty(hmUI.prop.TEXT, verseTextText || '')
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

          this.state.player.doAction(this.getServiceParam(playerButton.action))
        })
      })

      this.state.player.doAction(this.getServiceParam(START))
    }
  })
)
