import { NUM_CHAPTERS } from '../constants'
import { BASE_FONT_SIZE } from '../mmk/UiParams'
import { ConfigStorage } from '../storage/ConfigStorage'

const storage = new ConfigStorage()

/**
 * @param {string} key
 * @param {any} value
 */
export function setValue (key, value) {
  storage.set(key, value)
}

/**
 * @param {string} key
 */
export function getValue (key) {
  return storage.get(key)
}

/**
 * @param {string} key
 */
export function removeKey (key) {
  return storage.removeKey(key)
}

/**
 * @param {string} key
 */
export function hasKey (key) {
  return storage.hasKey(key)
}

export function clearConfig () {
  return storage.wipe()
}

export function clearData () {
  return storage.wipeData()
}

// ======================== Functions ================================= //

export function v (verse) {
  return verse.replace(':', '_')
}

export function getChapter (chapter) {
  return getValue('chapter' + chapter)
}

export function setChapters (chapters) {
  chapters.forEach((chapter, i) => {
    setChapter(i, chapter)
  })
}

export function setChapter (chapter, value) {
  setValue('chapter' + chapter, value)
}

export function getLang () {
  return getValue('lang')
}

export function setLang (lang) {
  setValue('lang', lang)
}

export function getChaptersLang () {
  return getValue('chaptersLang') || getLang()
}

export function setChaptersLang (lang) {
  setValue('chaptersLang', lang)
}

export function getSavedChaptersLang () {
  return getValue('savedChaptersLang')
}

export function setSavedChaptersLang (lang) {
  setValue('savedChaptersLang', lang)
}

export function getFontSize () {
  return getValue('fontSize') || BASE_FONT_SIZE
}

export function setFontSize (fontSize) {
  setValue('fontSize', fontSize)
}

export function getLastPath () {
  return getValue('lastPath')
}

export function setLastPath (value) {
  setValue('lastPath', value)
}

export function getClipboard () {
  return getValue('clipboard')
}

export function setClipboard (value) {
  setValue('clipboard', value)
}

export function getPasteMode () {
  return getValue('pastMode')
}

export function setImageViewTempFile (value) {
  setValue('clipboard', value)
}

export function getImageViewTempFile () {
  return getValue('imageViewTempFile')
}

export function setPasteMode (value) {
  setValue('imageViewTempFile', value)
}

export function useSimpleSurahName () {
  return getValue('useSimpleSurahName')
}

export function setUseSimpleSurahName (value) {
  setValue('useSimpleSurahName', value)
}

export function getRecitation () {
  return getValue('recitation') || 'Mishari Rashid al-`Afasy,7'
}

export function setRecitation (value) {
  setValue('recitation', value)
}

export function hasVerseInfo (verse) {
  return hasKey(`vi${v(verse)}`)
}

export function getVerseInfo (verse) {
  return getValue(`vi${v(verse)}`)
}

export function getPlayerInfo () {
  return getValue('playerInfo')
}

export function setPlayerInfo (playerInfo) {
  setValue('playerInfo', playerInfo)
}

export function getChaptersListRow (i) {
  return getValue('chaptersListRow_' + i)
}

export function removeChaptersListRows () {
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    removeKey('chaptersListRow_' + i)
  }
}

export function setChaptersListRow (i, row) {
  setValue('chaptersListRow_' + i, row)
}

export function getStorageInfoLine () {
  return getValue('storageInfoLine')
}

export function setStorageInfoLine (value) {
  setValue('storageInfoLine', value)
}

export function getDontShowWarning () {
  return getValue('dontShowWarning')
}

export function setDontShowWarning (dontShowWarning) {
  setValue('dontShowWarning', dontShowWarning)
}
