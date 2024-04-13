/* global getApp */
import { getPackageInfo } from 'zeppos-cross-api/app';
import {
  bin2str, json2str, str2bin, str2json,
} from 'zeppos-cross-api/data-conversion';
import {
  O_CREAT, O_RDONLY, O_WRONLY,
  closeSync,
  mkdirSync,
  openAssetsSync,
  openSync,
  readSync,
  readdirSync,
  rmSync,
  statAssetsSync,
  statSync,
  writeSync,
} from 'zeppos-cross-api/fs';

const appContext = getApp();

export const ASSETS_SCOPE = 'assets';
export const DATA_SCOPE = 'data';
export const FULL_SCOPE = 'full';
export class Path {
  constructor(scope, path) {
    if (path && path[0] !== '/') {
      path = '/' + path;
    }

    this.scope = scope;
    this.path = path;

    if (scope === ASSETS_SCOPE) {
      this.relativePath = path;
      this.absolutePath = FsTools.fullAssetPath(path);
    } else if (scope === DATA_SCOPE) {
      this.relativePath = path;
      this.absolutePath = FsTools.fullDataPath(path);
    } else if (scope === FULL_SCOPE) {
      this.relativePath = `../../../${path.substring(9)}`;
      if (this.relativePath.endsWith('/')) {
        this.relativePath = this.relativePath.substring(0, this.relativePath.length - 1);
      }

      this.absolutePath = path;
    } else {
      throw new Error('Unknown scope provided');
    }
  }

  get(path) {
    const newPath = this.path === '/' ? path : `${this.path}/${path}`;
    return new Path(this.scope, newPath);
  }

  resolve() {
    return new Path(FULL_SCOPE, this.absolutePath);
  }

  src() {
    if (this.scope !== ASSETS_SCOPE) {
      throw new Error('Can\'t get src for non-asset');
    }

    return this.relativePath.substring(1);
  }

  stat() {
    if (this.scope === DATA_SCOPE) {
      return statSync({
        path: this.relativePath,
      });
    }

    return statAssetsSync({
      path: this.relativePath,
    });
  }

  size() {
    const st = this.stat();
    if (st.size) {
      // Is file, nothing to do anymore
      return st.size;
    }

    let output = 0;
    for (const file of this.list()) {
      output += this.get(file).size();
    }

    return output;
  }

  open(flag) {
    if (this.scope === DATA_SCOPE) {
      this._f = openSync({ path: this.relativePath, flag });
    } else {
      this._f = openAssetsSync({ path: this.relativePath, flag });
    }

    return this._f;
  }

  remove() {
    if (this.scope === ASSETS_SCOPE) {
      return this.resolve().remove();
    }

    try {
      rmSync(this.relativePath);
      return true;
    } catch (_) {
      return false;
    }
  }

  removeTree() {
    // Recursive !!!
    const files = this.list();
    files.forEach(file => this.get(file).removeTree());
    this.remove();
  }

  fetch(limit = Infinity) {
    const st = this.stat();
    if (st === undefined) {
      return undefined;
    }

    const length = Math.min(limit, st.size);
    const buffer = new ArrayBuffer(st.size);
    this.open(O_RDONLY);
    this.read(buffer, 0, length);
    this.close();

    return buffer;
  }

  fetchText(limit = Infinity) {
    const contents = this.fetch(limit);
    return contents === undefined ? undefined : bin2str(contents);
  }

  fetchJSON() {
    const contents = this.fetchText();
    return contents === undefined ? undefined : str2json(contents);
  }

  override(buffer) {
    this.remove();

    // eslint-disable-next-line no-bitwise
    this.open(O_WRONLY | O_CREAT);
    this.write(buffer, 0, buffer.byteLength);
    this.close();
  }

  overrideWithText(text) {
    return this.override(str2bin(text));
  }

  overrideWithJSON(data) {
    return this.overrideWithText(json2str(data));
  }

  copy(destEntry) {
    const buf = this.fetch();
    destEntry.override(buf);
  }

  copyTree(destEntry, move = false) {
    // Recursive !!!
    if (this.isFile()) {
      this.copy(destEntry);
    } else {
      destEntry.mkdir();
      for (const file of this.list()) {
        this.get(file).copyTree(destEntry.get(file));
      }
    }

    if (move) {
      this.removeTree();
    }
  }

  isFile() {
    return this.exists() && !this.isFolder();
  }

  isFolder() {
    if (this.absolutePath === '/storage') {
      return true;
    }

    return this.list() !== undefined;
  }

  exists() {
    return this.stat() !== undefined;
  }

  list() {
    return readdirSync({ path: this.relativePath });
  }

  mkdir() {
    console.log(this.relativePath);
    const result = mkdirSync(this.relativePath);
    console.log('mkdir=' + result);
    return result;
  }

  seek(val) {
    this._pos = val;
  }

  read(buffer, offset, length) {
    return readSync({ fd: this._f, buffer, options: { offset, length, position: this._pos } });
  }

  write(buffer, offset, length) {
    return writeSync({ fd: this._f, buffer, options: { offset, length, position: this._pos } });
  }

  close() {
    closeSync({ fd: this._f });
  }
}

export class FsTools {
  static appTags = undefined;
  static cachedAppLocation = undefined;

  static getAppTags() {
    if (FsTools.appTags) {
      return FsTools.appTags;
    }

    try {
      const [id, type] = appContext._options.globalData.appTags;
      return [id, type];
    } catch (_) {
      const packageInfo = getPackageInfo();
      return [packageInfo.appId, packageInfo.type];
    }
  }

  static getAppLocation() {
    if (!FsTools.cachedAppLocation) {
      const [id, type] = FsTools.getAppTags();
      const idn = id.toString(16).padStart(8, '0').toUpperCase();
      FsTools.cachedAppLocation = [`js_${type}s`, idn];
    }

    return FsTools.cachedAppLocation;
  }

  static fullAssetPath(path) {
    const [base, idn] = FsTools.getAppLocation();
    return `/storage/${base}/${idn}/assets${path}`;
  }

  static fullDataPath(path) {
    const [base, idn] = FsTools.getAppLocation();
    return `/storage/${base}/data/${idn}${path}`;
  }

  static printBytes(val, base2 = false) {
    const options = base2 ? ['B', 'KiB', 'MiB', 'GiB'] : ['B', 'KB', 'MB', 'GB'];
    const base = base2 ? 1024 : 1000;

    let curr = 0;
    while (val > 800 && curr < options.length) {
      val /= base;
      curr++;
    }

    val = Math.round(val * 100) / 100;
    return val + ' ' + options[curr];
  }
}
