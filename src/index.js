import "7.css/dist/7.css";
import "./styles.css";

import interact from "interactjs";

const winTemplate = `
<div class="window-wrapper">
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
  </div>
</div>
`;

function htmlToElement(html) {
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
    left
  };
}

function snap(win, snapEl, minimize) {
  if (!minimize) {
    snapEl.style.opacity = 0;
  }
  
  win.element.classList.add("snapping");
  setTimeout(() => {
    win.element.classList.remove("snapping");
  }, 400);

  const restore = win.state.status === "minimized" || (win.state.stauts === "maximized" && snapEl === dropFull);

  if (restore) {
    win.saveState({
      ...win.prevState,
      snapTo: ""
    });
  } else {
    let { top: y, left: x } = getElementOffset(snapEl);
    let w = snapEl.offsetWidth;
    let h = snapEl.offsetHeight;
    let status = snapEl === dropFull ? "maximized" : "";

    if (minimize) {
      status = "minimized";
    }

    win.saveState({
      w,
      h,
      x,
      y,
      snapped: true,
      snapTo: "",
      status
    });
  }
}

let zIndex = 1;
let windowId;
const container = document.querySelector("#container");
const taskbar = document.querySelector("#taskbar");
const dropLeft = document.querySelector("#drop-left");
const dropRight = document.querySelector("#drop-right");
const dropFull = document.querySelector("#drop-full");
const windows = [];

function makeWindow(opts) {
  const { title = "", content = null } = opts;
  const el = htmlToElement(winTemplate.replace("{title}", title));
  const taskbarBtn = htmlToElement(taskbarBtnTemplate);
  const id = windowId++;

  let state = {};
  let prevState = {};
  function saveState(newState) {
    prevState = { ...state };
    state = {
      ...state,
      ...newState
    };

    let { w, h, y, x, status } = state;
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    let minimizedStyle = {};
    if (status === "minimized") {
      minimizedStyle = {
        opacity: 0,
        width: taskbarBtn.offsetWidth,
        height: taskbarBtn.offsetHeight,
      };
    } else {
      minimizedStyle = {
        opacity: 1
      };
    }

    Object.assign(el.style, {
      width: `${w}px`,
      height: `${h}px`,
      top: `${y}px`,
      left: `${x}px`,
      ...minimizedStyle
    });
  }

  const win = {
    element: el,
    get prevState() {
      return prevState;
    },
    get state() {
      return state;
    },
    saveState
  };

  el.querySelector(".window-body").appendChild(content);
  container.appendChild(el);

  taskbar.appendChild(taskbarBtn);
  taskbarBtn.addEventListener("click", function () {
    snap(win, taskbarBtn, true);
  });

  el.querySelector(".minimize").addEventListener("click", function () {
    snap(win, taskbarBtn, true);
  });

  el.querySelector(".maximize").addEventListener("click", function () {
    snap(win, dropFull);
  });

  el.querySelector(".dbl-maximize").addEventListener("dblclick", function () {
    snap(win, dropFull);
  });

  el.querySelector(".close").addEventListener("click", function () {
    interact(el).unset();
    container.removeChild(el);
    taskbar.removeChild(taskbarBtn);
    delete windows[id];
  });

  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const x = (container.offsetWidth - el.offsetWidth) / 2;
  const y = (container.offsetHeight - el.offsetHeight) / 2;

  win.saveState({ x, y, w, h, snapTo: "", snapped: false, status: "" });

  el.addEventListener("mousedown", function () {
    Object.assign(el.style, { zIndex: zIndex++ });
  });

  interact(el)
    .resizable({
      margin: 7,
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          let { x, y } = win.state;
          x += event.deltaRect.left;
          y += event.deltaRect.top;
          const w = event.rect.width;
          const h = event.rect.height;

          win.saveState({ x, y, w, h });
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: "parent"
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: win.state.w, height: win.state.h }
        })
      ],
      inertia: true
    })
    .draggable({
      allowFrom: ".title-bar",
      ignoreFrom: "button",
      cursorChecker: () => null,
      listeners: {
        move: function dragMoveListener(event) {
          let { x, y, w, h, snapTo, snapped } = win.state;
          const padding = 5;

          if (snapped) {
            w = win.prevState.w;
            h = win.prevState.h;
            x = event.pageX - event.pageX / (win.state.w / w) + x / 2;
            y = event.pageY - event.pageY / (win.state.h / h) + y / 2;
            snapped = false;
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

          win.saveState({ x, y, w, h, snapTo, snapped, status: "" });
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
        }
      }
    });

  windows[windowId] = win;

  return win;
}

for (let i = 0; i < 2; i++) {
  makeWindow({
    title: "Hello",
    content: htmlToElement(`<div><p>Hello</p>
    <section class="field-row" style="justify-content: flex-end;">
      <button>OK</button>
      <button>Cancel</button>
    </section></div>`)
  });
}