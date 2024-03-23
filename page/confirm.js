import { createWidget, widget, prop, align } from '@zos/ui'
import { back, replace } from "@zos/router";
import { log } from '@zos/utils';

const logger = log.getLogger("confirm.page");

Page({

    onCreate(e) {
        logger.log("confirm page on create invoke");
    },

    onInit() {
        logger.log("confirm page on init invoke");
    },

    onShow() {
        logger.log("confirm page on show invoke");
    },

    onHide() {
        logger.log("confirm page on hide invoke");
    },
    onDestroy() {
        logger.log("confirm page on destroy invoke");
    },

    build() {
        const dialog = createWidget(widget.DIALOG, {
            ok_text: 'OK',
            cancel_text: 'CANCEL'
        })
        dialog.setProperty(prop.MORE, {
            text: 'Surah not found. Download ?',
            content_text_size: 40,
            content_bg_color: 0x000000,
            content_text_color: 0xffffff,
            dialog_align_h: align.CENTER_H,
            content_text_align_h: align.CENTER_H,
            content_text_align_v: align.CENTER_V,
            ok_func: () => {
                console.log('OK')
                getApp()._options.globalData.isDownloadTransfer = true;

                replace({
                    url: 'page/download',
                });
            },
            cancel_func: () => {
                console.log('CANCEL')
                back();
            }
        })
        dialog.setProperty(prop.SHOW, true)
    }
})