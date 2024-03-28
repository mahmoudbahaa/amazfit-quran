/* global getApp, Page */
import hmUI from '@zos/ui'
import * as appService from '@zos/app-service'
import { log as Logger, px } from '@zos/utils'
import { queryPermission, requestPermission } from '@zos/app'
import { setWakeUpRelaunch } from '@zos/display'
import { replace } from '@zos/router'
import { BasePage } from '../libs/zml/dist/zml-page'
import * as Styles from './style.r.layout.js'
import { checkVerseExists } from '../libs/utils.js'
import { playerHelper as playerHelperFunc } from '../app-service/playerHelper'
import { getVerseText } from '../libs/storage/localStorage.js'
import { ICON_SIZE_MEDIUM, MAIN_COLOR, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import { NUM_VERSES } from '../libs/constants'
import { _ } from '../libs/i18n/lang'

const thisPage = 'page/player'
const serviceFile = 'app-service/player_service'
const logger = Logger.getLogger('player page')
const permissions = ['device:os.bg_service']
const isService = false
let lastVerseInfo = -1000

let playerHelper
if (!isService) {
  playerHelper = playerHelperFunc()
}

Page(
  BasePage({
    state: {
      verses: undefined,
      action: undefined,
      interval: undefined
    },

    onInit (verses) {
      setWakeUpRelaunch({
        relaunch: true
      })

      this.state.action = 'start'
      if (verses) {
        this.state.verses = verses.split(',')
      }
    },

    permissionRequest () {
      const [result2] = queryPermission({
        permissions
      })

      const that = this
      if (result2 === 0) {
        requestPermission({
          permissions,
          callback ([result2]) {
            if (result2 === 2) {
              that.startPlayerService()
            }
          }
        })
      } else if (result2 === 2) {
        this.startPlayerService()
      }
    },

    getServiceParam () {
      let extraParams = ''
      if (this.state.action === 'start') {
        const verses = this.state.verses.join(',')
        const exists = this.state.verses.map((verse) => checkVerseExists(verse) ? 't' : 'f')
        extraParams = `&exists=${exists.join(',')}&verses=${verses}}`
      }

      return `action=${this.state.action}${extraParams}`
    },

    startPlayerService () {
      const param = this.getServiceParams()
      appService.start({
        url: serviceFile,
        param
      })
    },

    onCall (params) {
      if (isService) return

      playerHelper.onCall(params, this)
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

    build () {
      const verses = this.state.verses
      const surahInfo = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.SURAH_PLAYER_LABEL,
        text: this.getSurahLabel(verses[0])
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

      this.state.interval = setInterval(() => {
        let verse = getApp()._options.globalData.curVerse
        let verseTextText
        if (verse !== undefined) {
          if (lastVerseInfo === verse) return
          lastVerseInfo = verse

          verseTextText = getVerseText(verse)
        } else {
          verse = getApp()._options.globalData.curDownloadedVerse
          if (verse === undefined) {
            verse = this.state.verses[0]
          }

          verseTextText = this.getDownloadLabel(verse)
        }

        surahInfo.setProperty(hmUI.prop.TEXT, this.getSurahLabel(verse))
        verseInfo.setProperty(hmUI.prop.TEXT, this.getVerseLabel(verse))
        verseText.setProperty(hmUI.prop.TEXT, verseTextText || '')
      }, 200)

      const playerButtons = [
        { src: 'back.png', action: 'previous', left: true },
        { src: 'play-pause.png', action: 'pause', left: true },
        { src: 'volume-dec.png', action: 'dec-vol', left: true },
        { src: 'forward.png', action: 'next', left: false },
        { src: 'stop.png', action: 'stop', left: false },
        { src: 'volume-inc.png', action: 'inc-vol', left: false }
      ]

      const vm = this
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
          vm.state.action = playerButton.action
          if (playerButton.action === 'pause') {
            playerButton.action = 'play'
          } else if (playerButton.action === 'play') {
            playerButton.action = 'pause'
          }

          if (isService) {
            vm.permissionRequest()
          } else {
            playerHelper.doAction(this.getServiceParam(), this)
          }
        })
      })

      console.log('action=' + this.state.action)
      if (isService) {
        this.permissionRequest()
      } else {
        playerHelper.reset()
        playerHelper.doAction(this.getServiceParam(), this)
      }
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

      if (isService) {
        this.state.action = 'exit'
        this.permissionRequest(this)
      } else {
        playerHelper.doExit(false)
      }

      if (this.state.interval) {
        clearInterval(this.state.interval)
      }
    }

  })
)
