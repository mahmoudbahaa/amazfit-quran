import { settingsLib } from '@zeppos/zml/base-side'

const logger = Logger.getLogger("quranicaudio-com-api");
export const quranicAduioComApiModule = {
  getRecitation(fileName, relativePath) {
    const prefix = "https://download.quranicaudio.com/quran/";

    logger.log("fileName: " + fileName);
    logger.log("Getting Recitation");
    const url = prefix + relativePath + fileName;
    const task = this.downloadFile(url);
    const that = this;
    task.onSuccess = (data) => {
      console.log("flePath; " + data.filePath);
      that.transferFile(data.filePath, { type: "mp3", name: data.filePath });
    };
  },
};
