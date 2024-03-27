import { log } from '@zos/utils'

const logger = log.getLogger('quran-com-api')
const baseUrl = 'https://api.quran.com/api/v4/'
export const quranComApiModule = {
  get (caller, onSucess, onError, url, resourceName, attrsToDelete = undefined) {
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

      onSucess(result.body[resourceName])
    }).catch((error) => {
      logger.error('error=>', error)
      if (onError) {
        onError(error)
      }
    })
  },

  getChapters (caller, surahLangIsoCode, onSucess, onError) {
    this.get(
      caller,
      onSucess,
      onError,
      `${baseUrl}chapters?language=${surahLangIsoCode}`,
      'chapters',
      ['id', 'bismillah_pre']
    )
  },

  getVersesAudioPaths (caller, recitationId, onSucess, onError) {
    const url = `${baseUrl}quran/recitations/${recitationId}?chapter_number=1`
    this.get(
      caller,
      onSucess,
      onError,
      url,
      'audio_files'
    )
  },

  getVerseText (caller, verse, onSucess, onError) {
    // audio=${recitationId}}&
    const url = `${baseUrl}verses/by_key/${verse}?fields=text_imlaei`
    this.get(
      caller,
      onSucess,
      onError,
      url,
      'verse'
    )
  }
}
