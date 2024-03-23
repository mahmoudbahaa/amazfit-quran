import * as i18n from '@zos/i18n'

let curLang = undefined;

export const langs = [
  {
    name: "Arabic",
    code: "ar-EG",
    value: "Arabic,ar-EG"
  },
  {
    name: "English",
    code: "en-US",
    value: "English,en-US"
  }
]

export function SetLanguage(lang) {
  curLang = lang;
}

export function __(text) {
  console.log("i18n", i18n);
  return text;
}