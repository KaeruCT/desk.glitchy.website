import { makeWindow, htmlToElement } from "./lib";
import webImg from "./img/web-browser.png";
import "./browser.css";

const leftArrow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
</svg>`;

const rightArrow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
<path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
</svg>`;

const refresh = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
</svg>`;

const home = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
</svg>`;

export function openBrowser(title, getSrc, { width = 460, height = 380 } = {}) {
  return function (opts = {}) {
    makeWindow({
      icon: opts.icon || webImg,
      width,
      height,
      title,
      content: () => {
        const src = getSrc();
        const browser = htmlToElement(
          `<div class="browser">
              <form class="bar">
                <button class="back" type="button">${leftArrow}</button>
                <button class="next" type="button">${rightArrow}</button>
                <input type="text" class="url" />
                <button class="reload" type="button">${refresh}</button>
                <button class="home" type="button">${home}</button>
              </form>
              <div class="iframe-container"></iframe>
            </div>`
        );
        const urlBox = browser.querySelector(".url");
        const form = browser.querySelector("form");
        const iframeContainer = browser.querySelector(".iframe-container");
        urlBox.value = src;
        setUrl(src);

        const prev = [];
        const next = [];
        function setUrl(url) {
          iframeContainer.innerHTML = `<iframe src="${url}"></iframe>`;
        }

        browser.querySelector(".back").addEventListener("click", function () {
          const url = prev.pop();
          if (!url) return;
          next.push(url);
          setUrl(url);
          urlBox.value = url;
        });
        browser.querySelector(".next").addEventListener("click", function () {
          const url = next.pop();
          if (!url) return;
          prev.push(url);
          setUrl(url);
          urlBox.value = url;
        });
        browser.querySelector(".reload").addEventListener("click", function () {
          setUrl(urlBox.value);
        });
        browser.querySelector(".home").addEventListener("click", function () {
          prev.push(urlBox.value);
          urlBox.value = src;
          setUrl(src);
          while (next.lenth) next.pop();
        });
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!urlBox.value) return;
          if (!urlBox.value.startsWith("http://")) {
            urlBox.value = "http://" + urlBox.value;
          }
          setUrl(urlBox.value);
          prev.push(urlBox.value);
          while (next.lenth) next.pop();
        });

        return browser;
      },
    });
  };
}

export function openIframe(title, src, { width = 460, height = 380 } = {}) {
  return function (opts = {}) {
    makeWindow({
      icon: opts.icon || webImg,
      className: "no-padding",
      width,
      height,
      title,
      content: htmlToElement(
        `<div style="display: flex;">
          <iframe allowfullscreen seamless allow="autoplay" src="${src}" style="width: 100%; height: 100%">
        </div>`
      ),
    });
  };
}
