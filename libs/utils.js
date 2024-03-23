import {getDeviceInfo} from "@zos/device";
import {push, replace} from "@zos/router";
import * as appService from "@zos/app-service";
import {getSurahInfo, setSurahInfo} from "./localStorage";
import fs from "@zos/fs";

export const {height: DEVICE_HEIGHT, width: DEVICE_WIDTH} = getDeviceInfo();

export const NUM_CHAPTERS = 30;
export const NUM_VERSES = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111,
  43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34,
  30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49,
  62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56,
  40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5,
  8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];

const chapterPageBoundaries = [0, 16, 23, 27, 29, NUM_CHAPTERS];

export function nextChapterEnd(currentEnd) {
  for (let i = 0; i < chapterPageBoundaries.length; i++) {
    if (chapterPageBoundaries[i] === currentEnd) return chapterPageBoundaries[i + 1];
  }
}

export function nextChapterStart(currentStart) {
  for (let i = 0; i < chapterPageBoundaries.length; i++) {
    if (chapterPageBoundaries[i] === currentStart) return chapterPageBoundaries[i - 1];
  }
}

let sleepSetTimeout_ctrl;

export function sleep(ms) {
  clearInterval(sleepSetTimeout_ctrl);
  return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

export function selectPage() {
  const serviceFile = "app-service/player_service";
  if (appService.getAllAppServices().includes(serviceFile)) {
    replace({
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

export function checkExists(fileName) {
  const exists = fs.statSync({
    path: "download/" + fileName,
  });

  console.log(fileName + " " + (exists ? "" : "doesn't ") + "exists.");
  return exists;
}

export function humanizeTime(total) {
  let remaining = Math.floor(total);
  const hours = Math.floor(remaining / 60 / 60);
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