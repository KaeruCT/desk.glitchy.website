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
    const terminal = document.querySelector(`#${terminalId}`);
    terminal.addEventListener("keypress", function (e) {
      win.body.scrollTop = win.body.scrollHeight;
      if (e.which == 13 || e.keyCode == 13) {
        // hack: scroll to the bottom when outputting
        setTimeout(function () {
          win.body.scrollTop = win.body.scrollHeight;
        }, 200);
      }
    });
    terminal.addEventListener("keydown", function (e) {
      const input = terminal.querySelector(".current .terminal-input");
      const text = input.value;

      if (e.ctrlKey && (e.which == 67 || e.keyCode == 67)) {
        shell.generateOutput("^C");
      }

      // autocomplete
      if (e.which == 9 || e.keyCode == 9) {
        e.preventDefault();
        try {
          if (!text.length) return;
          const files = Object.keys(shell.fs.listDir("."));
          const currentParts = text.split(/\s+/);
          const currentFile =
            currentParts.length > 1 && currentParts[currentParts.length - 1];
          let newFile;

          if (currentFile) {
            const i = files.indexOf(currentFile);
            if (i === -1) {
              newFile = files.find((f) => f.startsWith(currentFile));
            } else {
              newFile = files[(i + 1) % files.length];
            }
          } else {
            newFile = files[0];
          }

          if (newFile) {
            if (currentParts.length > 1) currentParts.pop();
            input.value = currentParts.join(" ") + " " + newFile;
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
  };
}
