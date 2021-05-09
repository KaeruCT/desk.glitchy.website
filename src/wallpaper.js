import { makeDialog } from "./lib";

const KEY = "wallpaper";

export function initWallpaper() {
  const input = document.querySelector("#wallpaper-upload");
  input.addEventListener("change", function (e) {
    const { files } = e.target;

    if (FileReader && files && files.length) {
      const fr = new FileReader();
      fr.onload = function () {
        try {
          localStorage.setItem(KEY, fr.result);
          setWallpaper(fr.result);
        } catch (e) {
          makeDialog(
            "Error!",
            "<p>Sorry, something is wrong with the chosen image.<br><br>" +
              e +
              "</p>"
          );
        }
      };
      fr.readAsDataURL(files[0]);
    }
  });

  const existing = localStorage.getItem(KEY);
  if (existing) {
    setWallpaper(existing);
  }
}

function setWallpaper(url) {
  document.querySelector(".desktop").style.backgroundImage = `url(${url})`;
}
