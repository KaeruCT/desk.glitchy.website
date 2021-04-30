import interact from "interactjs";
import html2canvas from "html2canvas";
import defaultIcon from "./img/unknown.png";
import startActive from "./img/startactive.png";
import startHover from "./img/starthover.png";
import startRegular from "./img/startregular.png";
import errorImg from "./img/error.png";

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

const desktopIconTemplate = `
<div class="desktop-icon">
    <img src="{icon}" />
    <div>{title}</div>
</div>
`;

const winTemplate = `
<div class="window-wrapper {className}">
    <div class="window colored glass">
        <div class="title-bar dbl-maximize">
            <div class="title-bar-text">{title}</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize" class="minimize"></button>
                <button aria-label="Maximize" class="maximize"></button>
                <button aria-label="Close" class="close"></button>
            </div>
        </div>
        <div class="window-body">
        </div>
    </div>
</div>
`;

const taskbarBtnTemplate = `
<div class="taskbar-btn">
    <div>
        <img src="{icon}" />
    </div>
</div>
`;

export function htmlToElement(html) {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function getElementOffset(el) {
  let top = 0;
  let left = 0;
  let element = el;

  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  return {
    top,
    left,
  };
}

let activeWin;
function setActive(win) {
  if (activeWin) {
    activeWin.taskbarBtn.classList.remove("active");
  }
  activeWin = win;
  Object.assign(activeWin.element.style, { zIndex: zIndex++ });
  activeWin.taskbarBtn.classList.add("active");
}

function snap(win, snapEl, minimize) {
  if (!minimize) {
    snapEl.style.opacity = 0;
  }

  win.element.classList.add("snapping");
  setTimeout(() => {
    win.element.classList.remove("snapping");
  }, 400);

  const restore =
    win.state.status === "minimized" ||
    (win.state.status === "maximized" && snapEl === dropFull);

  if (restore) {
    win.saveState({
      ...win.prevStates[win.state.status],
      snapTo: "",
    });
    setActive(win);
    win.hidePreview();
  } else {
    let { top: y, left: x } = getElementOffset(snapEl);
    let w = snapEl.offsetWidth;
    let h = snapEl.offsetHeight;
    let status = snapEl === dropFull ? "maximized" : "snapped";

    if (minimize) {
      status = "minimized";
    }

    win.saveState({
      w,
      h,
      x,
      y,
      snapTo: "",
      status,
    });
  }
}

let zIndex = 1;
let windowId;
const container = document.querySelector("#container");
const iconContainer = document.querySelector("#icon-container");
const taskbar = document.querySelector("#taskbar");
const dropLeft = document.querySelector("#drop-left");
const dropRight = document.querySelector("#drop-right");
const dropFull = document.querySelector("#drop-full");
const windows = [];

export function makeWindow(opts) {
  const {
    title = "",
    width = 0,
    height = 0,
    content = null,
    customEl = null,
    className = "",
    unresizable = false,
  } = opts;
  const el =
    customEl ||
    htmlToElement(
      winTemplate.replace("{title}", title).replace("{className}", className)
    );
  const taskbarBtn = htmlToElement(
    taskbarBtnTemplate.replace("{icon}", opts.icon || defaultIcon)
  );
  const id = windowId++;

  let state = {};
  let prevStates = [];
  function saveState(newState) {
    if (newState.status) {
      const skip =
        newState.status === "maximized" && state.status === "minimized";
      if (!skip) {
        prevStates[newState.status] = { ...state };
      }
    }

    state = {
      ...state,
      ...newState,
      prevStatus: state.status,
    };

    let { w, h, y, x, status, minWidth, minHeight } = state;
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    let minimizedStyle = {};
    if (status === "minimized") {
      minimizedStyle = {
        opacity: 0,
        width: `${taskbarBtn.offsetWidth}px`,
        height: `${taskbarBtn.offsetHeight}px`,
        minWidth: 0,
        minHeight: 0,
        ...(customEl && { display: "none" }),
      };
    } else {
      minimizedStyle = {
        opacity: 1,
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        ...(customEl && { display: "block" }),
      };
    }

    Object.assign(el.style, {
      ...(!customEl && {
        width: `${w}px`,
        height: `${h}px`,
        top: `${y}px`,
        left: `${x}px`,
      }),
      ...minimizedStyle,
    });
  }

  function toggleMinimize() {
    snap(win, taskbarBtn, true);
  }

  function close() {
    interact(el).unset();
    el.parentNode.removeChild(el);
    taskbar.removeChild(taskbarBtn);
    windows[id].hidePreview();
    delete windows[id];
  }

  let previewEl;
  let previewIsHidden = true;
  function showPreview() {
    if (previewEl) return;
    Object.keys(windows).forEach(id => {
      if (id !== this.id) {
        windows[id].hidePreview();
      }
    });

    const previewBody = win.element.querySelector(".window-body") // normal window
      || win.element.querySelector("#main-window") // webamp window
      || win.element; // fallback
    
    if (win.state.status === "minimized") {
      Object.assign(win.element.style, {
        opacity: 1,
        minWidth: `${win.state.minWidth}px`,
        minHeight: `${win.state.minHeight}px`,
        top: "-9999px",
        ...(customEl && { display: "block" }),
      });
    }
    previewIsHidden = false;
    html2canvas(previewBody, { backgroundColor: null, allowTaint: true, logging: false }).then(canvas => {
      if (win.element.style.top === "-9999px") {
        Object.assign(win.element.style, {
          top: customEl ? 0 : `${state.y}px`,
        });
      }
      if (previewIsHidden) return;
      if (previewEl) {
        previewEl.parentNode.removeChild(previewEl);
      }
      previewEl = htmlToElement(`<div class="preview window glass colored"><div class="title-bar"></div></div>`);
      previewEl.querySelector(".title-bar").appendChild(canvas);
      taskbarBtn.appendChild(previewEl);
      setTimeout(() => previewEl && previewEl.classList.add("show"), 1);
      if (win.state.status === "minimized") {
        Object.assign(win.element.style, {
          opacity: 0,
          width: `${taskbarBtn.offsetWidth}px`,
          height: `${taskbarBtn.offsetHeight}px`,
          minWidth: 0,
          minHeight: 0,
          top: customEl ? 0 : `${state.y}px`,
          ...(customEl && { display: "none" }),
        });
      }
    });
  }

  function hidePreview() {
    if (previewEl) {
      previewEl.parentNode.removeChild(previewEl);
      previewEl = null;
    }
    previewIsHidden = true;
  }

  const win = {
    element: el,
    taskbarBtn,
    get body() {
      return customEl || el.querySelector(".window-body");
    },
    get prevStates() {
      return prevStates;
    },
    get state() {
      return state;
    },
    saveState,
    toggleMinimize,
    showPreview,
    hidePreview,
    close,
  };

  let windowContent;
  if (typeof content === "function") {
    // content is a function that receives win and returns a DOM element
    windowContent = content(win);
  } else {
    windowContent = content; // asume DOM element already
  }

  taskbar.appendChild(taskbarBtn);
  taskbarBtn.addEventListener("click", toggleMinimize);
  taskbarBtn.addEventListener("mouseenter", function () {
    win.showPreview();
  });
  taskbarBtn.addEventListener("mouseleave", function () {
    win.hidePreview();
  });

  if (!customEl) {
    container.appendChild(el);
    el.querySelector(".window-body").appendChild(windowContent);

    el.querySelector(".minimize").addEventListener("click", toggleMinimize);

    el.querySelector(".maximize").addEventListener("click", function () {
      snap(win, dropFull);
    });

    el.querySelector(".dbl-maximize").addEventListener("dblclick", function () {
      snap(win, dropFull);
    });

    el.querySelector(".close").addEventListener("click", close);
  }
  setActive(win);

  let w = width || el.offsetWidth;
  let h = height || el.offsetHeight;

  w = Math.min(width, container.offsetWidth - container.offsetWidth * 0.1);
  h = Math.min(h, container.offsetHeight - container.offsetHeight * 0.1);

  const x = (container.offsetWidth - w) / 2;
  const y = (container.offsetHeight - h) / 2;

  win.saveState({
    x,
    y,
    w,
    h,
    minWidth: w,
    minHeight: h,
    snapTo: "",
    status: "",
  });

  el.addEventListener("mousedown", function () {
    setActive(win);
  });

  if (!customEl) {
    const interactable = interact(el).draggable({
      allowFrom: ".title-bar",
      ignoreFrom: "button",
      cursorChecker: () => null,
      listeners: {
        start: function () {
          Object.assign(win.body.style, { pointerEvents: "none" });
        },
        move: function (event) {
          let { x, y, w, h, snapTo, status } = win.state;
          const padding = 5;

          if (status === "snapped" || status === "maximized") {
            w = win.prevStates[status].w;
            h = win.prevStates[status].h;
            x = event.pageX - event.pageX / (win.state.w / w) + x / 2;
            y = event.pageY - event.pageY / (win.state.h / h) + y / 2;
          } else {
            x += event.dx;
            y += event.dy;
          }
          if (event.pageX - padding <= 0) {
            dropLeft.style.opacity = 1;
            snapTo = "left";
          } else if (event.pageX + padding >= container.offsetWidth) {
            dropRight.style.opacity = 1;
            snapTo = "right";
          } else if (event.pageY - padding <= 0) {
            dropFull.style.opacity = 1;
            snapTo = "top";
          } else {
            if (event.buttons > 0) {
              snapTo = "";
            }
            dropLeft.style.opacity = 0;
            dropRight.style.opacity = 0;
            dropFull.style.opacity = 0;
          }

          if (event.pageY + h >= container.offsetHeight) {
            y = container.offsetHeight - h;
          }

          win.saveState({ x, y, w, h, snapTo, status: "" });
        },
        end: function () {
          let { snapTo } = win.state;
          let snapEl;
          if (snapTo === "left") {
            snapEl = dropLeft;
          }
          if (snapTo === "right") {
            snapEl = dropRight;
          }
          if (snapTo === "top") {
            snapEl = dropFull;
          }
          if (snapEl) {
            snap(win, snapEl);
          }
          Object.assign(win.body.style, { pointerEvents: "auto" });
        },
      },
    });

    if (!unresizable) {
      interactable.resizable({
        margin: 7,
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start: function () {
            Object.assign(win.body.style, { pointerEvents: "none" });
          },
          end: function () {
            Object.assign(win.body.style, { pointerEvents: "auto" });
          },
          move: function (event) {
            let { x, y } = win.state;
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            const w = event.rect.width;
            const h = event.rect.height;

            win.saveState({ x, y, w, h });
          },
        },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: "parent",
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: win.state.w, height: win.state.h },
          }),
        ],
        inertia: true,
      });
    }
  }

  windows[windowId] = win;

  return win;
}

let focusedIcon;
function focusIcon(el) {
  if (focusedIcon) {
    focusedIcon.classList.remove("focus");
  }
  focusedIcon = el;
  if (focusedIcon) {
    focusedIcon.classList.add("focus");
  }
}

iconContainer.addEventListener("mouseup", function (event) {
  if (event.target === iconContainer) {
    focusIcon(undefined);
  }
});

export function makeDesktopIcon(opts) {
  const { x, y, title, icon, run } = opts;
  const el = htmlToElement(
    desktopIconTemplate.replace("{title}", title).replace("{icon}", icon)
  );
  iconContainer.appendChild(el);

  const position = { x, y };
  Object.assign(el.style, {
    top: `${position.y}px`,
    left: `${position.x}px`,
  });

  function onClick() {
    if (run) run(opts);
    focusIcon(undefined);
  }

  el.addEventListener("dblclick", onClick);
  if (isTouchDevice()) {
    el.addEventListener("click", onClick);
  }

  el.addEventListener("mousedown", () => focusIcon(el));

  interact(el).draggable({
    cursorChecker: () => null,
    listeners: {
      move: function (event) {
        position.x += event.dx;
        position.y += event.dy;
        Object.assign(el.style, {
          top: `${position.y}px`,
          left: `${position.x}px`,
        });

        focusIcon(el);
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: "parent",
      }),
    ],
  });
}

const startMenu = document.querySelector("#start-menu");
const startBtn = document.querySelector("#start-button");
export function closeStartMenu() {
  Object.assign(startMenu.style, {
    display: "none",
  });
}

export function makeStartMenu() {
  startBtn.addEventListener("mouseenter", function () {
    startBtn.src = startHover;
  });
  startBtn.addEventListener("mouseleave", function () {
    startBtn.src = startRegular;
  });
  startBtn.addEventListener("mousedown", function () {
    startBtn.src = startActive;
    Object.assign(startMenu.style, {
      display: startMenu.style.display === "block" ? "none" : "block",
      zIndex: zIndex++,
    });
  });
  startBtn.addEventListener("mouseup", function () {
    startBtn.src = startHover;
  });
  document.addEventListener("mousedown", function (event) {
    if (!startMenu.contains(event.target) && event.target !== startBtn) {
      closeStartMenu();
    }
  });
}

export function makeClock() {
  const clock = document.querySelector("#clock");
  setInterval(function () {
    const date = new Date();
    clock.innerHTML = `<div>${date.toLocaleTimeString()}</div><div>${date.toLocaleDateString()}</div>`;
  }, 1000);
}

export function makeDialog(title, message) {
  makeWindow({
    icon: errorImg,
    width: 300,
    height: 160,
    unresizable: true,
    title,
    content: (win) => {
      const el = htmlToElement(
        `<div>
          <p>${message}</p>
          <section class="field-row" style="justify-content: flex-end;">
            <button class="close">OK</button>
          </section>
        </div>`
      );
      el.querySelector(".close").addEventListener("click", function () {
        win.close();
      });
      return el;
    },
  });
}
