import { randItem } from "./util";
import { openTerminal } from "./terminal";
import { openExplorer } from "./explorer";
import { openBrowser, openIframe } from "./browser";
import { openMessenger } from "./messenger";
import { openVid } from "./videoplayer";
import { openWinamp } from "./winamp";
import { openClock } from "./clock";
import { openNotepad } from "./notepad";

import niceUrls from "./niceUrls";

import fileManagerImg from "./img/file-manager.png";
import vmImg from "./img/vm.png";
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
import notepadImg from "./img/notepad.png";
import video from "./vid/video.mp4";

export const programs = [
  {
    cmd: "explorer.exe",
    icon: fileManagerImg,
    title: "Explorer",
    run: openExplorer(),
  },
  {
    cmd: "mirc.exe",
    icon: ircImg,
    title: "MIRC",
    run: openIframe(
      "MIRC",
      "https://widget.mibbit.com/?server=irc.rizon.net&channel=%23Rizon"
    ),
  },
  {
    cmd: "messenger.exe",
    icon: imImg,
    title: "Messenger",
    run: openMessenger(),
  },
  {
    cmd: "iexplore.exe",
    icon: webImg,
    title: "Internet Explorer",
    run: openBrowser("Internet Explorer", () => randItem(niceUrls), {
      width: 640,
      height: 480,
    }),
  },
  {
    cmd: "clock.exe",
    icon: clockImg,
    title: "Clock",
    run: openClock(),
  },
  {
    cmd: "calc.exe",
    icon: calcImg,
    title: "Calque",
    run: openIframe("Calque", "https://calque.io/"),
  },
  {
    cmd: "virtualmachine.exe",
    icon: vmImg,
    title: "Virtual Machine",
    run: openIframe("Virtual Machine", "://", {
      width: 800,
      height: 600,
    }),
  },
  {
    cmd: "3dpipes.exe",
    icon: pipesImg,
    title: "3D Pipes",
    run: openIframe("3D Pipes", "https://1j01.github.io/pipes/", {
      width: 800,
      height: 600,
    }),
  },
  {
    cmd: "snake.exe",
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
    cmd: "minesweeper.exe",
    icon: minesweeperImg,
    title: "Minesweeper",
    run: openIframe("Minesweeper", "https://glitchy-minesweeper.netlify.app/", {
      width: 392,
      height: 392,
    }),
  },
  {
    cmd: "musicsnake.exe",
    icon: musicSnakeImg,
    title: "musicSnake",
    run: openIframe("musicSnake", "https://kaeruct.github.io/musicSnake/", {
      width: 460,
      height: 680,
    }),
  },
  {
    cmd: "minecraft.exe",
    icon: minecraftImg,
    title: "Minecraft",
    run: openIframe("Minecraft", "https://classic.minecraft.net", {
      width: 640,
      height: 480,
    }),
  },
  {
    cmd: "plasma.exe",
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
    cmd: "skifree.exe",
    icon: skiImg,
    title: "SkiFree",
    run: openIframe("SkiFree", "https://basicallydan.github.io/skifree.js/", {
      width: 640,
      height: 480,
    }),
  },
  {
    cmd: "paint.exe",
    icon: paintImg,
    title: "Paint",
    run: openIframe("Paint", "https://jspaint.app", {
      width: 800,
      height: 600,
    }),
  },
  {
    cmd: "mplayer.exe",
    icon: aviImg,
    title: "Media Player",
    run: openVid("Media Player", video),
  },
  {
    cmd: "terminal.exe",
    icon: terminalImg,
    title: "Terminal",
    run: openTerminal(),
  },
  {
    cmd: "winamp.exe",
    icon: winampImg,
    title: "Winamp",
    run: openWinamp("Winamp"),
  },
  {
    cmd: "notepad.exe",
    icon: notepadImg,
    title: "Notepad",
    run: openNotepad(),
  },
];

export function findPrograms(search) {
  const sorted = programs.sort((a, b) => a.title.localeCompare(b.title));
  search = search.trim().toLowerCase();
  if (!search) return sorted;
  return sorted.filter(function (p) {
    const searchValues = [p.title, p.cmd].map((s) => s.toLowerCase());
    return searchValues.some((s) => s.includes(search));
  });
}
