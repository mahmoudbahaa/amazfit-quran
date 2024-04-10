import { NUM_CHAPTERS, NUM_VERSES, NUM_VERSES_PER_FILE } from '../constants'
import { FS } from '../storage/fsWrapper'
import { setValue, v } from './default'

function readVerseFile (verse) {
  const path = `verses/${v(verse)}`
  if (FS.exists(path)) {
    return FS.readFile(path).split('\n')
  } else {
    if (!FS.exists('verses')) FS.makeDirectory('verses')

    const fileId = Math.floor(getVerseIndex(verse) / NUM_VERSES_PER_FILE)
    let i = fileId * NUM_VERSES_PER_FILE
    FS.readAsset(`verses/verses_${fileId}`).split('\n\n\n').forEach(file => {
      const path2 = `verses/${v(getVerseAtIndex(i++))}`
      FS.writeFile(path2, file + ' ۝')
    })

    return FS.readFile(path).split('\n')
  }
}

export function getVerseText (verse) {
  const lines = readVerseFile(verse)
  if (lines.length !== 1) lines.shift()
  return lines
}

export function setVerseInfo (verse, mapping) {
  const lines = readVerseFile(verse)
  if (lines.length === 1) {
    setValue(`vi${v(verse)}`, [])
  } else {
    const saved = []
    lines[0].split(',').forEach(part => {
      saved.push(mapping[parseInt(part) - 1])
    })

    setValue(`vi${v(verse)}`, saved)
  }
}

function getVerseIndex (verseId) {
  const chapter = parseInt(verseId.split(':')[0]) - 1
  const verse = parseInt(verseId.split(':')[1]) - 1
  let index = 0
  for (let i = 0; i < chapter; i++) {
    index += NUM_VERSES[i]
  }

  return index + verse
}

function getVerseAtIndex (index) {
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    index -= NUM_VERSES[i]
    if (index < 0) {
      index += NUM_VERSES[i]
      const verse = (i + 1) + ':' + (index + 1)
      console.log('verse at ' + index + '=' + verse)
      return verse
    }
  }
}
