import {gettext} from 'i18n';

const quranicaudioBaseUrl = "https://quranicaudio.com/api/";

const globaleStyle = {
  border: "2px solid blue",
  backgroundColor: "green",
  fontSize: "18px",
  padding: "10px",
};

const sectionStyle = {
  // border: "20px solid green",
  margin: "10px",
  padding: "10px",
  backgroundColor: "lightgreen",
};

AppSettingsPage({
  state: {
    surahLang: NaN,
    recitation: undefined,
    langs: [],
    recitations: [],
    selected_recitation: undefined,
    error: "",
  },
  build(props) {
    this.getStorage(props)
    const that = this;
    const recitationDesc = this.state.selected_recitation ? recitations[this.state.selected_recitation].description : "";

    return Section({
      style: globaleStyle,
    }, [
      Section(
        {
          style: sectionStyle
        },
        Select({
          label: this.state.surahLang.split(",")[0],
          options: this.state.langs,
          value: this.state.surahLang,
          title: gettext('Surah Names Language'),
          onChange: val => props.settingsStorage.setItem('surahLang', val),
        })
      ),
      Section(
        {
          style: sectionStyle
        },
        [Select({
          label: this.state.recitation.split(",")[0],
          options: this.state.recitations,
          value: this.state.recitation,
          title: 'Recitation',
          onChange: val => {
            that.state.selected_recitation = parseInt(val.split(",")[1]);
            props.settingsStorage.setItem('recitation', val);
          },
        }),
          Text({
            paragraph: true,
          }, recitationDesc)]
      ),
      Section(
        {
          style: this.state.error ? sectionStyle : {},
        },
        Text({
          style: {
            color: "darkred",
          },
          paragraph: true,
        }, this.state.error),
      )
    ])
  },

  getStorage(props) {
    this.state.surahLang = props.settingsStorage.getItem('surahLang') || 'English,en'
    this.state.recitation = props.settingsStorage.getItem('recitation') || 'Mishari Rashid al-`Afasy,7'

    this.state.langs = props.settingsStorage.getItem('languages');
    this.state.recitations = props.settingsStorage.getItem('recitations');
    this.state.error = "";

    if (this.state.langs) {
      this.state.langs = JSON.parse(this.state.langs);
      this.state.langs = this.state.langs.map(lang => {
        return {
          name: lang.name + "(" + lang.native_name + ")",
          value: lang.name + "," + lang.iso_code,
        };
      });
    } else {
      this.getLanguages(props.settingsStorage);
      this.state.langs = [];
      this.state.error += "Please wait while retreving languages\n";
    }

    if (this.state.recitations) {
      this.state.recitations = JSON.parse(this.state.recitations);
      this.state.recitations = this.state.recitations.map(recitation => {
        return {
          name: recitation.translated_name.name,
          value: recitation.translated_name.name + "," + recitation.id,
        }
          ;
      });
    } else {
      this.getLanguages(props.settingsStorage, this.state.surahLang.split(",")[1]);
      this.state.recitations = [];
      this.state.error += "Please wait while retreving recitations\n";
    }


    this.state.recitations = this.state.recitations.map((recitation, index) => {
      return {
        name: recitation.name,
        value: recitation.name + "," + index + "," + recitation.relative_path,
      };
    });

    this.state.error = "Please wait while retreving languages\n";
  },

  async get(res, endPoint, baseUrl = "https://api.quran.com/api/v4/") {
    try {
      console.log("url" + baseUrl + endPoint);
      const response = await fetch(baseUrl + endPoint);
      const text = await response.text();
      const result = JSON.parse(text);

      res({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.log("error", error);
      res({
        status: "error",
        error,
      });
    }
  },

  getLanguages(settingsLib) {
    console.log("Getting languages");
    this.get(result => {
      console.log("Status: ", result.status);

      if (result.status === "error") {
        console.log("Error:" + result.error);
        return;
      }

      result.data.languages.forEach(lang => {
        delete lang.translations_count;
        delete lang.translated_name;
      });

      result.data.languages.unshift({
        id: 0,
        name: "Arabic",
        iso_code: "ar",
        native_name: "عربي",
        direction: "rtl"
      });

      settingsLib.setItem("languages", JSON.stringify(result.data.languages));
    }, 'resources/languages');
  },

  getRecitations(settingsLib, lang) {
    console.log("Getting Recitations");
    this.get(result => {
      console.log("Status: ", result.status);

      if (result.status === "error") {
        console.log("Error:" + result.error);
        return;
      }

      settingsLib.setItem("recitations", JSON.stringify(result.data.recitations));
    }, '/resources/recitations?language=' + lang);
  },
})