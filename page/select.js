import hmUI from "@zos/ui";
import {log} from "@zos/utils";
import {NUM_CHAPTERS, nextChapterEnd, nextChapterStart, NUM_VERSES, checkExists} from "../libs/utils.js";
import {
  getChapters,
  getCurSurahLang,
  getSurahInfo,
  setChapters,
  setCurSurahLang,
  setSurahInfo,
  useSimpleSurahName
} from "../libs/localStorage.js";
import {createLoadingWidget, deleteLoadingWidget} from "../components/loading-anim/index.js";
import {apiCall} from "../components/api-caller/index.js";
import {_, getLanguageCode} from "../libs/lang.js";
//import {chapters} from "./test-data/chapters.js"
import {juzs} from "./test-data/juzs.js"
import {ListScreen} from "../libs/mmk/ListScreen.js";
import {BasePage} from "@zeppos/zml/base-page";
import {quranComApiModule} from "../components/quran-com-api-module.js"
import {setWakeUpRelaunch} from "@zos/display";
import {push} from "@zos/router";

const logger = log.getLogger("select.page");
// let chapters = [];
let langCode = "ar";
let rtl = true;
let verseIdx = -1;
let chapters;
let page;
const thisPage = "page/select";
const playerPage = "page/player"

Page(
  BasePage({
    onInit(params) {
      page = this;
      setWakeUpRelaunch({
        relaunch: true,
      });
    },

    onDestroy() {
      logger.log("select page on destroy invoke");
    },

    onSettings() {
      const settings = getApp()._options.globalData.settings;
      console.log("recitation=" + settings.recitation);
      setSurahInfo("recitation", settings.recitation);
      const lastCurLang = getCurSurahLang();
      const surahLang = settings.surahLang;
      langCode = surahLang ? surahLang.isoCode : getLanguageCode().split("-")[0];
      console.log("returned lang: " + langCode)
      console.log("lastCurLang: " + lastCurLang);
      const caller = this;
      if (lastCurLang !== langCode) {
        quranComApiModule.getChapters(this, langCode, (theChapters) => {
          console.log("Got Chapters: ")
          chapters = theChapters;
          setCurSurahLang(langCode);
          setChapters(chapters);
          caller.createWidgets();
        });
      } else {
        chapters = getChapters();
        this.createWidgets();
      }
    },

    onCall(result) {
      const req = result.req;
      console.log("result received for req:", JSON.stringify(req));
      console.log("success:", result.success);

      if (!result.success || req.params.page !== thisPage) return;

      console.log("method=" + req.method);
      switch (req.method) {
        case "getSettings": {
          getApp()._options.globalData.settings = result.settings;
          this.onSettings();
          break;
        }

        case "getVerseRecitation": {
          console.log("Got file:" + req.params.relativePath);
          downloadVerse();
          break;
        }
      }
    },

    createWidgets() {
      console.log("Creating Widgets");
      new ChaptersScreen().start(0, nextChapterEnd(0));
      deleteLoadingWidget();
    },

    build() {
      createLoadingWidget(hmUI);

      console.log("Sending getSettings to Side Service");
      if (getApp()._options.globalData.settings) {
        this.onSettings();
      } else {
        apiCall("getSettings", this, thisPage);
      }
    },
  })
);


let lastSurahNumber = -1;

class ChaptersScreen extends ListScreen {
  start(start, end) {
    render(this, start, end);
  }
}

function render(screen, start, end) {
  if (start > 0) {
    addNextPreviousButton(screen, "Previous", nextChapterStart(start), start);
  }

  const ar = langCode === "ar";
  const useSimpleNames = useSimpleSurahName() === "true";
  const nameKey = ar ? "name_arabic" : useSimpleNames ? "name_simple" : "name_complex";

  juzs.slice(start, end).forEach((juz) => {
    addJuzRow(screen, juz.juz_number);

    const verse_mapping = juz.verse_mapping;
    for (const surah_number in verse_mapping) {
      if (lastSurahNumber === surah_number) continue;

      const index = surah_number - 1;
      const name = chapters[index][nameKey];
      const translation = ar ? chapters[index].name_arabic : chapters[index].translated_name.name;
      addChapterRow(screen, surah_number, name, translation);
      lastSurahNumber = surah_number;
    }
  });

  if (end < NUM_CHAPTERS) {
    addNextPreviousButton(screen, "Next", end, nextChapterEnd(end));
  }
}

function addNextPreviousButton(listScreen, label, newStart, newEnd) {
  listScreen.row({
    text: _(label),
    rtl,
    card: {
      color: 0x123456,
      radius: 0,
      callback: () => {
        listScreen.clear();
        render(listScreen, newStart, newEnd);
      },
    },
    alignH: hmUI.align.CENTER_H,
  });
}

function addJuzRow(listScreen, juz_number) {
  listScreen.row({
    text: _("Juz'") + " " + _(juz_number + ""),
    textHeight: 10,
    card: {
      color: 0x333333,
      radius: 0,
      callback: () => {
//                verses = getJuzVerses(juz_number);
//                downloadVerses();
//                route(verses);
      }
    },
    alignH: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT,
  })
}

function addChapterRow(listScreen, surah_number, name, translation) {
  listScreen.row({
    text: _("Surah") + " " + name,
    textHeight: 10,
    rtl,
    card: {
      color: 0x222222,
      radius: 0,
      callback: () => {
        getApp()._options.globalData.verses = getChapterVerses(surah_number);
        downloadVerses();
        console.log("verses=" + getApp()._options.globalData.verses);

      }
    },

    description: translation,
    iconText: _(surah_number),
    iconAlignH: hmUI.align.RIGHT,
    alignH: hmUI.align.CENTER_H,
  })
}

function getJuzVerses(juz_number) {
  const verseMapping = juzs[juz_number - 1].verse_mapping;
  const verses = [];
  const surahs = [];
  for (const surah in verseMapping) {
    surahs.push(parseInt(surah));
  }

  surahs.sort();
  surahs.forEach((surah) => {
    const verseSingleMapping = verseMapping[surah + ""];
    const start = verseSingleMapping.split("-")[0];
    const end = verseSingleMapping.split("-")[1];
    for (let i = start; i <= end; i++) {
      verses.push(surah + ":" + i);
    }
  });

  return verses;
}

function getChapterVerses(surah_number) {
  const verses = [];
  for (let i = 1; i <= NUM_VERSES[surah_number - 1]; i++) {
    verses.push(surah_number + ":" + i);
  }

  return verses;
}

function downloadVerse() {
  verseIdx++;
  if (verseIdx === 3) {
    push({
      url: playerPage,
    });
  }
  const surah_number = getApp()._options.globalData.verses[verseIdx].split(":")[0];
  const verse_number = getApp()._options.globalData.verses[verseIdx].split(":")[1];
  const fileName = surah_number.padStart(3, "0") + verse_number.padStart(3, "0") + ".mp3"
  if (checkExists(fileName)) {
    downloadVerse();
    return;
  }
  const relativePath = getSurahInfo().relativePath + fileName;
  console.log("relativePath=" + relativePath);
  apiCall("getVerseRecitation", page, thisPage, {relativePath});
}

function downloadVerses() {
  const relativePath = getSurahInfo().relativePath;
  console.log("relativePath=" + relativePath);
  if (relativePath) {
    downloadVerse();
  } else {
    quranComApiModule.getVersesAudioPaths(page,
      getSurahInfo().recitation.split(",")[1],
      audio_files => {
        const relativePath = audio_files[0].url.substring(0, audio_files[0].url.lastIndexOf("/") + 1);
        setSurahInfo("relativePath", relativePath)
        console.log("relativePath=" + relativePath);
        downloadVerse();
      });
  }
}