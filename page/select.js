/* global getApp, Page */
import { log } from '@zos/utils'
import { createLoadingWidget } from '../components/loadingWidget'
import { ChaptersScreen } from '../components/chaptersList'
import { SelectPage } from './start'

const logger = log.getLogger('select.page')

Page(
  SelectPage({
    createWidgets () {
      logger.log('Inside Create Widgets')
      new ChaptersScreen(this.state.rtl).start()
    },

    build () {
      createLoadingWidget()

      if (getApp()._options.globalData.settings) {
        setTimeout(() => this.onSettings(), 50)
      } else {
        this.getSideAppSettings()
      }

      // setRecitation('Mishari Rashid al-`Afasy,7,0')
      // setChapters(CHAPTERS)
      // this.createWidgets()
    }
  })
)
