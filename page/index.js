import hmUI from "@zos/ui";
import { px } from '@zos/utils'
import { log } from "@zos/utils";
import { NUM_CHAPTERS, nextChapterEnd, selectPage } from "../libs/utils.js";
import { push, replace } from "@zos/router";
import { createList } from "../components/list/index.js";
import * as Styles from "./style.r.layout";
import { getLanguage } from "@zos/settings";
import { _ } from "../libs/lang.js";

const logger = log.getLogger("index.page");

Page({
  state: {
    displayTypeIndex: 0,
  },

  onCreate(e) {
    logger.log("index page on create invoke");
  },
  onInit(params) {
    console.log("lang" + getLanguage());
    logger.log("index page on init invoke");

    if (params) {
      const start = parseInt(params.split(",")[0]);
      const end = parseInt(params.split(",")[1]);

      push({
        url: "page/select",
        params: start + "," + end,
      });
    } else {
      push({
        url: "page/select",
        params: "0," + nextChapterEnd(0),
      });
      selectPage();
    }
  },
  onShow() {
    logger.log("index page on show invoke");
  },

  build() {
    // const title = hmUI.createWidget(hmUI.widget.TEXT, {
    //   ...Styles.MAIN_TITLE_STYLE,
    //   text: _("Choose By")
    // });

    // const choices = [ _("Surah"), _("Juz'")];
    // createList(choices, null, choice_no => {
    //   if (choice_no === 0) {
    //     replace({
    //       url: "page/select"
    //     });
    //   }
    // });
  },
  onHide() {
    logger.log("index page on hide invoke");
  },
  onDestroy() {
    logger.log("index page on destroy invoke");
  }
});