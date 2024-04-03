import { quranComApiModule } from '../components/quran-com-api-module'
import {
  ERROR_RETRY_AFTER,
  MAX_ERROR_RETRIES
} from '../libs/constants'

const TIME_OUT_DURATION = 50

export class QuranVersesDownloader {
  #verses
  #curDownVerse
  #audioExists
  #textExists
  #relativePath
  #stoppingVerseDownload
  #stoppedVerseDownload
  #service
  #recitation
  #logger
  #transferErrorCount
  #downloadErrorCount

  constructor (logger, service, params) {
    this.#init(logger, service, params)
    this.#stoppingVerseDownload = false
    this.#stoppedVerseDownload = false
  }

  #init (logger, service, params) {
    this.#logger = logger
    this.#service = service

    this.#verses = params.verses
    this.#audioExists = params.audioExists
    this.#textExists = params.textExists
    this.#recitation = params.recitation
    this.#curDownVerse = params.start

    this.#transferErrorCount = 0
    this.#downloadErrorCount = 0
  }

  downloadVerses () {
    this.#service.call({ curDownVerse: this.#curDownVerse })
    // this.#stoppingVerseDownload = false
    // if (!this.#stoppedVerseDownload) return
    // this.#stoppedVerseDownload = false
    setTimeout(async () => await this.#getVersesAudioPaths(), TIME_OUT_DURATION)
  }

  // updateParams (logger, service, params) {
  //   this.#init(logger, service, params)
  // }

  #checkStop () {
    if (this.#stoppingVerseDownload) {
      this.#logger.log('Stopping download')
      this.#stoppingVerseDownload = false
      this.#stoppedVerseDownload = true
      return true
    }

    return false
  }

  #transferVersesAudio () {
    if (this.#checkStop()) return

    const verse = this.#verses[this.#curDownVerse]
    this.#logger.log('Transferring verse: ' + verse)
    quranComApiModule.transferVerse(
      this.#service,
      verse,
      () => {
        this.#transferErrorCount = 0
        setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      },
      event => {
        this.#logger.log('transfer error=>' + JSON.stringify(event))
        if (event.started) {
          this.#transferErrorCount++
        }

        this.#logger.log('Transfer Retry number=>' + this.#transferErrorCount)
        if (this.#transferErrorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#transferVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          this.#logger.log('Too many errors in transfer stopping :(')
          setTimeout(() => this.stop(), 5000)
        }
      }
    )
  }

  #downloadVersesAudio () {
    if (this.#checkStop()) return

    if (this.#audioExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVerseText(), 50)
      return
    }

    if (this.#downloadErrorCount > 0) {
      this.#logger.log('Download Retry number=>' + this.#downloadErrorCount)
    }

    quranComApiModule.downloadVerse(
      this.#service,
      this.#relativePath,
      this.#verses[this.#curDownVerse],
      () => {
        this.#downloadErrorCount = 0
        setTimeout(() => this.#transferVersesAudio(), TIME_OUT_DURATION)
      },
      event => {
        this.#logger.log('download error=>' + JSON.stringify(event))
        this.#downloadErrorCount++
        if (this.#downloadErrorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#downloadVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          this.#logger.log('Too many errors in download stopping :(')
          setTimeout(() => this.stop(), TIME_OUT_DURATION)
        }
      }
    )
  }

  #verseMapping
  #parseVerse (verseText) {
    this.#verseMapping = []
    for (let i = 0; i < verseText.audio.segments.length; i++) {
      this.#verseMapping.push(verseText.audio.segments[i][3])
    }
    return this.#verseMapping
  }

  async #downloadVerseText () {
    if (this.#checkStop()) return

    this.#curDownVerse++
    this.#service.call({ curDownVerse: this.#curDownVerse })
    if (this.#curDownVerse === this.#verses.length) {
      this.#stoppedVerseDownload = true
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    this.#logger.log('Downloading verse: ' + verse)
    if (this.#textExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVersesAudio(), TIME_OUT_DURATION)
      return
    }

    const that = this
    await quranComApiModule.getVerseText(
      this.#service,
      verse,
      this.#recitation,
      (verseText) => {
        const mapping = this.#parseVerse(verseText)
        this.#service.call({ verse, mapping })
        setTimeout(() => that.#downloadVersesAudio(), TIME_OUT_DURATION)
      }
    )
  }

  async #getVersesAudioPaths () {
    if (this.#checkStop()) return

    const that = this
    await quranComApiModule.getVersesAudioPaths(
      this.#service,
      this.#recitation,
      (audioFiles) => {
        const { url } = audioFiles[0]
        that.#relativePath = url.substring(0, url.lastIndexOf('/') + 1)
        setTimeout(async () => await that.#downloadVerseText(), TIME_OUT_DURATION)
      })
  }

  stop () {
    this.#stoppingVerseDownload = true
  }

  log (...params) {
    this.#logger.log(...params)
  }
}
