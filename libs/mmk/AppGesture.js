import { getDeviceInfo } from '@zos/device';
import { onGesture, GESTURE_UP, GESTURE_LEFT, GESTURE_RIGHT, GESTURE_DOWN } from '@zos/interaction';
import { scrollTo } from '@zos/page';
import { back } from '@zos/router';
import * as hmUI from '@zos/ui';

const info = getDeviceInfo();
const _events = {}
const _evMapping = {
	"up": GESTURE_UP,
	"left": GESTURE_LEFT,
	"right": GESTURE_RIGHT,
	"down": GESTURE_DOWN,
}

export class AppGesture {
	/**
	 * Register this instance. Must be called in onInit
	 */
	static init() {
		onGesture((e) => {
			return _events[e] ? _events[e]() : false;
		});
	}

	/**
	 * Add event listener, ex. AppGesture.on("left", () => {...})
	 */
	static on(event, action) {
		_events[_evMapping[event]] = action;
	}

	static withHighLoadBackWorkaround() {
		AppGesture.on("right", () => {
			scrollTo(0);
			hmUI.createWidget(hmUI.widget.FILL_RECT, {
				x: 0,
				y: 0,
				w: info.width,
				h: info.height,
				color: 0x0
			});
			setTimeout(() => back(), 350);
			return true;
		})
	}

	/**
	 * Reload page after two swipes in selected direction
	 */
	static withYellowWorkaround(event, startReq) {
		let lastSwipe = 0;
		let count = 0;
		AppGesture.on(event, () => {
			if(Date.now() - lastSwipe > 1000)
				count = 1;

			if(count == 3) {
				console.log("Reloading with params", startReq);
				hmApp.startApp(startReq,);
				return;
			}

			count++;
			lastSwipe = Date.now();
			return true;
		});
	}
}