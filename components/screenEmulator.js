import { getScrollTop } from 'zeppos-cross-api/page';
import { createWidget, prop, widget } from 'zeppos-cross-api/ui';
import { IS_ROUND, SCREEN_HEIGHT, SCREEN_WIDTH } from '../lib/mmk/UiParams';

const NOOP = true;
export function createEmulatorScreen() {
  if (NOOP || !IS_ROUND) {
    return;
  }

  const emulatorScreen = createWidget(widget.CIRCLE, {
    center_x: SCREEN_WIDTH / 2,
    center_y: SCREEN_HEIGHT / 2,
    radius: SCREEN_WIDTH / 2,
    color: 0x222222,
  });

  let lastPosY = -1000;
  setInterval(() => {
    const posY = getScrollTop();
    if (posY === lastPosY) {
      return;
    }

    lastPosY = posY;
    emulatorScreen.setProperty(prop.CENTER_Y, (SCREEN_WIDTH / 2) - lastPosY);
  }, 50);
}
