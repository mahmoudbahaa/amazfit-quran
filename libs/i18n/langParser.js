import * as poParser from './gettext-parser/poparser'
import { FS } from '../storage/fsWrapper'

export function parsePO (lang) {
  const result = {}
  const translation = FS.readAsset('i18n/' + lang + '.po')
  if (translation === undefined) return undefined
  const po = poParser.parse(translation).translations['']
  for (const key in po) {
    const keyValue = po[key]
    result[keyValue.msgid] = keyValue.msgstr
  }

  return result
}
