import { EasyFlashStorage } from './easy-storage'
import { NUM_CHAPTERS } from '../constants'
import { getEnChapter } from '../../page/data/chapters'
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

export function setEnChapters () {
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    setChapter(i, getEnChapter(i))
  }
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

export function getPlayerInfo () {
  return getValue('playerInfo')
}

export function setPlayerInfo (playerInfo) {
  setValue('playerInfo', playerInfo)
}

export function getChaptersListRows () {
  return getValue('chaptersListRows')
}

export function setChaptersListRows (rows) {
  setValue('chaptersListRows', rows)
}

export function getAutoStart () {
  return getValue('autoStart')
}

export function setAutoStart (autoStart) {
  setValue('autoStart', autoStart)
}

export function getDontShowWarning () {
  return getValue('dontShowWarning')
}

export function setDontShowWarning (dontShowWarning) {
  setValue('dontShowWarning', dontShowWarning)
}
