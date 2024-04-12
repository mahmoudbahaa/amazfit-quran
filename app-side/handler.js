import { QuranVersesDownloader } from './quranVersesDownloader'

const baseUrl = 'https://api.quran.com/api/v4/'

export class Handler {
  /**
   * @type {QuranVersesDownloader}
   */
  #downloader
  #service
  /**
   * @type {number}
   */
  #remainingLangsNum
  #messageBuilder

  constructor (service, messageBuilder) {
    this.#service = service
    this.#messageBuilder = messageBuilder
  }

  async onRequest (req, ctx) {
    switch (req.method) {
      case 'download.ayas': {
        if (this.#downloader) this.#downloader.stop()

        this.#downloader = new QuranVersesDownloader(this.#service, this.#messageBuilder, req.params)
        this.#downloader.downloadVerses()
        ctx.response({ data: { result: 'SUCCESS' } })
        break
      }
      case 'download.stop': {
        if (this.#downloader !== undefined) { this.#downloader.stop() }
        this.#downloader = undefined
        ctx.response({ data: { result: 'SUCCESS' } })
        break
      }
      case 'get.chapters.langs': {
        await this.#getChaptersLangs(ctx)
        break
      }

      case 'get.chapters': {
        await this.#getChapters(req, ctx)
        break
      }
    }
  }

  /**
   * @param {string} url
   * @returns {Promise<Response>}
   */
  async #get (url) {
    // @ts-ignore
    return await fetch({ url, method: 'GET' })
  }

  async #getChaptersLangs (ctx) {
    const response = await this.#get(baseUrl + 'resources/languages')

    if (!response.ok) {
      ctx.response({ data: { status: 'error' } })
      return
    }

    const languages = {}
    const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
    this.#remainingLangsNum = body.languages.length
    body.languages.forEach(lang => this.#checkLanguage(lang, languages, ctx))
  }

  async #checkLanguage (lang, languages, ctx) {
    const response = await this.#get(baseUrl + 'chapters/1?language=' + lang.iso_code)
    this.#remainingLangsNum--
    if (response.ok) {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
      const retLangName = body.chapter.translated_name.language_name.toLowerCase()
      if (retLangName === lang.name.toLowerCase()) {
        languages[lang.iso_code] = lang.native_name
      }
    }

    if (this.#remainingLangsNum === 0) {
      languages.ar = 'عربي'
      ctx.response({ data: { status: 'success', languages } })
    }
  }

  async #getChapters (req, ctx) {
    const response = await this.#get(`${baseUrl}chapters?language=${req.params.lang}`)

    if (!response.ok) {
      console.log(`Error=${response.status},${response.statusText}`)
      ctx.response({ data: { status: 'error' } })
      return
    }

    const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
    if (body.chapters === undefined) {
      ctx.response({ data: { status: 'error' } })
    }

    const chapters = body.chapters.map(chapter => {
      return {
        name_simple: chapter.name_simple,
        name_complex: chapter.name_complex,
        name_arabic: chapter.name_arabic,
        translated_name: chapter.translated_name.name
      }
    })

    ctx.response({ data: { status: 'success', chapters } })
  }
}
