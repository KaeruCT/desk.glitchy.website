import Webamp from "webamp";
import untergangstraum from "./audio/untergangstraum.mp3";
import t1 from "./audio/1.busy_metropolis.mp3";
import t2 from "./audio/2.maze_song.mp3";
import t3 from "./audio/3.melancholy_(chiptune_version).mp3";
import t4 from "./audio/4.june.loop.mp3";
import t5 from "./audio/5.squid_in_space.mp3";

export function initWebamp() {
  const webamp = new Webamp({
    zIndex: 99999,
    initialTracks: [
      {
        metaData: {
          artist: "Try Andy",
          title: "Busy Metropolis",
          album: "Papaya Potential",
        },
        url: t1,
        duration: 120,
      },
      {
        metaData: {
          artist: "Try Andy",
          title: "Maze Song",
          album: "Papaya Potential",
        },
        url: t2,
        duration: 193,
      },
      {
        metaData: {
          artist: "Try Andy",
          title: "Melancholy (Chiptune Version)",
          album: "Papaya Potential",
        },
        url: t3,
        duration: 162,
      },
      {
        metaData: {
          artist: "Try Andy",
          title: "june.loop",
          album: "Papaya Potential",
        },
        url: t4,
        duration: 139,
      },
      {
        metaData: {
          artist: "Try Andy",
          title: "Squid in Space",
          album: "Papaya Potential",
        },
        url: t5,
        duration: 164,
      },
      {
        metaData: {
          artist: "Try Andy",
          title: "Untergangstraum",
          album: "Musikschöpfungen von Ende 2020 bis Anfang 2021",
        },
        url: untergangstraum,
        duration: 250,
      },
    ],
    __butterchurnOptions: {
      importButterchurn: () => {
        // Only load butterchurn when music starts playing to reduce initial page load
        return import("butterchurn");
      },
      getPresets: () => {
        // Load presets from preset URL mapping on demand as they are used
        return fetch(
          // NOTE: Your preset file must be served from the same domain as your HTML
          // file, or served with permissive CORS HTTP headers:
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
          "https://unpkg.com/butterchurn-presets-weekly@0.0.2/weeks/week1/presets.json"
        )
          .then((resp) => resp.json())
          .then((namesToPresetUrls) => {
            return Object.keys(namesToPresetUrls).map((name) => {
              return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
            });
          });
      },
      butterchurnOpen: true,
    },
    __initialWindowLayout: {
      main: { position: { x: 0, y: 0 } },
      equalizer: { position: { x: 0, y: 116 } },
      playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
      milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] },
    },
  });
  return webamp;
}
