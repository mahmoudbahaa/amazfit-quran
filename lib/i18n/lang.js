import { getLanguage } from '@zos/settings'
import { getLang } from '../config/default'
import { FS } from '../storage/fsWrapper'
import * as LANG from './baseLang'
let DEVICE_LANG_VALUE

export function DEVICE_LANG () {
  if (DEVICE_LANG_VALUE === undefined) DEVICE_LANG_VALUE = getLanguageCode()
  return DEVICE_LANG_VALUE
}

export function isRtlLang (lang = undefined) {
  if (lang === undefined) {
    lang = getLang()
  }

  return LANG.isRtlLang(lang, DEVICE_LANG)
}

const getTranslation = (lang) => {
  return FS.readAsset('i18n/' + lang + '.po')
}
export function _ (text, lang) {
  if (lang === undefined) {
    lang = getLang()
  }

  return LANG._(text, getTranslation, lang, DEVICE_LANG)
}

function getLanguageCode () {
  return LANG.LANGUAGES[getLanguage()]
}
