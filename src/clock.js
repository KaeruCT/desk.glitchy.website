import "./clock.css";
import { htmlToElement, makeWindow } from "./lib";

function getNotches() {
  const notches = [];
  let hours = 12;
  for (let i = 0; i < hours; i++) {
    notches.push((Math.PI * 2 * i) / hours);
  }
  return notches;
}

function getHands(date) {
  let s = date.getSeconds() / 60;
  let m = date.getMinutes() / 60;
  let h = date.getHours() / 12;

  return [h, m, s].map((val) => Math.PI * (1 + val * 2));
}

function getHandId(i) {
  return `hand-${i}`;
}

function initClock(date) {
  const clock = document.createElement("div");
  clock.className = "clock";
  getHands(date).forEach(function (_, i) {
    const hand = document.createElement("div");
    hand.className = "hand " + getHandId(i);
    clock.appendChild(hand);
  });
  getNotches().forEach(function (val, i) {
    const notch = document.createElement("div");
    notch.classList.add("notch");
    if (i % 3 === 0) {
      notch.classList.add("notch-strong");
    }
    notch.style.transform = `rotate(${val}rad)`;
    clock.appendChild(notch);
  });
  return clock;
}

function updateClock(container, date) {
  getHands(date).forEach(function (val, i) {
    const hand = container.querySelector("." + getHandId(i));
    hand.style.transform = `rotate(${val}rad)`;
  });
}

export function openClock() {
  return function (opts) {
    const win = makeWindow({
      icon: opts.icon,
      className: "no-padding",
      width: 300,
      height: 300,
      title: opts.title,
      content: htmlToElement(
        `<div class="clock-container"><div class="app"></div></div>`
      ),
    });

    const clock = initClock(new Date());
    win.body.querySelector(".app").appendChild(clock);
    updateClock(win.body, new Date());
    setInterval(function () {
      updateClock(win.body, new Date());
    }, 1000);
  };
}
