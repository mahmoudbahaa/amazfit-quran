/* global Page */
import { px } from '@zos/utils'
import { BaseAboutScreen } from '../libs/mmk/BaseAboutScreen'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { SelectPage } from './start'
import { getRows } from '../components/chaptersList'
import hmUI from '@zos/ui'

const majorVersion = 0
const minorVersion = 1

const lang = DEVICE_LANG()
Page(
  SelectPage({
    state: {
      about: undefined
    },
    onGettingChapters () {
      this.state.about.updateStatus('Getting Chapters...')
    },

    createWidgets () {
      // logger.log('Inside Create Widgets')
      this.state.about.updateStatus('Setting up Rows...')
      setTimeout(() => {
        getRows()
        this.state.about.ready()
      }, 50)
    },

    build () {
      this.state.about = new AboutScreen()
      this.state.about.start()
      this.state.about.updateStatus('Getting Settings...')
      setTimeout(() => this.getSideAppSettings(), 50)
    }
  })
)

class AboutScreen extends BaseAboutScreen {
  constructor () {
    super()
    this.rtl = isRtlLang(lang)
    this.appName = `${_('Quran App', lang)}`
    this.version = `(${_(majorVersion, lang)}${_('.', lang)}${_(minorVersion, lang)})`
    this.infoRows = [
      [_('Mahmoud Bahaa', lang), _('Developer', lang)]
      // [_('Nisreen Ali', lang), _('Designer', lang)]
    ]
    this.infoHeaderWidth = px(170)

    this.iconSize = px(128)
    this.fontSize = px(24)
    this.bismallahFontSize = px(64)

    const bismallah = '﷽'
    const inTheNameOfAllah = _('In The name of Allah', lang)
    this.headerText = [bismallah]
    this.headerFontSize = [this.bismallahFontSize]
    this.headerPos = ['top']
    this.headerHeight = [this.bismallahFontSize]

    if (inTheNameOfAllah.toString().localeCompare(bismallah) !== 0) {
      this.headerText.push(inTheNameOfAllah)
      this.headerFontSize.push(this.fontSize)
      this.headerPos.push('top')
      this.headerHeight.push(this.fontSize * 1.25)
    }

    this.posY = 0// SCREEN_MARGIN_Y / 2
    this.nextIconSrc = 'next.png'
    this.nextIconSize = 64
    this.nextPage = 'page/select'
  }

  updateStatus (status) {
    this.status.setProperty(hmUI.prop.TEXT, status)
  }

  ready () {
    this.status.setProperty(hmUI.prop.VISIBLE, false)
    this.next.setProperty(hmUI.prop.VISIBLE, true)
  }
}
