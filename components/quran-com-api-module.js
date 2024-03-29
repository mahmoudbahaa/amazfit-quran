import { log } from '@zos/utils'
import { getFileName } from '../libs/utils'

const logger = log.getLogger('quran-com-api')
const baseUrl = 'https://api.quran.com/api/v4/'
export const quranComApiModule = {
  get (caller, onSuccess, onError, url, resourceName, attrsToDelete = undefined) {
    caller.httpRequest({
      method: 'get',
      url
    }).then((result) => {
      if (result.status >= 300 && result.status < 200) {
        logger.log(`Error${result.statusText}`)
        if (onError) {
          onError()
        }
        return
      }

      if (attrsToDelete !== undefined) {
        result.body[resourceName].forEach((resource) => {
          attrsToDelete.forEach((attr) => {
            delete resource[attr]
          })
        })
      }

      if (!result.body[resourceName]) {
        console.log('OOPS')
        console.log(url)
        console.log(JSON.stringify(result.body))
        console.log(result.status)
        console.log(result.statusText)
      }

      onSuccess(result.body[resourceName])
    }).catch((error) => {
      logger.error('error=>', error)
      if (onError) {
        onError(error)
      }
    })
  },

  getChapters (caller, surahLangIsoCode, onSuccess, onError) {
    this.get(
      caller,
      onSuccess,
      onError,
      `${baseUrl}chapters?language=${surahLangIsoCode}`,
      'chapters',
      ['id', 'bismillah_pre']
    )
  },

  getVersesAudioPaths (caller, recitationId, onSuccess, onError) {
    const url = `${baseUrl}quran/recitations/${recitationId}?chapter_number=1`
    this.get(
      caller,
      onSuccess,
      onError,
      url,
      'audio_files'
    )
  },

  getVerseText (caller, verse, recitationId, onSuccess, onError) {
    // audio=${recitationId}}&
    const url = `${baseUrl}verses/by_key/${verse}?audio=${recitationId}&fields=text_imlaei`
    this.get(
      caller,
      onSuccess,
      onError,
      url,
      'verse'
    )
  },

  _receiveVerse (caller, path, onSuccess, onError) {
    caller.receiveFile(path, {
      type: 'mp3',
      name: path
    }).then((result) => {
      onSuccess(result)
    }).catch((error) => {
      logger.error('error=>' + JSON.stringify(error))
      if (onError) {
        onError(error)
      }
    })
  },

  downloadVerse (caller, relativePath, verse, onSuccess, onError) {
    const fileName = getFileName(verse)
    const url = `https://verses.quran.com/${relativePath}${fileName}`
    const path = `data://download/${fileName}`

    logger.log('download from=>' + url)
    // this._receiveVerse(caller, path, onSuccess, () => {
    caller.download(url, {
      headers: {},
      timeout: 600000,
      transfer: {
        path,
        opts: {
          type: 'mp3',
          name: path,
          timeout: 600000
        }
      }
    }).then((result) => {
      onSuccess(result)
    }).catch((error) => {
      logger.error('error=>' + JSON.stringify(error))
      if (onError) {
        onError(error)
      }
    })
    // })
  }
}
