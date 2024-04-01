/* global getApp, Page */
import { px } from '@zos/utils'
import { BaseAboutScreen } from '../libs/mmk/BaseAboutScreen'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { StartPage } from './start'
import { getRows } from '../components/chaptersList'
import hmUI from '@zos/ui'
import { SCREEN_MARGIN_X, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import { createSwitch } from '../components/switch'
import { getAutoStart, setAutoStart } from '../libs/storage/localStorage'
import { push } from '@zos/router'

const majorVersion = 1
const minorVersion = 0

const lang = DEVICE_LANG()
Page(
  StartPage({
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
        this.state.about.ready(true)
      }, 50)
    },

    build () {
      this.state.about = new AboutScreen()
      this.state.about.start()
      if (getApp()._options.globalData.appStarting) {
        getApp()._options.globalData.appStarting = false
        this.state.about.updateStatus('Getting Settings...')
        setTimeout(() => this.getSideAppSettings(), 50)
      } else {
        this.state.about.ready()
      }
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
      // [_('Mahmoud Bahaa', lang), _('Developer', lang)]
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

  start () {
    super.start()
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: this.posY,
      w: SCREEN_WIDTH / 2 - SCREEN_MARGIN_X / 4,
      h: px(56),
      align_h: this.rtl ? hmUI.align.LEFT : hmUI.align.RIGHT,
      align_v: hmUI.align.CENTER_V,
      text: _('Auto Start'),
      text_size: this.fontSize,
      color: 0xFFFFFF
    })
    this.autoStart = createSwitch(
      SCREEN_WIDTH / 2 + SCREEN_MARGIN_X / 4,
      this.posY,
      !!getAutoStart(),
      (slideSwitch, checked) => {
        setAutoStart(checked)
      })
  }

  ready (autoStart = false) {
    this.status.setProperty(hmUI.prop.VISIBLE, false)
    this.next.setProperty(hmUI.prop.VISIBLE, true)
    if (autoStart && getAutoStart()) {
      push({
        url: this.nextPage
      })
    }
  }
}
