import gettext from 'i18n'

// let curLang

// export const langs = [
//   {
//     name: 'Arabic',
//     code: 'ar-EG',
//     value: 'Arabic,ar-EG'
//   },
//   {
//     name: 'English',
//     code: 'en-US',
//     value: 'English,en-US'
//   }
// ]

// export function SetLanguage (lang) {
//   curLang = lang
// }

export function __ (text) {
  return gettext(text)
}
