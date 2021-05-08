import { readFileSync } from "fs";
const creditsText = readFileSync(__dirname + "/CREDITS.txt", "utf-8");

var niceImgs = [
  "https://picsum.photos/{0}/{1}",
  "https://source.unsplash.com/{0}x{1}",
  "https://placebear.com/{0}/{1}",
  "https://placekitten.com/{0}/{1}",
  "https://placekeanu.com/{0}/{1}",
  "https://www.placecage.com/{0}/{1}",
];

function formatStr(format) {
  var args = Array.prototype.slice.call(arguments, 1);

  return format.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
}

function getRandomImageUrl() {
  var url = niceImgs[Math.floor(Math.random() * niceImgs.length)];

  url = formatStr(
    url,
    Math.floor(Math.random() * 300) + 200,
    Math.floor(Math.random() * 300) + 200
  );

  return url;
}

const niaImg = {};
for (let i = 1; i <= 28; i++) {
  niaImg[`nice_${i}.jpg`] = getRandomImageUrl();
}

export const filesystem = {
  home: {
    nia: {
      Desktop: {},
      Images: niaImg,
    },
    van: {
      Desktop: {},
    },
    try_andy: {
      Desktop: {
        "CREDITS.txt": creditsText,
        Homework: {
          "SURPRISE.url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      },
      Music: {
        "you're nine times closer": {
          "TRACKLIST.url":
            "https://tryandy.bandcamp.com/album/youre-nine-times-closer",
        },
        npi: {
          "TRACKLIST.url": "https://tryandy.bandcamp.com/album/npi",
        },
        Dicha: {
          "TRACKLIST.url": "https://tryandy.bandcamp.com/album/dicha",
        },
      },
    },
  },
};

function toExplorerEntries(dir) {
  const files = Object.keys(dir);
  return files.map((f, i) => {
    const id = f + "-" + i;
    const type = typeof dir[f] === "object" ? "folder" : "file";
    const content = type === "file" ? dir[f] : "";
    const thumb = f.endsWith(".jpg") ? content : "";

    return {
      id,
      name: f,
      type,
      hash: id,
      attrs: { canmodify: false, content },
      size: content.length,
      thumb,
    };
  });
}

export function getExplorerFolderEntries(pathParts) {
  let dir = filesystem;
  const parts = [...pathParts];
  while (parts.length > 0) {
    const pathPart = parts.shift();
    dir = dir[pathPart];
    if (!dir) {
      console.error(`path (${pathPart}) not found`, pathParts);
    }
  }
  return dir ? toExplorerEntries(dir) : [];
}
