import hmUI, { deleteWidget, redraw } from "@zos/ui";
import { px } from '@zos/utils'
import { log } from "@zos/utils";
import * as Styles from "./style.r.layout.js";
import { CHAPTERS_PER_PAGE, DEVICE_HEIGHT, DEVICE_WIDTH, NUM_CHAPTERS, route } from "../libs/utils.js";
import { BasePage } from "@zeppos/zml/base-page";
import { getChapters, getCurSurahLang, setChapters, setCurSurahLang, setSurahInfo, useSimpleSurahName } from "../libs/localStorage.js";
import { replace } from "@zos/router";
import { createLoadingWidget, deleteLoadingWidget } from "../components/loading-anim/index.js";
import { apiCall } from "../components/api-caller/index.js";
import { createList } from "../components/list/index.js";
import { _, getLanguageCode } from "../libs/lang.js";
import { chapters } from "./test-data/chapters.js"
import { juzs } from "./test-data/juzs.js"
import { ListScreen } from "../libs/mmk/ListScreen.js";

const logger = log.getLogger("select.page");
// let chapters = [];
let langCode = "ar";
let rtl = true;
const numChapters = 30;
const thisPage = "page/select";

Page({
  state: {
    start,
    end,
  },
  onCreate() {
    logger.log("select page on create invoke");
  },
  onInit(params) {
    logger.log("select page on init invoke");
    console.log(params);
    const paramParts = params.split(",");
    this.state.start = parseInt(paramParts[0]);
    this.state.end = parseInt(paramParts[1]);
  },
  onShow() {
    logger.log("select page on show invoke");
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
    if (this.state.start !== 0) {
      console.log("Creating Previous Button");
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...Styles.MAIN_TITLE_STYLE,
        x: DEVICE_WIDTH / 4,
        w: DEVICE_WIDTH / 4,
        text: _("<-"),
        click_func: () => {
          replace({
            url: thisPage,
            params: (this.state.start - CHAPTERS_PER_PAGE) + "," + (this.state.end - CHAPTERS_PER_PAGE)
          })
        }
      });
    }

    if (this.state.end < NUM_CHAPTERS) {
      console.log("Creating Next Button");
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...Styles.MAIN_TITLE_STYLE,
        x: DEVICE_WIDTH / 2,
        w: DEVICE_WIDTH / 4,
        text: _("->"),
        click_func: () => {
          replace({
            url: thisPage,
            params: (this.state.start + CHAPTERS_PER_PAGE) + "," + (this.state.end + CHAPTERS_PER_PAGE)
          })
        }
      });
    }

    new ChaptersScreen(this.state.start, this.state.end).start();
  },

  build() {
    this.createWidgets();
  },

  onHide() {
    logger.log("select page on hide invoke");
  },
  onDestroy() {
    logger.log("select page on destroy invoke");
  }
});


let lastSurahNumber = -1;
class ChaptersScreen extends ListScreen {
  constructor(start, end) {
    super();
    this._start = start;
    this._end = end;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  start() {
    render(this);
  }
}

function render(screen) {
  const ar = langCode === "ar";
  const useSimpleNames = useSimpleSurahName() === "true";
  const nameKey = ar ? "name_arabic" : useSimpleNames ? "name_simple" : "name_complex";

  juzs.slice(screen.start, screen.end).forEach((juz, index) => {
    index += renderStart;
    getJuzRow(screen, juz.juz_number);

    const verse_mapping = juz.verse_mapping;
    for (const surah_number in verse_mapping) {
      if (lastSurahNumber === surah_number) continue;

      const index = surah_number - 1;
      const name = chapters[index][nameKey];
      const translation = ar ? chapters[index].name_arabic : chapters[index].translated_name.name;
      getChapterRow(screen, surah_number, name, translation);
      lastSurahNumber = surah_number;
    }
  });

  screen.offset();
}

function getJuzRow(listScreen, juz_number) {
  const textRow = listScreen.row({
    text: _("Juz'") + " " + _(juz_number + ""),
    card: {
      color: 0x333333,
      radius: 0,
    },
    alignH: rtl ? hmUI.align.RIGHT : hmUI.align.LEFT,
    callback: () => {
      textRow.setText("Sus Sus Sus Sus Sus Sus Sus Sus Sus Sus Sus Sus Sus ")
    }
  })
}

function getChapterRow(listScreen, surah_number, name, translation) {
  const textRow = listScreen.row({
    text: _("Surah") + " " + name,
    rtl,
    card: {
      color: 0x222222,
      radius: 0,
    },

    description: translation,
    iconText: _(surah_number),
    iconWidth: 1,
    iconAlignH: hmUI.align.RIGHT,
    alignH: hmUI.align.CENTER_H,
    callback: () => {
      // shown = false;
      route(surah_number - 1);
    }
  })
}