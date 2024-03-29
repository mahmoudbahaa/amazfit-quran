import { quranComApiModule } from '../components/quran-com-api-module'
import { ERROR_RETRY_AFTER, MAX_ERROR_RETRIES, MAX_WORDS_PER_PAGE, STOP_LABELS } from '../libs/constants'

const TIME_OUT_DURATION = 200
let errorCount = 0
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
  // #logger

  constructor (logger, service, params) {
    // this.#logger = logger
    this.#service = service

    this.#verses = params.verses
    this.#audioExists = params.audioExists
    this.#textExists = params.textExists
    this.#recitation = params.recitation

    this.#stoppingVerseDownload = false
    this.#stoppedVerseDownload = false
    this.#curDownVerse = -1
  }

  #transferVersesAudio () {
    const verse = this.#verses[this.#curDownVerse]

    quranComApiModule.transferVerse(
      this.#service,
      verse,
      () => {
        errorCount = 0
        setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      },
      event => {
        console.log('error=>' + JSON.stringify(event))
        errorCount++
        if (errorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#transferVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          setTimeout(() => this.stop(), 5000)
        }
      }
    )
  }

  #downloadVersesAudio () {
    if (this.#audioExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVerseText(), TIME_OUT_DURATION)
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    quranComApiModule.downloadVerse(
      this.#service,
      this.#relativePath,
      verse,
      () => {
        errorCount = 0
        setTimeout(() => this.#transferVersesAudio(), TIME_OUT_DURATION)
      },
      event => {
        console.log('error=>' + JSON.stringify(event))
        errorCount++
        if (errorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#downloadVersesAudio(), ERROR_RETRY_AFTER)
        } else {
          setTimeout(() => this.stop(), 5000)
        }
      }
    )
  }

  #parseVerse (verseText) {
    const text = verseText.text_imlaei
    let normalizedText = text
    STOP_LABELS.forEach((stopLabel) => {
      normalizedText = normalizedText.replaceAll(stopLabel, '')
    })
    const words = normalizedText.replaceAll('  ', ' ').split(' ')
    const mapping = [0]

    if (words.length < MAX_WORDS_PER_PAGE) return [text, mapping]

    const segments = verseText.audio.segments
    for (let i = MAX_WORDS_PER_PAGE; i < words.length; i += MAX_WORDS_PER_PAGE) {
      mapping.push(segments[i][3])
    }
    return [normalizedText, mapping]
  }

  async #downloadVerseText () {
    if (this.#stoppingVerseDownload) {
      this.#stoppingVerseDownload = false
      this.#stoppedVerseDownload = true
      return
    }

    this.#curDownVerse++
    if (this.#curDownVerse === this.#verses.length) {
      this.#stoppedVerseDownload = true
      return
    }

    const verse = this.#verses[this.#curDownVerse]
    this.#service.call({ curDownVerse: this.#curDownVerse })
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
    setTimeout(async () => await this.#getVersesAudioPaths(), TIME_OUT_DURATION)
  }

  stop () {
    this.#stoppingVerseDownload = true
  }
}
