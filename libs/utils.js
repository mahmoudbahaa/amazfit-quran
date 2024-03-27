/* global */
import { replace } from '@zos/router'
import * as appService from '@zos/app-service'
import { statSync } from '@zos/fs'
import { CHAPTERS_PAGE_BOUNDARIES } from './constants'

export function nextChapterEnd (currentEnd) {
  for (let i = 0; i < CHAPTERS_PAGE_BOUNDARIES.length; i++) {
    if (CHAPTERS_PAGE_BOUNDARIES[i] === currentEnd) return CHAPTERS_PAGE_BOUNDARIES[i + 1]
  }
}

export function nextChapterStart (currentStart) {
  for (let i = 0; i < CHAPTERS_PAGE_BOUNDARIES.length; i++) {
    if (CHAPTERS_PAGE_BOUNDARIES[i] === currentStart) return CHAPTERS_PAGE_BOUNDARIES[i - 1]
  }
}

export function selectPage () {
  const serviceFile = 'app-service/player_service'
  if (appService.getAllAppServices().includes(serviceFile)) {
    replace({
      url: 'page/player'
    })
  }
}

export function parseQuery (queryString) {
  if (!queryString) {
    return {}
  }
  const query = {}
  const pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    query[pair[0]] = pair[1] || ''
  }
  return query
}

export function getFileName (verse) {
  const surahNumber = verse.split(':')[0]
  const verseNumber = verse.split(':')[1]
  return `${surahNumber.padStart(3, '0') + verseNumber.padStart(3, '0')}.mp3`
}

export function checkVerseExists (verse) {
  const fileName = getFileName(verse)
  return statSync({
    path: `download/${fileName}`
  })
}

export function humanizeTime (total) {
  let remaining = Math.floor(total)
  const hours = Math.floor(remaining / 60 / 60)
  remaining -= hours * 60 * 60
  const minutes = Math.floor(remaining / 60)
  remaining -= minutes * 60
  const seconds = remaining

  let time = ''
  if (hours > 0) {
    time += `${(`${hours}`).padStart(2, '0')}:`
  }

  if (minutes > 0) {
    time += `${(`${minutes}`).padStart(2, '0')}:`
  }

  time += (`${seconds}`).padStart(2, '0')
  return time
}
