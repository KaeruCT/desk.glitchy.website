import "7.css/dist/7.css";
import "./styles.css";

import asciiImg from "./img/ascii.png";
//import fileManagerImg from "./img/file-manager.png";
import ircImg from "./img/im-irc.png";
import imImg from "./img/im-message-new.png";
import webImg from "./img/web-browser.png";
import clockImg from "./img/xclock.png";
import paintImg from "./img/gimp.png";
import calcImg from "./img/gcalctool.png";
import pipesImg from "./img/pipes.png";
import aviImg from "./img/avidemux.png";
import winampImg from "./img/winamp.png";
import snakeImg from "./img/snake.png";
import minesweeperImg from "./img/minesweeper.png";
import musicSnakeImg from "./img/musicSnake.png";
import minecraftImg from "./img/minecraft.png";
import plasmaImg from "./img/plasma.png";
import skiImg from "./img/skifree.png";
import homeworkImg from "./img/homework.png";
import video from "./vid/video.mp4";

import { readFileSync } from "fs";
const creditsText = readFileSync(__dirname + "/CREDITS.txt", "utf-8");

import {
  makeStartMenu,
  makeClock,
  makeDesktopIcon,
  makeWindow,
  htmlToElement,
  makeDialog,
  closeStartMenu,
} from "./lib";
import { initWebamp } from "./webamp";
import { openBrowser } from "./browser";
import { initWallpaper } from "./wallpaper";
import niceUrls from "./niceUrls";
import { randItem } from "./util";
import { openHomework } from "./homeworkTrap";

function openWinamp(title, { width = 0, height = 0 } = {}) {
  let running = false;

  return function (opts) {
    if (running) return;
    running = true;

    const webamp = initWebamp();

    webamp.renderWhenReady(document.querySelector("#drop-full")).then(() => {
      makeWindow({
        customEl: document.querySelector("#webamp"),
        icon: opts.icon,
        width,
        height,
        title,
        content: (win) => {
          webamp.onClose(() => {
            win.close();
            webamp.dispose();
            running = false;
          });
          webamp.onMinimize(() => {
            win.toggleMinimize();
          });
        },
      });
    });
  };
}

function openIframe(title, src, { width = 460, height = 380 } = {}) {
  return function (opts) {
    makeWindow({
      icon: opts.icon,
      className: "no-padding",
      width,
      height,
      title,
      content: htmlToElement(
        `<div style="display: flex;">
          <iframe allowfullscreen seamless src="${src}" style="width: 100%; height: 100%">
        </div>`
      ),
    });
  };
}

function openVid(title, src, { width = 400, height = 300 } = {}) {
  return function (opts) {
    makeWindow({
      icon: opts.icon,
      width,
      height,
      title,
      content: htmlToElement(
        `<div style="display: flex; justify-content: center; align-items: center;"><video src="${src}" style="max-width: ${
          width * 0.85
        }px; max-height: ${height * 0.85}px" controls autoplay loop></div>`
      ),
    });
  };
}

function editableText(title, text) {
  return function (opts) {
    makeWindow({
      icon: opts.icon,
      width: 600,
      height: 400,
      title,
      content: htmlToElement(
        `<div style="display: block; overflow: auto; font-family: 'Courier New',monospace; font-size: 16px; padding: 4px; background: #fff" contenteditable>${text}</div>`
      ),
    });
  };
}

const winampIcon = {
  icon: winampImg,
  title: "Winamp",
  run: openWinamp("Winamp"),
};
const desktopIcons = [
  {
    icon: asciiImg,
    title: "CREDITS.txt",
    run: editableText("CREDITS.txt", `<pre>${creditsText}</pre>`),
  },
  //, title: "File Explorer", run: () => alert("not yet") },
  {
    icon: ircImg,
    title: "IRC",
    run: openIframe(
      "IRC",
      "https://widget.mibbit.com/?server=irc.rizon.net&channel=%23Rizon"
    ),
  },
  {
    icon: imImg,
    title: "Chat",
    run: openIframe("The Only Limit...", "https://html5zombo.com/"),
  },
  {
    icon: webImg,
    title: "Internet Explorer",
    run: openBrowser("Internet Explorer", () => randItem(niceUrls), {
      width: 640,
      height: 480,
    }),
  },
  {
    icon: clockImg,
    title: "Clock",
    run: openIframe("Clock", "https://csb-bbeyl.netlify.app/", {
      width: 500,
      height: 500,
    }),
  },
  {
    icon: calcImg,
    title: "Calque",
    run: openIframe("Calque", "https://calque.io/"),
  },
  {
    icon: pipesImg,
    title: "3D Pipes",
    run: openIframe("3D Pipes", "https://1j01.github.io/pipes/", {
      width: 800,
      height: 600,
    }),
  },
  {
    icon: snakeImg,
    title: "Snake!",
    run: openIframe(
      "Snake!",
      "https://kaeruct.github.io/legacy-projects/snake/",
      {
        width: 800,
        height: 600,
      }
    ),
  },
  {
    icon: minesweeperImg,
    title: "Minesweeper",
    run: openIframe("Minesweeper", "https://glitchy-minesweeper.netlify.app/", {
      width: 392,
      height: 392,
    }),
  },
  {
    icon: musicSnakeImg,
    title: "musicSnake",
    run: openIframe("musicSnake", "https://kaeruct.github.io/musicSnake/", {
      width: 460,
      height: 680,
    }),
  },
  {
    icon: minecraftImg,
    title: "Minecraft",
    run: openIframe("Minecraft", "https://classic.minecraft.net", {
      width: 640,
      height: 480,
    }),
  },
  {
    icon: plasmaImg,
    title: "Plasma Gun",
    run: openIframe(
      "Plasma Gun",
      "https://oguzeroglu.github.io/ROYGBIV/demo/plasmaGun/application.html",
      {
        width: 640,
        height: 480,
      }
    ),
  },
  {
    icon: skiImg,
    title: "SkiFree",
    run: openIframe("SkiFree", "https://basicallydan.github.io/skifree.js/", {
      width: 640,
      height: 480,
    }),
  },
  {
    icon: paintImg,
    title: "Paint",
    run: openIframe("Paint", "https://jspaint.app", {
      width: 800,
      height: 600,
    }),
  },
  { icon: aviImg, title: "Media Player", run: openVid("DJ Yayo", video) },
  { icon: homeworkImg, title: "Homework ;)", run: openHomework() },
  winampIcon,
];

const inc = 100;
let initial = 40;
let x = initial;
let y = -initial;

const rowCnt = window.innerWidth > 420 ? 5 : 3;
desktopIcons.forEach((di, i) => {
  if (i % rowCnt === 0) {
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
    run: di.run,
  });
});

makeStartMenu();
makeClock();
initWallpaper();

winampIcon.run(winampIcon);

const shutdown = document.querySelector("#shutdown");
shutdown.addEventListener("click", function () {
  closeStartMenu();
  makeDialog(
    "Not allowed",
    "Sorry, you do not have the necessary permissions to shut the system down."
  );
});
