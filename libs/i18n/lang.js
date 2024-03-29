/* global getApp */
import { getLanguage } from '@zos/settings'
import { parsePO } from './langParser'

let DEVICE_LANG_VALUE

export function DEVICE_LANG () {
  if (DEVICE_LANG_VALUE === undefined) DEVICE_LANG_VALUE = getLanguageCode()
  return DEVICE_LANG_VALUE
}

const FALLBACK_LANG = 'en-US'

const i18n = {}
const parsedPOS = {}
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
    lang = getCurLang()
  }

  if (lang === undefined) {
    lang = DEVICE_LANG()
  }

  const idx = lang.indexOf('-')
  if (idx > -1) lang = lang.substring(0, idx)
  return rtlLangs.indexOf(lang) > 0
}

export function getCurLang () {
  let lang = getApp()._options.globalData.langCode
  if (lang === undefined) lang = getLanguageCode()
  if (lang === undefined) lang = FALLBACK_LANG
  return lang
}
export function _ (text, lang) {
  if (lang === undefined) {
    lang = getCurLang()
  }

  if (lang === undefined) {
    lang = DEVICE_LANG()
  }

  if (!isNaN(text)) {
    return mapNumber(text, lang)
  }

  return getText(text, lang)
}

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

  const value = lang === DEVICE_LANG() ? getText(key, FALLBACK_LANG) : getText(key, DEVICE_LANG())
  return value === undefined ? key : value
}

function mapNumber (num, lang) {
  const numText = num.toString()

  let result = ''
  for (let i = 0; i < numText.length; i++) {
    result += getText(numText[i].toString(), lang)
  }

  return result
}

const languages = ['zh-CN', 'zh-TW', 'en-US', 'es-ES', 'ru-RU', 'ko-KR', 'fr-FR', 'de-DE', 'id-ID', 'pl-PL', 'it-IT', 'ja-JP', 'th-TH', 'ar-EG', 'vi-VN', 'pt-PT', 'nl-NL', 'tr-TR', 'uk-UA', 'iw-IL', 'pt-BR', 'ro-RO', 'cs-CZ', 'el-GR', 'sr-RS', 'ca-ES', 'fi-FI', 'nb-NO', 'da-DK', 'sv-SE', 'hu-HU', 'ms-MY', 'sk-SK', 'hi-IN']

function getLanguageCode () {
  return languages[getLanguage()]
}

let locales

function getDefaultLocaleValues () {
  locales = {}
  languages.forEach((lang) => {
    locales[lang.split('-')[0]] = lang.split('-')[1]
  })
}

function getDefaultLocale (lang) {
  if (locales === undefined) getDefaultLocaleValues()
  return locales[lang]
}
