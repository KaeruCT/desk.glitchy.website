import interact from "interactjs";
import html2canvas from "html2canvas";
import defaultIcon from "./img/unknown.png";
import startActive from "./img/startactive.png";
import startHover from "./img/starthover.png";
import startRegular from "./img/startregular.png";
import errorImg from "./img/error.png";
import { findPrograms } from "./programs";
import { debounce } from "./util";

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
  if (!activeWin) {
    return;
  }
  Object.assign(activeWin.element.style, { zIndex: zIndex++ });
  activeWin.taskbarBtn.classList.add("active");
}

function inferActive() {
  let nonMinimized = 0;
  Object.keys(windows).forEach((id) => {
    if (windows[id].state.status !== "minimized") {
      nonMinimized = id;
    }
  });
  setActive(windows[nonMinimized]);
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
let windowId = 1;
const desktop = document.querySelector(".desktop");
const container = document.querySelector("#container");
const iconContainer = document.querySelector("#icon-container");
const taskbar = document.querySelector("#taskbar");
const dropLeft = document.querySelector("#drop-left");
const dropRight = document.querySelector("#drop-right");
const dropFull = document.querySelector("#drop-full");
const windows = {};

export function makeWindow(opts) {
  desktop.style.cursor = "progress";

  const {
    width = 0,
    height = 0,
    content = null,
    customEl = null,
    className = "",
    unresizable = false,
  } = opts;
  let title = opts.title || "";
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
      inferActive();
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
    // TODO: uncomment if we have the preview update again
    // if (updatePreviewInterval) {
    //   clearInterval(updatePreviewInterval);
    // }
    interact(el).unset();
    win.element.classList.add("fading-out");
    win.element.style.opacity = 0;
    win.element.style.transform = "scale(0.85)";
    setTimeout(() => {
      el.parentNode.removeChild(el);
      taskbar.removeChild(taskbarBtn);
      win.hidePreview();
      if (win.onClose) {
        win.onClose();
      }
      delete windows[id];
    }, 300);

    inferActive();
  }

  let previewEl;
  let previewCanvas;
  let previewScheduled;

  function initPreview() {
    if (win.state.status === "minimized") return;
    const previewBody =
      win.element.querySelector(".window-body") || // normal window
      win.element.querySelector("#main-window") || // webamp window
      win.element; // fallback

    html2canvas(previewBody, {
      backgroundColor: null,
      allowTaint: true,
      logging: false,
    }).then((canvas) => {
      if (win.state.status === "minimized") return;
      previewCanvas = canvas;
      if (previewScheduled) {
        win.showPreview();
      }
    });
  }

  function showPreview() {
    if (previewEl && previewEl.classList.contains("show")) return;
    if (!previewCanvas) {
      previewScheduled = true;
      return;
    }
    previewScheduled = false;
    Object.keys(windows).forEach((id) => {
      if (id !== this.id) {
        windows[id].hidePreview();
      }
    });

    if (previewEl) {
      previewEl.parentNode.removeChild(previewEl);
    }
    previewEl = htmlToElement(
      `<div class="preview window glass colored"><div class="title-bar"></div></div>`
    );
    const title = htmlToElement(
      `<div class="preview-title">
        <div class="title-bar-text">${win.title}</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="close"></button>
        </div>
      </div>`
    );
    const content = previewEl.querySelector(".title-bar");
    content.appendChild(title);
    content.appendChild(previewCanvas);
    taskbarBtn.appendChild(previewEl);

    previewEl.querySelector(".close").addEventListener("click", function (e) {
      e.stopPropagation();
      win.close();
    });

    setTimeout(() => previewEl && previewEl.classList.add("show"), 1);
  }

  function hidePreview() {
    previewScheduled = false;
    if (previewEl) {
      previewEl.parentNode.removeChild(previewEl);
      previewEl = null;
    }
  }

  function setTitle(newTitle) {
    title = newTitle;
    const titleEl = win.element.querySelector(".title-bar-text");
    if (titleEl) {
      titleEl.innerText = newTitle;
    }
  }

  const win = {
    element: el,
    taskbarBtn,
    get id() {
      return id;
    },
    get body() {
      return customEl || el.querySelector(".window-body");
    },
    get title() {
      return title;
    },
    get prevStates() {
      return prevStates;
    },
    get state() {
      return state;
    },
    get container() {
      return container;
    },
    setActive: function _setActive() {
      setActive(win);
    },
    get isActive() {
      return activeWin === win;
    },
    setTitle,
    saveState,
    toggleMinimize,
    showPreview,
    hidePreview,
    close,
    hasCustomEl: !!customEl,
  };

  let windowContent;
  if (typeof content === "function") {
    // content is a function that receives win and returns a DOM element
    windowContent = content(win);
  } else {
    windowContent = content; // asume DOM element already
  }

  let hideTimeout;
  taskbar.appendChild(taskbarBtn);
  taskbarBtn.addEventListener("click", function () {
    if (win.state.status === "minimized" || win.isActive) {
      win.toggleMinimize();
    } else {
      win.setActive();
    }
  });
  taskbarBtn.addEventListener("mouseenter", function () {
    if (hideTimeout) clearTimeout(hideTimeout);
    win.showPreview();
  });
  taskbarBtn.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(() => win.hidePreview(), 250);
  });

  if (!customEl) {
    el.style.opacity = 0;
    el.style.transform = "scale(0.9)";
    el.classList.add("fading-in");
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

  setTimeout(initPreview, 500);
  // TODO: figure out when to update the previews, it's very resource heavy
  // for external images
  //const updatePreviewInterval = setInterval(initPreview, 5 * 1000);
  setActive(win);

  let w = width || el.offsetWidth;
  let h = height || el.offsetHeight;

  w = Math.min(width, container.offsetWidth - container.offsetWidth * 0.1);
  h = Math.min(h, container.offsetHeight - container.offsetHeight * 0.1);
  const minWidth = Math.max(w / 2, 360);

  const x = (container.offsetWidth - w) / 2;
  const y = (container.offsetHeight - h) / 2;

  win.saveState({
    x,
    y,
    w,
    h,
    minWidth,
    minHeight: h,
    snapTo: "",
    status: "",
  });

  el.style.opacity = 1;
  el.style.transform = "";
  setTimeout(() => {
    el.classList.remove("fading-in");
  }, 200);
  setTimeout(() => {
    desktop.style.cursor = "default";
  }, 400);

  const titleBar = el.querySelector(".title-bar");
  if (titleBar) {
    titleBar.addEventListener("mousedown", function () {
      setActive(win);
    });
  }

  function delayedActivate() {
    setTimeout(() => {
      if (windows[win.id]) {
        // check if the window still exists before focusing because of a click
        setActive(win);
      }
    }, 10);
  }

  el.addEventListener("click", delayedActivate);

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

          if (win.onDrag) {
            win.onDrag();
          }
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

  windows[id] = win;
  return win;
}

let focusedIcon;
function focusIcon(el) {
  const icons = document.querySelectorAll(".desktop-icon");
  icons.forEach((icon) => icon.classList.remove("focus"));
  if (el) {
    selectedIcons = [el];
    focusedIcon = el;
    focusedIcon.classList.add("focus");
  } else {
    selectedIcons = [];
  }
}

iconContainer.addEventListener("mouseup", function (event) {
  if (
    event.target === iconContainer &&
    lastDragBoxTime + 150 < new Date().getTime()
  ) {
    focusIcon(undefined);
  }
});

function getIcons() {
  return document.querySelectorAll(".desktop-icon");
}

let iconZIndex = 0;
let selectedIcons = [];
export function makeDesktopIcon(opts) {
  const { x, y, title, icon, run } = opts;
  const el = htmlToElement(
    desktopIconTemplate.replace("{title}", title).replace("{icon}", icon)
  );
  iconContainer.appendChild(el);

  Object.assign(el.style, {
    top: `${y}px`,
    left: `${x}px`,
  });

  function onClick() {
    if (run) run(opts);
    focusIcon(undefined);
  }

  if (isTouchDevice()) {
    el.addEventListener("click", function () {
      if (
        el.lastDragTime === 0 ||
        el.lastDragTime + 150 > new Date().getTime()
      ) {
        return;
      }
      onClick();
    });
  } else {
    el.addEventListener("dblclick", onClick);
  }

  let positions = [];
  let start = [];
  interact(el).draggable({
    cursorChecker: () => null,
    listeners: {
      start: function () {
        if (selectedIcons.length === 0 || !selectedIcons.includes(el))
          focusIcon(el);
        positions = selectedIcons.map((icon) => ({
          x: parseInt(icon.style.left),
          y: parseInt(icon.style.top),
        }));
        start = [...positions.map((p) => ({ ...p }))];
      },
      move: function (event) {
        positions = positions.map((p) => ({
          x: p.x + event.dx,
          y: p.y + event.dy,
        }));
        selectedIcons.forEach((icon, i) => {
          Object.assign(icon.style, {
            top: `${positions[i].y}px`,
            left: `${positions[i].x}px`,
            zIndex: iconZIndex++,
          });
        });
      },
      end: function () {
        el.lastDragTime = new Date().getTime();
        const anyIsOutOfBounds = positions.some(
          (p) =>
            p.x < 0 ||
            p.y < 0 ||
            p.x >= container.clientWidth ||
            p.y >= container.clientHeight
        );
        if (anyIsOutOfBounds) {
          selectedIcons.forEach((icon, i) => {
            Object.assign(icon.style, {
              top: `${start[i].y}px`,
              left: `${start[i].x}px`,
              zIndex: iconZIndex++,
            });
          });
        }
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: "parent",
      }),
    ],
  });
}

function isIconInSelection(icon) {
  const selectionRect = dragBox.getBoundingClientRect();
  const rect = icon.getBoundingClientRect();
  const w = rect.right - rect.left;
  const h = rect.bottom - rect.top;
  return (
    selectionRect.left <= rect.left + w &&
    selectionRect.top <= rect.top + h &&
    selectionRect.right >= rect.right - w &&
    selectionRect.bottom >= rect.bottom - h
  );
}

const dragBox = document.querySelector("#icon-select");
let lastDragBoxTime = 0;
export function initIconSelect() {
  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;
  const icons = getIcons();
  interact(iconContainer).draggable({
    cursorChecker: () => null,
    listeners: {
      start: function (event) {
        x1 = event.x0;
        y1 = event.y0;
        iconZIndex++;
      },
      move: function (event) {
        x2 = event.client.x;
        y2 = event.client.y;
        const top = Math.min(y1, y2);
        const left = Math.min(x1, x2);
        const bottom = Math.max(y1, y2);
        const right = Math.max(x1, x2);
        Object.assign(dragBox.style, {
          display: "block",
          top: `${top}px`,
          left: `${left}px`,
          height: `${bottom - top}px`,
          width: `${right - left}px`,
          zIndex: iconZIndex,
        });
        selectedIcons = [];
        icons.forEach((icon) => {
          if (isIconInSelection(icon)) {
            icon.classList.add("focus");
            selectedIcons.push(icon);
          } else {
            icon.classList.remove("focus");
          }
        });
        lastDragBoxTime = new Date().getTime();
      },
      end: function () {
        Object.assign(dragBox.style, {
          display: "none",
          height: 0,
          width: 0,
        });
        lastDragBoxTime = new Date().getTime();
      },
    },
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

const spotlightBtn = document.querySelector("#spotlight-button");
const spotlightMenu = document.querySelector("#spotlight-menu");
const spotlightInput = document.querySelector("#spotlight-input");
const spotlightResults = document.querySelector("#spotlight-results");
export function closeSpotlightMenu() {
  Object.assign(spotlightMenu.style, {
    display: "none",
  });
}

export function makeSpotlight() {
  let lastResults;
  let focused = 0;
  function setFocus(i) {
    const results = spotlightResults.querySelectorAll(".result");
    if (!results.length) return;

    if (results[focused]) {
      results[focused].classList.remove("active");
    }
    if (i > results.length - 1) i = 0;
    if (i < 0) i = results.length - 1;

    results[i].classList.add("active");
    results[i].scrollIntoView && results[i].scrollIntoView();
    focused = i;
  }

  function updateResults() {
    lastResults = findPrograms(spotlightInput.value);
    spotlightResults.innerHTML = "";
    lastResults.forEach((r) => {
      const el = htmlToElement(
        `<div class="result"><img src="${r.icon}" /><div>${r.title}</div></div>`
      );

      el.addEventListener("click", function () {
        setTimeout(() => r.run(r), 150);
        closeSpotlightMenu();
      });

      spotlightResults.appendChild(el);
    });
    setFocus(0);
  }

  spotlightBtn.addEventListener("click", function () {
    Object.assign(spotlightMenu.style, {
      display: spotlightMenu.style.display === "block" ? "none" : "block",
      zIndex: zIndex++,
    });

    spotlightResults.innerHTML = "";
    spotlightInput.value = "";
    spotlightInput.focus();
    updateResults();
  });
  document.addEventListener("mousedown", function (event) {
    if (
      !spotlightMenu.contains(event.target) &&
      !spotlightBtn.contains(event.target)
    ) {
      closeSpotlightMenu();
    }
  });
  spotlightInput.addEventListener("input", debounce(updateResults, 250));
  spotlightInput.addEventListener("keydown", function (e) {
    if (e.which == 38 || e.keyCode == 38) {
      setFocus(focused - 1);
      e.preventDefault();
    }

    if (e.which == 40 || e.keyCode == 40) {
      setFocus(focused + 1);
      e.preventDefault();
    }

    if (e.which == 13 || e.keyCode == 13) {
      if (lastResults) {
        const program = lastResults[focused];
        setTimeout(() => program.run(program), 150);
        closeSpotlightMenu();
        e.preventDefault();
      }
    }

    if (e.which == 27 || e.keyCode == 27) {
      closeSpotlightMenu();
      e.preventDefault();
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

export function makeDialog(title, message, icon = undefined) {
  return makeWindow({
    icon: icon || errorImg,
    width: 300,
    height: 160,
    unresizable: true,
    title,
    content: (win) => {
      const el = htmlToElement(
        `<div>
          ${message}
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
