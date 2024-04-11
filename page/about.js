/* global Page */
import { px } from 'zeppos-cross-api/utils'
import { _, isRtlLang } from '../lib/i18n/lang'
import { BaseAboutScreen } from '../lib/mmk/BaseAboutScreen'

const majorVersion = 1
const minorVersion = 0

Page({

  build () {
    new AboutScreen().start()
  }
})

class AboutScreen extends BaseAboutScreen {
  constructor () {
    super()
    this.rtl = isRtlLang()
    this.appName = `${_('Quran App')}`
    this.version = `(${_(majorVersion)}${_('.')}${_(minorVersion)})`
    this.infoRows = [
      [_('Mahmoud Bahaa'), _('Developer')]
    ]
    this.infoHeaderWidth = px(170)

    this.iconSize = px(128)
    this.fontSize = px(24)
    this.bismallahFontSize = px(64)

    const bismallah = '﷽'
    const inTheNameOfAllah = _('In The name of Allah')
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
  }
}
