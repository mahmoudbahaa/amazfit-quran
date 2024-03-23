import hmUI, { deleteWidget, redraw } from "@zos/ui";
import { px } from '@zos/utils'
import { log } from "@zos/utils";
import * as Styles from "./style.r.layout.js";
import { APP_ID, CHAPTERS_PER_PAGE, DEVICE_HEIGHT, DEVICE_WIDTH, NUM_CHAPTERS, nextChapterEnd, nextChapterStart, route } from "../libs/utils.js";
import { BasePage } from "@zeppos/zml/base-page";
import { getChapters, getCurSurahLang, setChapters, setCurSurahLang, setSurahInfo, useSimpleSurahName } from "../libs/localStorage.js";
import { back, exit, push, replace, setLaunchAppTimeout } from "@zos/router";
import { createLoadingWidget, deleteLoadingWidget } from "../components/loading-anim/index.js";
import { apiCall } from "../components/api-caller/index.js";
import { createList } from "../components/list/index.js";
import { _, getLanguageCode } from "../libs/lang.js";
import { chapters } from "./test-data/chapters.js"
import { juzs } from "./test-data/juzs.js"
import { ListScreen } from "../libs/mmk/ListScreen.js";
import { Time } from "@zos/sensor";

const logger = log.getLogger("select.page");
// let chapters = [];
let langCode = "ar";
let rtl = true;
const thisPage = "page/select";
const indexPage = "page/index";

Page({
  state: {
    start,
    end
  },

  onInit(params) {
    logger.log("select page on init invoke");
    if (params) {
      this.state.start = parseInt(params.split(",")[0]);
      this.state.end = parseInt(params.split(",")[1]);
    } else {
      const startParams = getApp()._options.globalData.startParams;
      this.state.start = parseInt(startParams.split(",")[1]);
      this.state.end = parseInt(startParams.split(",")[1]);
    }
  },

  onDestroy() {
    logger.log("select page on destroy invoke");
  },

  onCall({ result }) {
    console.log("result: ", result.status);

    if (result.status !== "success") return;

    switch (result.api) {
      case "getSettings": {
        setSurahInfo("recitation", result.settings.recitation);
        const lastCurLang = getCurSurahLang();
        const surahLang = result.settings.surahLang;
        this.state.langCode = surahLang ? surahLang.isoCode : getLanguageCode().split("-")[0];
        console.log("returned lang: " + isoCode)
        console.log("lastCurLang: " + lastCurLang);
        if (lastCurLang !== isoCode) {
          apiCall("getChapters", this);
        } else {
          // chapters = getChapters();
          this.createWidgets();
        }
        break;
      }
      case "getChapters": {
        console.log("Got Chapters: ")
        // chapters = result.chapters;
        setCurSurahLang(this.state.langCode);
        setChapters(result.chapters);
        this.createWidgets();
        break;
      }
    }
  },

  createWidgets() {
    new ChaptersScreen().start(this.state.start, this.state.end);
  },

  build() {
    this.createWidgets();
  },
});


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
        //TODO:
        logger.log("Juz Called " + juz_number);
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
        // shown = false;
        route(surah_number - 1);
      }
    },

    description: translation,
    iconText: _(surah_number),
    iconAlignH: hmUI.align.RIGHT,
    alignH: hmUI.align.CENTER_H,
  })
}