import "7.css/dist/7.css";
import "./styles.css";

import asciiImg from "./img/ascii.png";
import homeworkImg from "./img/homework.png";
import petImg from "./img/pet.png";

import { readFileSync } from "fs";
const creditsText = readFileSync(__dirname + "/CREDITS.txt", "utf-8");

import {
  makeStartMenu,
  makeClock,
  makeDesktopIcon,
  makeDialog,
  closeStartMenu,
} from "./lib";

import { initWallpaper } from "./wallpaper";
import { shuffle } from "./util";
import { openNotepad } from "./notepad";
import { programs } from "./programs";
import { openHomework } from "./homeworkTrap";

function initDesktop() {
  const desktopIcons = [...programs.filter((p) => p.title !== "Notepad")];
  shuffle(desktopIcons);
  desktopIcons.unshift({
    icon: asciiImg,
    title: "CREDITS.txt",
    run: openNotepad("CREDITS.txt", creditsText),
  });
  desktopIcons.unshift({
    icon: homeworkImg,
    title: "Homework",
    run: openHomework(),
  });

  let initial = 40;
  let x = initial;
  let y = -initial;

  const rowCnt = window.innerWidth <= 375 ? 3 : 5;
  const xinc = window.innerWidth <= 375 ? 90 : 100;
  const yinc = window.innerWidth <= 375 ? 80 : 100;
  desktopIcons.forEach((di, i) => {
    if (i % rowCnt === 0) {
      x = initial;
      y += yinc;
    } else {
      x += xinc;
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

  const shutdown = document.querySelector("#shutdown");
  shutdown.addEventListener("click", function () {
    closeStartMenu();
    makeDialog(
      "Not allowed",
      "<p>Sorry, you do not have the necessary permissions to shut the system down.</p>"
    );
  });

  const shareLink = document.querySelector("#share-link");
  shareLink.addEventListener("click", function () {
    closeStartMenu();
    makeDialog(
      "Share Link",
      "Copy and paste this link to share with your pals!<br><input onClick='this.setSelectionRange(0, this.value.length)' value='https://desk.glitchy.website/' />",
      petImg
    );
  });
}

initDesktop();
