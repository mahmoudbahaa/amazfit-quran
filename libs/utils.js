import { getDeviceInfo } from "@zos/device";
import fs from '@zos/fs'
import { push, replace } from "@zos/router";
import * as appService from "@zos/app-service";
import { getSurahInfo, setSurahInfo } from "./localStorage";

export const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = getDeviceInfo();
export const CHAPTERS_PER_PAGE = 10;
export const NUM_CHAPTERS = 30;

export function selectPage() {
  const serviceFile = "app-service/player_service";
  if (appService.getAllAppServices().includes(serviceFile)) {
    replace( {
      url: 'page/player'
    });
  } else if (getApp()._options.globalData.isDownloadTransfer) {
    replace({
      url: 'page/download'
    });
  }
}

export function parseQuery(queryString) {
    if (!queryString) {
        return {};
    }
    const query = {};
    const pairs = (
        queryString[0] === "?" ? queryString.substr(1) : queryString
        ).split("&");
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split("=");
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
}

export function route(index) {  
    if (getApp()._options.globalData.isDownloadTransfer) {
      console.log("already downloading");
      return;
    }

    if (index < 0) {
      index += 114;
    } else if (index >= 114) {
      index -=114;
    }
  
    const surah_number = index + 1;
    console.log("Surah number: " + surah_number);
    const surah_file_name = ((surah_number + "").padStart(3, '0')) + ".mp3";
    console.log("Surah File Name: " + surah_file_name);
    const alreadyExists = fs.statSync({
      path: "download/" + surah_file_name,
    })
  
    setSurahInfo("number", surah_number);
    setSurahInfo("fileName", surah_file_name);
    console.log("Surah: " + surah_file_name + " " + (alreadyExists ? "exists" : "doesn't exist yet"));
    if (alreadyExists) {
      push({
        url: 'page/player',
      });
    } else {
      push({
        url: 'page/confirm',
      });
    }
  }

  export function humanizeTime(total) {
    let remaining = Math.floor(total);
    const hours = Math.floor(remaining / 60 / 60) ;
    remaining = remaining - hours * 60 * 60;
    const minutes = Math.floor(remaining / 60);
    remaining = remaining - minutes * 60;
    const seconds = remaining;

    let time = "";
    if (hours > 0) {
        time += (hours + "").padStart(2, "0") + ":";
    }

    if (minutes > 0) {
        time += (minutes + "").padStart(2, "0") + ":";
    }

    time += (seconds + "").padStart(2, "0");
    return time;
  }