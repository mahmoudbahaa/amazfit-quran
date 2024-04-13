import { Path } from '../mmk/Path';

let mkdirWorks = true;

export class ConfigStorage {
  /**
   * @type {Path}
   */
  #folder;
  #prefix;
  /**
   * @param {string} folder
   */
  constructor(folder = undefined) {
    folder ||= 'quran_config';

    this.#folder = new Path('data', folder);
    this.#prefix = '';

    if (!mkdirWorks || !this.#folder.exists()) {
      if (this.#folder.mkdir() !== 0) {
        mkdirWorks = false;
        this.#folder = new Path('data', '');
        this.#prefix = folder + '_';
      }
    }
  }

  /**
   * @param {string} key
   */
  get(key) {
    return this.#folder.get(this.#prefix + key).fetchJSON();
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    this.#folder.get(this.#prefix + key).overrideWithJSON(value);
  }

  /**
   * @param {string} key
   */
  removeKey(key) {
    return this.#folder.get(this.#prefix + key).remove();
  }

  /**
   * @param {string} key
   */
  hasKey(key) {
    return this.#folder.get(this.#prefix + key).exists();
  }

  wipe() {
    return this.#folder.remove();
  }

  wipeData() {
    let result = true;
    [new Path('data', 'download'), new Path('data', 'verses')].forEach(path => {
      if (path.exists) {
        result &&= path.remove();
      }
    });
    return result;
  }
}
