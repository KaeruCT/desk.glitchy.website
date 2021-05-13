import { htmlToElement, makeWindow } from "./lib";
import notepadImg from "./img/notepad.png";
import "./notepad.css";

export function openNotepad(title = "", text = "") {
  return function (opts = {}) {
    if (opts) {
      title = opts.filename || title;
      text = opts.content || text;
    }
    makeWindow({
      icon: notepadImg,
      width: 600,
      height: 400,
      title: title ? "Notepad - " + title : "Notepad",
      className: "no-padding",
      content: htmlToElement(
        `<div class="notepad-container" contenteditable><pre>${text}</pre></div>`
      ),
    });
  };
}
