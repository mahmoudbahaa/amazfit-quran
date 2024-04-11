/* global Page */
import { back } from 'zeppos-cross-api/router'
import {
  getClipboard,
  getImageViewTempFile,
  getPasteMode,
  setClipboard,
  setImageViewTempFile, setPasteMode
} from '../../lib/config/default'
import { _ } from '../../lib/i18n/lang'
import { ListScreen } from '../../lib/mmk/ListScreen'
import { FsTools, Path } from '../../lib/mmk/Path'
import { openPage } from '../../lib/utils'

class FileEditScreen extends ListScreen {
  constructor (data) {
    super()
    this.entry = new Path('full', data)
  }

  start () {
    const path = this.entry.absolutePath

    // Stats
    this.headline(_('Location'), path)

    let fileSize = 0
    try {
      const st = this.entry.stat()
      if (st.size) {
        this.headline(_('Size'), FsTools.printBytes(st.size))
        fileSize = st.size
      }
    } catch (e) {}

    // Open btns
    if (fileSize > 0) {
      if (path.endsWith('.png') || path.endsWith('.tga')) {
        this.row({
          text: _('View as image'),
          icon: 'menu/file_png.png',
          card: { callback: () => openPage('page/file/view/image', this.prepareTempFile()) }
        })
      } else {
        this.row({
          text: _('View as text'),
          icon: 'menu/file_txt.png',
          card: { callback: () => openPage('page/file/view/text', path) }
        })
      }

      this.row({
        text: _('View as binary'),
        icon: 'menu/file_base.png',
        card: { callback: () => openPage('page/file/view/hex', path) }
      })
    }

    if (this.path === '/storage') return

    if (this.canEdit()) {
      this.buildEditRows(fileSize)
    } else {
      this.text({ text: _('To edit this file/folder, unlock "Danger features" in app settings') })
    }

    this.finalize()
  }

  buildEditRows (fileSize) {
    this.headline(_('Edit...'))
    if (this.canPaste() && fileSize === 0) {
      this.row({
        text: _('Paste'),
        icon: 'menu/paste.png',
        callback: () => {
          this.doPaste()
        }
      })
    }

    this.row({
      text: _('Cut'),
      icon: 'menu/cut.png',
      callback: () => {
        this.pathToBuffer(true)
      }
    })
    this.row({
      text: _('Copy'),
      icon: 'menu/copy.png',
      callback: () => {
        this.pathToBuffer(false)
      }
    })
    this.row({
      text: _('Delete'),
      icon: 'menu/delete.png',
      callback: () => {
        this.delete()
      }
    })
  }

  canEdit () {
    const editablePaths = [
      '/storage/js_apps',
      '/storage/js_watchfaces'
    ]

    for (const ep of editablePaths) {
      if (this.entry.absolutePath.startsWith(ep)) { return true }
    }

    return false
  }

  delete () {
    this.entry.removeTree()
    back()
  }

  canPaste () {
    const val = getClipboard()
    if (!val) return false

    const st = new Path('full', val).stat()
    return st === undefined && !this.entry.absolutePath.startsWith(val) && this.entry.absolutePath !== val
  }

  doPaste () {
    const src = getClipboard()
    const deleteSource = getPasteMode() === 'cut'
    const filename = src.substring(src.lastIndexOf('/'))
    const dest = this.entry.get(filename)

    new Path('full', src).copyTree(dest, deleteSource)
    if (deleteSource) setClipboard('')
    back()
  }

  pathToBuffer (deleteSource) {
    setClipboard(this.entry.absolutePath)
    setPasteMode(deleteSource ? 'cut' : 'copy')
    back()
  }

  prepareTempFile (sourcePath) {
    const current = getImageViewTempFile()
    if (current) {
      new Path('assets', current).remove()
    }

    // const data = FsUtils.read(sourcePath);
    const newFile = 'temp_' + Math.round(Math.random() * 100000) + '.png'
    const dest = new Path('assets', newFile)
    this.entry.copy(dest)

    setImageViewTempFile(newFile)
    return newFile
  }
}

Page({
  onInit (p) {
    new FileEditScreen(p).start()
  }
})
