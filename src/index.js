import "7.css/dist/7.css";
import "./styles.css";

import interact from "interactjs";

const desktopIconTemplate = `
<div class="desktop-icon">
  <img src="{icon}" />
  <div>{title}</div>
</div>
`;

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

  const restore = win.state.status === "minimized" || (win.state.status === "maximized" && snapEl === dropFull);
  
  if (restore) {
    win.saveState({
      ...win.prevStates[win.state.status],
      snapTo: ""
    });
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
      status
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

function makeWindow(opts) {
  const { title = "", width = 0, height = 0, content = null } = opts;
  const el = htmlToElement(winTemplate.replace("{title}", title));
  const taskbarBtn = htmlToElement(taskbarBtnTemplate);
  const id = windowId++;

  let state = {};
  let prevStates = [];
  function saveState(newState) {
    if (newState.status) {
      const skip = newState.status === "maximized" && state.status === "minimized";
      if (!skip) {
        prevStates[newState.status] = { ...state };
      }
      
    }

    state = {
      ...state,
      ...newState,
      prevStatus: state.status,
    };

    let { w, h, y, x, status } = state;
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    let minimizedStyle = {};
    if (status === "minimized") {
      minimizedStyle = {
        opacity: 0,
        width: `${taskbarBtn.offsetWidth}px`,
        height: `${taskbarBtn.offsetHeight}px`,
        minWidth: 0,
      };
    } else {
      minimizedStyle = {
        opacity: 1
      };
      delete el.style.minWidth;
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
    get prevStates() {
      return prevStates;
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

  const w = width || el.offsetWidth;
  const h = height || el.offsetHeight;
  const x = (container.offsetWidth - w) / 2;
  const y = (container.offsetHeight - h) / 2;

  win.saveState({ x, y, w, h, snapTo: "", status: "" });

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
        }
      }
    });

  windows[windowId] = win;

  return win;
}

function makeDesktopIcon(opts) {
  const { x, y, title, icon, run } = opts;
  const el = htmlToElement(desktopIconTemplate.replace("{title}", title).replace("{icon}", icon));
  iconContainer.appendChild(el);

  const position = { x, y };
  Object.assign(el.style, {
    top: `${position.y}px`,
    left: `${position.x}px`
  });

  el.addEventListener("dblclick", () => run());

  interact(el).draggable({
    cursorChecker: () => null,
    listeners: {
      move: function(event) {
        position.x += event.dx;
        position.y += event.dy;
        Object.assign(el.style, {
          top: `${position.y}px`,
          left: `${position.x}px`
        });
      }
    }
  });
}

let n = 0;
makeDesktopIcon({
  x: 40,
  y: 40, 
  title: "Magic Sauce",
  icon: "https://snippets.cdn.mozilla.net/media/icons/cf90f4af-9ce9-4614-9473-d97260615c7b.png",
  run: () => {
    if (n++%2 === 0) {
      makeWindow({
        width: 600,
        height: 400,
        title: "Magic Paint " + new Date().getTime(),
        content: htmlToElement(`<div style="display: flex; flex-direction: column;">
        <iframe src="https://paint.js.org/" style="width: 100%; height: 100%">
        </div>`)
      });
      return;
    }

    makeWindow({
      width: 160,
      height: 100,
      title: "Waste Ur Time",
      content: htmlToElement(`<div style="display: flex; flex-direction: column;">
      <div>Attempting to load fucks...</div>
      <div role="progressbar" class="marquee"></div>
      </div>`)
    });
  }
});

// /<div><p>Hello</p>
// <section class="field-row" style="justify-content: flex-end;">
// <button>OK</button>
// <button>Cancel</button>
// </section></div>