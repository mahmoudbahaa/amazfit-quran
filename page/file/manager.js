/* global Page */
import { resetPageBrightTime, setPageBrightTime } from 'zeppos-cross-api/display';
import hmUI from 'zeppos-cross-api/ui';
import { getLastPath, setLastPath } from '../../lib/config/default';
import { _ } from '../../lib/i18n/lang';
import { FsTools, Path } from '../../lib/mmk/Path';
import {
  SCREEN_HEIGHT, SCREEN_MARGIN_X, SCREEN_MARGIN_Y, WIDGET_WIDTH,
} from '../../lib/mmk/UiParams';
import { openPage } from '../../lib/utils';

class FileManagerScreen {
  constructor(params) {
    this.maxItems = 16;

    this.editPath = null;
    this.content = [];
    this.rows = [];

    this.showFileSizes = true; // = config.get('fmShowSizes', false)

    let currentPath = FsTools.fullAssetPath('');
    const lastPath = getLastPath();
    if (params.path) {
      currentPath = params.path;
    } else if (lastPath) {
      currentPath = lastPath;
    }

    this.entry = new Path('full', currentPath);
  }

  finish() {
    resetPageBrightTime();
  }

  start() {
    setPageBrightTime({
      brightTime: 60000,
    });

    hmUI.setStatusBarVisible(false);

    this.viewFiles = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
      x: SCREEN_MARGIN_X,
      y: 0,
      w: WIDGET_WIDTH,
      h: SCREEN_HEIGHT,
      item_space: 8,
      item_config: [
        {
          // Header
          type_id: 1,
          item_height: SCREEN_MARGIN_Y,
          item_bg_color: 0x0,
          item_bg_radius: 0,
          text_view: [{
            x: SCREEN_MARGIN_Y > 80 ? 4 : 56,
            y: SCREEN_MARGIN_Y > 80 ? 48 : 22,
            w: WIDGET_WIDTH - (SCREEN_MARGIN_Y > 80 ? 0 : 56),
            h: 32,
            key: 'title',
            color: 0xEEEEEE,
            text_size: 18,
          }],
          text_view_count: 1,
          image_view: [{
            x: SCREEN_MARGIN_Y > 80 ? Math.floor((WIDGET_WIDTH - 24) / 2) : (WIDGET_WIDTH > 200 ? 32 : 12),
            y: SCREEN_MARGIN_Y > 80 ? 24 : 24,
            w: 24,
            h: 24,
            key: 'icon',
          }],
          image_view_count: 1,
        },
        {
          // File row without size
          type_id: 2,
          item_height: 64,
          item_bg_color: 0x111111,
          item_bg_radius: 12,
          text_view: [{
            x: 44,
            y: 0,
            w: WIDGET_WIDTH - 48,
            h: 64,
            key: 'name',
            color: 0xffffff,
            text_size: 22,
          }],
          text_view_count: 1,
          image_view: [{
            x: 30,
            y: 20,
            w: 24,
            h: 24,
            key: 'icon',
          }],
          image_view_count: 1,
        },
        {
          // File row with size
          type_id: 3,
          item_height: 64,
          item_bg_color: 0x111111,
          item_bg_radius: 12,
          text_view: [
            {
              x: 44,
              y: 0,
              w: WIDGET_WIDTH - 48,
              h: 32,
              key: 'name',
              color: 0xffffff,
              text_size: 22,
            },
            {
              x: 44,
              y: 32,
              w: WIDGET_WIDTH - 48,
              h: 24,
              key: 'size',
              color: 0xAAAAAA,
              text_size: 20,
            },
          ],
          text_view_count: 2,
          image_view: [{
            x: 30,
            y: 20,
            w: 24,
            h: 24,
            key: 'icon',
          }],
          image_view_count: 1,
        },
      ],
      item_config_count: 3,
      item_click_func: (_, i) => this.onRowClick(i),
      data_type_config: [],
      data_type_config_count: 0,
      data_array: [],
      data_count: 0,
    });

    // Run
    this.applyPathEntry(this.entry);
  }

  modify(path) {
    openPage('page/file/edit', path);
  }

  applyPathEntry(entry) {
    this.entry = entry;
    this.refresh();
    setLastPath(entry.absolutePath);
  }

  getFileIcon(path) {
    if (path.endsWith('.png')) {
      return 'files/img.png';
    }

    if (path.endsWith('.txt')) {
      return 'files/text.png';
    }

    if (path.endsWith('.js') || path.endsWith('.json')) {
      return 'files/code.png';
    }

    return 'files/file.png';
  }

  refresh() {
    const dirContent = this.entry.list();

    const folders = [];
    const files = [];

    if (this.entry.absolutePath !== '/storage') {
      folders.push({
        name: '..',
        icon: 'files/up.png',
        size: '',
      });
    }

    for (let i = 0; i < Math.min(dirContent.length, this.maxItems); i++) {
      const fn = dirContent[i];
      const item = this.entry.get(fn);
      const isFolder = item.isFolder();
      const row = {
        name: fn,
        icon: isFolder ? 'files/folder.png' : this.getFileIcon(fn),
        size: isFolder ? _('Folder') : _('File'),
      };

      if (!isFolder && this.showFileSizes) {
        try {
          const st = item.stat();
          if (st !== undefined && st.size) {
            row.size = FsTools.printBytes(st.size);
          }
        } catch (_) {}
      }

      if (isFolder) {
        folders.push(row);
      } else {
        files.push(row);
      }
    }

    folders.sort(this._sortFnc);
    files.sort(this._sortFnc);

    this.contents = [
      {
        title: this.entry.absolutePath,
        icon: 'menu/context.png',
        isContext: true,
      },
      ...folders,
      ...files,
    ];

    this.contents.push(dirContent.length > this.maxItems
      ? {
        title: '',
        icon: 'menu/expand.png',
        // @ts-ignore
        isExpand: true,
      }
      : {
        title: '',
        icon: '',
      });

    this.viewFiles.setProperty(hmUI.prop.UPDATE_DATA, {
      data_type_config: [
        {
          start: 0,
          end: 0,
          type_id: 1,
        },
        {
          start: 1,
          end: this.contents.length - 2,
          type_id: this.showFileSizes ? 3 : 2,
        },
        {
          start: this.contents.length - 1,
          end: this.contents.length - 1,
          type_id: 1,
        },
      ],
      data_type_config_count: 3,
      data_array: this.contents,
      data_count: this.contents.length,
      on_page: 1,
    });
  }

  onRowClick(i) {
    if (!this.contents[i]) {
      return;
    }

    if (this.contents[i].isContext) {
      return this.modify(this.entry.absolutePath);
    }

    if (this.contents[i].isExpand) {
      this.maxItems += 50;
      return this.refresh();
    }

    const val = this.contents[i].name;

    let path = this.entry.absolutePath;
    if (val === '..') {
      path = path.substring(0, path.lastIndexOf('/'));
    } else {
      path = path + '/' + val;
    }

    const entry = new Path('full', path);
    if (entry.isFolder()) {
      this.applyPathEntry(entry);
    } else {
      this.modify(path);
    }
  }

  _sortFnc(a, b) {
    return a.name < b.name ? -1 : 1;
  }
}

let screen;
Page({
  onInit(p) {
    let params = {};
    if (typeof p === 'string' && p[0] === '{') {
      params = JSON.parse(p);
    }

    hmUI.setLayerScrolling(false);
    screen = new FileManagerScreen(params);
    screen.start();
  },
  onDestroy() {
    screen.finish();
  },
});
