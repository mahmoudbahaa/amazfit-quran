import { getLanguage } from 'zeppos-cross-api/settings'
import { getLang } from '../config/default'
import { parsePO } from './langParser'

const FALLBACK_LANG = 'en-US'

const i18n = {}
const parsedPOS = {}
/**
 * @param {string} lang
 */
export function isRtlLang (lang = undefined) {
  const rtlLangs = [
    'ae', /* Avestan */
    'ar', /* 'العربية', Arabic */
    'arc', /* Aramaic */
    'bcc', /* 'بلوچی مکرانی', Southern Balochi */
    'bqi', /* 'بختياري', Bakthiari */
    'ckb', /* 'Soranî / کوردی', Sorani */
    'dv', /* Dhivehi */
    'fa', /* 'فارسی', Persian */
    'glk', /* 'گیلکی', Gilaki */
    'he', /* 'עברית', Hebrew */
    'ku', /* 'Kurdî / كوردی', Kurdish */
    'mzn', /* 'مازِرونی', Mazanderani */
    'nqo', /* N'Ko */
    'pnb', /* 'پنجابی', Western Punjabi */
    'prs', /* 'دری', Darī */
    'ps', /* 'پښتو', Pashto, */
    'sd', /* 'سنڌي', Sindhi */
    'ug', /* 'Uyghurche / ئۇيغۇرچە', Uyghur */
    'ur', /* 'اردو', Urdu */
    'yi' /* 'ייִדיש', Yiddish */
  ]

  if (lang === undefined) {
    lang = getLang()
  }

  if (lang === undefined) {
    lang = getCurLang()
  }

  if (lang === undefined) {
    lang = DEVICE_LANG()
  }

  const idx = lang.indexOf('-')
  if (idx > -1) lang = lang.substring(0, idx)
  return rtlLangs.indexOf(lang) > 0
}

let DEVICE_LANG_VALUE
export function DEVICE_LANG () {
  if (DEVICE_LANG_VALUE === undefined) DEVICE_LANG_VALUE = getLanguageCode()
  return DEVICE_LANG_VALUE
}

export function getCurLang (getLanguageCode = undefined) {
  let lang
  if (getLanguageCode) lang = getLanguageCode()
  if (lang === undefined) lang = FALLBACK_LANG
  return lang
}

/**
 * @param {string | number} text
 * @param {string} lang
 */
export function _ (text, lang = undefined) {
  text = text.toString()
  if (lang === undefined) {
    lang = getLang()
  }

  if (lang === undefined) {
    lang = getCurLang()
  }

  if (lang === undefined) {
    lang = DEVICE_LANG()
  }

  // @ts-ignore
  if (!isNaN(text)) {
    return mapNumber(text, lang)
  }

  return getText(text, lang)
}

/**
 * @param {string} key
 * @param {string} lang
 */
function getText (key, lang) {
  if (lang.indexOf('-') < 0) lang = lang + '-' + getDefaultLocale(lang)
  if (lang === FALLBACK_LANG) return key
  if (!parsedPOS[lang]) {
    i18n[lang] = parsePO(lang)
    parsedPOS[lang] = true
  }

  if (i18n[lang]) {
    const value = i18n[lang][key]
    return value === undefined ? key : value
  }

  lang = (lang === DEVICE_LANG()) ? FALLBACK_LANG : DEVICE_LANG()

  const value = getText(key, lang)
  return value === undefined ? key : value
}

/**
 * @param {string} num
 * @param {string} lang
 */
function mapNumber (num, lang) {
  const numText = num.toString()

  let result = ''
  for (let i = 0; i < numText.length; i++) {
    result += getText(numText[i], lang)
  }

  return result
}

export const LANGUAGES = ['zh-CN', 'zh-TW', 'en-US', 'es-ES', 'ru-RU', 'ko-KR', 'fr-FR', 'de-DE', 'id-ID', 'pl-PL', 'it-IT', 'ja-JP', 'th-TH', 'ar-EG', 'vi-VN', 'pt-PT', 'nl-NL', 'tr-TR', 'uk-UA', 'iw-IL', 'pt-BR', 'ro-RO', 'cs-CZ', 'el-GR', 'sr-RS', 'ca-ES', 'fi-FI', 'nb-NO', 'da-DK', 'sv-SE', 'hu-HU', 'ms-MY', 'sk-SK', 'hi-IN']

let locales

function getDefaultLocaleValues () {
  locales = {}
  LANGUAGES.forEach((lang) => {
    locales[lang.split('-')[0]] = lang.split('-')[1]
  })
}

/**
 * @param {string} lang
 */
function getDefaultLocale (lang) {
  if (locales === undefined) getDefaultLocaleValues()
  return locales[lang]
}

function getLanguageCode () {
  return LANGUAGES[getLanguage()]
}
