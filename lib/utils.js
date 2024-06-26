import { push, replace } from 'zeppos-cross-api/router';
import { getVerseMapping } from '../lib/config/juzs';
import { getPlayerInfo } from './config/default';
import { NUM_VERSES } from './constants';
import { Path } from './mmk/Path';

export function openPage(url, params = undefined, replacePage = false) {
  if (replacePage) {
    replace({ url, params });
  } else {
    push({ url, params });
  }
}

export function restorePlayer() {
  const playerInfo = getPlayerInfo();
  if (playerInfo === undefined) {
    return false;
  }

  if (playerInfo.curVerse !== undefined) {
    push({
      url: 'page/player',
      params: `type=${playerInfo.type}&number=${playerInfo.number}&verse=${playerInfo.curVerse}`,
    });

    return true;
  }

  return false;
}

export function getChapterVerses(surahNumber) {
  const verses = [];
  for (let i = 1; i <= NUM_VERSES[surahNumber - 1]; i++) {
    verses.push(`${surahNumber}:${i}`);
  }

  return verses;
}

export function getJuzVerses(juzNumber) {
  const verseMapping = getVerseMapping(juzNumber - 1);
  const verses = [];
  const surahes = [];
  // eslint-disable-next-line guard-for-in
  for (const surah in verseMapping) {
    surahes.push(parseInt(surah, 10));
  }

  // Just in case
  surahes.sort();
  surahes.forEach(surah => {
    const verseSingleMapping = verseMapping[String(surah)];
    const start = parseInt(verseSingleMapping.split('-')[0], 10);
    const end = parseInt(verseSingleMapping.split('-')[1], 10);
    for (let i = start; i <= end; i++) {
      verses.push(`${surah}:${i}`);
    }
  });

  return verses;
}

export function parseQuery(queryString) {
  if (!queryString) {
    return {};
  }

  const query = {};
  const pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[pair[0]] = pair[1] || '';
  }

  return query;
}

export function getFileName(verse) {
  const surahNumber = verse.toString().split(':')[0];
  const verseNumber = verse.toString().split(':')[1];
  return `${surahNumber.padStart(3, '0') + verseNumber.padStart(3, '0')}.mp3`;
}

export function checkVerseExists(verse) {
  const fileName = getFileName(verse);
  return new Path('data', `download/${fileName}`).exists();
}

export function humanizeTime(total) {
  let remaining = Math.floor(total);
  const hours = Math.floor(remaining / 60 / 60);
  remaining -= hours * 60 * 60;
  const minutes = Math.floor(remaining / 60);
  remaining -= minutes * 60;
  const seconds = remaining;

  let time = '';
  if (hours > 0) {
    time += `${(`${hours}`).padStart(2, '0')}:`;
  }

  if (minutes > 0) {
    time += `${(`${minutes}`).padStart(2, '0')}:`;
  }

  time += (`${seconds}`).padStart(2, '0');
  return time;
}
