import { back } from 'zeppos-cross-api/router';
import { getFontSize, getLang, setLang } from '../lib/config/default';
import { DEVICE_LANG, _, isRtlLang } from '../lib/i18n/lang';
import { ListScreen } from '../lib/mmk/ListScreen';

const UI_LANGS = {
  en: 'English',
  ar: 'عربي',
};

export class SettingsLangScreen extends ListScreen {
  constructor(availableLanguages = undefined, current = undefined, setter = undefined) {
    super(isRtlLang());
    this.fontSize = getFontSize();
    this.row({
      text: _('Back'),
      icon: 'menu/back.png',
      card: { callback: () => back() },
    });
    this.availableLanguages = availableLanguages || UI_LANGS;
    this.current = current || getLang();
    this.setter = setter || setLang;
  }

  start() {
    const osLocale = DEVICE_LANG();
    this.current ||= 'false';

    this.localeRow(`${_('System ')}(${osLocale})`, 'false');
    this.headlineRow(_('Supported:'));

    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const key in this.availableLanguages) {
      keys.push(key);
    }

    keys.sort();
    keys.forEach(key => this.localeRow(this.availableLanguages[key], key));
    this.finalize();
  }

  localeRow(prettyName, key) {
    const active = this.current === key;
    const that = this;
    this.row({
      text: prettyName,
      icon: `menu/cb_${active}.png`,
      card: {
        callback() {
          that.setter(key);
          back();
        },
      },
    });
  }
}
