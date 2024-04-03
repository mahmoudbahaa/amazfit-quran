/* global App */
import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    globalData: {
      playerInfo: {
        type: undefined,
        number: undefined,
        curVerse: undefined,
        curDownloadedVerse: undefined,
        verseStartTime: undefined
      },
      settings: undefined,
      langCode: undefined,
      pageNumber: 0,
      scrollTop: 0,
      continue: true,
      errorCount: 0,
      restorePlayer: true,
      appStarting: true,
      basePage: undefined,
      player: undefined
    },
    onCreate () {
      console.log('app on create invoke')
    },
    onDestroy () {
      console.log('app on destroy invoke')
    }
  })
)
