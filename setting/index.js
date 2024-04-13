/* global AppSettingsPage,Section,Select,Text */
import { _ } from './lang';

const globaleStyle = {
  border: '2px solid blue',
  backgroundColor: 'green',
  fontSize: '18px',
  padding: '10px',
};

const sectionStyle = {
  // Border: "20px solid green",
  margin: '10px',
  padding: '10px',
  backgroundColor: 'lightgreen',
};

AppSettingsPage({
  state: {
    chaptersLang: undefined,
    translationLang: undefined,

    recitation: undefined,
    recitations: [],
    translation: undefined,
    translations: [],

    error: '',
  },
  build(props) {
    this.getStorage(props);
    return Section({
      style: globaleStyle,
    }, [
      Section({
        style: sectionStyle,
      }, [
        Select({
          label: this.state.translationLang.split(',')[0],
          options: this.state.languages,
          value: this.state.translationLang,
          title: _('Translation Language'),
          onChange(val) {
            props.settingsStorage.setItem('translationLang', val);
            props.settingsStorage.removeItem('translation');
            props.settingsStorage.removeItem('translations');
          },
        }),
        Select({
          label: this.state.translation.split(',')[0],
          options: this.state.translations,
          value: this.state.translation,
          title: _('Translation'),
          onChange(val) {
            props.settingsStorage.setItem('translation', val);
          },
        }),
      ]),
      Section({
        style: sectionStyle,
      }, [
        Select({
          label: this.state.recitation.split(',')[0],
          options: this.state.recitations,
          value: this.state.recitation,
          title: _('Recitation'),
          onChange(val) {
            props.settingsStorage.setItem('recitation', val);
          },
        }),
      ]),
      Section(
        {
          style: this.state.error ? sectionStyle : {},
        },
        Text({
          style: {
            color: 'darkred',
          },
          paragraph: true,
        }, this.state.error),
      ),
    ]);
  },

  getResource(props, propName, fetchFunc, extraFetchParam, nameFunc, valueFunc) {
    this.state[propName] = props.settingsStorage.getItem(propName);

    if (this.state[propName]) {
      this.state[propName] = JSON.parse(this.state[propName]);
      this.state[propName] = this.state[propName].map((prop, index) => ({
        name: nameFunc(prop, index),
        value: valueFunc(prop, index),
      }));
    } else {
      this[fetchFunc](props.settingsStorage, extraFetchParam);
      this.state[propName] = [];
      this.state.error += `${_('Please wait while retrieving')} ${_(propName)}\n`;
    }
  },

  getStorage(props) {
    this.state.chaptersLang = props.settingsStorage.getItem('chaptersLang') || 'English,en';
    this.state.translationLang = props.settingsStorage.getItem('translationLang') || 'English,en';

    this.state.recitation = props.settingsStorage.getItem('recitation') || 'Mishari Rashid al-`Afasy,7,0';
    this.state.translation = props.settingsStorage.getItem('translation') || 'None,-1,0';
    this.state.error = '';

    this.getResource(
      props,
      'recitations',
      'getRecitations',
      'en',
      recitation => recitation.translated_name.name,
      (recitation, index) => `${recitation.translated_name.name},${recitation.id},${index}`,
    );

    this.getResource(
      props,
      'translations',
      'getTranslations',
      this.state.translationLang.split(',')[0],
      translation => translation.translated_name.name,
      (translation, index) => `${translation.translated_name.name},${translation.id},${index}`,
    );
  },

  async get(res, endPoint, baseUrl = 'https://api.quran.com/api/v4/') {
    try {
      console.log(`url=${baseUrl}${endPoint}`);
      const response = await fetch(baseUrl + endPoint);
      const text = await response.text();
      const result = JSON.parse(text);

      res({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.log('error', error);
      res({
        status: 'error',
        error,
      });
    }
  },

  getLangBasedResource(settingsLib, lang, resource, filterFunc, extraItem) {
    console.log(`Getting ${resource}`);
    this.get(result => {
      console.log('Status: ', result.status);

      if (result.status === 'error') {
        console.log(`Error:${result.error}`);
        return;
      }

      if (filterFunc) {
        result.data[resource] = result.data[resource].filter(filterFunc);
      }

      if (extraItem) {
        result.data[resource].unshift(extraItem);
      }

      settingsLib.setItem(resource, JSON.stringify(result.data[resource]));
    }, `/resources/${resource}?language=${lang}`);
  },

  getRecitations(settingsLib, lang) {
    return this.getLangBasedResource(settingsLib, lang, 'recitations');
  },

  getTranslations(settingsLib, lang) {
    const langName = lang.toLowerCase();
    return this.getLangBasedResource(
      settingsLib,
      lang,
      'translations',
      translation => translation.language_name === langName,
      {
        id: -1,
        name: 'None',
        author_name: 'None',
        slug: 'None',
        language_name: 'None',
        translated_name: {
          name: 'None',
          language_name: 'None',
        },
      },
    );
  },
});
