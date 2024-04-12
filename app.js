/* global App */

import { messageBuilderNoInit } from './lib/messageBuilderHolder'
// import { FsTools } from './lib/mmk/Path'

// FsTools.appTags = [9999999, 'app']

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
    const mb = messageBuilderNoInit()
    if (mb) mb.disConnect()
  }
})
