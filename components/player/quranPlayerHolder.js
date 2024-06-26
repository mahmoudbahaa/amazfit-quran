import {
  QuranPlayer,
} from './quranPlayer';
/**
 * @type {QuranPlayer}
 */
let player;

export class Player {
  static init() {
    player ||= new QuranPlayer();
    return player;
  }

  static get() {
    return player;
  }

  static clear() {
    const oldPlayer = player;
    player = undefined;
    return oldPlayer;
  }
}
