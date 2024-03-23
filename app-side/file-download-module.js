const logger = Logger.getLogger("network-download");

export const fileDownloadModule = {
  async onRunFileDownload() {
    logger.log("download run");
  },
  downloadFile(url) {
    const task = this.download(url, {
      headers: {},
      timeout: 600000,
    });

    if (!task) {
      this.call({
        message: "download fail",
      });
      return;
    }

    task.onSuccess = (data) => {
      logger.log("download success", data, this.call);
    };

    task.onFail = (data) => {
      logger.log("download fail", data);
    };

    task.onComplete = () => {
      logger.log("download complete");
    };

    let last_progress = -1;
    task.onProgress = (data) => {
      if (last_progress !== data.progress) {
        this.call({
          result: {
            progress: data.progress,
            action: "Download",
          },
        });

        last_progress = data.progress;
      }
    };

    return task;
  },
};
