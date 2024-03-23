import { parseQuery } from "../libs/utils";
import { log } from "@zos/utils";
import media from '@zos/media'
import * as appServiceMgr from "@zos/app-service";
import { Time } from '@zos/sensor'

const VOLUME_INCREMENT = 5;
const moduleName = "Player Service";
let player = undefined;
let lastDuration = 0;
let lastStarted = undefined;
const time = new Time();
const logger = log.getLogger("player.service");

function playSurah(fileName) {
    console.log("Creating player for fileName: " + fileName)

    if (player === undefined) {

        player = media.create(media.id.PLAYER);
        player.addEventListener(player.event.PREPARE, function (result) {
            if (result) {
                console.log('=== prepare succeed ===')
                getApp()._options.globalData.surahDuration = player.getMediaInfo().duration;
                lastDuration = 0;
                lastStarted = time.getTime();
                player.start()
            } else {
                console.log('=== prepare fail ===' + JSON.stringify(result));
                player.release()
            }
        })

        player.addEventListener(player.event.COMPLETE, function (result) {
            console.log('=== play end ===');
            lastDuration = lastDuration + (time.getTime() - lastStarted);
            lastStarted = NaN;
            player.stop();
            player.release();
        })
        

        player.setSource(player.source.FILE, { file: "data://" + fileName })

        // User control
        player.prepare()

        setInterval(() => {
            let elapsed = lastDuration;
            if (!Number.isNaN(lastStarted)) {
                elapsed += time.getTime() - lastStarted;
            }

            getApp()._options.globalData.playerDuration = elapsed / 1000;
          }, 500)
    } else {
        player.stop();
        player.setSource(player.source.FILE, { file: "data://" + fileName })
        player.prepare();
    }
}

AppService({
    state: {
        running: false,
    },

    doAction(e) {
        let result = parseQuery(e);

        if (result.action === "start") {
            running = true;
            playSurah(result.fileName);
        } else if (result.action === "exit") {
            running = false;
            if (player !== undefined) {
                player.stop();
                player.release();
            }
            appServiceMgr.exit();
        } else if (player === undefined) {
            logger.error(`player not defined !!!`);
            return;
        }

        switch (result.action) {
            case "dec-vol": player.setVolume(player.getVolume() - VOLUME_INCREMENT); break;
            case "play": {
                if (player.getStatus() === player.state.PAUSED) {
                    lastStarted = time.getTime();
                    player.resume(); 
                } else {
                    player.prepare(); 
                }
                
                break;
            }
            case "pause": {
                player.pause(); 
                lastDuration = lastDuration + (time.getTime() - lastStarted);
                lastStarted = NaN;
                break;
            }
            case "stop": {
                player.stop(); 
                lastDuration = lastDuration + (time.getTime() - lastStarted);
                lastStarted = NaN;
                break;
            }
            case "inc-vol": player.setVolume(player.getVolume() + VOLUME_INCREMENT); break;;
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

        if (player !== undefined && running) {
            running = false;
            player.stop();
            player.release();
        }
    }
});