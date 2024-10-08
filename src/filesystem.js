import { readFileSync } from "fs";
import doom from "./img/doom.jpg";
import buddha from "./img/buddha.jpg";
import dc4 from "./img/dc4.png";
import { randItem } from "./util";
const creditsText = readFileSync(__dirname + "/CREDITS.txt", "utf-8");

const trollText =
  "IF YOU'RE READING THIS, YOU'VE BEEN IN A COMA FOR ALMOST 20 YEARS NOW.\nWE'RE TRYING A NEW TECHNIQUE.\nWE DON'T KNOW WHERE THIS MESSAGE WILL END UP IN YOUR DREAM,\nBUT WE HOPE WE'RE GETTING THROUGH.";

var niceImgs = [
  "https://picsum.photos/{0}/{1}",
  "https://picsum.photos/{0}/{1}",
  "https://placebear.com/{0}/{1}",
  "https://placekitten.com/{0}/{1}",
  "https://placekeanu.com/{0}/{1}",
  "https://placecage.deno.dev/{0}/{1}",
];

function formatStr(format) {
  var args = Array.prototype.slice.call(arguments, 1);

  return format.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
}

function getRandomImageUrl() {
  var url = randItem(niceImgs);

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
    try_nks: {
      Desktop: {
        Images: niaImg,
      },
    },
    try_wolk: {
      Desktop: {
        Images: {
          "dc4.png": dc4,
        },
      },
    },
    try_andy: {
      Images: {
        "DOOM.jpg": doom,
        "aug29.jpg": buddha,
      },
      Homework: {
        "hot_redhead_solo.mp4":
          "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
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
          "https://www.youtube.com/embed/Hp-KX4HcaXo?autoplay=1",
        "two_months.mp4":
          "https://www.youtube.com/embed/9T_m6Zq3ZKQ?autoplay=1",
        "new_freedom.avi":
          "https://www.youtube.com/embed/xh8lQU1jSO4?autoplay=1",
        "milk_hun.mp4": "https://www.youtube.com/embed/-NHFNjCe0Eo?autoplay=1",
        "cyan_dot_music.mp4":
          "https://www.youtube.com/embed/3k_7KhEwJ_0?autoplay=1",
        "cold_blow.avi": "https://www.youtube.com/embed/qQPKlf5NRkc?autoplay=1",
        "rh_bb.wmv": "https://www.youtube.com/embed/hvf_LemcrcE?autoplay=1",
      },
      Documents: {
        "IMPORTANT.txt": trollText,
      },
      Desktop: {
        "CREDITS.txt": creditsText,
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
