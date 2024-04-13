import { QuranVersesDownloader } from './quranVersesDownloader';

const baseUrl = 'https://api.quran.com/api/v4/';

export class Handler {
  /**
   * @type {QuranVersesDownloader}
   */
  #downloader;
  #service;
  /**
   * @type {number}
   */
  #remainingLangsNum;

  constructor(service) {
    this.#service = service;
  }

  async onRequest(req, res) {
    switch (req.method) {
      case 'download.ayas': {
        if (this.#downloader) {
          this.#downloader.stop();
        }

        this.#downloader = new QuranVersesDownloader(this.#service, req.params);
        this.#downloader.downloadVerses();
        res(null);
        break;
      }

      case 'download.stop': {
        if (this.#downloader !== undefined) {
          this.#downloader.stop();
        }

        this.#downloader = undefined;
        res(null);
        break;
      }

      case 'get.chapters.langs': {
        await this.#getChaptersLangs(res);
        break;
      }

      case 'get.chapters': {
        await this.#getChapters(req, res);
        break;
      }

      default: {
        console.log('unknown method/command');
        throw new Error('unknown method/command');
      }
    }
  }

  /**
   * @param {string} url
   * @returns {Promise<Response>}
   */
  async #get(url) {
    // @ts-ignore
    return fetch({ url, method: 'GET' });
  }

  async #getChaptersLangs(res) {
    const response = await this.#get(baseUrl + 'resources/languages');

    if (!response.ok) {
      res('error');
      return;
    }

    const languages = {};
    const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    this.#remainingLangsNum = body.languages.length;
    body.languages.forEach(lang => this.#checkLanguage(lang, languages, res));
  }

  async #checkLanguage(lang, languages, res) {
    const response = await this.#get(baseUrl + 'chapters/1?language=' + lang.iso_code);
    this.#remainingLangsNum--;
    if (response.ok) {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      const retLangName = body.chapter.translated_name.language_name.toLowerCase();
      if (retLangName === lang.name.toLowerCase()) {
        languages[lang.iso_code] = lang.native_name;
      }
    }

    if (this.#remainingLangsNum === 0) {
      languages.ar = 'عربي';
      res(null, { languages });
    }
  }

  async #getChapters(req, res) {
    const response = await this.#get(`${baseUrl}chapters?language=${req.params.lang}`);

    if (!response.ok) {
      console.log(`Error=${response.status},${response.statusText}`);
      res('error');
      return;
    }

    const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    if (body.chapters === undefined) {
      res('error');
    }

    const chapters = body.chapters.map(chapter => ({
      nameSimple: chapter.name_simple,
      nameComplex: chapter.name_complex,
      nameArabic: chapter.name_arabic,
      translatedName: chapter.translated_name.name,
    }));

    res(null, { chapters });
  }
}
