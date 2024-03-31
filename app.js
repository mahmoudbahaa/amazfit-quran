/* global App */
import { BaseApp } from '@zeppos/zml/base-app'

import { Time } from '@zos/sensor'
import { getPlayerInfo } from './libs/storage/localStorage'
import { replace } from '@zos/router'

App(
  BaseApp({
    globalData: {
      player: {
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
      time: new Time()
    },
    onCreate () {
      console.log('app on create invoke')
      const playerInfo = getPlayerInfo()
      if (playerInfo === undefined) return

      this.globalData.player = playerInfo
      if (playerInfo.curVerse !== undefined) {
        replace({
          url: 'page/player',
          params: `type=${playerInfo.type}&number=${playerInfo.number}&verse=${playerInfo.curVerse}`
        })
      }
    },
    onDestroy () {
      console.log('app on destroy invoke')
    }
  })
)
