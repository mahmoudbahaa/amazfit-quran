/* global getApp, Page */
import hmUI from '@zos/ui'
import * as appService from '@zos/app-service'
import { log as Logger, px } from '@zos/utils'
import { queryPermission, requestPermission } from '@zos/app'
import { setWakeUpRelaunch } from '@zos/display'
import { replace } from '@zos/router'
import { BasePage } from '@zeppos/zml/base-page'
import * as Styles from './style.r.layout.js'
import { checkVerseExists } from '../libs/utils.js'
import { playerHelper as playerHelperFunc } from '../app-service/playerHelper'
import { getVerseText } from '../libs/storage/localStorage.js'
import { SCREEN_WIDTH } from '../libs/mmk/UiParams'
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
      action: 'start',
      interval: undefined
    },

    onInit () {
      setWakeUpRelaunch({
        relaunch: true
      })
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
        const verses = getApp()._options.globalData.verses
        const exists = verses.map((verse) => checkVerseExists(verse) ? 't' : 'f')
        extraParams = `&exists=${exists.join(',')}`
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
      return `${_('Surah')}: ${verseInfo.split(':')[0]}`
    },

    getDownloadLabel (verseIdx) {
      const verseText = verseIdx ? this.getVerseLabel(getApp()._options.globalData.verses[verseIdx]) : '...'
      return `${_('Downloading')} ${_('Verse')} ${verseText}`
    },

    getVerseLabel (verseInfo) {
      const chapter = parseInt(verseInfo.split(':')[0])
      const verse = parseInt(verseInfo.split(':')[1])
      return `${_(verse.toString().padStart(3, '0'))}/${_(NUM_VERSES[chapter - 1].toString().padStart(3, '0'))}`
    },

    build () {
      const verses = getApp()._options.globalData.verses
      const surahInfo = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.SURAH_PLAYER_LABEL,
        text: this.getSurahLabel(verses[0])
      })

      // const verseBg =
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        ...Styles.VERSE_PLAYER_TEXT,
        color: 0x222222,
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
        const verse = getApp()._options.globalData.curVerse
        let verseTextText
        if (verse !== undefined) {
          if (lastVerseInfo === verse) return
          lastVerseInfo = verse

          verseTextText = getVerseText(verse)
          surahInfo.setProperty(hmUI.prop.TEXT, this.getSurahLabel(verse))
          verseInfo.setProperty(hmUI.prop.TEXT, this.getVerseLabel(verse))
        } else {
          const downVerse = getApp()._options.globalData.curDownloadedVerse
          verseTextText = this.getDownloadLabel(downVerse)
        }

        verseText.setProperty(hmUI.prop.TEXT, verseTextText || '')
      }, 500)

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
        hmUI.createWidget(hmUI.widget.BUTTON, {
          ...Styles.PLAYER_BTN,
          x: playerButton.left ? Styles.PLAYER_BTN_X : (SCREEN_WIDTH - Styles.PLAYER_BTN_X - Styles.PLAYER_BTN_W),
          y: Styles.PLAYER_BTN_Y + Styles.PLAYER_BTN_OY * (playerButton.left ? startYLeft++ : startYRight++),
          normal_src: playerButton.src,
          press_src: playerButton.src,
          click_func: () => {
            vm.state.action = playerButton.action
            if (playerButton.action === 'pause') {
              playerButton.action = 'play'
            } else if (playerButton.action === 'play') {
              playerButton.action = 'pause'
            }

            if (isService) {
              vm.permissionRequest()
            } else {
              playerHelper.doAction(this.getServiceParam())
            }
          }
        })
      })

      if (isService) {
        this.permissionRequest()
      } else {
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
