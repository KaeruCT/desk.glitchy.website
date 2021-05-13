import { makeWindow } from "./lib";
import { initWebamp } from "./webamp";
import "./winamp.css";

export function openWinamp(title, { width = 0, height = 0 } = {}) {
  let running = false;

  return function (opts) {
    if (running) return;
    running = true;

    const webamp = initWebamp();

    webamp.renderWhenReady(document.querySelector("#drop-full")).then(() => {
      const customEl = document.querySelector("#webamp");
      document.querySelector("#container").appendChild(customEl); // so it respects zindex of other windows
      makeWindow({
        customEl,
        icon: opts.icon,
        width,
        height,
        title,
        content: (win) => {
          webamp.onClose(() => {
            win.close();
            webamp.dispose();
            running = false;
          });
          webamp.onMinimize(() => {
            win.toggleMinimize();
          });
        },
      });
    });
  };
}
