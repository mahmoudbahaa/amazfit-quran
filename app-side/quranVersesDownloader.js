import { quranComApiModule } from '../components/quran-com-api-module';
import {
  ERROR_RETRY_AFTER,
  MAX_ERROR_RETRIES,
  MIN_TIMEOUT_DURATION,
} from '../lib/constants';

export class QuranVersesDownloader {
  #verses;
  #curDownVerse;
  #audioExists;
  #textExists;
  #relativePath;
  #stoppingVerseDownload;
  #stoppedVerseDownload;
  #service;
  #recitation;
  #transferErrorCount;
  #downloadErrorCount;
  #messageBuilder;

  constructor(service, messageBuilder, params) {
    this.#init(service, messageBuilder, params);
    this.#stoppingVerseDownload = false;
    this.#stoppedVerseDownload = false;
  }

  #init(service, messageBuilder, params) {
    this.#service = service;
    this.#messageBuilder = messageBuilder;

    this.#verses = params.verses;
    this.#audioExists = params.audioExists;
    this.#textExists = params.textExists;
    this.#recitation = params.recitation;
    this.#curDownVerse = params.start;

    this.#transferErrorCount = 0;
    this.#downloadErrorCount = 0;
  }

  downloadVerses() {
    this.#messageBuilder.request({ curDownVerse: this.#curDownVerse });
    setTimeout(async () => this.#getVersesAudioPaths(), MIN_TIMEOUT_DURATION);
  }

  #checkStop() {
    if (this.#stoppingVerseDownload) {
      this.#service.log('Stopping download');
      this.#stoppingVerseDownload = false;
      this.#stoppedVerseDownload = true;
      return true;
    }

    return false;
  }

  #transferVersesAudio() {
    if (this.#checkStop()) {
      return;
    }

    const verse = this.#verses[this.#curDownVerse];
    quranComApiModule.transferVerse(
      this.#service,
      verse,
      () => {
        this.#transferErrorCount = 0;
        setTimeout(() => this.#downloadVerseText(), MIN_TIMEOUT_DURATION);
      },
      event => {
        this.#service.log('transfer error=>' + JSON.stringify(event));
        if (event.started) {
          this.#transferErrorCount++;
        }

        this.#service.log('Transfer Retry number=>' + this.#transferErrorCount);
        if (this.#transferErrorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#transferVersesAudio(), ERROR_RETRY_AFTER);
        } else {
          this.#service.log('Too many errors in transfer stopping :(');
          setTimeout(() => this.stop(), MIN_TIMEOUT_DURATION);
        }
      },
    );
  }

  #downloadVersesAudio() {
    if (this.#checkStop()) {
      return;
    }

    if (this.#audioExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVerseText(), MIN_TIMEOUT_DURATION);
      return;
    }

    if (this.#downloadErrorCount > 0) {
      this.#service.log('Download Retry number=>' + this.#downloadErrorCount);
    }

    quranComApiModule.downloadVerse(
      this.#service,
      this.#relativePath,
      this.#verses[this.#curDownVerse],
      () => {
        this.#downloadErrorCount = 0;
        setTimeout(() => this.#transferVersesAudio(), MIN_TIMEOUT_DURATION);
      },
      event => {
        this.#service.log('download error=>' + JSON.stringify(event));
        this.#downloadErrorCount++;
        if (this.#downloadErrorCount <= MAX_ERROR_RETRIES) {
          setTimeout(() => this.#downloadVersesAudio(), ERROR_RETRY_AFTER);
        } else {
          this.#service.log('Too many errors in download stopping :(');
          setTimeout(() => this.stop(), MIN_TIMEOUT_DURATION);
        }
      },
    );
  }

  #verseMapping;
  #parseVerse(verseText) {
    this.#verseMapping = [];
    for (let i = 0; i < verseText.audio.segments.length; i++) {
      this.#verseMapping.push(verseText.audio.segments[i][3]);
    }

    return this.#verseMapping;
  }

  async #downloadVerseText() {
    if (this.#checkStop()) {
      return;
    }

    this.#curDownVerse++;
    this.#messageBuilder.request({ curDownVerse: this.#curDownVerse });
    if (this.#curDownVerse >= this.#verses.length) {
      this.#stoppingVerseDownload = true;
      return;
    }

    const verse = this.#verses[this.#curDownVerse];
    if (this.#textExists[this.#curDownVerse]) {
      setTimeout(() => this.#downloadVersesAudio(), MIN_TIMEOUT_DURATION);
      return;
    }

    const that = this;
    await quranComApiModule.getVerseText(
      this.#service,
      verse,
      this.#recitation,
      verseText => {
        const mapping = this.#parseVerse(verseText);
        this.#messageBuilder.request({ verse, mapping });
        setTimeout(() => that.#downloadVersesAudio(), MIN_TIMEOUT_DURATION);
      },
    );
  }

  async #getVersesAudioPaths() {
    if (this.#checkStop()) {
      return;
    }

    const that = this;
    await quranComApiModule.getVersesAudioPaths(
      this.#service,
      this.#recitation,
      audioFiles => {
        const { url } = audioFiles[0];
        that.#relativePath = url.substring(0, url.lastIndexOf('/') + 1);
        setTimeout(async () => that.#downloadVerseText(), MIN_TIMEOUT_DURATION);
      });
  }

  stop() {
    this.#stoppingVerseDownload = true;
  }
}
