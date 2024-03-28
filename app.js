/* global App */
import { BaseApp } from './libs/zml/dist/zml-app'

App(
  BaseApp({
    globalData: {
      curVerse: undefined,
      curDownloadedVerse: undefined,
      settings: undefined,
      langCode: undefined,
      pageNumber: 0,
      scrollTop: 0
    },
    onCreate () {
      console.log('app on create invoke')
    },
    onDestroy () {
      console.log('app on destroy invoke')
    }
  })
)
