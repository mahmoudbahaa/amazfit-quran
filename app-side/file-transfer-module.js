const logger = Logger.getLogger("file-transfer");

export const fileTransferModule = {
  onRunFileTransfer() {
    logger.log("fileTransfer run");
  },
  transferFile(url, opt) {
    const task = this.sendFile(url, opt);

    let last_progress = -1;
    task.on("progress", (e) => {
      if (last_progress !== e.data.progress) {
        this.call({
          result: {
            progress: e.data.progress,
            action: "Copy",
          },
        });

        last_progress = e.data.progress;
      }
    });

    task.on("change", (e) => {
      logger.log("task change", e);

      if (e.data.readyState === 'transferred') {
        logger.log("file transferred", e);

        // setSurahDownloaded(getSurahInfo().number);
      }
    });

    return task;
  },
};
