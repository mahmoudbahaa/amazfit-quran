/* global App */
// import { BaseApp } from './libs/zml/dist/zml-app'
import { BaseApp } from '@zeppos/zml/base-app'

import { Time } from '@zos/sensor'

App(
  BaseApp({
    globalData: {
      curVerse: undefined,
      curDownloadedVerse: undefined,
      settings: undefined,
      langCode: undefined,
      pageNumber: 0,
      scrollTop: 0,
      continue: true,
      errorCount: 0,
      verseStartTime: undefined,
      time: new Time()
    },
    onCreate () {
      console.log('app on create invoke')
    },
    onDestroy () {
      console.log('app on destroy invoke')
    }
  })
)
