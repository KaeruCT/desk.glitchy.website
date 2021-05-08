import TermlyPrompt from "termly.js/bin/classes/Prompt";
import { htmlToElement, makeWindow } from "./lib";
import { filesystem } from "./filesystem";

import "./terminal.css";

let terminals = 0;
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
      title: opts.title,
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
