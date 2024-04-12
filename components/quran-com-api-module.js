const baseUrl = 'https://api.quran.com/api/v4/'

export const quranComApiModule = {
  async getByService (service, onSuccess, onError, url, resourceName, attrsToDelete = undefined) {
    // @ts-ignore
    const result = await fetch({
      method: 'get',
      url
    })

    if (!result.ok) {
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
      `${baseUrl}verses/by_key/${verse}?audio=${recitationId}`,
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
