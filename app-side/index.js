/* global Logger AppSideService */

import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { QuranVersesDownloader } from './quranVersesDownloader'

const logger = Logger.getLogger('message-app-side')

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

          if (this.state.downloader !== undefined) { this.state.downloader.stop() }

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
      }
    },

    log (...text) {
      logger.log(text)
    }
  })
)
