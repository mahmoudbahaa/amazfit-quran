import * as hmUI from '@zos/ui';
export class TouchEventManager {
	constructor(widget) {
		this.ontouch = null;
		this.onlongtouchrepeatly = null;
		this.ontouchdown = null;
		this.ontouchup = null;
		this.ontouchmove = null;
		this._init(widget);
	}

	_init(widget) {
		let handleClick = true;
		let timeOutLongTap = -1;
		let intervalLongTap = -1;
		let startX = 0;
		let startY = 0;

		widget.addEventListener(hmUI.event.CLICK_UP, (e) => {
			if(this.ontouchup) this.ontouchup(e);
			if(handleClick && this.ontouch) this.ontouch(e);

			handleClick = false;
			startX = e.x;
			startY = e.y;
			clearTimeout(timeOutLongTap);
			clearInterval(intervalLongTap);
		});

		widget.addEventListener(hmUI.event.CLICK_DOWN, (e) => {
			if(this.ontouchdown) this.ontouchdown(e);

			handleClick = true;
			const repeatFunc = () => {
				if(handleClick && this.onlongtouch) {
					this.onlongtouch(e);
					handleClick = false;
				}

				if(this.onlongtouchrepeatly) 
					this.onlongtouchrepeatly(e);
			};

			timeOutLongTap = setTimeout(() => {
				repeatFunc();
				intervalLongTap = setInterval(repeatFunc, 150);	
			}, 750);
		});

		widget.addEventListener(hmUI.event.MOVE, (e) => {
			if(this.ontouchmove) this.ontouchmove(e);
			
			if(Math.abs(e.x - startX) + Math.abs(e.y - startY) > 3) {
				handleClick = false;
				clearTimeout(timeOutLongTap);
				clearInterval(intervalLongTap);
			}
		})
	}
}