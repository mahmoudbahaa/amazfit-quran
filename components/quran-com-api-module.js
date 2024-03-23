import {log} from "@zos/utils";

const logger = log.getLogger("quran-com-api");
const baseUrl = "https://api.quran.com/api/v4/";
export const quranComApiModule = {
  onRunGetSurahsNames() {
    logger.log("get surahs names");
  },

  get(caller, onSucess, onError, url, resource_name, attrsToDelete = []) {
    caller.httpRequest({
      method: 'get',
      url: url,
    }).then((result) => {
      console.log('result.body', result.body)
      logger.log("Status=" + result.status);

      if (result.status >= 300 && result.status < 200) {
        logger.log("Error" + result.statusText);
        if (onError) {
          onError();
        }
        return;
      }

      console.log(result.body);
      result.body[resource_name].forEach(resource => {
        attrsToDelete.forEach(attr => {
          delete resource[attr];
        })
      });

      logger.log("Got Resource: " + result.body[resource_name].length);
      onSucess(result.body[resource_name]);
    }).catch((error) => {
      console.error('error=>', error)
      if (onError) {
        onError(error);
      }
    })
  },

  getChapters(caller, surahLangIsoCode, onSucess, onError) {
    logger.log("Getting Chapters");

    this.get(caller,
      onSucess,
      onError,
      baseUrl + 'chapters?language=' + surahLangIsoCode,
      "chapters",
      ["id", "bismillah_pre"]);
  },

  getVersesAudioPaths(caller, recitation_id, onSucess, onError) {
    logger.log("Getting Verses Audio Paths");

    let url = baseUrl + 'quran/recitations/' + recitation_id + "?chapter_number=1";
    this.get(caller,
      onSucess,
      onError,
      url,
      "audio_files");
  },
};
