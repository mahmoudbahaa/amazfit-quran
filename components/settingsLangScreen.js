import { back } from '@zos/router'
import { getFontSize, getLang, setLang } from '../libs/config/default'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { ListScreen } from '../libs/mmk/ListScreen'

const UI_LANGS = {
  en: 'English',
  ar: 'عربي'
}

export class SettingsLangScreen extends ListScreen {
  constructor (availableLanguages = undefined, current = undefined, setter = undefined) {
    super(isRtlLang())
    this.fontSize = getFontSize()
    this.row({
      text: _('Back'),
      icon: 'menu/back.png',
      card: { callback: () => back() }
    })
    this.availableLanguages = availableLanguages || UI_LANGS
    this.current = current || getLang()
    this.setter = setter || setLang
  }

  start () {
    const osLocale = DEVICE_LANG()
    if (!this.current) this.current = false

    this.localeRow(`${_('System ')}(${osLocale})`, 'false')
    this.headline(_('Supported:'))

    const keys = []
    for (const key in this.availableLanguages) {
      keys.push(key)
    }

    keys.sort()
    keys.forEach(key => this.localeRow(this.availableLanguages[key], key))
    this.finalize()
  }

  localeRow (prettyName, key) {
    const active = this.current === key
    const that = this
    this.row({
      text: prettyName,
      icon: `menu/cb_${active}.png`,
      card: {
        callback: () => {
          that.setter(key)
          back()
        }
      }
    })
  }
}
