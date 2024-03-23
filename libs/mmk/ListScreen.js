import * as hmUI from '@zos/ui';
import {
	BASE_FONT_SIZE,
	ICON_SIZE_SMALL,
	SCREEN_MARGIN_X,
	SCREEN_MARGIN_Y,
	SCREEN_WIDTH,
	WIDGET_WIDTH
} from "./UiParams";
import {CardEntry} from "./ListScreenParts/CardEntry";
import {RowEntry} from "./ListScreenParts/RowEntry";
import {DataFieldEntry} from "./ListScreenParts/DataFieldEntry";
import {TextEntry} from "./ListScreenParts/TextEntry";
import { DEVICE_WIDTH } from '../utils';


export class ListScreen {
	constructor() {
		this._init();
	}

	_init() {
		this.positionY = SCREEN_MARGIN_Y;
		this.fontSize = BASE_FONT_SIZE;
		this.accentColor = 0x123456;
		this.entries = [];
		this.vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER);
	}

	build() {}

	clear() {
		hmUI.deleteWidget(this.vc);
		this._init();
	}

	headline(text) {
		const lineHeight = Math.floor(BASE_FONT_SIZE * 1.5);
		const config = {
			x: SCREEN_MARGIN_X + 4,
			w: WIDGET_WIDTH - 8,
			h: lineHeight,
			color: this.accentColor,
			align_v: hmUI.align.CENTER_V,
			y: this.positionY,
			text_size: BASE_FONT_SIZE - 4,
			text
		};
		const widget = vc.createWidget(hmUI.widget.TEXT, config);
		const entry = {
			widget,
			viewHeight: lineHeight,
			positionY: this.positionY,
		};

		this._registerRow(entry);
		return entry;
	}

	offset(height = SCREEN_MARGIN_Y) {
		const config = {
			x: 0,
			y: this.positionY,
			w: SCREEN_WIDTH,
			h: height
		};

		const entry = {
			widget: vc.createWidget(hmUI.widget.IMG, config),
			positionY: this.positionY,
			viewHeight: height,
		};

		this._registerRow(entry);
		return entry;
	}

	text(userConfig) {
		return this._classBasedEntry(TextEntry, userConfig);
	}

	checkboxRow(config) {
		let value = !!config.value;

		const row = this.row({
			...config,
			callback: () => {
				value = !value;
				row.iconView.setProperty(hmUI.prop.SRC, 
					value ? config.iconTrue : config.iconFalse);
				config.callback(value);
			}
		});

		row.iconView.setProperty(hmUI.prop.SRC, value ? config.iconTrue : config.iconFalse);
		return row;
	}

	image(config) {
		const card = this.card({height: config.height + 8, color: 0});
		card.image = card.group.createWidget(hmUI.widget.IMG, {
			x: 0,
			y: 0,
			w: config.width,
			h: config.height,
			auto_scale: config.auto_scale,
			src: config.src
		});
		return card;
	}

	toggleGroup(config) {
		let value = config.value;

		const views = [];

		const callback = (row) => {
			value = row.value;
			for(let i of views)
				i.iconView.setProperty(hmUI.prop.SRC, 
					value === i.value ? config.iconTrue : config.iconFalse);
			config.callback(value);
		};

		for(const item of config.options) {
			const row = this.row({
				text: item.name,
				icon: value === item.value ? config.iconTrue : config.iconFalse,
				callback
			});
			row.value = item.value;
			views.push(row);
		}
	}

	row(userConfig) {
		return this._classBasedEntry(RowEntry, userConfig);
	}

	field(userConfig) {
		return this._classBasedEntry(DataFieldEntry, userConfig);
	}

	card(userConfig) {
		return this._classBasedEntry(CardEntry, userConfig);
	}

	moreButton(userConfig) {
		const more = vc.createWidget(hmUI.widget.BUTTON, {
			x: 0,
			w: DEVICE_WIDTH,
			h: 64,
			...userConfig,
			y: this.positionY,
			click_func: () => {
				userConfig.callback();
				hmUI.deleteWidget(more);
			}
		})
	}

	_classBasedEntry(ClassEntry, userConfig) {
		const entry = new ClassEntry(userConfig, this, this.positionY);
		entry._init();
        this._registerRow(entry);
		return entry;
	}

	_registerRow(data) {
		data._lastHeight = data.viewHeight;
		data._index = this.entries.length;
		this.entries.push(data);
		this.positionY += data.viewHeight;
	}

	get baseRowHeight() {
		if(this.fontSize !== this._brh_lastheight) {
			this._brh_lastheight = this.fontSize
			this._brh_cached = hmUI.getTextLayout(" ", {
				text_size: this.fontSize,
				text_width: 96,
			}).height + 18;
		}
		return this._brh_cached;
	}
}
