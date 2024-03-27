import { mkdirSync, readFileSync, writeFileSync } from '@zos/fs'

function normalizeKey (key) {
  return key.replace(/[^a-zA-Z0-9]/g, '_')
}

function setSmallValue (key, value) {
  return setLargeValue(key, value)
}

function getSmallValue (key, defaultVal) {
  return getLargeValue(key, defaultVal)
}

function setLargeValue (key, value) {
  key = normalizeKey(key)
  mkdirSync({
    path: 'config'
  })

  writeFileSync({
    path: 'config/' + key,
    data: JSON.stringify(value),
    options: {
      encoding: 'utf8'
    }
  })
}

function getLargeValue (key, defaultVal) {
  key = normalizeKey(key)
  const data = readFileSync({
    path: 'config/' + key,
    options: {
      encoding: 'utf8'
    }
  })
  return data === undefined ? defaultVal : JSON.parse(data)
}

export function getChapter (chapter) {
  return getLargeValue('chapter' + chapter)
}

export function setChapters (chapters) {
  chapters.forEach((chapter, i) => {
    setChapter(i, chapter)
  })
}

function setChapter (chapter, value) {
  setLargeValue('chapter' + chapter, value)
}

export function getLang () {
  return getSmallValue('lang')
}

export function setLang (lang) {
  setSmallValue('lang', lang)
}

export function useSimpleSurahName () {
  return getSmallValue('useSimpleSurahName')
}

export function setUseSimpleSurahName (value) {
  setSmallValue('useSimpleSurahName', value)
}

export function getRecitation () {
  return getSmallValue('recitation')
}

export function setRecitation (value) {
  setSmallValue('recitation', value)
}

export function getVerseText (verse) {
  return getLargeValue(`v${verse}`)
}

export function setVerseText (verse, text) {
  setLargeValue(`v${verse}`, text)
}
