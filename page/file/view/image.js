/* global Page */
import { O_RDONLY, openAssetsSync, readSync } from '@zos/fs'
import { showToast } from '@zos/interaction'
import hmUI from '@zos/ui'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../libs/mmk/UiParams'

class ImageViewScreen {
  constructor (data) {
    this.path = data
  }

  start () {
    // Read TGA image header
    const fd = openAssetsSync({ path: this.path, flag: O_RDONLY })
    const header = new Uint8Array(18)
    readSync({
      fd,
      buffer: header.buffer,
      options: {
        position: 0,
        offset: 0,
        length: 18
      }
    })

    const width = (header[13] << 8) + header[12]
    const height = (header[15] << 8) + header[14]

    showToast({ content: width + 'x' + height })

    hmUI.createWidget(hmUI.widget.IMG, {
      x: Math.max(0, Math.floor((SCREEN_WIDTH - width) / 2)),
      y: Math.max(0, Math.floor((SCREEN_HEIGHT - height) / 2)),
      src: this.path
    })
  }
}

Page({
  onInit (p) {
    new ImageViewScreen(p).start()
  }
})
