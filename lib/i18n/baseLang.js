/* global getApp */
import { parsePO } from './langParser'

const FALLBACK_LANG = 'en-US'

const i18n = {}
const parsedPOS = {}
export function isRtlLang (lang = undefined, deviceLang = undefined) {
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
    lang = getCurLang()
  }

  if (lang === undefined && deviceLang) {
    lang = deviceLang()
  }

  const idx = lang.indexOf('-')
  if (idx > -1) lang = lang.substring(0, idx)
  return rtlLangs.indexOf(lang) > 0
}

export function getCurLang (getLanguageCode = undefined) {
  let lang
  if (getLanguageCode) lang = getLanguageCode()
  if (lang === undefined) lang = FALLBACK_LANG
  return lang
}

export function _ (text, getTranslation, lang = undefined, deviceLang = undefined) {
  if (lang === undefined) {
    lang = getCurLang()
  }

  if (lang === undefined && deviceLang) {
    lang = deviceLang()
  }

  if (!isNaN(text)) {
    return mapNumber(text, lang, deviceLang, getTranslation)
  }

  return getText(text, lang, deviceLang, getTranslation)
}

function getText (key, lang, deviceLang, getTranslation) {
  if (lang.indexOf('-') < 0) lang = lang + '-' + getDefaultLocale(lang)
  if (lang === FALLBACK_LANG) return key
  if (!parsedPOS[lang]) {
    i18n[lang] = parsePO(lang, getTranslation)
    parsedPOS[lang] = true
  }

  if (i18n[lang]) {
    const value = i18n[lang][key]
    return value === undefined ? key : value
  }

  let lng
  if (!deviceLang) {
    lng = FALLBACK_LANG
  } else {
    lng = (lang === deviceLang()) ? FALLBACK_LANG : deviceLang()
  }

  const value = getText(key, lng, deviceLang, getTranslation)
  return value === undefined ? key : value
}

function mapNumber (num, lang, deviceLang, getTranslation) {
  const numText = num.toString()

  let result = ''
  for (let i = 0; i < numText.length; i++) {
    result += getText(numText[i].toString(), lang, deviceLang, getTranslation)
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

function getDefaultLocale (lang) {
  if (locales === undefined) getDefaultLocaleValues()
  return locales[lang]
}
