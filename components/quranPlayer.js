/* global getApp */
import { create, id } from '@zos/media'
import { Time } from '@zos/sensor'
import { log } from '@zos/utils'
import { getRecitation, getVerseInfo, hasVerseInfo } from '../libs/config/default'
import { IS_EMULATOR, NUM_CHAPTERS, NUM_JUZS, PLAYER_BUFFER_SIZE } from '../libs/constants'
import { checkVerseExists, getChapterVerses, getFileName, getJuzVerses, parseQuery } from '../libs/utils'

const time = new Time()
const VOLUME_INCREMENT = 10
const logger = log.getLogger('quran.player')

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
  #relativePath
  #recitation
  #paused

  constructor () {
    this.#reset()
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
        getApp()._options.globalData.playerInfo.type = result.type
        this.#playSurahOrJuz(parseInt(result.number), result.verse)
        break
      case EXIT:
        this.#doExit()
        break
      case PLAY:
        this.#paused = false
        if (this.#player.getStatus() === this.#player.state.PAUSED) {
          this.#player.resume()
        } else {
          this.#player.prepare()
        }
        break
      case PAUSE:
        this.#paused = true
        this.#player.pause()
        break
      case STOP:
        this.#paused = true
        this.#player.stop()
        break
      case PREVIOUS:
        this.#playSurahOrJuz(getApp()._options.globalData.playerInfo.number - 1)
        break
      case NEXT:
        this.#playSurahOrJuz(getApp()._options.globalData.playerInfo.number + 1)
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
    getApp()._options.globalData.playerInfo.curDownloadedVerse = this.#verses[curDownVerse]
    if (curDownVerse - this.#curPlayVerse > PLAYER_BUFFER_SIZE || curDownVerse === this.#verses.length) {
      this.#playVerse()
    }
  }

  #doExit (stopService = true) {
    logger.log('Stop Player Service')
    if (this.#player !== undefined) {
      this.#player.stop()
      this.#player.release()
    }

    if (getApp()._options.globalData.basePage) {
      getApp()._options.globalData.basePage.request({
        method: 'download.stop',
        params: ''
      })
    }
  }

  #reset (partialReset = false) {
    getApp()._options.globalData.playerInfo.curVerse = undefined
    getApp()._options.globalData.playerInfo.curDownloadedVerse = undefined

    this.#curPlayVerse = -1
    this.#curDownVerse = -1
    this.#recitation = getRecitation().split(',')[1]
    this.#paused = false

    if (partialReset) return

    getApp()._options.globalData.playerInfo.type = undefined
    getApp()._options.globalData.playerInfo.number = undefined
    this.#relativePath = undefined
  }

  #playSurahOrJuz (number, startFrom) {
    switch (getApp()._options.globalData.playerInfo.type) {
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
    getApp()._options.globalData.playerInfo.number = number
    if (this.#player !== undefined) {
      this.#player.stop()
    }

    const audioExists = this.#verses.map((verse) => checkVerseExists(verse))
    const textExists = this.#verses.map((verse) => hasVerseInfo(verse))
    const recitation = getRecitation().split(',')[1]

    this.#curPlayVerse = startFrom === undefined ? -1 : (this.#verses.indexOf(startFrom) - 1)
    getApp()._options.globalData.basePage.request({
      method: 'download.ayas',
      params: {
        verses: this.#verses,
        start: this.#curPlayVerse,
        audioExists,
        textExists,
        recitation
      }
    })
  }

  #getFileName (verseIndex) {
    return getFileName(this.#verses[verseIndex])
  }

  emulatePlayVerse () {
    this.#curPlayVerse++

    if (this.#curPlayVerse >= this.#verses.length) {
      this.#emulatorPlayed = false
      if (getApp()._options.globalData.continue) {
        this.#playSurahOrJuz(getApp()._options.globalData.playerInfo.number + 1)
      } else {
        this.#doExit(false)
      }

      return
    }

    if (this.#curPlayVerse >= this.#curDownVerse) {
      this.#curPlayVerse--
      this.#emulatorPlayed = false
      return
    }

    getApp()._options.globalData.playerInfo.verseStartTime = time.getTime()
    getApp()._options.globalData.playerInfo.curVerse = this.#verses[this.#curPlayVerse]

    const mapping = getVerseInfo(this.#verses[this.#curPlayVerse])
    const timeout = mapping.length === 0 ? 5000 : mapping[mapping.length - 1]
    setTimeout(() => this.emulatePlayVerse(), timeout)
  }

  #emulatorPlayed
  #playVerse () {
    if (IS_EMULATOR && !this.#emulatorPlayed) {
      this.#emulatorPlayed = true
      this.emulatePlayVerse()
      return
    }

    if (this.#paused) return

    if (this.#player &&
      (this.#player.getStatus() === (this.#player.state.STARTED || 5) ||
        this.#player.getStatus() === (this.#player.state.PREPARED || 3) ||
        this.#player.getStatus() === (this.#player.state.PREPARING || 2))) {
      return
    }

    this.#curPlayVerse++

    if (this.#curPlayVerse >= this.#verses.length) {
      if (getApp()._options.globalData.continue) {
        this.#playSurahOrJuz(getApp()._options.globalData.playerInfo.number + 1)
      } else {
        this.#doExit(false)
      }

      return
    }

    if (this.#curPlayVerse >= this.#curDownVerse) {
      this.#curPlayVerse--
      return
    }

    let player = this.#player
    if (player === undefined) {
      this.#player = player = create(id.PLAYER)
      const that = this
      player.addEventListener(player.event.PREPARE, (result) => {
        if (result) {
          getApp()._options.globalData.playerInfo.verseStartTime = time.getTime()
          getApp()._options.globalData.playerInfo.curVerse = this.#verses[that.#curPlayVerse]
          player.start()
        } else {
          console.log('hi15')
          logger.log('=== prepare fail ===')
          player.release()
        }
      })

      player.addEventListener(player.event.COMPLETE, (result) => {
        console.log('hi12')
        that.#playVerse()
      })
    } else {
      player.stop()
    }

    player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` })
    player.prepare()
  }
}
