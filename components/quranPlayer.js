/* global getApp */
import { log } from '@zos/utils'
import { create, id } from '@zos/media'
import * as appServiceMgr from '@zos/app-service'
import { checkVerseExists, getChapterVerses, getFileName, getJuzVerses, parseQuery, parseVerse } from '../libs/utils'
import { getRecitation, getVerseText, setVerseInfo, setVerseText } from '../libs/storage/localStorage'
import { quranComApiModule } from './quran-com-api-module'
import { ERROR_RETRY_AFTER, MAX_ERROR_RETRIES, NUM_CHAPTERS, NUM_JUZS, PLAYER_BUFFER_SIZE } from '../libs/constants'
import { showToast } from '@zos/interaction'
import { exit } from '@zos/router'

const VOLUME_INCREMENT = 10
const thisService = 'app-service/player_service'
const logger = log.getLogger('player.service')
const TIME_OUT_DURATION = 200

export const START = 'start'
export const EXIT = 'exit'
export const PLAY = 'play'
export const PAUSE = 'pause'
export const STOP = 'stop'
export const PREVIOUS = 'previous'
export const NEXT = 'next'
export const DECREASE_VOLUME = 'dec-vol'
export const INCREASE_VOLUME = 'inc-vol'
export const PLAYER_TYPE_JUZ = 'JUZ'
export const PLAYER_TYPE_CHAPTER = 'CHAPTER'
export class QuranPlayer {
  #player
  #verses
  #curDownVerse
  #curPlayVerse
  #exists
  #onHold
  #relativePath
  #downloading
  #stoppingVerseDownload
  #stoppedVerseDownload
  #basePage
  #type
  #number
  #recitation

  constructor (basePage) {
    this.#reset()
    this.#basePage = basePage
  }

  doAction (e) {
    const result = parseQuery(e)

    if (result.action !== START &&
        result.action !== EXIT &&
      this.#player === undefined) {
      logger.error('player not ready')
      return
    }

    switch (result.action) {
      case START:
        this.#reset()
        this.#type = result.type
        this.#playSurahOrJuz(parseInt(result.number))
        break
      case EXIT:
        this.#doExit()
        break
      case PLAY:
        if (this.#player.getStatus() === this.#player.state.PAUSED) {
          this.#player.resume()
        } else {
          this.#player.prepare()
        }
        break
      case PAUSE:
        this.#player.pause()
        break
      case STOP:
        this.#player.stop()
        break
      case PREVIOUS:
        this.#playSurahOrJuz(this.#number - 1)
        break
      case NEXT:
        this.#playSurahOrJuz(this.#number + 1)
        break
      case DECREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() - VOLUME_INCREMENT)
        break
      case INCREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() + VOLUME_INCREMENT)
        break
    }
  }

  #doExit (stopService = true) {
    logger.log('Stop Player Service')
    if (this.#player !== undefined) {
      this.#player.stop()
      this.#player.release()
    }

    this.#stoppingVerseDownload = true

    if (stopService) {
      appServiceMgr.stop({
        file: thisService
      })
    }
  }

  #reset (partialReset = false) {
    getApp()._options.globalData.curVerse = undefined
    getApp()._options.globalData.curDownloadedVerse = undefined

    this.#curDownVerse = -1
    this.#curPlayVerse = -1
    this.#exists = undefined
    this.#onHold = true
    this.#stoppingVerseDownload = false
    this.#recitation = getRecitation().split(',')[1]

    if (partialReset) return

    this.#relativePath = undefined
    this.#downloading = false
    this.#stoppedVerseDownload = true
  }

  #playSurahOrJuz (number) {
    switch (this.#type) {
      case PLAYER_TYPE_JUZ: {
        if (number > NUM_JUZS || number < 1) return
        this.#verses = getJuzVerses(number)
        break
      }
      case PLAYER_TYPE_CHAPTER: {
        if (number > NUM_CHAPTERS || number < 1) return
        this.#verses = getChapterVerses(number)
        break
      }
    }

    this.#reset(true)
    this.#number = number
    if (this.#player !== undefined) {
      this.#player.stop()
    }

    this.#exists = this.#verses.map((verse) => checkVerseExists(verse))

    if (this.#stoppedVerseDownload) {
      this.#stoppedVerseDownload = false
      this.#downloadVerses()
    }
  }

  #getFileName (verseIndex) {
    return getFileName(this.#verses[verseIndex])
  }

  #playVerse () {
    if (!this.#onHold) return

    this.#onHold = false
    this.#curPlayVerse++

    if (this.#curPlayVerse >= this.#verses.length) {
      if (getApp()._options.globalData.continue) {
        this.#playSurahOrJuz(this.#number + 1)
      } else {
        this.#doExit(false)
      }
    }

    if (this.#curDownVerse <= this.#curPlayVerse) {
      this.#curPlayVerse--
      this.#onHold = true
      return
    }

    let player = this.#player
    if (player === undefined) {
      this.#player = player = create(id.PLAYER)
      const that = this
      player.addEventListener(player.event.PREPARE, (result) => {
        if (result) {
          getApp()._options.globalData.verseStartTime = getApp()._options.globalData.time.getTime()
          getApp()._options.globalData.curVerse = this.#verses[that.#curPlayVerse]
          player.start()
        } else {
          console.log(`=== prepare fail ===${JSON.stringify(result)}`)
          player.release()
        }
      })

      const service = this
      player.addEventListener(player.event.COMPLETE, (result) => {
        that.#onHold = true
        service.#playVerse()
      })

      player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` })
      player.prepare()
    } else {
      console.log('status=' + player.getStatus())
      player.stop()
      player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` })
      player.prepare()
    }
  }

  #downloadVersesAudio () {
    if (this.#exists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    logger.log('downloading verse=' + verse)
    quranComApiModule.downloadVerse(
      this.#basePage,
      this.#relativePath,
      verse,
      () => {
        getApp()._options.globalData.errorCount = 0
        setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      },
      event => {
        console.log('error=>' + JSON.stringify(event))
        getApp()._options.globalData.errorCount++
        if (getApp()._options.globalData.errorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#downloadVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          showToast({
            content: 'Too many errors. App will exit'
          })

          setTimeout(() => exit(), 5000)
        }
      }
    )
  }

  #downloadVerseText () {
    if (this.#stoppingVerseDownload) {
      this.#stoppingVerseDownload = false
      this.#stoppedVerseDownload = true
      return
    }

    this.#curDownVerse++
    if ((this.#curDownVerse - this.#curPlayVerse) >= PLAYER_BUFFER_SIZE ||
        this.#curDownVerse === this.#verses.length) {
      this.#playVerse()
    }

    if (this.#curDownVerse === this.#verses.length) {
      this.#stoppedVerseDownload = true
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    getApp()._options.globalData.curDownloadedVerse = verse
    const text = getVerseText(verse)
    logger.log('text=' + text)
    if (text) {
      setTimeout(() => this.#downloadVersesAudio(), TIME_OUT_DURATION)
      return
    }

    console.log('Downloading text for verse: ' + verse)
    const that = this
    quranComApiModule.getVerseText(
      this.#basePage,
      verse,
      this.#recitation,
      (verseText) => {
        const [text, mapping] = parseVerse(verseText)
        logger.log('text=' + text)
        setVerseText(verse, text)
        setVerseInfo(verse, mapping)
        setTimeout(() => that.#downloadVersesAudio(), TIME_OUT_DURATION)
      }
    )
  }

  #getVersesAudioPaths () {
    const that = this
    quranComApiModule.getVersesAudioPaths(
      this.#basePage,
      this.#recitation,
      (audioFiles) => {
        const { url } = audioFiles[0]
        that.#relativePath = url.substring(0, url.lastIndexOf('/') + 1)
        setTimeout(() => that.#downloadVerseText(), TIME_OUT_DURATION)
      })
  }

  #downloadVerses () {
    setTimeout(() => this.#getVersesAudioPaths(), TIME_OUT_DURATION)
  }
}
