/* global getApp, Page */
import hmUI from '@zos/ui'
import { log as Logger, px } from '@zos/utils'
import { setWakeUpRelaunch } from '@zos/display'
import { replace, exit } from '@zos/router'
import { BasePage } from '@zeppos/zml/base-page'
import * as Styles from './style.r.layout.js'
import { parseQuery } from '../libs/utils.js'
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

const thisPage = 'page/player'
const logger = Logger.getLogger('player page')
const lastVerseText = ''

Page(
  BasePage({
    state: {
      interval: undefined,
      player: undefined,
      type: undefined,
      number: -1,
      verse: undefined
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

    onCall (data) {
      if (data.curDownVerse) {
        if (this.state.player) {
          this.state.player.updateStatus(data.curDownVerse)
        }
      } else if (data.verse) {
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
      const verseText = verse ? this.getVerseLabel(verse) : '...'
      return `${_('Downloading')} ${_('Verse')} ${verseText}`
    },

    getVerseLabel (verseInfo) {
      const chapter = parseInt(verseInfo.split(':')[0])
      const verse = parseInt(verseInfo.split(':')[1])
      return `${_(verse.toString().padStart(3, '0'))}/${_(NUM_VERSES[chapter - 1].toString().padStart(3, '0'))}`
    },

    getVerseText (verse, curTime) {
      const text = getVerseText(verse)
      const mapping = getVerseInfo(verse)
      if (mapping.length <= 1) return text

      const words = text.split(' ')
      const elapsed = curTime - getApp()._options.globalData.player.verseStartTime

      for (let i = 0; i < words.length; i += MAX_WORDS_PER_PAGE) {
        const page = i / MAX_WORDS_PER_PAGE
        if (elapsed > mapping[page] && elapsed < mapping[page + 1]) return words.slice(i, i + MAX_WORDS_PER_PAGE).join(' ')
      }

      const start = Math.floor(words.length / MAX_WORDS_PER_PAGE) * MAX_WORDS_PER_PAGE
      return words.slice(start, words.length).join(' ')
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

      let lastVerse
      this.state.interval = setInterval(() => {
        let verse = getApp()._options.globalData.player.curVerse
        let verseTextText
        if (verse !== undefined) {
          if (lastVerse !== verse) {
            lastVerse = verse
          }

          verseTextText = this.getVerseText(verse, getApp()._options.globalData.time.getTime())
          if (lastVerseText.localeCompare(verseTextText) === 0) return
        } else {
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
    },
    onPause () {
      logger.log('page on pause invoke')
    },
    onResume () {
      logger.log('page on resume invoke')
      replace({ url: `${thisPage}` })
    },
    onDestroy () {
      logger.log('page on destroy invoke')
      delete this.globalData.player.verseStartTime
      delete this.globalData.player.curDownloadedVerse
      setPlayerInfo(this.globalData.player)
      this.state.player.doAction(this.getServiceParam(EXIT))

      if (this.state.interval) {
        clearInterval(this.state.interval)
      }
    }

  })
)
