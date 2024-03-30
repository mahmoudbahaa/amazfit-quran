/* global getApp */
import { log } from '@zos/utils'
import { create, id } from '@zos/media'
import * as appServiceMgr from '@zos/app-service'
import { checkVerseExists, getChapterVerses, getFileName, getJuzVerses, parseQuery } from '../libs/utils'
import { getRecitation, hasVerseText } from '../libs/storage/localStorage'
import { NUM_CHAPTERS, NUM_JUZS, PLAYER_BUFFER_SIZE } from '../libs/constants'

const VOLUME_INCREMENT = 10
const thisService = 'app-service/player_service'
const logger = log.getLogger('player.service')

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
  #verses
  #player
  #curPlayVerse
  #curDownVerse
  #onHold
  #relativePath
  #basePage
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
        getApp()._options.globalData.player.type = result.type
        this.#playSurahOrJuz(parseInt(result.number))
        if (!isNaN(result.verse)) this.#curPlayVerse = this.#verses.indexOf(result.verse) - 1
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
        this.#playSurahOrJuz(getApp()._options.globalData.player.number - 1)
        break
      case NEXT:
        this.#playSurahOrJuz(getApp()._options.globalData.player.number + 1)
        break
      case DECREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() - VOLUME_INCREMENT)
        break
      case INCREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() + VOLUME_INCREMENT)
        break
    }
  }

  updateStatus (curDownVerse) {
    this.#curDownVerse = curDownVerse
    getApp()._options.globalData.player.curDownloadedVerse = this.#verses[curDownVerse]
    if (curDownVerse - this.#curPlayVerse > PLAYER_BUFFER_SIZE) {
      this.#playVerse()
    }
  }

  #doExit (stopService = true) {
    logger.log('Stop Player Service')
    if (this.#player !== undefined) {
      this.#player.stop()
      this.#player.release()
    }

    this.#basePage.request({
      method: 'download.stop',
      params: ''
    })

    if (stopService) {
      appServiceMgr.stop({
        file: thisService
      })
    }
  }

  #reset (partialReset = false) {
    getApp()._options.globalData.player.curVerse = undefined
    getApp()._options.globalData.player.curDownloadedVerse = undefined

    this.#curPlayVerse = -1
    this.#curDownVerse = -1
    this.#onHold = true
    this.#recitation = getRecitation().split(',')[1]

    if (partialReset) return

    getApp()._options.globalData.player.type = undefined
    getApp()._options.globalData.player.number = undefined
    this.#relativePath = undefined
  }

  #playSurahOrJuz (number) {
    switch (getApp()._options.globalData.player.type) {
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
    getApp()._options.globalData.player.number = number
    if (this.#player !== undefined) {
      this.#player.stop()
    }

    const audioExists = this.#verses.map((verse) => checkVerseExists(verse))
    const textExists = this.#verses.map((verse) => hasVerseText(verse))
    const recitation = getRecitation().split(',')[1]

    this.#basePage.request({
      method: 'download.ayas',
      params: {
        verses: this.#verses,
        audioExists,
        textExists,
        recitation
      }
    })
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
        this.#playSurahOrJuz(getApp()._options.globalData.player.number + 1)
      } else {
        this.#doExit(false)
      }

      return
    }

    if (this.#curPlayVerse > this.#curDownVerse) {
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
          getApp()._options.globalData.player.verseStartTime = getApp()._options.globalData.time.getTime()
          getApp()._options.globalData.player.curVerse = this.#verses[that.#curPlayVerse]
          player.start()
        } else {
          logger.log(`=== prepare fail ===${JSON.stringify(result)}`)
          player.release()
        }
      })

      player.addEventListener(player.event.COMPLETE, (result) => {
        that.#onHold = true
        that.#playVerse()
      })

      player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` })
      player.prepare()
    } else {
      player.stop()
      player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` })
      player.prepare()
    }
  }
}
