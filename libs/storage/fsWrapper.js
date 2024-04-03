import {
  closeSync,
  mkdirSync, O_CREAT, O_RDONLY, O_RDWR, openAssetsSync,
  readFileSync, readSync, statAssetsSync,
  statSync,
  writeFileSync, writeSync
} from '@zos/fs'

export class FS {
  static makeDirectory (directory) {
    try {
      return mkdirSync({ path: directory }) === 0
    } catch (error) {
      return false
    }
  }

  static exists (dirOrFile) {
    try {
      return statSync({ path: dirOrFile }) !== undefined
    } catch (error) {
      return false
    }
  }

  static assetExists (dirOrFile) {
    try {
      return statAssetsSync({ path: dirOrFile }) !== undefined
    } catch (error) {
      return false
    }
  }

  static writeObject (path, obj) {
    FS.writeFile(path, JSON.stringify(obj))
  }

  static writeFile (path, data) {
    writeFileSync({
      path,
      data, // directly use the string data; no need to convert to ab
      options: {
        encoding: 'utf8' // specify encoding method for string data
      }
    })
  }

  static writeFileBinary (path, data) {
    writeFileSync({
      path,
      data
    })
  }

  static readObject (path) {
    const read = FS.readFile(path)
    return read ? JSON.parse(read) : undefined
  }

  static readFile (path) {
    return readFileSync({
      path,
      options: {
        encoding: 'utf8' // specify string encoding
      }
    })
  }

  static readFileBinary (path) {
    return readFileSync({
      path
    })
  }

  static writeAsset (path, buffer) {
    const file = openAssetsSync({ path, flag: O_RDWR | O_CREAT })
    const result = writeSync({
      fd: file,
      buffer
      // other params: 'offset', 'length', 'position'
    })

    console.log('result=' + JSON.stringify(result))
    closeSync(file)
    if (result !== 0) {
      console.log('Write asset failed')
    }
    return result
  }

  static readAssetBinary (path) {
    const stat = statAssetsSync({
      path
    })

    if (!stat) return undefined
    const fd = openAssetsSync({
      path,
      flag: O_RDONLY
    })

    if (!fd) return undefined

    const buffer = new ArrayBuffer(stat.size)
    const count = readSync({
      fd,
      buffer
    })

    closeSync(fd)
    return count === 0 ? undefined : buffer
  }

  static readAsset (path) {
    const data = FS.readAssetBinary(path)
    return data === undefined ? undefined : FS.arrayBufferToString(data)
  }

  static stringToArrayBuffer (str) {
    const buf = new ArrayBuffer(str.length) // has to be switched back to 1 byte for each character for utf8 writeSync
    const bufView = new Uint8Array(buf)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }

  /* From arraybuffer-to-string nodejs module */
  static arrayBufferToString (buffer) {
    // return String.fromCharCode.apply(null, new Uint8Array(buffer))
    return Buffer.from(buffer).toString('utf8')
  }
}
