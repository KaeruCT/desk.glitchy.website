import { htmlToElement, makeWindow } from "./lib";
import { getExplorerFolderEntries } from "./filesystem";
import "./js-fileexplorer/file-explorer/file-explorer.js";
import "./js-fileexplorer/file-explorer/file-explorer.css";
import "./explorer.css";
import { openNotepad } from "./editor";
import { openIframe } from "./browser";

export function openExplorer() {
  return function (opts) {
    const win = makeWindow({
      icon: opts.icon,
      className: "no-padding",
      width: 640,
      height: 480,
      title: opts.title,
      content: htmlToElement(`<div class="explorer-container"></div>`),
    });

    initExplorer(win, win.body.querySelector(".explorer-container"));
  };
}

function initExplorer(win, element) {
  var options = {
    // This allows drag-and-drop and cut/copy/paste to work between windows of the live demo.
    // Your application should either define the group uniquely for your application or not at all.
    group: "desk.glitchy.website",

    capturebrowser: true,

    initpath: [
      ["0", "home", { canmodify: false }],
      ["1", "try_andy", { canmodify: false }],
    ],

    // See main documentation for the complete list of keys.
    // The only tool that won't show as a result of a handler being defined is 'item_checkboxes'.
    tools: {
      item_checkboxes: true,
    },

    onrefresh: function (folder, required) {
      if (!required) return;
      const pathParts = folder.GetPath();
      const parts = pathParts.map((p) => p[1]);
      const entries = getExplorerFolderEntries(parts);

      win.setTitle(parts.join("/"));
      folder.SetEntries(entries);
    },

    onrename: function (renamed, folder, entry, newname) {
      renamed(entry);
    },

    onopenfile: function (folder, entry) {
      const nameParts = entry.name.split(".");
      const ext = nameParts[1] && nameParts[1].toLowerCase();
      if (ext === "txt") {
        openNotepad(entry.name, entry.attrs.content)();
      }

      const iframeExts = [
        "jpg",
        "jpeg",
        "png",
        "url",
        "webm",
        "wma",
        "wmv",
        "mkv",
        "avi",
        "mp4",
        "m3u8",
      ];
      if (iframeExts.includes(ext)) {
        setTimeout(function () {
          openIframe(entry.name, entry.attrs.content)();
        }, 150);
      }
    },

    onnewfolder: function (created, folder) {
      created(false);
    },

    onnewfile: function (created, folder) {
      created(false);
    },

    oninitupload: function (startupload, fileinfo) {
      // noop
    },

    // Optional upload handler function to finalize an uploaded file on a server (e.g. move from a temporary directory to the final location).
    onfinishedupload: function (finalize, fileinfo) {
      // noop
    },

    // Optional upload handler function to receive permanent error notifications.
    onuploaderror: function (fileinfo, e) {
      // noop
    },

    oninitdownload: function (startdownload, folder, ids, entries) {
      // noop
    },

    ondownloadstarted: function (options) {
      // noop
    },

    ondownloaderror: function (options) {
      // noop
    },

    // Calculated information must be fully synchronous (i.e. no AJAX calls).  Chromium only.
    ondownloadurl: function (result, folder, ids, entry) {
      // noop
    },

    oncopy: function (copied, srcpath, srcids, destfolder) {
      copied(false);
    },

    onmove: function (moved, srcpath, srcids, destfolder) {
      moved(false);
    },

    ondelete: function (deleted, folder, ids, entries, recycle) {
      deleted(false);
    },
  };

  new window.FileExplorer(element, options);
}
