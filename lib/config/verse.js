import { NUM_CHAPTERS, NUM_VERSES, NUM_VERSES_PER_FILE } from '../constants';
import { Path } from '../mmk/Path';
import { setValue, v } from './default';

function readVerseFile(verse) {
  const path = new Path('data', `verses/${v(verse)}`);
  if (path.exists()) {
    return path.fetchText().split('\n');
  }

  const folder = new Path('data', 'verses');
  if (!folder.exists()) {
    folder.mkdir();
  }

  const fileId = Math.floor(getVerseIndex(verse) / NUM_VERSES_PER_FILE);
  let i = fileId * NUM_VERSES_PER_FILE;
  const asset = new Path('assets', `verses/verses_${fileId}`);
  asset.fetchText().split('\n\n\n').forEach(file => {
    const path2 = new Path('data', `verses/${v(getVerseAtIndex(i++))}`);
    path2.overrideWithText(file + ' ۝');
  });

  return path.fetchText().split('\n');
}

export function getVerseText(verse) {
  const lines = readVerseFile(verse);
  if (lines.length !== 1) {
    lines.shift();
  }

  return lines;
}

export function setVerseInfo(verse, mapping) {
  const lines = readVerseFile(verse);
  if (lines.length === 1) {
    setValue(`vi${v(verse)}`, []);
  } else {
    const saved = [];
    lines[0].split(',').forEach(part => {
      saved.push(mapping[parseInt(part, 10) - 1]);
    });

    setValue(`vi${v(verse)}`, saved);
  }
}

function getVerseIndex(verseId) {
  const chapter = parseInt(verseId.split(':')[0], 10) - 1;
  const verse = parseInt(verseId.split(':')[1], 10) - 1;
  let index = 0;
  for (let i = 0; i < chapter; i++) {
    index += NUM_VERSES[i];
  }

  return index + verse;
}

function getVerseAtIndex(index) {
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    index -= NUM_VERSES[i];
    if (index < 0) {
      index += NUM_VERSES[i];
      const verse = (i + 1) + ':' + (index + 1);
      console.log('verse at ' + index + '=' + verse);
      return verse;
    }
  }
}
