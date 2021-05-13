import { randItem } from "./util";
import { openHomework } from "./homeworkTrap";
import { openTerminal } from "./terminal";
import { openExplorer } from "./explorer";
import { openBrowser, openIframe } from "./browser";
import { openMessenger } from "./messenger";
import { openVid } from "./videoplayer";
import { openWinamp } from "./winamp";
import { openClock } from "./clock";

import niceUrls from "./niceUrls";

import fileManagerImg from "./img/file-manager.png";
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
import terminalImg from "./img/terminal.png";
import homeworkImg from "./img/homework.png";
import video from "./vid/video.mp4";

export const programs = [
  {
    icon: fileManagerImg,
    title: "Explorer",
    run: openExplorer(),
  },
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
    title: "Messenger",
    run: openMessenger(),
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
    run: openClock(),
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
  { icon: aviImg, title: "Media Player", run: openVid("Media Player", video) },
  { icon: homeworkImg, title: "Homework", run: openHomework() },
  { icon: terminalImg, title: "Terminal", run: openTerminal() },
  {
    icon: winampImg,
    title: "Winamp",
    run: openWinamp("Winamp"),
  },
];
