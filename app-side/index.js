import {BaseSideService} from "@zeppos/zml/base-side";

import {settingsModule} from "./settings-module";

const logger = Logger.getLogger("message-app-side");

AppSideService(
  BaseSideService({
    ...settingsModule,
    onInit() {
      logger.log("app side service invoke onInit");
    },
    onRun() {
      logger.log("app side service invoke onRun");
    },
    onDestroy() {
      logger.log("app side service invoke onDestroy");
    },

    async onRequest(req, res) {
      switch (req.method) {
        case "getSettings":
          res(null, {
            status: "success",
            data: "",
          });
          this.getSettings(req);
          break;
        case "getVerseRecitation":
          res(null, {
            status: "success",
            data: "",
          });
          this.getVerseRecitation(req);
          break;
        default: {
          res(null, {
            status: "error",
            message: "unknown action",
          });
        }
      }
    },

    getVerseRecitation(req) {
      logger.log("Getting Recitation");
      const url = "https://verses.quran.com/" + req.params.relativePath;
      const task = this.download(url, {
        headers: {},
        timeout: 600000,
      });

      const fileName = url.substr(url.lastIndexOf("/") + 1);
      const that = this;
      task.onComplete = () => that.transferFile(req, fileName);
    },

    transferFile(req, fileName) {
      const to = "data://download/" + fileName;
      const task = this.sendFile(to, {type: "mp3", name: to});
      const module = this;
      task.on("change", (e) => {
        if (e.data.readyState !== 'transferred') return;

        module.call({
          success: true,
          req
        });
      });
    }
  })
)