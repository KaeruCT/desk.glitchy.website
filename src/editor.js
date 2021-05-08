import { htmlToElement, makeWindow } from "./lib";
import asciiImg from "./img/ascii.png";

export function openNotepad(title, text) {
  return function (opts = {}) {
    makeWindow({
      icon: opts.icon || asciiImg,
      width: 600,
      height: 400,
      title,
      content: htmlToElement(
        `<div style="display: block; overflow: auto; font-family: 'Courier New',monospace; font-size: 16px; padding: 4px; background: #fff" contenteditable><pre>${text}</pre></div>`
      ),
    });
  };
}
