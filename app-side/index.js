import { BaseSideService } from "@zeppos/zml/base-side";

import { fileDownloadModule } from "./file-download-module";
import { fileTransferModule } from "./file-transfer-module";
import { quranComApiModule } from "./quran-com-api-module";
import { quranicAduioComApiModule } from "./quranicaudio-com-api-module";

const logger = Logger.getLogger("message-app-side");

AppSideService(
  BaseSideService({
    ...fileDownloadModule,
    ...fileTransferModule,
    ...quranComApiModule,
    ...quranicAduioComApiModule,
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
      console.log("can you hear me ?");
      const [, action] = req.method.split(".");
      switch (action) {
        case "quranApi": {
          const { api } = req.params;

          res(null, {
            status: "success",
            data: "",
          });

          logger.log("api: " + api);
          logger.log("req.params: " + JSON.stringify(req.params));
          switch (api) {
            case "getSettings": this.getSettings(); break;
            case "getChapters": this.getChapters(); break;
            case "getRecitation": this.getRecitation(req.params.fileName, req.params.relativePath); break;
          }
          
          break;
        }
        default: {
          res(null, {
            status: "error",
            message: "unknown action",
          });
        }
      }
    },
  })
);
