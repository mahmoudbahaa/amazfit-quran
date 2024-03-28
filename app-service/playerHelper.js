/* global getApp */
import { log } from '@zos/utils'
import { create, id } from '@zos/media'
import * as appServiceMgr from '@zos/app-service'
import { checkVerseExists, getChapterVerses, getFileName, parseQuery } from '../libs/utils'
import { getRecitation, getVerseText, setVerseText } from '../libs/storage/localStorage'
import { quranComApiModule } from '../components/quran-com-api-module'
import { NUM_JUZS, PLAYER_BUFFER_SIZE } from '../libs/constants'

const VOLUME_INCREMENT = 10
const thisService = 'app-service/player_service'
const logger = log.getLogger('player.service')
const TIME_OUT_DURATION = 200

export function playerHelper () {
  return {

    state: {
      player: undefined,
      verses: undefined,
      curDownVerse: -1,
      curPlayVerse: -1,
      exists: undefined,
      onHold: true,
      relativePath: undefined,
      downloading: false,
      stoppingVerseDownload: false,
      stoppedVerseDownload: false
    },

    onInit (e) {
      logger.log(`service onInit(${e})`)
      this.reset()
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

    reset (partialReset = false) {
      getApp()._options.globalData.curVerse = undefined
      getApp()._options.globalData.curDownloadedVerse = undefined

      this.state.curDownVerse = -1
      this.state.curPlayVerse = -1
      this.state.exists = undefined
      this.state.onHold = true
      this.state.stoppingVerseDownload = false

      if (partialReset) return

      this.state.relativePath = undefined
      this.state.downloading = false
      this.state.stoppedVerseDownload = false
    },

    doExit (stopService = true) {
      logger.log('Stop Player Service')
      if (this.state.player !== undefined) {
        this.state.player.stop()
        this.state.player.release()
      }

      this.state.stoppingVerseDownload = true

      if (stopService) {
        appServiceMgr.stop({
          file: thisService
        })
      }
    },

    doAction (e, basePage = this) {
      const result = parseQuery(e)

      const player = this.state.player
      if (result.action !== 'start' &&
        result.action !== 'exit' &&
        player === undefined) {
        logger.error('player not ready')
        return
      }

      switch (result.action) {
        case 'start':
          this.reset()
          this.state.verses = result.verses.toString().split(',')
          this.state.exists = result.exists.toString().split(',')
          this._downloadVerses(basePage)
          break
        case 'exit':
          this.doExit()
          break
        case 'dec-vol':
          player.setVolume(player.getVolume() - VOLUME_INCREMENT)
          break
        case 'play':
          if (player.getStatus() === player.state.PAUSED) {
            player.resume()
          } else {
            player.prepare()
          }

          break
        case 'pause':
          player.pause()
          break
        case 'stop':
          player.stop()
          break
        case 'previous':
          this._playSurah(basePage, -1)
          break
        case 'next':
          this._playSurah(basePage, 1)
          break
        case 'inc-vol':
          player.setVolume(player.getVolume() + VOLUME_INCREMENT)
          break
      }
    },

    _playSurah (basePage, offset) {
      const verses = this.state.verses
      const surahNumber = parseInt(verses[verses.length - 1].split(':')[0]) + offset
      console.log('New surah number=' + surahNumber)
      if (surahNumber > NUM_JUZS || surahNumber < 1) return

      this.reset(true)
      if (this.state.player !== undefined) {
        this.state.player.stop()
      }

      basePage.state.verses = this.state.verses = getChapterVerses(surahNumber)
      this.state.exists = this.state.verses.map((verse) => checkVerseExists(verse) ? 't' : 'f')

      if (this.state.stoppedVerseDownload) {
        setTimeout(() => this._downloadVerseText(basePage), 20)
      }
    },

    _getFileName (verseIndex) {
      return getFileName(this.state.verses[verseIndex])
    },

    _playVerse () {
      console.log('INSIDE playVerse')
      if (!this.state.onHold) return

      this.state.onHold = false
      this.state.curPlayVerse++

      if (this.state.curPlayVerse >= this.state.exists.length) {
        this.doExit(false)
      }

      if (this.state.curDownVerse <= this.state.curPlayVerse) {
        this.state.curPlayVerse--
        this.state.onHold = true
        return
      }

      let player = this.state.player
      console.log('player=' + player)
      if (player === undefined) {
        this.state.player = player = create(id.PLAYER)
        const { state } = this
        player.addEventListener(player.event.PREPARE, (result) => {
          if (result) {
            getApp()._options.globalData.curVerse = this.state.verses[state.curPlayVerse]
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
        console.log('status' + player.getStatus())
        player.stop()
        player.setSource(player.source.FILE, { file: `data://download/${this._getFileName(this.state.curPlayVerse)}` })
        player.prepare()
      }
    },

    _downloadVersesAudio (basePage) {
      const exists = this.state.exists[this.state.curDownVerse] === 't'

      if (exists) {
        setTimeout(() => this._downloadVerseText(basePage), TIME_OUT_DURATION)
        return
      }

      const verse = this.state.verses[this.state.curDownVerse]
      getApp()._options.globalData.curDownloadedVerse = verse
      logger.log('downloading verse=' + verse)
      quranComApiModule.downloadVerse(
        basePage,
        this.state.relativePath,
        verse,
        () => setTimeout(() => this._downloadVerseText(basePage), TIME_OUT_DURATION),
        event => console.log('error=>' + JSON.stringify(event))
      )
    },

    _downloadVerseText (basePage) {
      if (this.state.stoppingVerseDownload) {
        this.state.stoppingVerseDownload = false
        this.state.stoppedVerseDownload = true
        return
      }

      this.state.curDownVerse++
      if ((this.state.curDownVerse - this.state.curPlayVerse) >= PLAYER_BUFFER_SIZE ||
        this.state.curDownVerse === this.state.exists.length) {
        this._playVerse()
      }

      if (this.state.curDownVerse === this.state.exists.length) {
        this.state.stoppedVerseDownload = true
        return
      }

      const verse = this.state.verses[this.state.curDownVerse]
      const text = getVerseText(verse)
      logger.log('text=' + text)
      if (text !== undefined) {
        setTimeout(() => this._downloadVersesAudio(basePage), TIME_OUT_DURATION)
        return
      }

      const that = this
      quranComApiModule.getVerseText(
        basePage,
        verse,
        // getRecitationInfo().recitation.split(',')[1],
        (verseText) => {
          const text = verseText.text_imlaei
          logger.log('text=' + text)
          setVerseText(verse, text)
          setTimeout(() => that._downloadVersesAudio(basePage), TIME_OUT_DURATION)
        }
      )
    },

    _getVersesAudioPaths (basePage) {
      const that = this
      const recitation = getRecitation()
      quranComApiModule.getVersesAudioPaths(
        basePage,
        recitation.split(',')[1],
        (audioFiles) => {
          const { url } = audioFiles[0]
          that.state.relativePath = url.substring(0, url.lastIndexOf('/') + 1)
          setTimeout(() => that._downloadVerseText(basePage), TIME_OUT_DURATION)
        })
    },

    _downloadVerses (basePage) {
      setTimeout(() => this._getVersesAudioPaths(basePage), TIME_OUT_DURATION)
    }

  }
}
