/* global */
import { Path } from '../mmk/Path'

export class ConfigStorage {
  /**
   * @type {Path}
   */
  #folder

  /**
   * @param {Path} folder
   */
  constructor (folder = null) {
    if (folder !== null) {
      this.#folder = folder
    } else {
      this.#folder = new Path('data', 'quran-config')
    }

    if (!this.#folder.exists()) {
      this.#folder.mkdir()
    }
  }

  /**
   * @param {string} key
   */
  get (key) {
    return this.#folder.get(key).fetchJSON()
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  set (key, value) {
    this.#folder.get(key).overrideWithJSON(value)
  }

  /**
   * @param {string} key
   */
  removeKey (key) {
    return this.#folder.get(key).remove()
  }

  /**
   * @param {string} key
   */
  hasKey (key) {
    return this.#folder.get(key).exists()
  }

  wipe () {
    return this.#folder.remove()
  }

  wipeData () {
    let result = true
    ;[new Path('data', 'download'), new Path('data', 'verses')].forEach(path => {
      if (path.exists) result &&= path.remove()
    })
    return result
  }
}
