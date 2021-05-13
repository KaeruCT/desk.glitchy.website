import Shell from "termly.js";
import { programs } from "./programs";
import { htmlToElement, makeWindow } from "./lib";
import { filesystem } from "./filesystem";
import { openExplorer, openFile } from "./explorer";

import "./terminal.css";

let terminals = 0;
const KEY = "terminalHistory";

class Prompt extends Shell {
  constructor(selector = undefined, options = {}) {
    super(options); // must pass option here

    if (!selector) throw new Error("No wrapper element selector provided");
    try {
      this.container = document.querySelector(selector);
      if (!this.container)
        throw new Error("new Terminal(): DOM element not found");
    } catch (e) {
      throw new Error("new Terminal(): Not valid DOM selector.");
    }

    return this.init();
  }

  init() {
    this.generateRow();
    this.container.addEventListener("click", () => {
      let input = this.container.querySelector(".current .terminal-input");
      if (input) input.focus();
    });
  }

  generateRow() {
    var that = this;

    // Remove previous current active row
    let current = this.container.querySelector(".current.terminal-row");
    if (current) {
      current.classList.remove("current");
      current.querySelector("input").disabled = true;
    }

    let prevInput = this.container.querySelector(".terminal-input");
    if (prevInput) {
      prevInput.removeEventListener("input", this.resizeHandler);
      prevInput.blur();
    }

    const div = document.createElement("div");
    div.classList.add("current", "terminal-row");
    div.innerHTML = "";
    div.innerHTML += `<span class="terminal-info">${this.env.USER}@${
      this.env.HOSTNAME
    } - ${this.fs.getCurrentDirectory()} ➜ </span>`;
    div.innerHTML += `<input type="text" class="terminal-input" size="2" style="cursor:none;">`;

    // add new row and focus it
    this.container.appendChild(div);
    let input = this.container.querySelector(".current .terminal-input");
    let currentRow = this.container.querySelector(".current.terminal-row");
    let currentPrompt = currentRow.querySelector(".terminal-info");
    let inputWidth = currentRow.offsetWidth - currentPrompt.offsetWidth - 20;
    input.style.width = inputWidth + "px";
    input.addEventListener("keyup", (e) => this.submitHandler(e));
    input.select();
    this.container.scrollTop = this.container.scrollHeight + 1;

    return input;
  }

  generateOutput(out = "", newLine = true) {
    if (Array.isArray(out)) {
      out = out.join("\n");
    }
    const pre = document.createElement("pre");
    pre.textContent = out;
    pre.className = "terminal-output";
    this.container.appendChild(pre);
    if (newLine) {
      return this.generateRow();
    }
  }

  clear() {
    this.container.innerHTML = "";
    return this.generateRow();
  }

  submitHandler(e) {
    if (e.which == 13 || e.keyCode == 13) {
      e.preventDefault();
      const command = e.target.value.trim();

      if (command === "clear") return this.clear();

      // EXEC
      let output = this.run(command);

      // if is a {Promise} resolve it ad parse as json response
      if (output["then"]) {
        this.generateOutput("Pending request...", false);
        return output
          .then((res) => {
            if (typeof res === "object") {
              try {
                res = JSON.stringify(res, null, 2);
              } catch (e) {
                return this.generateOutput(
                  "-fatal http: Response received but had a problem parsing it."
                );
              }
            }
            return this.generateOutput(res);
          })
          .catch((err) => this.generateOutput(err.message));
      }

      if (typeof output === "object" || Array.isArray(output)) {
        output = JSON.stringify(output, null, 2);
      }

      return this.generateOutput(output);
    }
  }
}

export function openTerminal() {
  return function (opts) {
    terminals++;
    const terminalId = `terminal-${terminals}`;

    const storedHistory = JSON.parse(localStorage.getItem(KEY) || "[]");
    const history = storedHistory.length > 0 ? storedHistory : [];
    const commands = {};
    let histIndex = -1;

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

    programs.forEach((p) => {
      commands[p.cmd] = {
        name: p.cmd,
        fn: function (argv) {
          const fs = this.shell.fs;
          const fileArg = argv._[0];
          const filename = fileArg
            ? fs.pathArrayToString(fs.cwd) + "/" + fileArg
            : "";
          const file = filename ? fs.readFile(filename) : "";

          const opts = {
            icon: p.icon,
            filename,
            content: file ? file.content : "",
          };
          p.run(opts);
          return "";
        },
      };
    });
    commands.open = {
      name: "open",
      man: "Opens a file or directory with the appropriate program",
      fn: function (argv) {
        const fs = this.shell.fs;
        const fileArg = argv._[0];
        if (!fileArg) throw Error("No file specified");
        const filename = fileArg
          ? fs.pathArrayToString(fs.cwd) + "/" + fileArg
          : "";
        const res = fs.getNode(filename);
        if (!res) {
          throw Error("Could not open " + filename);
        }
        console.log(res.node);
        if (!res.node.type) {
          // this is a directory
          openExplorer()({ filename: res.node.path });
          return "";
        }
        openFile(res.node.name, res.node.content);
        return "";
      },
    };
    commands.exit = {
      name: "exit",
      fn: function () {
        win.close();
      },
    };

    const shell = new Prompt(`#${terminalId}`, {
      filesystem,
      commands,
      env: {
        USER: "andy",
        HOSTNAME: "glitchy",
      },
    });
    shell.run("cd /home/try_andy");
    shell.clear();

    function getTermInput() {
      return terminal.querySelector(".current .terminal-input");
    }

    // scroll to bottom when user presses any key
    const terminal = document.querySelector(`#${terminalId}`);
    getTermInput().style.cursor = "";

    terminal.addEventListener("keypress", function (e) {
      win.body.scrollTop = win.body.scrollHeight;
      if (e.which == 13 || e.keyCode == 13) {
        // hack: scroll to the bottom when outputting
        setTimeout(function () {
          win.body.scrollTop = win.body.scrollHeight;
          getTermInput().style.cursor = "";
        }, 200);

        const cmd = getTermInput().value;
        if (cmd.startsWith("#")) {
          // ignore comment commands
          getTermInput().value = "";
        } else {
          // otherwise push to history
          history.unshift(cmd);
          localStorage.setItem(KEY, JSON.stringify(history));
        }
        histIndex = -1; // reset history index
      }
    });
    terminal.addEventListener("keydown", function (e) {
      const text = getTermInput().value;

      if (e.ctrlKey && (e.which == 67 || e.keyCode == 67)) {
        shell.generateOutput("^C");
      }

      if (e.which == 38 || e.keyCode == 38) {
        histIndex++;
        if (histIndex > history.length) histIndex = history.length - 1;
        const entry = history[histIndex];
        if (entry) {
          getTermInput().value = entry;
          setTimeout(() => moveCursorToEnd(getTermInput()), 1);
        }
      }

      if (e.which == 40 || e.keyCode == 40) {
        histIndex--;
        if (histIndex < 0) histIndex = 0;
        const entry = history[histIndex];
        if (entry) {
          getTermInput().value = entry;
          setTimeout(() => moveCursorToEnd(getTermInput()), 1);
        }
      }

      // autocomplete
      if (e.which == 9 || e.keyCode == 9) {
        e.preventDefault();
        try {
          if (!text.length) return;
          const currentParts = text.split(/\s+/);
          let input = currentParts[currentParts.length - 1];

          if (currentParts.length <= 1) {
            // autocomplete program names
            const programs = Object.keys(shell.ShellCommands);
            const search = input.toLowerCase();
            const results = programs.filter((p) => p.startsWith(search));

            if (results.length > 1) {
              shell.generateOutput(results.join(" "));
              getTermInput().value = input;
            }
            if (results.length === 1) {
              getTermInput().value = results[0] + " ";
            }
            return;
          }

          // else, autocomplete file names
          let files = [];
          let pathPrefix = "";
          if (input.includes("/")) {
            const isDir = input.endsWith("/");
            const inputDir = isDir ? input : dirname(input);
            files = Object.keys(shell.fs.listDir(inputDir));
            const inputParts = input.split("/");
            input = inputParts.pop();

            pathPrefix = inputParts.join("/") + "/";
          } else {
            files = Object.keys(shell.fs.listDir("."));
          }
          const newFile = autocomplete(input, files);

          if (newFile) {
            if (currentParts.length > 1) currentParts.pop();
            getTermInput().value =
              currentParts.join(" ") + " " + pathPrefix + newFile;
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
  };
}

function dirname(path) {
  const inputParts = path.split("/");
  path = inputParts.pop();
  return inputParts.join("/") + "/";
}

function autocomplete(input, candidates) {
  let result = "";
  if (input) {
    input = input.toLowerCase();
    const i = candidates.map((f) => f.toLowerCase()).indexOf(input);
    if (i === -1) {
      result = candidates.find((f) => f.toLowerCase().startsWith(input));
    } else {
      result = candidates[(i + 1) % candidates.length];
    }
  } else {
    result = candidates[0];
  }
  return result;
}

function moveCursorToEnd(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}
