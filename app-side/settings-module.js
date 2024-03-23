import {settingsLib} from "@zeppos/zml/base-side";

const logger = Logger.getLogger("settings-module");

export const settingsModule = {
  getSettings(req) {
    logger.log("Getting Settings");
    let surahLang = settingsLib.getItem("surahLang");
    const recitation = settingsLib.getItem("recitation") || 'Mishari Rashid al-`Afasy,7'
    surahLang = surahLang ? {
      name: surahLang.split(",")[0],
      isoCode: surahLang.split(",")[1],
    } : undefined;

    this.call({
      success: true,
      req,
      settings: {
        surahLang,
        recitation,
      }
    });
  },
}