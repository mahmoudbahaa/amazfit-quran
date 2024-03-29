const baseUrl = 'https://api.quran.com/api/v4/'
export const quranComApiModule = {
  get (caller, onSuccess, onError, url, resourceName, attrsToDelete = undefined) {
    caller.httpRequest({
      method: 'get',
      url
    }).then((result) => {
      if (result.status >= 300 && result.status < 200) {
        console.log(`Error${result.statusText}`)
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
      console.log('error=>', error)
      if (onError) {
        onError(error)
      }
    })
  },

  async getByService (service, onSuccess, onError, url, resourceName, attrsToDelete = undefined) {
    const result = await service.fetch({
      method: 'get',
      url
    }).catch((error) => {
      service.log('error=>', error)
      if (onError) {
        onError(error)
      }
    })

    if (result.status >= 300 && result.status < 200) {
      service.log(`Error${result.statusText}`)
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
      service.log('OOPS')
      service.log(url)
      service.log(JSON.stringify(result.body))
      service.log(result.status)
      service.log(result.statusText)
    }

    onSuccess(result.body[resourceName])
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

  async getVersesAudioPaths (caller, recitationId, onSuccess, onError) {
    const url = `${baseUrl}quran/recitations/${recitationId}?chapter_number=1`
    caller.log(url)
    await this.getByService(
      caller,
      onSuccess,
      onError,
      url,
      'audio_files'
    )
  },

  async getVerseText (caller, verse, recitationId, onSuccess, onError) {
    const url = `${baseUrl}verses/by_key/${verse}?audio=${recitationId}&fields=text_imlaei`
    await this.getByService(
      caller,
      onSuccess,
      onError,
      url,
      'verse'
    )
  },

  transferVerse (caller, verse, onSuccess, onError) {
    const fileName = this.getFileName(verse)
    const path = `data://download/${fileName}`
    const task = caller.sendFile(path, {
      type: 'mp3',
      fileName: path
    })

    let sendResult = true
    task.on('change', (e) => {
      if (e.data.readyState === 'transferred') {
        if (sendResult) {
          sendResult = false
          onSuccess({ status: 'success' })
        }
      } else if (e.data.readyState === 'error') {
        if (sendResult) {
          sendResult = false
          onError({ status: 'error' })
        }
      }
    })
  },

  getFileName (verse) {
    const surahNumber = verse.split(':')[0]
    const verseNumber = verse.split(':')[1]
    return `${surahNumber.padStart(3, '0') + verseNumber.padStart(3, '0')}.mp3`
  },

  downloadVerse (caller, relativePath, verse, onSuccess, onError) {
    const fileName = this.getFileName(verse)
    const url = `https://verses.quran.com/${relativePath}${fileName}`

    caller.log('download from=>' + url)
    const task = caller.download(url, {
      headers: {},
      timeout: 600000
    })

    if (!task) {
      onError({ message: 'download fail' })
      return
    }

    task.onSuccess = (data) => {
      onSuccess({ status: 'success' })
    }

    task.onFail = (data) => {
      onError({ message: 'download fail' })
    }
  }
}
