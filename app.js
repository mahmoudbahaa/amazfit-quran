/* global App */
import { BaseApp } from 'zeppos-cross-api/zml-base-app';
// Import { FsTools } from './lib/mmk/Path'

// FsTools.appTags = [9999999, 'app']

App(
  BaseApp({
    globalData: {
      pageNumber: 0,
      scrollTop: 0,
      continue: true,
      errorCount: 0,
      restorePlayer: true,
    },
    onCreate() {
      console.log('app on create invoke');
    },
    onDestroy() {
      console.log('app on destroy invoke');
    },
  }),
);
