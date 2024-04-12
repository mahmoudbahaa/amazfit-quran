/* global Logger AppSideService */
import { MessageBuilder } from 'zeppos-cross-api/message-side'
import { Handler } from './handler'

const messageBuilder = new MessageBuilder()

// @ts-ignore
const logger = Logger.getLogger('message-app-side')
// @ts-ignore
AppSideService({
  state: {
    downloader: undefined
  },
  onInit () {
    logger.log('app side service invoke onInit')
    const handler = new Handler(this, messageBuilder)
    messageBuilder.listen(() => { })

    messageBuilder.on('request', (ctx) => {
      const req = messageBuilder.buf2Json(ctx.request.payload)
      handler.onRequest(req, ctx)
    })
  },
  onRun () {
    logger.log('app side service invoke onRun')
  },
  onDestroy () {
    logger.log('app side service invoke onDestroy')
  },
  log (...text) {
    logger.log(text)
  }
})
