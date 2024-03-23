import { LocalStorage } from '@zos/storage';

lazy = function (creator) {
    let res;
    let processed = false;
    return function () {
      if (processed) return res;
      res = creator.apply(this, arguments);
      processed = true;
      return res;
    };
  };
  
  const localStorage = lazy(() => new LocalStorage());

  function setValue(key, value) {
    // const valueStr = typeof value === 'string' ? val : JSON.stringify(value)
    // localStorage().setItem(key, valueStr);

    localStorage().setItem(key, value);
  }

  function getValue(key, defaultVal) {
    // const value = localStorage().getItem(key);
    // if (value === undefined || value === 'undefined') return undefined;
    // return typeof value === 'string' ? JSON.parse(value) : value;

    return localStorage().getItem(key, defaultVal);
  }

  export function getChapters() {
    return getValue("chapters");
  }
  
  export function setChapters(chapters) {
    setValue("chapters", chapters);
  }

  export function getRecitations() {
    return getValue("recitations");
  }
  
  export function setRecitations(recitations) {
    setValue("recitations", recitations);
  }

  export function getCurSurahLang() {
    return getValue("curSurahLang");
  }
  
  export function setCurSurahLang(lang) {
    setValue("curSurahLang", lang);
  }

  export function getCurRecLang() {
    return getValue("curRecLang");
  }
  
  export function setCurRecLang(lang) {
    setValue("curRecLang", lang);
  }

  export function useSimpleSurahName() {
    return getValue("useSimpleSurahName");
  }
  
  export function setUseSimpleSurahName(value) {
    setValue("useSimpleSurahName", value);
  }

  export function getSurahInfo() {
    return {
      number: getValue("surah_number"),
      fileName: getValue("surah_fileName"),
      recitation: getValue("surah_recitation"),
    };
  }
  
  export function isSurahDownloaded(index) {
    return getValue("surah_downloaded_" + index, false);
  }
  
  export function setSurahInfo(param, value) {
    setValue("surah_" + param, value);
  }