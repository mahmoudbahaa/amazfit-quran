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
    await this.getByService(
      caller,
      onSuccess,
      onError,
      `${baseUrl}quran/recitations/${recitationId}?chapter_number=1`,
      'audio_files'
    )
  },

  async getVerseText (caller, verse, recitationId, onSuccess, onError) {
    await this.getByService(
      caller,
      onSuccess,
      onError,
      `${baseUrl}verses/by_key/${verse}?audio=${recitationId}&fields=text_imlaei`,
      'verse'
    )
  },

  transferVerse (caller, verse, onSuccess, onError) {
    const task = caller.sendFile(`data://download/${this.getFileName(verse)}`)
    let started = false
    task.on('change', (e) => {
      switch (e.data.readyState) {
        case 'transferring': {
          started = true
          break
        }
        case 'transferred': {
          onSuccess({ status: 'success' })
          break
        }
        case 'error': {
          onError({ status: 'error', error: e, started })
          break
        }
      }
    })

    task.on('complete', (e) => {
      caller.log('File-transfer = ' + JSON.stringify(e))
    })
  },

  getFileName (verse) {
    return `${verse.split(':')[0].padStart(3, '0') + verse.split(':')[1].padStart(3, '0')}.mp3`
  },

  downloadVerse (caller, relativePath, verse, onSuccess, onError) {
    const task = caller.download(`https://verses.quran.com/${relativePath}${this.getFileName(verse)}`, {
      headers: {},
      timeout: 60000
    })

    if (!task) {
      onError({ message: 'download fail' })
      return
    }

    task.onSuccess = (data) => {
      onSuccess({ status: 'success', data })
    }

    task.onFail = (data) => {
      onError({ message: 'download fail', error: data })
    }
  }
}
