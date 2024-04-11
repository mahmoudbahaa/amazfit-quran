import { Path } from '../mmk/Path'
import * as poParser from './gettext-parser/poparser'

/**
 * @param {string} lang
 */
export function parsePO (lang) {
  const result = {}
  const translation = new Path('assets', 'i18n/' + lang + '.po').fetchText()
  if (translation === undefined) return undefined
  const po = poParser.parse(translation).translations['']
  for (const key in po) {
    const keyValue = po[key]
    result[keyValue.msgid] = keyValue.msgstr
  }

  return result
}
