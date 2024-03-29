import { EasyFlashStorage } from './easy-storage'
let _flash
function flash () {
  if (!_flash) _flash = new EasyFlashStorage()

  return _flash
}
function setValue (key, value) {
  flash().setKey(key, value)
}

function getValue (key) {
  return flash().getKey(key)
}

function hasKey (key) {
  return flash().hasKey(key)
}

export function getChapter (chapter) {
  return getValue('chapter' + chapter)
}

export function setChapters (chapters) {
  chapters.forEach((chapter, i) => {
    setChapter(i, chapter)
  })
}

function setChapter (chapter, value) {
  setValue('chapter' + chapter, value)
}

export function getLang () {
  return getValue('lang')
}

export function setLang (lang) {
  setValue('lang', lang)
}

export function useSimpleSurahName () {
  return getValue('useSimpleSurahName')
}

export function setUseSimpleSurahName (value) {
  setValue('useSimpleSurahName', value)
}

export function getRecitation () {
  return getValue('recitation')
}

export function setRecitation (value) {
  setValue('recitation', value)
}

export function getVerseText (verse) {
  return getValue(`v${verse}`)
}

export function hasVerseText (verse) {
  return hasKey(`v${verse}`)
}

export function setVerseText (verse, text) {
  setValue(`v${verse}`, text)
}

export function getVerseInfo (verse) {
  return getValue(`vi${verse}`)
}

export function setVerseInfo (verse, mapping) {
  setValue(`vi${verse}`, mapping)
}
