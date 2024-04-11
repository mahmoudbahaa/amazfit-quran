import { quranComApiModule } from '../components/quran-com-api-module'
import {
    ERROR_RETRY_AFTER,
    MAX_ERROR_RETRIES,
    MIN_TIMEOUT_DURATION
} from '../lib/constants'

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
    setTimeout(async () => await this.#getVersesAudioPaths(), MIN_TIMEOUT_DURATION)
  }

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
    quranComApiModule.transferVerse(
      this.#service,
      verse,
      () => {
        this.#transferErrorCount = 0
        setTimeout(() => this.#downloadVerseText(), MIN_TIMEOUT_DURATION)
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
          setTimeout(() => this.stop(), MIN_TIMEOUT_DURATION)
        }
      }
    )
  }

  #downloadVersesAudio () {
    if (this.#checkStop()) return

    if (this.#audioExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVerseText(), MIN_TIMEOUT_DURATION)
      return
    }

    if (this.#downloadErrorCount > 0) {
      this.#logger.log('Download Retry number=>' + this.#downloadErrorCount)
    }

    quranComApiModule.downloadVerse(
      this.#service,
      this.#relativePath,
      this.#verses[this.#curDownVerse],
      (result) => {
        this.#downloadErrorCount = 0
        setTimeout(() => this.#transferVersesAudio(), MIN_TIMEOUT_DURATION)
      },
      event => {
        this.#logger.log('download error=>' + JSON.stringify(event))
        this.#downloadErrorCount++
        if (this.#downloadErrorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#downloadVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          this.#logger.log('Too many errors in download stopping :(')
          setTimeout(() => this.stop(), MIN_TIMEOUT_DURATION)
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
    if (this.#curDownVerse >= this.#verses.length) {
      this.#stoppingVerseDownload = true
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    if (this.#textExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVersesAudio(), MIN_TIMEOUT_DURATION)
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
        setTimeout(() => that.#downloadVersesAudio(), MIN_TIMEOUT_DURATION)
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
        setTimeout(async () => await that.#downloadVerseText(), MIN_TIMEOUT_DURATION)
      })
  }

  stop () {
    this.#stoppingVerseDownload = true
  }

  log (...params) {
    this.#logger.log(...params)
  }
}
