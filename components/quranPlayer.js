import { create, id } from 'zeppos-cross-api/media';
import { Time } from 'zeppos-cross-api/sensor';
import { log } from 'zeppos-cross-api/utils';
import { getRecitation, hasVerseInfo } from '../lib/config/default';
import {
  NUM_CHAPTERS, NUM_JUZS, PLAYER_BUFFER_SIZE, PLAYER_TYPE_CHAPTER, PLAYER_TYPE_JUZ,
} from '../lib/constants';
import { getGlobal } from '../lib/global';
import {
  checkVerseExists, getChapterVerses, getFileName, getJuzVerses, parseQuery,
} from '../lib/utils';
import { PlayerInfo } from './player/playerInfoHolder';

const time = new Time();
const VOLUME_INCREMENT = 10;
const logger = log.getLogger('quran.player');

export const START = 'start';
export const EXIT = 'exit';
export const PLAY = 'play';
export const PAUSE = 'pause';
export const STOP = 'stop';
export const PREVIOUS = 'previous';
export const NEXT = 'next';
export const DECREASE_VOLUME = 'dec-vol';
export const INCREASE_VOLUME = 'inc-vol';
export class QuranPlayer {
  #verses;
  #player;
  #curPlayVerse;
  #curDownVerse;
  #relativePath;
  #recitation;
  #paused;

  constructor() {
    this.#reset();
  }

  doAction(e) {
    const result = parseQuery(e);

    if (result.action !== START
        && result.action !== EXIT
      && this.#player === undefined) {
      logger.error('player not ready');
      return;
    }

    switch (result.action) {
      case START:
        this.#reset();
        PlayerInfo.type = result.type;
        this.#playSurahOrJuz(parseInt(result.number, 10), result.verse);
        break;
      case EXIT:
        this.#doExit();
        break;
      case PLAY:
        this.#paused = false;
        if (this.#player.getStatus() === this.#player.state.PAUSED) {
          this.#player.resume();
        } else {
          this.#player.prepare();
        }

        break;
      case PAUSE:
        this.#paused = true;
        this.#player.pause();
        break;
      case STOP:
        this.#paused = true;
        this.#player.stop();
        break;
      case PREVIOUS:
        this.#playSurahOrJuz(PlayerInfo.number - 1);
        break;
      case NEXT:
        this.#playSurahOrJuz(PlayerInfo.number + 1);
        break;
      case DECREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() - VOLUME_INCREMENT);
        break;
      case INCREASE_VOLUME:
        this.#player.setVolume(this.#player.getVolume() + VOLUME_INCREMENT);
        break;
      default: break;
    }
  }

  updateStatus(curDownVerse) {
    this.#curDownVerse = curDownVerse;
    PlayerInfo.curDownloadedVerse = this.#verses[curDownVerse];
    if (curDownVerse - this.#curPlayVerse > PLAYER_BUFFER_SIZE || curDownVerse === this.#verses.length) {
      this.#playVerse();
    }
  }

  #doExit() {
    logger.log('Stop Player Service');
    if (this.#player !== undefined) {
      this.#player.stop();
      this.#player.release();
    }

    if (getGlobal().basePage) {
      getGlobal().basePage.request({
        method: 'download.stop',
        params: '',
      });
    }
  }

  #reset(partialReset = false) {
    PlayerInfo.curVerse = undefined;
    PlayerInfo.curDownloadedVerse = undefined;

    this.#curPlayVerse = -1;
    this.#curDownVerse = -1;
    this.#recitation = getRecitation().split(',')[1];
    this.#paused = false;

    if (partialReset) {
      return;
    }

    PlayerInfo.type = undefined;
    PlayerInfo.number = undefined;
    this.#relativePath = undefined;
  }

  #playSurahOrJuz(number, startFrom) {
    switch (PlayerInfo.type) {
      case PLAYER_TYPE_JUZ: {
        if (number > NUM_JUZS || number < 1) {
          return;
        }

        this.#verses = getJuzVerses(number);
        break;
      }

      case PLAYER_TYPE_CHAPTER: {
        if (number > NUM_CHAPTERS || number < 1) {
          return;
        }

        this.#verses = getChapterVerses(number);
        break;
      }

      default: break;
    }

    this.#reset(true);
    PlayerInfo.number = number;
    if (this.#player !== undefined) {
      this.#player.stop();
    }

    const audioExists = this.#verses.map(verse => checkVerseExists(verse));
    const textExists = this.#verses.map(verse => hasVerseInfo(verse));
    const recitation = getRecitation().split(',')[1];

    this.#curPlayVerse = startFrom === undefined ? -1 : (this.#verses.indexOf(startFrom) - 1);
    getGlobal().basePage.request({
      method: 'download.ayas',
      params: {
        verses: this.#verses,
        start: this.#curPlayVerse,
        audioExists,
        textExists,
        recitation,
      },
    });
  }

  #getFileName(verseIndex) {
    return getFileName(this.#verses[verseIndex]);
  }

  #playVerse() {
    if (this.#paused) {
      return;
    }

    if (this.#player
      && (this.#player.getStatus() === (this.#player.state.STARTED || 5)
        || this.#player.getStatus() === (this.#player.state.PREPARED || 3)
        || this.#player.getStatus() === (this.#player.state.PREPARING || 2))) {
      return;
    }

    this.#curPlayVerse++;

    if (this.#curPlayVerse >= this.#verses.length) {
      if (PlayerInfo.continue) {
        this.#playSurahOrJuz(PlayerInfo.number + 1);
      } else {
        this.#doExit();
      }

      return;
    }

    if (this.#curPlayVerse >= this.#curDownVerse) {
      this.#curPlayVerse--;
      return;
    }

    let player = this.#player;
    if (player === undefined) {
      this.#player = create(id.PLAYER);
      player = this.#player;
      player.addEventListener(player.event.PREPARE, result => {
        if (result) {
          PlayerInfo.verseStartTime = time.getTime();
          PlayerInfo.curVerse = this.#verses[this.#curPlayVerse];
          player.start();
        } else {
          logger.log('=== prepare fail ===');
          player.release();
        }
      });

      player.addEventListener(player.event.COMPLETE, () => this.#playVerse());
    } else {
      player.stop();
    }

    player.setSource(player.source.FILE, { file: `data://download/${this.#getFileName(this.#curPlayVerse)}` });
    player.prepare();
  }
}
