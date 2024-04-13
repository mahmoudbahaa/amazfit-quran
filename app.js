/* global App */
import { BaseApp } from 'zeppos-cross-api/zml-base-app';
import { getGlobalInitialState } from './lib/global';

App(
  BaseApp({
    globalData: getGlobalInitialState(),
    onCreate() {
      console.log('app on create invoke');
    },
    onDestroy() {
      console.log('app on destroy invoke');
    },
  }),
);
