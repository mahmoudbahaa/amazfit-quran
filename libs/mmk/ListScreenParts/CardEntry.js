import * as hmUI from '@zos/ui';
import {SCREEN_MARGIN_X, WIDGET_WIDTH} from "../UiParams";

export class CardEntry {
    constructor(config, screen, positionY) {
        this.screen = screen;
        this.positionY = positionY;
        this._eventsBlock = null;
        this._swipeX = 0;
        this.config = {
			color: 0x111111,
			offsetX: 0,
			radius: 8,
			width: WIDGET_WIDTH,
            hiddenIcon: null,
			...config
		};
    }

    _init() {
        this.group = this.screen.vc.createWidget(hmUI.widget.GROUP, this._groupConfig);
		this.bg = this.group.createWidget(hmUI.widget.FILL_RECT, this._bgConfig);

        if (this.config.callback) {
            this.group.addEventListener(hmUI.event.CLICK_UP, () => {
                this.config.callback();
            })
        }
    }

    get _groupConfig() {
        return {
			x: SCREEN_MARGIN_X, //+ this._swipeX ,//+ this.config.offsetX,
			y: this.positionY,
			w: this.config.width,
			h: this.config.height
		};
    }

    get _bgConfig() {
        return {
			x: -SCREEN_MARGIN_X,
			y: 0,
			w: this.config.width + SCREEN_MARGIN_X * 2,
			h: this.config.height,
			color: this.config.color,
			radius: this.config.radius,
		};
    }

    get viewHeight() {
        if(this.config.dontChangePosY) return 0;
        return this.config.height;
    }
}