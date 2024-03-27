/* global */
import { settingsLib } from '@zeppos/zml/base-side'

// const logger = Logger.getLogger('settings-module')

export const settingsModule = {
  getSettings (req) {
    let lang = settingsLib.getItem('lang')
    const recitation = settingsLib.getItem('recitation') || 'Mishari Rashid al-`Afasy,7'
    lang = lang
      ? {
          name: lang.split(',')[0],
          isoCode: lang.split(',')[1]
        }
      : undefined

    this.call({
      success: true,
      req,
      settings: {
        lang,
        recitation
      }
    })
  }
}
