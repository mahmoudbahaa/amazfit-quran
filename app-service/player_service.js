import {checkExists, parseQuery, sleep} from "../libs/utils";
import {log} from "@zos/utils";
import fs from '@zos/fs'
import media from '@zos/media'
import * as appServiceMgr from "@zos/app-service";
import {Time} from '@zos/sensor'

const VOLUME_INCREMENT = 5;
const moduleName = "Player Service";
let lastDuration = 0;
let lastStarted = undefined;
const time = new Time();
const logger = log.getLogger("this.state.player.service");

AppService(
  BasePage({
    state: {
      running: false,
      player: undefined,
    },

    doExit() {
      this.state.running = false;
      if (this.state.player !== undefined) {
        this.state.player.stop();
        this.state.player.release();
      }
      appServiceMgr.exit();
    },
    doAction(e) {
      let result = parseQuery(e);

      if (result.action === "start") {
        this.state.running = true;
        const verses = result.verses.split(",");
        this.playVerse(verses, 0);
      } else if (result.action === "exit") {
        this.doExit();
      } else if (this.state.player === undefined) {
        logger.error(`this.state.player not defined !!!`);
        return;
      }

      switch (result.action) {
        case "dec-vol":
          this.state.player.setVolume(this.state.player.getVolume() - VOLUME_INCREMENT);
          break;
        case "play": {
          if (this.state.player.getStatus() === this.state.player.state.PAUSED) {
            lastStarted = time.getTime();
            this.state.player.resume();
          } else {
            this.state.player.prepare();
          }

          break;
        }
        case "pause": {
          this.state.player.pause();
          lastDuration = lastDuration + (time.getTime() - lastStarted);
          lastStarted = NaN;
          break;
        }
        case "stop": {
          this.state.player.stop();
          lastDuration = lastDuration + (time.getTime() - lastStarted);
          lastStarted = NaN;
          break;
        }
        case "inc-vol":
          this.state.player.setVolume(this.state.player.getVolume() + VOLUME_INCREMENT);
          break;
          ;
      }
    },

    onEvent(e) {
      logger.log(`service onEvent(${e})`);
      this.doAction(e);
    },
    onInit(e) {
      logger.log(`service onInit(${e})`);
      this.doAction(e);
    },
    onDestroy() {
      logger.log("service on destroy invoke");

      if (this.state.player !== undefined && this.state.running) {
        this.state.running = false;
        this.state.player.stop();
        this.state.player.release();
      }
    },
    async playVerse(verses, i) {
      const surahNumber = verses[i].split(":")[0];
      const verseNumber = verses[i].split(":")[1];

      const fileName = surahNumber.padStart(3, "0") + verseNumber.padStart(3, "0") + ".mp3";
      console.log("Creating player for fileName: " + fileName);

      const exists = checkExists(fileName);

      if (!exists) {
        this.doExit();
        return;
      }

      console.log("Check if player is defined or not")
      if (this.state.player === undefined) {
        console.log("Player not defined, initializing");
        this.state.player = media.create(media.id.PLAYER);
        this.state.player.addEventListener(this.state.player.event.PREPARE, function (result) {
          if (result) {
            console.log('=== prepare succeed ===')
            getApp()._options.globalData.surahDuration = this.state.player.getMediaInfo().duration;
            lastDuration = 0;
            lastStarted = time.getTime();
            this.state.player.start()
          } else {
            console.log('=== prepare fail ===' + JSON.stringify(result));
            this.state.player.release()
          }
        })

        const service = this;
        this.state.player.addEventListener(this.state.player.event.COMPLETE, function (result) {
          console.log('=== play end ===');
          lastDuration = lastDuration + (time.getTime() - lastStarted);
          lastStarted = NaN;
          i++;
          if (i < verses.length) {
            service.playVerse(verses, i);
          } else {
            service.doExit();
          }
        })

        this.state.player.setSource(this.state.player.source.FILE, {file: "data://" + fileName})

        // User control
        this.state.player.prepare()

        setInterval(() => {
          let elapsed = lastDuration;
          if (!Number.isNaN(lastStarted)) {
            elapsed += time.getTime() - lastStarted;
          }

          getApp()._options.globalData.playerDuration = elapsed / 1000;
        }, 500)
      } else {
        console.log("Player initialized, change only source");
        this.state.player.stop();
        this.state.player.setSource(this.state.player.source.FILE, {file: "data://" + fileName})
        this.state.player.prepare();
      }
    }
  })
);