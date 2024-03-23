import { settingsLib } from '@zeppos/zml/base-side'

const logger = Logger.getLogger("quran-com-api");

export const quranComApiModule = {
  onRunGetSurahsNames() {
    logger.log("get surahs names");
  },

  async get(res, endPoint, baseUrl = "https://api.quran.com/api/v4/") {
    try {
      const response = await fetch({
        url: baseUrl + endPoint,
        method: 'GET'
      })

      const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
  
      res({
        status: "success",
        data: resBody,
      });
    } catch (error) {
      res({
        status: "error",
        error,
      });
    }
  },

  async post(res, endPoint, requestBody) {
    try {
      const response = await fetch({
        url: baseUrl + endPoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
  
      res({
        status: "success",
        data: resBody,
      });
    } catch (error) {
      res({
        status: "error",
        error,
      });
    }
  },

  getSettings() {
    logger.log("Getting Settings");
    const api = "getSettings";
    let surahLang = settingsLib.getItem("surahLang");
    const recitation = settingsLib.getItem("recitation") || 'Mishari Rashid al-`Afasy,114,mishaari_raashid_al_3afaasee/';
    surahLang = surahLang ? {
      name: surahLang.split(",")[0],
      isoCode: surahLang.split(",")[1],
    } : undefined;

    this.call({
      result: {
        status: "success",
        api,
        settings: {
          surahLang,
          recitation,
        }
      },
    });
  },

  getChapters() {
    logger.log("Getting Chapters");
    const api = "getChapters";
    const lang = settingsLib.getItem("surahLang") || 'English,en';
    const surahLangIsoCode = lang.split(",")[1];
    const module = this;
    this.get(result => {
        logger.log("Status: ", result.status);

        if (result.status === "error") {
          logger.log("Error" + result.error);
          return;
        }

        result.data.chapters.forEach(chapter => {
            delete chapter.id;
            delete chapter.bismillah_pre;
        });

        logger.log("Got Chapters: " + result.data.chapters.length);
        module.call({
          result: {
            status: "success",
            api,
            chapters: result.data.chapters,
          },
        });
    }, 
    'chapters?language=' + surahLangIsoCode);
  },

  getRecitation(fileName) {
    logger.log("fileName: " + fileName);
    const fileNameWithoutExt = fileName.split(".")[0];
    const chapter = parseInt(fileNameWithoutExt.split("-")[0]);
    const reciterId = parseInt(fileNameWithoutExt.split("-")[1]);

    logger.log("Getting Recitation");
    const module = this;
    this.get(result => {
        logger.log("Status: ", result.status);

        if (result.status === "error") {
          logger.log("Error" + result.error);
          return;
        }

        console.log("result=" + JSON.stringify(result));
        const url = result.data.audio_file.audio_url;
        const task = module.downloadFile(url, fileName);
        const orgFileName = url.substr(url.lastIndexOf("/") + 1);
        task.onComplete = () => {
          // const from = "data://download/" + orgFileName;
          const to = "data://download/" + fileName;
          module.transferFile(to, { type: "mp3" , name: fileName });
        };
      }, 
    'chapter_recitations/' + reciterId + '/' + chapter);
  },
};
