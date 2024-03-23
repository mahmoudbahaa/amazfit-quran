import * as hmUI from '@zos/ui';
import {CardEntry} from "./CardEntry";
import {ICON_SIZE_SMALL, WIDGET_WIDTH} from "../UiParams";

export class RowEntry extends CardEntry {
    constructor(config, screen, positionY) {
        super(config.card ? config.card : {}, screen, positionY);
        this.rowConfig = {
			color: 0xFFFFFF,
			fontSize: this.screen.fontSize,
            ...config,
        };

        this.config.height = this.rowViewHeight;
    }

    _init() {
        super._init();

		this.textView = this.group.createWidget(hmUI.widget.TEXT, this._textViewConfig);

        if (this.rowConfig.iconText) {
            this.iconView = this.group.createWidget(hmUI.widget.TEXT, this._iconViewConfig);
        } else {
            this.iconView = this.group.createWidget(hmUI.widget.IMG, this._iconViewConfig);
        }

        if(this.rowConfig.description)
            this.descView = this.group.createWidget(hmUI.widget.TEXT, this._descrViewConfig);
    }

    get _iconWidth() {
        return this.config.iconWidth === undefined ? ICON_SIZE_SMALL : this.config.iconWidth;
    }

    get _iconViewConfig() {


        const offsetX = Math.floor(this._iconWidth / 2);
        const x = this.rowConfig.rtl ?  this.textWidth - offsetX : offsetX;

        if (this.rowConfig.iconText) {
            return {
                x,
                y: Math.floor((this.rowViewHeight - this._iconWidth) / 2),
                w: this._iconWidth,
                text: this.rowConfig.iconText,
                align_h: this.rowConfig.iconAlignH,
                color: 0xFFFFFF,
            }
        } else {
            return {
                x,
                y: Math.floor((this.rowViewHeight - this._iconWidth) / 2),
                src: this.rowConfig.icon
            }
        }
    }

    get _textViewConfig() {
        return {
			x: this.textX,
			y: 9,
			w: this.textWidth,
			// h: this.rowViewHeight - 36,
			align_h: this.rowConfig.alignH,
			text_style: hmUI.text_style.WRAP,
			text_size: this.rowConfig.fontSize,
			color: this.rowConfig.color,
			text: this.rowConfig.text
		}
    }

   get _descrViewConfig() {
        return {
            x: this.textX,
            y: 9 + this.textHeight,
            w: this.textWidth,
            // h: this.rowViewHeight - 36,
            align_h: this.rowConfig.alignH,
            text_style: hmUI.text_style.WRAP,
            text_size: this.rowConfig.fontSize - 2,
            color: 0x999999,
            text: this.rowConfig.description
        }
    }

    get textX() {
        const textX = this._iconWidth * 2;
        return this.rowConfig.rtl ?  0 : textX;
    }

    get textWidth() {
		return (this.config.width ? this.config.width : WIDGET_WIDTH) - (this._iconWidth * 2) - 8;
    }

    get textHeight() {
        const { height } = hmUI.getTextLayout(this.rowConfig.text, {
            text_size: this.rowConfig.fontSize,
            text_width: this.textWidth
        });
        return height;
    }

    get descriptionHeight() {
        if(!this.rowConfig.description) return 0;
        const { height } = hmUI.getTextLayout(this.rowConfig.description, {
            text_size: this.rowConfig.fontSize - 2,
            text_width: this.textWidth
        });
        return height;
    }

    get rowViewHeight() {
        return Math.max(this.screen.baseRowHeight, this.textHeight + this.descriptionHeight + 18);
    }
}