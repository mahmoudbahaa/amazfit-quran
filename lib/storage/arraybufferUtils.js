export function stringToArrayBuffer (str) {
  const buf = new ArrayBuffer(str.length) // has to be switched back to 1 byte for each character for utf8 writeSync
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/* From arraybuffer-to-string nodejs module */
export function arrayBufferToString (buffer) {
  // return String.fromCharCode.apply(null, new Uint8Array(buffer))
  return Buffer.from(buffer).toString('utf8')
}
