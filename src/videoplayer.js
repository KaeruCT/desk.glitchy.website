import { makeWindow, htmlToElement } from "./lib";
import "./videoplayer.css";

export function openVid(title, src, { width = 400, height = 300 } = {}) {
  return function (opts) {
    makeWindow({
      icon: opts.icon,
      width,
      height,
      title,
      className: "no-padding",
      content: htmlToElement(
        `<div class="video-container"><video src="${src}" controls autoplay loop></div>`
      ),
    });
  };
}
