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
    try_panpan: {
      Desktop: {
        Images: niaImg,
      },
    },
    try_wolk: {
      Desktop: {},
    },
    try_andy: {
      Desktop: {
        "CREDITS.txt": creditsText,
        Homework: {
          "SURPRISE.mp4": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        Music: {
          ur9tc: {
            "playlist.m3u8":
              "https://bandcamp.com/EmbeddedPlayer/album=1635113546/size=large/bgcol=ffffff/linkcol=f171a2/artwork=small/transparent=true",
          },
          npi: {
            "playlist.m3u8":
              "https://bandcamp.com/EmbeddedPlayer/album=2480641060/size=large/bgcol=ffffff/linkcol=f171a2/artwork=small/transparent=true",
          },
          Dicha: {
            "playlist.m3u8":
              "https://bandcamp.com/EmbeddedPlayer/album=2262989140/size=large/bgcol=ffffff/linkcol=f171a2/artwork=small/transparent=true",
          },
        },
        Videos: {
          "the_need_for_escapism.mkv":
            "https://www.youtube.com/embed/Hp-KX4HcaXo",
          "two_months.mp4": "https://www.youtube.com/embed/9T_m6Zq3ZKQ",
          "new_freedom.avi": "https://www.youtube.com/embed/xh8lQU1jSO4",
          "milk_hun.mp4": "https://www.youtube.com/embed/-NHFNjCe0Eo",
          "cyan_dot_music.mp4": "https://www.youtube.com/embed/3k_7KhEwJ_0",
          "cold_blow.avi": "https://www.youtube.com/embed/qQPKlf5NRkc",
          "rh_bb.wmv": "https://www.youtube.com/embed/hvf_LemcrcE",
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
