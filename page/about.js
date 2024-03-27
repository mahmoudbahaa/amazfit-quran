/* global Page */
import { log, px } from '@zos/utils'
import { setWakeUpRelaunch } from '@zos/display'
import { BaseAboutScreen } from '../libs/mmk/BaseAboutScreen'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { SCREEN_MARGIN_Y } from '../libs/mmk/UiParams'
import { showToast } from '@zos/interaction'

const logger = log.getLogger('about.page')
const majorVersion = 0
const minorVersion = 1

const lang = DEVICE_LANG()
Page({
  onInit () {
    setWakeUpRelaunch({
      relaunch: true
    })
  },

  onDestroy () {
    logger.log('select page on destroy invoke')
  },

  build () {
    new AboutScreen().start()
  }
})

class AboutScreen extends BaseAboutScreen {
  constructor () {
    super()
    this.rtl = isRtlLang(lang)
    this.appName = `${_('Quran App', lang)}`
    this.version = `(${_(majorVersion, lang)}${_('.', lang)}${_(minorVersion, lang)})`
    this.infoRows = [
      [_('Mahmoud Bahaa', lang), _('Developer', lang)],
      [_('Nisreen Ali', lang), _('Designer', lang)]
    ]
    this.infoHeaderWidth = px(170)

    this.iconSize = px(128)
    this.fontSize = px(24)

    const bismallah = 'بسم الله الرحمن الرحيم'
    const inTheNameOfAllah = _('In The name of Allah', lang)
    this.headerText = [bismallah]
    this.headerFontSize = [this.fontSize]
    this.headerPos = ['top']

    if (inTheNameOfAllah.toString().localeCompare(bismallah) !== 0) {
      this.headerText.push(inTheNameOfAllah)
      this.headerFontSize.push(this.fontSize)
      this.headerPos.push('top')
    }

    this.posY = SCREEN_MARGIN_Y
    this.nextIconSrc = 'next.png'
    this.nextIconSize = 64
    this.nextPage = 'page/select'
  }
}
