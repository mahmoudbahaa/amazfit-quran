/* global App */
import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    globalData: {
      curVerse: undefined,
      curDownloadedVerse: undefined,
      verses: undefined,
      langCode: undefined
    },
    onCreate () {
      console.log('app on create invoke')
    },
    onDestroy () {
      console.log('app on destroy invoke')
    }
  })
)
