import "7.css/dist/7.css";
import "./styles.css";

import asciiImg from "./img/ascii.png";
import fileManagerImg from "./img/file-manager.png";
import ircImg from "./img/im-irc.png";
import imImg from "./img/im-message-new.png";
import webImg from "./img/web-browser.png";
import clockImg from "./img/xclock.png";
import paintImg from "./img/gimp.png";
import calcImg from "./img/gcalctool.png";

import { makeDesktopIcon, makeWindow, htmlToElement } from "./lib";

function openIframe(title, src, { width = 600, height = 400 } = {}) {
  return function() {
    makeWindow({
      width,
      height,
      title,
      content: htmlToElement(
        `<div style="display: flex;">
          <iframe src="${src}" style="width: 100%; height: 100%">
        </div>`
      )
    });
    return;
  }
}

function editableText(title, text) {
  return function() {
    makeWindow({
      width: 600,
      height: 400,
      title,
      content: htmlToElement(
        `<div style="display: block; font-family: 'Courier New',monospace; font-size: 16px; padding: 4px; background: #fff" contenteditable>${text}</div>`
      )
    });
    return;
  }
}

function timeWaster() {
  makeWindow({
    width: 300,
    height: 160,
    title: "Waste Ur Time",
    content: (win) => {
      const content = htmlToElement(`
        <div style="display: flex; flex-direction: column; justify-content: flex-start;">
          <div style="margin-bottom: 10px;">Attempting to load fucks...</div>
          <div style="margin-bottom: 10px;" role="progressbar" class="marquee"></div>
          <div>
            <button class="close">I Give Up</button>
          </div>
        </div>`
      );
      content.querySelector(".close").addEventListener("click", () => win.close());
      return content;
    }
  });
}

const desktopIcons = [
  { icon: asciiImg, title: "hello.txt", run: editableText("hello.txt", "Welcome! There's no way to save this file if you change it.") },
  { icon: fileManagerImg, title: "File Explorer", run: () => alert("not yet") },
  { icon: ircImg, title: "IRC", run: openIframe("IRC", "https://widget.mibbit.com/?server=irc.rizon.net&channel=%23Rizon") },
  { icon: imImg, title: "Chat", run: openIframe("The Only Limit...", "https://html5zombo.com/") },
  { icon: webImg, title: "Internet", run: openIframe("Interwebs", "https://tri.neocities.org/spacejam.html", { width: 1024, height: 768 }) },
  { icon: clockImg, title: "Time", run: timeWaster },
  { icon: calcImg, title: "Calque", run: openIframe("Calque", "https://calque.io/") },
  { icon: paintImg, title: "Paint", run: openIframe("Paint", "https://paint.js.org/") },
]

const inc = 100;
let initial = 40;
let x = initial;
let y = 0;

desktopIcons.forEach((di, i) => {
  if (i % 5 === 0) {
    x = initial;
    y += inc;
  } else {
    x += inc;
  }
  makeDesktopIcon({
    x,
    y, 
    title: di.title,
    icon: di.icon,
    run: di.run
  });
});