/* global AppSettingsPage,Section,Select,Text */
import { gettext } from 'i18n'

const globaleStyle = {
  border: '2px solid blue',
  backgroundColor: 'green',
  fontSize: '18px',
  padding: '10px'
}

const sectionStyle = {
  // border: "20px solid green",
  margin: '10px',
  padding: '10px',
  backgroundColor: 'lightgreen'
}

let filteredLangs
let remainingLangsNum
AppSettingsPage({
  state: {
    languages: undefined,
    surahLang: NaN,
    translationLang: undefined,

    recitation: undefined,
    recitationIdx: undefined,
    recitations: [],
    translation: undefined,
    translationIdx: undefined,
    translations: [],

    error: ''
  },
  build (props) {
    this.getStorage(props)
    return Section({
      style: globaleStyle
    }, [
      Section(
        {
          style: sectionStyle
        },
        Select({
          label: this.state.surahLang.split(',')[0],
          options: this.state.languages,
          value: this.state.surahLang,
          title: gettext('Main Language'),
          onChange: (val) => {
            props.settingsStorage.setItem('lang', val)
            props.settingsStorage.removeItem('recitations')
          }
        })
      ),
      Section({
        style: sectionStyle
      }, [
        Select({
          label: this.state.translationLang.split(',')[0],
          options: this.state.languages,
          value: this.state.translationLang,
          title: gettext('Translation Language'),
          onChange: (val) => {
            props.settingsStorage.setItem('translationLang', val)
            props.settingsStorage.removeItem('translation')
            props.settingsStorage.removeItem('translations')
          }
        }),
        Select({
          label: this.state.translation.split(',')[0],
          options: this.state.translations,
          value: this.state.translation,
          title: 'Translation',
          onChange: (val) => {
            this.state.translationIdx = val.split(',')[2]
            props.settingsStorage.setItem('translation', val)
          }
        })
      ]),
      Section({
        style: sectionStyle
      }, [
        Select({
          label: this.state.recitations[this.state.recitationIdx] ? this.state.recitations[this.state.recitationIdx].name : this.state.recitation.split(',')[0],
          options: this.state.recitations,
          value: this.state.recitation,
          title: 'Recitation',
          onChange: (val) => {
            props.settingsStorage.setItem('recitation', val)
          }
        })
      ]),
      Section(
        {
          style: this.state.error ? sectionStyle : {}
        },
        Text({
          style: {
            color: 'darkred'
          },
          paragraph: true
        }, this.state.error)
      )
    ])
  },

  getResource (props, propName, fetchFunc, extraFetchParam, nameFunc, valueFunc) {
    this.state[propName] = props.settingsStorage.getItem(propName)

    if (this.state[propName]) {
      this.state[propName] = JSON.parse(this.state[propName])
      this.state[propName] = this.state[propName].map((prop, index) => ({
        name: nameFunc(prop, index),
        value: valueFunc(prop, index)
      }))
    } else {
      this[fetchFunc](props.settingsStorage, extraFetchParam)
      this.state[propName] = []
      this.state.error += `Please wait while retreving ${propName}\n`
    }
  },

  getStorage (props) {
    this.state.surahLang = props.settingsStorage.getItem('lang') || 'English,en'
    this.state.translationLang = props.settingsStorage.getItem('translationLang') || 'English,en'

    this.state.recitation = props.settingsStorage.getItem('recitation') || 'Mishari Rashid al-`Afasy,7,0'
    this.state.translation = props.settingsStorage.getItem('translation') || 'None,-1,0'
    this.state.translationIdx = parseInt(this.state.translation.split(',')[2])
    this.state.error = ''

    if (this.state.languages === undefined) {
      this.getLanguages(props.settingsStorage)
      this.state.languages = []
      this.state.error += 'Please wait while retrieving languages\n'
    } else {
      this.state.languages = filteredLangs
    }

    this.getResource(
      props,
      'languages',
      'getLanguages',
      undefined,
      (lang) => `${lang.name}(${lang.native_name})`,
      (lang) => `${lang.name},${lang.iso_code}`
    )

    this.getResource(
      props,
      'recitations',
      'getRecitations',
      this.state.surahLang.split(',')[1],
      (recitation) => recitation.translated_name.name,
      (recitation, index) => `${recitation.translated_name.name},${recitation.id},${index}`
    )

    this.getResource(
      props,
      'translations',
      'getTranslations',
      this.state.translationLang.split(',')[0],
      (translation) => translation.translated_name.name,
      (translation, index) => `${translation.translated_name.name},${translation.id},${index}`
    )
  },

  async get (res, endPoint, baseUrl = 'https://api.quran.com/api/v4/') {
    try {
      console.log(`url=${baseUrl}${endPoint}`)
      const response = await fetch(baseUrl + endPoint)
      const text = await response.text()
      const result = JSON.parse(text)

      res({
        status: 'success',
        data: result
      })
    } catch (error) {
      console.log('error', error)
      res({
        status: 'error',
        error
      })
    }
  },

  getLanguages (settingsLib) {
    console.log('Getting languages')
    this.get((result) => {
      console.log('Status: ', result.status)

      if (result.status === 'error') {
        console.log(`Error:${result.error}`)
        return
      }

      result.data.languages.forEach((lang) => {
        delete lang.translations_count
        delete lang.translated_name
      })

      remainingLangsNum = result.data.languages.length
      filteredLangs = [{
        id: 0,
        name: 'Arabic',
        iso_code: 'ar',
        native_name: 'عربي',
        direction: 'rtl'
      }]
      result.data.languages.forEach(lang => {
        this.get(result => {
          remainingLangsNum--
          if (result.status === 'success') {
            const retLangName = result.data.chapter.translated_name.language_name.toLowerCase()
            if (retLangName === lang.name.toLowerCase()) {
              filteredLangs.push(lang)
            }
          }

          if (remainingLangsNum === 0) {
            settingsLib.setItem('languages', JSON.stringify(filteredLangs.sort((a, b) => {
              return a.iso_code.toString().localeCompare(b.iso_code.toString())
            })))
          }
        }, 'chapters/1?language=' + lang.iso_code)
      })
    }, 'resources/languages')
  },

  getLangBasedResource (settingsLib, lang, resource, filterFunc, extraItem) {
    console.log(`Getting ${resource}`)
    this.get((result) => {
      console.log('Status: ', result.status)

      if (result.status === 'error') {
        console.log(`Error:${result.error}`)
        return
      }

      if (filterFunc) result.data[resource] = result.data[resource].filter(filterFunc)
      if (extraItem) result.data[resource].unshift(extraItem)
      settingsLib.setItem(resource, JSON.stringify(result.data[resource]))
    }, `/resources/${resource}?language=${lang}`)
  },

  getRecitations (settingsLib, lang) {
    return this.getLangBasedResource(settingsLib, lang, 'recitations')
  },

  getTranslations (settingsLib, lang) {
    const langName = lang.toLowerCase()
    return this.getLangBasedResource(
      settingsLib,
      lang,
      'translations',
      (translation) => translation.language_name === langName,
      {
        id: -1,
        name: 'None',
        author_name: 'None',
        slug: 'None',
        language_name: 'None',
        translated_name: {
          name: 'None',
          language_name: 'None'
        }
      }
    )
  }
})
