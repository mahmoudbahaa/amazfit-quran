import * as hmUI from "@zos/ui";
import * as Styles from "../../page/style.r.layout";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../../libs/utils";
import { getScrollTop, setScrollMode } from "@zos/page";
import { Time } from "@zos/sensor";
import { px } from "@zos/utils";
import { createEmptySpace } from "../empty-space";
import { KEY_BACK, KEY_DOWN, KEY_EVENT_CLICK, KEY_EVENT_DOUBLE_CLICK, KEY_EVENT_LONG_PRESS, KEY_EVENT_PRESS, KEY_EVENT_RELEASE, KEY_HOME, KEY_SELECT, KEY_SHORTCUT, KEY_UP, offKey, onKey } from "@zos/interaction";
import { ListScreen } from "../../libs/mmk/ListScreen";

let lastClickInfo = undefined;
const ebs = px(15);
export function createList(list, type, onSelect, vc = hmUI) {
  // const x = px(45);
  // const y = 0;
  // const w = DEVICE_WIDTH - px(90);
  // const h = DEVICE_HEIGHT;
  // const item_height = DEVICE_HEIGHT / 4;
  // const num_items_per_page = 4;
  // const item_bg_radius = px(50);
  // const item_bg_color = 0xef5350;
  // const item_bg_focus_color = 0x222222;
  // const bgs = Array.from({ length: list.length });
  // let focus_index = 0;



  // const scrollBar = vc.createWidget(hmUI.widget.PAGE_SCROLLBAR, {
  //   target: viewContainer,
  //   color: 123456,
  //   bg_color: 654321,
  // });

  // // setInterval(() => {
  // //   const posY = viewContainer.getProperty(hmUI.prop.POS_Y);
  // //   const offset = Math.max(0, posY * -1 - item_height / 2);
  // //   const new_focus_index = Math.ceil(offset / (item_height + item_space));
  // //   if (new_focus_index == focus_index) return;

  // //   let props = bgs[focus_index].getProperty(hmUI.prop.MORE, {});
  // //   bgs[focus_index].setProperty(hmUI.prop.MORE, {
  // //     ...props,
  // //     normal_color: item_bg_color,
  // //     press_color: item_bg_color
  // //   });

  // //   props = bgs[new_focus_index].getProperty(hmUI.prop.MORE, {});
  // //   bgs[new_focus_index].setProperty(hmUI.prop.MORE, {
  // //     ...props,
  // //     normal_color: item_bg_focus_color,
  // //     press_color: item_bg_focus_color
  // //   });

  // //   focus_index = new_focus_index;
  // // }, 200)

  // offKey();

  // onKey({
  //   callback: (key, keyEvent) => {
  //     if (key === KEY_SELECT && keyEvent === KEY_EVENT_CLICK) {
  //       offKey();
  //       onSelect(focus_index);
  //       return true;
  //     }

  //     return false;
  //   },
  // })
}
