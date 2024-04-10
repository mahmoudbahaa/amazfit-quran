import * as poParser from './gettext-parser/poparser'

export function parsePO (lang, getTranslation) {
  const result = {}
  const translation = getTranslation(lang)
  if (translation === undefined) return undefined
  const po = poParser.parse(translation).translations['']
  for (const key in po) {
    const keyValue = po[key]
    result[keyValue.msgid] = keyValue.msgstr
  }

  return result
}
