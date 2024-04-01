import { quranComApiModule } from '../components/quran-com-api-module'
import {
  ERROR_RETRY_AFTER,
  MAX_CHARS_PER_PAGE,
  MAX_ERROR_RETRIES,
  MAX_WORDS_PER_PAGE,
  STOP_LABELS
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
    this.#logger = logger
    this.#service = service

    this.#verses = params.verses
    this.#audioExists = params.audioExists
    this.#textExists = params.textExists
    this.#recitation = params.recitation

    this.#stoppingVerseDownload = false
    this.#stoppedVerseDownload = false
    this.#curDownVerse = -1
    this.#transferErrorCount = 0
    this.#downloadErrorCount = 0
  }

  #transferVersesAudio () {
    const verse = this.#verses[this.#curDownVerse]

    quranComApiModule.transferVerse(
      this.#service,
      verse,
      () => {
        this.#transferErrorCount = 0
        setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      },
      event => {
        if (event.started) {
          this.#logger.log('transfer error=>' + JSON.stringify(event))
          this.#transferErrorCount++
          this.#logger.log('Transfer Retry number=>' + this.#transferErrorCount)
        }

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

  #verse = {}
  #parseVerse (verseText) {
    // if (verseText.text_imlaei.length <= MAX_CHARS_PER_PAGE) { return [verseText.text_imlaei, [0]] }

    this.#verse.text = verseText.text_imlaei
    this.#verse.normalizedText = this.#verse.text
    STOP_LABELS.forEach((stopLabel) => {
      this.#verse.normalizedText = this.#verse.normalizedText.replaceAll(stopLabel, '')
    })
    this.#verse.words = this.#verse.normalizedText.replaceAll('  ', ' ').split(' ')
    this.#verse.mapping = [0]

    if (this.#verse.words.length < MAX_WORDS_PER_PAGE) return [this.#verse.text, this.#verse.mapping]

    this.#verse.segments = verseText.audio.segments
    for (let i = MAX_WORDS_PER_PAGE - 2; i < this.#verse.words.length; i += MAX_WORDS_PER_PAGE - 1) {
      this.#verse.mapping.push(this.#verse.segments[i][3])
    }
    return [this.#verse.normalizedText, this.#verse.mapping]
  }

  async #downloadVerseText () {
    if (this.#stoppingVerseDownload) {
      this.#stoppingVerseDownload = false
      this.#stoppedVerseDownload = true
      return
    }

    this.#curDownVerse++
    this.#service.call({ curDownVerse: this.#curDownVerse })
    if (this.#curDownVerse === this.#verses.length) {
      this.#stoppedVerseDownload = true
      return
    }

    const verse = this.#verses[this.#curDownVerse]
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
        const [text, mapping] = this.#parseVerse(verseText)
        this.#service.call({ verse, verseText: text, verseInfo: mapping })
        setTimeout(() => that.#downloadVersesAudio(), TIME_OUT_DURATION)
      }
    )
  }

  async #getVersesAudioPaths () {
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

  downloadVerses () {
    this.#service.call({ curDownVerse: 0 })
    setTimeout(async () => await this.#getVersesAudioPaths(), TIME_OUT_DURATION)
  }

  stop () {
    this.#stoppingVerseDownload = true
  }

  log (...params) {
    this.#logger.log(...params)
  }
}
