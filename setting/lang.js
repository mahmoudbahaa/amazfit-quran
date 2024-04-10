import { _ as original_ } from '../libs/i18n/baseLang'
import { AR_EG } from './i18n/ar-EG'

let langCode
function getTranslation (lang) {
  if (lang === 'ar-EG') {
    return AR_EG
  } else {
    return undefined
  }
}

export function _ (text) {
  return original_(text, getTranslation, langCode)
}

export function setLang (lang) {
  langCode = lang
}

export const UI_LANGS = [
  {
    name: 'عربي',
    value: 'عربي,ar'
  },
  {
    name: 'English',
    value: 'English,en'
  }
]
