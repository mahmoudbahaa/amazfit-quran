/* global App */

import { messageBuilder } from './lib/messageBuilderHolder'

App({
  globalData: {
    pageNumber: 0,
    scrollTop: 0,
    continue: true,
    errorCount: 0,
    restorePlayer: true
  },
  onCreate () {
    console.log('app on create invoke')
  },
  onDestroy () {
    console.log('app on destroy invoke')
    const mb = messageBuilder()
    if (mb) mb.disConnect()
  }
})
