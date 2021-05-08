import TermlyPrompt from "termly.js/bin/classes/Prompt";
import { htmlToElement, makeWindow } from "./lib";
import { readFileSync } from "fs";
const creditsText = readFileSync(__dirname + "/CREDITS.txt", "utf-8");

import "./terminal.css";

let terminals = 0;

const filesystem = {
  home: {
    nia: {
      Desktop: {},
    },
    van: {
      Desktop: {},
    },
    try_andy: {
      Desktop: {
        "CREDITS.txt": creditsText,
        Homework: {
          "surprise.txt": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      },
      Music: {
        "you're nine times closer": {
          "TRACKLIST.txt":
            "https://tryandy.bandcamp.com/album/youre-nine-times-closer",
        },
        npi: {
          "TRACKLIST.txt": "https://tryandy.bandcamp.com/album/npi",
        },
        Dicha: {
          "TRACKLIST.txt": "https://tryandy.bandcamp.com/album/dicha",
        },
      },
    },
  },
};
const commands = {};

export function openTerminal() {
  return function (opts) {
    terminals++;
    const terminalId = `terminal-${terminals}`;

    const win = makeWindow({
      icon: opts.icon,
      className: "no-padding",
      width: 640,
      height: 480,
      title: "PuTTy",
      content: htmlToElement(
        `<div class="terminal-container" id="${terminalId}"></div>`
      ),
    });
    const shell = new TermlyPrompt(`#${terminalId}`, {
      filesystem,
      commands,
      env: {
        USER: "andy",
        HOSTNAME: "glitchy",
      },
    });
    shell.run("cd /home/try_andy");

    // scroll to bottom when user presses any key
    document
      .querySelector(`#${terminalId}`)
      .addEventListener("keypress", function (e) {
        win.body.scrollTop = win.body.scrollHeight;
        if (e.which == 13 || e.keyCode == 13) {
          // hack: scroll to the bottom when outputting
          setTimeout(function () {
            win.body.scrollTop = win.body.scrollHeight;
          }, 200);
        }
      });
  };
}
