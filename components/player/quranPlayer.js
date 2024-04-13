import { Time } from 'zeppos-cross-api/sensor';
import { log } from 'zeppos-cross-api/utils';
import { getRecitation } from '../../lib/config/default';
import {
  DECREASE_VOLUME, EXIT, INCREASE_VOLUME, NEXT, NUM_CHAPTERS, NUM_JUZS, PAUSE, PLAY, PLAYER_BUFFER_SIZE, PLAYER_TYPE_CHAPTER, PLAYER_TYPE_JUZ, PREVIOUS, START, STOP,
} from '../../lib/constants';
import {
  getChapterVerses, getFileName, getJuzVerses, parseQuery,
} from '../../lib/utils';
import { Player } from './Player';
import { PlayerInfo } from './playerInfoHolder';

const VOLUME_INCREMENT = 10;
const logger = log.getLogger('quran.player');
const time = new Time();

export class QuranPlayer {
  #player;
  #verses;
  #curPlayVerse;
  #curDownVerse;
  #relativePath;
  #recitation;
  #paused;

  // Where playerClass is either dummyPlayer or realPlayer
  constructor() {
    // BasePagc.onCall(param)
    // const mb = messageBuilder();
    // mb.on('request', ctx => {
    //   const request = mb.buf2Json(ctx.request.payload);
    //   if (request.curDownVerse) {
    //     this.updateStatus(request.curDownVerse);
    //   } else if (request.verse) {
    //     console.log('request received ' + JSON.stringify(request));
    //     setVerseInfo(request.verse, request.mapping);
    //   }
    //   // RequestHandler.onRequest(ctx, request)
    // });

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
        if (this.#player.isPaused()) {
          this.#player.resume();
        } else {
          this.#player.play();
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
        this.#player.incrVolume(-VOLUME_INCREMENT);
        break;
      case INCREASE_VOLUME:
        this.#player.incrVolume(VOLUME_INCREMENT);
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
    logger.log('Stop PlayerInfo Service');
    if (this.#player !== undefined) {
      this.#player.stop();
      this.#player.release();
    }

    // MessageBuilder().request({
    //   method: 'download.stop',
    //   params: '',
    // });
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

    // const audioExists = this.#verses.map(verse => checkVerseExists(verse));
    // const textExists = this.#verses.map(verse => hasVerseInfo(verse));
    // const recitation = getRecitation().split(',')[1];

    this.#curPlayVerse = startFrom === undefined ? -1 : (this.#verses.indexOf(startFrom) - 1);
    // messageBuilder().request({
    //   method: 'download.ayas',
    //   params: {
    //     verses: this.#verses,
    //     start: this.#curPlayVerse,
    //     audioExists,
    //     textExists,
    //     recitation,
    //   },
    // });
  }

  #getFileName(verseIndex) {
    return getFileName(this.#verses[verseIndex]);
  }

  #playVerse() {
    if (this.#paused) {
      return;
    }

    if (this.#player && this.#player.isStarted()) {
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

    if (this.#player === undefined) {
      this.#player = new Player(
        // On start
        () => {
          PlayerInfo.verseStartTime = time.getTime();
          PlayerInfo.curVerse = this.#verses[this.#curPlayVerse];
        },
        // On complete
        () => {
          this.#playVerse();
        });
    } else {
      this.#player.stop();
    }

    this.#player.setSource(`data://download/${this.#getFileName(this.#curPlayVerse)}`);
    this.#player.play();
  }
}
