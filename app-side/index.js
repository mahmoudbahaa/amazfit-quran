/* global Logger AppSideService */
import { BaseSideService } from 'zeppos-cross-api/zml-base-side';
import { Handler } from './handler';

// @ts-ignore
const logger = Logger.getLogger('message-app-side');
// @ts-ignore
AppSideService(
  BaseSideService({
    state: {
      handler: undefined,
    },
    onInit() {
      logger.log('app side service invoke onInit');
      this.state.handler = new Handler(this);
    },
    onRequest(req, res) {
      this.state.handler.onRequest(req, res);
    },
    onRun() {
      logger.log('app side service invoke onRun');
    },
    onDestroy() {
      logger.log('app side service invoke onDestroy');
    },
    log(...text) {
      logger.log(text);
    },
  }),
);
