/* global getApp */
import { log } from '@zos/utils'
import media from '@zos/media'
import * as appServiceMgr from '@zos/app-service'
import { getFileName, parseQuery } from '../libs/utils'
import { getRecitation, getVerseText, setVerseText } from '../libs/storage/localStorage'
import { quranComApiModule } from '../components/quran-com-api-module'
import { apiCall } from '../components/api-caller'
import { PLAYER_BUFFER_SIZE } from '../libs/constants'

const VOLUME_INCREMENT = 10
const thisService = 'app-service/player_service'
const logger = log.getLogger('player.service')

export function playerHelper () {
  return {

    state: {
      running: false,
      player: undefined,
      curDownAudioVerse: -1,
      curDownTextVerse: -1,
      curPlayVerse: -1,
      exists: undefined,
      onHold: true,
      relativePath: undefined
    },

    onInit (e) {
      logger.log(`service onInit(${e})`)
      this.doAction(e)
    },
    onDestroy () {
      logger.log('service on destroy invoke')
      this.doExit()
    },

    onEvent (e) {
      logger.log(`service onEvent(${e})`)
      this.doAction(e)
    },
    onCall (result, basePage = this) {
      if (!result) return

      const { req } = result

      if (!result.success || req.params.page !== thisService) return

      switch (req.method) {
        case 'getVerseRecitation': {
          this._downloadVerse(basePage)
          break
        }
      }
    },

    doExit (stopService = true) {
      logger.log('Exiting Player Service')
      this.state.running = false
      if (this.state.player !== undefined) {
        this.state.player.stop()
        this.state.player.release()
      }

      if (stopService) {
        appServiceMgr.stop({
          file: thisService
        })
      }
    },

    doAction (e, basePage = this) {
      const result = parseQuery(e)

      if (result.action !== 'start' &&
        result.action !== 'exit' &&
        this.state.player === undefined) {
        logger.error('this.state.player not defined !!!')
        return
      }

      switch (result.action) {
        case 'start':
          this.state.running = true
          this.state.exists = result.exists.toString().split(',')
          this._downloadVerses(basePage)
          break
        case 'exit':
          this.doExit()
          break
        case 'dec-vol':
          this.state.player.setVolume(this.state.player.getVolume() - VOLUME_INCREMENT)
          break
        case 'play':
          if (this.state.player.getStatus() === this.state.player.state.PAUSED) {
            this.state.player.resume()
          } else {
            this.state.player.prepare()
          }

          break
        case 'pause':
          this.state.player.pause()
          break
        case 'stop':
          this.state.player.stop()
          break
        case 'forward':
          this.state.player.stop()
          this.state.onHold = true
          this._playVerse()
          break
        case 'previous':
          this.state.player.stop()
          this.state.onHold = true
          this._playVerse()
          break
        case 'inc-vol':
          this.state.player.setVolume(this.state.player.getVolume() + VOLUME_INCREMENT)
          break
      }
    },

    _getFileName (verseIndex) {
      return getFileName(getApp()._options.globalData.verses[verseIndex])
    },

    _playVerse () {
      if (!this.state.onHold) return

      this.state.onHold = false
      this.state.curPlayVerse++
      if (this.state.curDownAudioVerse >= this.state.exists.length) {
        this.doExit()
      }

      if (this.state.curDownAudioVerse <= this.state.curPlayVerse) {
        this.state.curPlayVerse--
        this.state.onHold = true
        return
      }

      if (this.state.player === undefined) {
        const player = this.state.player = media.create(media.id.PLAYER)
        const { state } = this
        player.addEventListener(player.event.PREPARE, (result) => {
          if (result) {
            getApp()._options.globalData.curVerse = getApp()._options.globalData.verses[state.curPlayVerse]
            player.start()
          } else {
            console.log(`=== prepare fail ===${JSON.stringify(result)}`)
            player.release()
          }
        })

        const service = this
        player.addEventListener(player.event.COMPLETE, (result) => {
          state.onHold = true
          service._playVerse()
        })

        player.setSource(player.source.FILE, { file: `data://download/${this._getFileName(this.state.curPlayVerse)}` })
        player.prepare()
      } else {
        this.state.player.stop()
        this.state.player.setSource(this.state.player.source.FILE, { file: `data://download/${this._getFileName(this.state.curPlayVerse)}` })
        this.state.player.prepare()
      }
    },

    _downloadVerse (basePage) {
      this.state.curDownAudioVerse = this.state.curDownAudioVerse + 1

      this._checkIfEnoughBuffer()
      if (this.state.curDownAudioVerse >= this.state.exists.length) {
        return
      }

      const exists = this.state.exists[this.state.curDownAudioVerse] === 't'

      if (exists) {
        setTimeout(() => this._downloadVerse(basePage), 20)
      }

      getApp()._options.globalData.curDownloadedVerse = this.state.curDownAudioVerse
      const relativePath = this.state.relativePath + this._getFileName(this.state.curDownAudioVerse)
      apiCall('getVerseRecitation', basePage, thisService, { relativePath })
    },

    _downloadVersesAudio (basePage) {
      const that = this
      quranComApiModule.getVersesAudioPaths(
        basePage,
        getRecitation().split(',')[1],
        (audioFiles) => {
          const { url } = audioFiles[0]
          that.state.relativePath = url.substring(0, url.lastIndexOf('/') + 1)
          that._downloadVerse(basePage)
        })
    },

    _checkIfEnoughBuffer (basePage) {
      const downVerse = this._getCurDownVerse()
      if (downVerse - this.state.curPlayVerse >= PLAYER_BUFFER_SIZE ||
        downVerse === this.state.exists.length) {
        this._playVerse()
      }
    },

    _downloadVerseText (basePage) {
      this.state.curDownTextVerse++

      this._checkIfEnoughBuffer()
      if (this.state.curDownTextVerse === this.state.exists.length) {
        return
      }

      const verse = getApp()._options.globalData.verses[this.state.curDownTextVerse]
      const text = getVerseText(verse)
      if (text !== undefined) {
        setTimeout(() => this._downloadVerseText(basePage), 200)
        return
      }

      const that = this
      quranComApiModule.getVerseText(
        basePage,
        verse,
        // getRecitationInfo().recitation.split(',')[1],
        (verseText) => {
          const text = verseText.text_imlaei
          setVerseText(verse, text)
          setTimeout(() => that._downloadVerseText(basePage), 200)
        }
      )
    },

    _downloadVerses (basePage) {
      setTimeout(() => this._downloadVersesAudio(basePage), 20)
      setTimeout(() => this._downloadVerseText(basePage), 20)
    },

    _getCurDownVerse (basePage) {
      return Math.min(this.state.curDownAudioVerse, this.state.curDownTextVerse)
    }
  }
}
