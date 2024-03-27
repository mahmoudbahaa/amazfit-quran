import * as fs from '@zos/fs'
import * as poParser from './gettext-parser/poparser'

export function parsePO (lang) {
  const result = {}
  const path = 'i18n/' + lang + '.po'
  const stat = fs.statAssetsSync({
    path
  })

  if (!stat) {
    return undefined
  }

  const fd = fs.openAssetsSync({
    path: 'i18n/' + lang + '.po',
    flag: fs.O_RDONLY
  })

  const buffer = new ArrayBuffer(stat.size)
  const count = fs.readSync({
    fd,
    buffer
  })

  if (count === 0) {
    return undefined
  }

  const str = arrayBufferToString(buffer)
  const po = poParser.parse(str).translations['']
  for (const key in po) {
    const keyValue = po[key]
    result[keyValue.msgid] = keyValue.msgstr
  }

  return result
}

/* From arraybuffer-to-string nodejs module */
function arrayBufferToString (buffer, encoding) {
  if (encoding == null) encoding = 'utf8'

  return Buffer.from(buffer).toString(encoding)
}
