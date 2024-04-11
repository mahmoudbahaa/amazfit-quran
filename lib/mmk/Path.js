/* global getApp */
import { getPackageInfo } from 'zeppos-cross-api/app'
import {
  closeSync,
  mkdirSync, O_CREAT, O_RDONLY, O_WRONLY,
  openAssetsSync,
  openSync,
  readdirSync,
  readSync,
  rmSync,
  statAssetsSync,
  statSync,
  writeSync
} from 'zeppos-cross-api/fs'

const appContext = getApp()

export const ASSETS_SCOPE = 'assets'
export const DATA_SCOPE = 'data'
export const FULL_SCOPE = 'full'
export class Path {
  constructor (scope, path) {
    if (path[0] !== '/') path = '/' + path

    this.scope = scope
    this.path = path

    if (scope === ASSETS_SCOPE) {
      this.relativePath = path
      this.absolutePath = FsTools.fullAssetPath(path)
    } else if (scope === DATA_SCOPE) {
      this.relativePath = path
      this.absolutePath = FsTools.fullDataPath(path)
    } else if (scope === FULL_SCOPE) {
      this.relativePath = `../../../${path.substring(9)}`
      if (this.relativePath.endsWith('/')) { this.relativePath = this.relativePath.substring(0, this.relativePath.length - 1) }
      this.absolutePath = path
    } else {
      throw new Error('Unknown scope provided')
    }
  }

  get (path) {
    const newPath = this.path === '/' ? path : `${this.path}/${path}`
    return new Path(this.scope, newPath)
  }

  resolve () {
    return new Path(FULL_SCOPE, this.absolutePath)
  }

  src () {
    if (this.scope !== ASSETS_SCOPE) { throw new Error("Can't get src for non-asset") }
    return this.relativePath.substring(1)
  }

  stat () {
    if (this.scope === DATA_SCOPE) {
      return statSync({
        path: this.relativePath
      })
    } else {
      return statAssetsSync({
        path: this.relativePath
      })
    }
  }

  size () {
    const st = this.stat()
    if (st.size) {
      // Is file, nothing to do anymore
      return st.size
    }

    let output = 0
    for (const file of this.list()[0]) {
      output += this.get(file).size()
    }

    return output
  }

  open (flag) {
    if (this.scope === DATA_SCOPE) {
      this._f = openSync({ path: this.relativePath, flag })
    } else {
      this._f = openAssetsSync({ path: this.relativePath, flag })
    }

    return this._f
  }

  remove () {
    if (this.scope === ASSETS_SCOPE) { return this.resolve().remove() }

    try {
      rmSync(this.relativePath)
      return true
    } catch (e) {
      return false
    }
  }

  removeTree () {
    // Recursive !!!
    const files = this.list()
    for (const i in files) {
      this.get(files[i]).removeTree()
    }

    this.remove()
  }

  fetch (limit = Infinity) {
    const st = this.stat()
    if (st === undefined) return undefined

    const length = Math.min(limit, st.size)
    const buffer = new ArrayBuffer(st.size)
    this.open(O_RDONLY)
    this.read(buffer, 0, length)
    this.close()

    return buffer
  }

  fetchText (limit = Infinity) {
    const buf = this.fetch(limit)
    const view = new Uint8Array(buf)
    return FsTools.decodeUtf8(view, limit).result
  }

  fetchJSON () {
    const contents = this.fetchText()
    return contents && JSON.parse(contents)
  }

  override (buffer) {
    this.remove()

    this.open(O_WRONLY | O_CREAT)
    this.write(buffer, 0, buffer.byteLength)
    this.close()
  }

  overrideWithText (text) {
    return this.override(FsTools.strToUtf8(text))
  }

  overrideWithJSON (data) {
    return this.overrideWithText(JSON.stringify(data))
  }

  copy (destEntry) {
    const buf = this.fetch()
    destEntry.override(buf)
  }

  copyTree (destEntry, move = false) {
    // Recursive !!!
    if (this.isFile()) {
      this.copy(destEntry)
    } else {
      destEntry.mkdir()
      for (const file of this.list()[0]) {
        this.get(file).copyTree(destEntry.get(file))
      }
    }

    if (move) this.removeTree()
  }

  isFile () {
    return this.exists() && !this.isFolder()
  }

  isFolder () {
    if (this.absolutePath === '/storage') return true
    return this.list() !== undefined
  }

  exists () {
    return this.stat() !== undefined
  }

  list () {
    return readdirSync({ path: this.relativePath })
  }

  mkdir () {
    return mkdirSync(this.relativePath)
  }

  seek (val) {
    this._pos = val
  }

  read (buffer, offset, length) {
    readSync({ fd: this._f, buffer, options: { offset, length, position: this._pos } })
  }

  write (buffer, offset, length) {
    writeSync({ fd: this._f, buffer, options: { offset, length, position: this._pos } })
  }

  close () {
    closeSync({ fd: this._f })
  }
}

export class FsTools {
  static appTags = undefined
  static cachedAppLocation = undefined

  static getAppTags () {
    if (FsTools.appTags) return FsTools.appTags

    try {
      const [id, type] = appContext._options.globalData.appTags
      return [id, type]
    } catch (_) {
      const packageInfo = getPackageInfo()
      return [packageInfo.appId, packageInfo.type]
    }
  }

  static getAppLocation () {
    if (!FsTools.cachedAppLocation) {
      const [id, type] = FsTools.getAppTags()
      const idn = id.toString(16).padStart(8, '0').toUpperCase()
      FsTools.cachedAppLocation = [`js_${type}s`, idn]
    }

    return FsTools.cachedAppLocation
  }

  static fullAssetPath (path) {
    const [base, idn] = FsTools.getAppLocation()
    return `/storage/${base}/${idn}/assets${path}`
  }

  static fullDataPath (path) {
    const [base, idn] = FsTools.getAppLocation()
    return `/storage/${base}/data/${idn}${path}`
  }

  // https://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
  static strToUtf8 (str) {
    const utf8 = []
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i)
      if (charcode < 0x80) utf8.push(charcode)
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6),
          0x80 | (charcode & 0x3f))
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f))
      } else {
        i++
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
          (str.charCodeAt(i) & 0x3ff))
        utf8.push(0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f))
      }
    }

    return new Uint8Array(utf8).buffer
  }

  // source: https://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript
  static decodeUtf8 (array, outLimit = Infinity, startPosition = 0) {
    let out = ''
    const length = array.length

    let i = startPosition
    let c; let char2; let char3
    while (i < length && out.length < outLimit) {
      c = array[i++]
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c)
          break
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++]
          out += String.fromCharCode(
            ((c & 0x1f) << 6) | (char2 & 0x3f)
          )
          break
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++]
          char3 = array[i++]
          out += String.fromCharCode(
            ((c & 0x0f) << 12) |
            ((char2 & 0x3f) << 6) |
            ((char3 & 0x3f) << 0)
          )
          break
      }
    }

    return {
      result: out,
      length: i - startPosition
    }
  }

  static Utf8ArrayToStr (array) {
    return FsTools.decodeUtf8(array).result
  }

  static printBytes (val, base2 = false) {
    const options = base2 ? ['B', 'KiB', 'MiB', 'GiB'] : ['B', 'KB', 'MB', 'GB']
    const base = base2 ? 1024 : 1000

    let curr = 0
    while (val > 800 && curr < options.length) {
      val = val / base
      curr++
    }

    val = Math.round(val * 100) / 100
    return val + ' ' + options[curr]
  }
}
