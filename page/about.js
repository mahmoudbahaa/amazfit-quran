/* global Page */
import { log, px } from '@zos/utils'
import { setWakeUpRelaunch } from '@zos/display'
import { BaseAboutScreen } from '../libs/mmk/BaseAboutScreen'
import { _, DEVICE_LANG, isRtlLang } from '../libs/i18n/lang'
import { SCREEN_HEIGHT, SCREEN_MARGIN_Y, SCREEN_WIDTH } from '../libs/mmk/UiParams'
import hmUI from '@zos/ui'

const logger = log.getLogger('about.page')
const majorVersion = 0
const minorVersion = 1
const fonts = ['471btehran.ttf', 'ah-moharram-bold.ttf', 'al-gemah-alhoda.ttf', 'al-majd.ttf', 'albayan.ttf', 'algeria.ttf', 'alhorr.ttf', 'alhurra.ttf', 'almawadah.ttf', 'almushaf.ttf', 'alnaqaa.ttf', 'alqusair.ttf', 'alshohadaa.ttf', 'amiri-bold.ttf', 'amiri-quran.ttf', 'amiri-regular.ttf', 'amiri-slanted.ttf', 'aqeeq.ttf', 'arabswell-1.ttf', 'aref-ruqaa.ttf', 'arwa.ttf', 'asmaa.ttf', 'assaf.ttf', 'aures.ttf', 'b-compset.ttf', 'b-hamid.ttf', 'b-sepideh.ttf', 'b-sepideh_1.ttf', 'baghdad.ttf', 'bahij.ttf', 'BArabics.ttf', 'baran.ttf', 'Basim-Marah-Beh-Light.ttf', 'bdavat.ttf', 'bedayah.ttf', 'bein.ttf', 'bein-normal.ttf', 'bokra.ttf', 'bon.ttf', 'boutros-ads.ttf', 'cairo.ttf', 'cairo-bold.ttf', 'cairo-extra-light.ttf', 'cairo-light.ttf', 'DecoType-Thuluth.ttf', 'diana-light.ttf', 'diana-regular.ttf', 'Diwani-Bent.ttf', 'Diwanltr.ttf', 'droid-sans.ttf', 'DroidKufi-Regular.ttf', 'DroidNaskh-Regular.ttf', 'elmessiri-bold.ttf', 'elmessiri-light.ttf', 'esfahan.ttf', 'Fanni.ttf', 'fantezy.ttf', 'farsi-simple-bold.ttf', 'fixed-kufi.ttf', 'flat-jooza-regular.ttf', 'ghala.ttf', 'ghala-bold.ttf', 'hala.ttf', 'hama-regular.ttf', 'Hamada_light_font.ttf', 'harmattan.ttf', 'hayah.ttf', 'helal.ttf', 'homa.ttf', 'Ibtisam.ttf', 'insan.ttf', 'ishraq.ttf', 'israr-syria.ttf', 'jannat.ttf', 'jazeera.ttf', 'jazeera-light.ttf', 'jomhuria.ttf', 'jooza-regular.ttf', 'jordan.ttf', 'kacst-farsi.ttf', 'kamran.ttf', 'katibeh.ttf', 'KawkabMono-Regular.ttf', 'Kitab-Regular.ttf', 'kufi.ttf', 'lamar.ttf', 'lateef.ttf', 'lemonada.ttf', 'lemonada-bold.ttf', 'lemonada-light.ttf', 'mada.ttf', 'mada-bold.ttf', 'mada-light.ttf', 'maghrebi.ttf', 'maidan.ttf', 'mbc.ttf', 'me_quran2.ttf', 'me_quranR3HOQ.ttf', 'milano.ttf', 'mirza.ttf', 'mirza-bold.ttf', 'mirza-medium.ttf', 'motairah.ttf', 'motairah-light.ttf', 'motken.ttf', 'muslimah.ttf', 'nawar.ttf', 'neckar.ttf', 'neckar-bold.ttf', 'neckar_1.ttf', 'noorehuda.ttf', 'noto-urdu.ttf', 'Old-Antic-Bold.ttf', 'old-antic-decorative.ttf', 'omar.ttf', 'osama.ttf', 'rabat.ttf', 'rakkas.ttf', 'rawi.ttf', 'rawy-bold.ttf', 'rawy-thin.ttf', 'reem-kufi.ttf', 'rsail.ttf', 'rsail-bold.ttf', 'rsail-light.ttf', 'rsail_1.ttf', 'rustam_quranR3HOQ.ttf', 'sabgha.ttf', 'sadiyah.ttf', 'sahlnaskh-regular.ttf', 'sara.ttf', 'saudi.ttf', 'setareh.ttf', 'shahd.ttf', 'shahd-bold.ttf', 'shams.ttf', 'sheba.ttf', 'shekari.ttf', 'shiraz.ttf', 'shorooq.ttf', 'sky.ttf', 'sky-bold.ttf', 'smartman.ttf', 'spirit-of-doha.ttf', 'stc.ttf', 'stoor.ttf', 'strick.ttf', 'Sukar-Black.ttf', 'Sukar-Bold.ttf', 'Sukar-Regular.ttf', 'tachkili.ttf', 'taha-naskh.ttf', 'tanseek.ttf', 'taqniya.ttf', 'tasmeem-med.ttf', 'Thabit.ttf', 'thameen.ttf', 'themixarab.ttf', 'thuluth-decorated.ttf', 'toyor-aljanah.ttf', 'UthmanicHafs1-ver09.otf', 'UthmanicHafs1-ver13.otf', 'UthmanTN1_Ver06.otf', 'vip-hakm.ttf', 'vip-hakm-bold.ttf', 'vip-hakm-thin.ttf', 'vip-tim.ttf', 'vip-tim-black.ttf', 'vip-tim-bold.ttf', 'vip-tim-light.ttf', 'yaraa.ttf', 'yaraa-regular.ttf', 'yassin.ttf', 'zahra.ttf', 'zahra-bold.ttf']
const aya = 'وَاتَّقُوا يَوْمًا تُرْجَعُونَ فِيهِ إِلَى اللَّهِ ۖ ثُمَّ تُوَفَّىٰ كُلُّ نَفْسٍ مَّا كَسَبَتْ وَهُمْ لَا يُظْلَمُونَ'
let fontIdx = 0
const minFontIdx = 0
const maxFontIdx = 59

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
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 0,
      y: 100,
      w: SCREEN_WIDTH / 2,
      h: 40,
      text: 'previous',
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      click_func: () => {
        if (fontIdx <= minFontIdx) return
        fontIdx--
        redraw()
      }
    })

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: SCREEN_WIDTH / 2,
      y: 100,
      w: SCREEN_WIDTH / 2,
      h: 40,
      text: 'next',
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      click_func: () => {
        if (fontIdx >= maxFontIdx) return
        fontIdx++
        redraw()
      }
    })

    draw()
  }
})

let label
let text
function draw () {
  label = hmUI.createWidget(hmUI.widget.TEXT, {
    x: px(50),
    y: px(150),
    w: SCREEN_WIDTH - px(100),
    h: 30,
    color: 0xFFFFFF,
    text_size: 24,
    text: fonts[fontIdx]
  })

  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: px(50),
    y: px(220),
    w: SCREEN_WIDTH - px(100),
    h: SCREEN_HEIGHT * 2,
    color: 0x004400
  })

  text = hmUI.createWidget(hmUI.widget.TEXT, {
    x: px(50),
    y: px(220),
    w: SCREEN_WIDTH - px(100),
    h: SCREEN_HEIGHT * 2,
    color: 0xFFFFFF,
    font: 'fonts/' + fonts[fontIdx],
    text_size: px(48),
    text_style: hmUI.text_style.WRAP,
    align_h: hmUI.align.CENTER_H,
    text: aya
  })
}
function redraw () {
  label.setProperty(hmUI.prop.TEXT, fonts[fontIdx])
  text.setProperty(hmUI.prop.MORE, { font: 'fonts/' + fonts[fontIdx] })
}
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
