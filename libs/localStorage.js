import {EasyFlashStorage} from "@silver-zepp/easy-storage";
import EasyStorage from "@silver-zepp/easy-storage";

const storage = new EasyStorage();
const flash = new EasyFlashStorage();

function setSmallValue(key, value) {
  storage.setKey(key, value);
}

function getSmallValue(key, defaultVal) {
  return storage.getKey(key, defaultVal);
}

function setLargeValue(key, value) {
  flash.setKey(key, value);
}

function getLargeValue(key, defaultVal) {
  const val = flash.getKey(key);
  return val === undefined ? defaultVal : val;
}

export function getChapters() {
  return getLargeValue("chapters");
}

export function setChapters(chapters) {
  setLargeValue("chapters", chapters);
}

export function getCurSurahLang() {
  return getSmallValue("curSurahLang");
}

export function setCurSurahLang(lang) {
  setSmallValue("curSurahLang", lang);
}

export function useSimpleSurahName() {
  return getSmallValue("useSimpleSurahName");
}

export function setUseSimpleSurahName(value) {
  setSmallValue("useSimpleSurahName", value);
}

export function getSurahInfo() {
  return {
    number: getSmallValue("surah_number"),
    relativePath: getSmallValue("surah_relativePath"),
    recitation: getSmallValue("surah_recitation"),
  };
}

export function setSurahInfo(param, value) {
  setSmallValue("surah_" + param, value);
}