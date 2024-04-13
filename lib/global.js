/* global getApp */

/**
 * @returns {{pageNumber: number, scrollTop: number, errorCount: number, restorePlayer: boolean,
 * basePage:  { state: {player: any}, request: (option: {method: string, params: any}) => Promise<any> }}}
 */
export function getGlobal() {
  return getApp()._options.globalData;
}

export function getGlobalInitialState() {
  return {
    pageNumber: 0,
    scrollTop: 0,
    errorCount: 0,
    // restorePlayer: true,
    restorePlayer: false,
    basePage: undefined,
  };
}
