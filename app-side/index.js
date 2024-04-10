/* global Logger AppSideService */

import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { QuranVersesDownloader } from './quranVersesDownloader'

const logger = Logger.getLogger('message-app-side')

let remainingLangsNum
AppSideService(
  BaseSideService({

    state: {
      downloader: undefined
    },
    onInit () {
      logger.log('app side service invoke onInit')
    },
    onRun () {
      logger.log('app side service invoke onRun')
    },
    onDestroy () {
      logger.log('app side service invoke onDestroy')
    },
    onReceivedFile (file) {
      logger.log('received file:=> %j', file)
    },
    async onRequest (req, res) {
      switch (req.method) {
        case 'download.ayas': {
          res(null, {
            status: 'success',
            data: ''
          })

          if (this.state.downloader) this.state.downloader.stop()

          this.state.downloader = new QuranVersesDownloader(logger, this, req.params)
          this.state.downloader.downloadVerses()
          break
        }
        case 'download.stop': {
          res(null, {
            status: 'success',
            data: ''
          })

          if (this.state.downloader !== undefined) { this.state.downloader.stop() }
          this.state.downloader = undefined
          break
        }
        case 'get.settings': {
          const result = {}
          req.params.forEach(setting => {
            result[setting] = settingsLib.getItem(setting)
          })

          res(null, {
            status: 'success',
            data: result
          })

          break
        }

        case 'get.chapters.langs': {
          res(null, {
            status: 'success',
            data: ''
          })

          await this.getChaptersLangs(req)
          break
        }
      }
    },

    log (...text) {
      logger.log(text)
    },

    async get (url) {
      const res = await fetch({
        url,
        method: 'GET'
      })

      res.body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body
      return res
    },

    async getChaptersLangs (req) {
      const result = await this.get('https://api.quran.com/api/v4/resources/languages')
      if (result.status >= 300 || result.status < 200) {
        this.call({ req, status: 'error' })
        return
      }

      const languages = {}
      remainingLangsNum = result.body.languages.length
      result.body.languages.forEach(lang => this.checkLanguage(req, lang, languages))
    },

    async checkLanguage (req, lang, languages) {
      const result = await this.get('https://api.quran.com/api/v4/chapters/1?language=' + lang.iso_code)
      remainingLangsNum--
      if (result.status < 300 && result.status >= 200) {
        const retLangName = result.body.chapter.translated_name.language_name.toLowerCase()
        if (retLangName === lang.name.toLowerCase()) {
          languages[lang.iso_code] = lang.native_name
        }
      }

      if (remainingLangsNum === 0) {
        languages.ar = 'عربي'
        this.call({ req, status: 'success', languages })
      }
    }
  })
)
