import { htmlToElement, makeWindow } from "./lib";
import { getExplorerFolderEntries } from "./filesystem";
import "./js-fileexplorer/file-explorer/file-explorer.js";
import "./js-fileexplorer/file-explorer/file-explorer.css";
import "./explorer.css";
import { openNotepad } from "./notepad";
import { openIframe } from "./browser";

export function openFile(name, content) {
  const nameParts = name.split(".");
  const ext = nameParts[1] && nameParts[1].toLowerCase();
  if (ext === "txt") {
    openNotepad("")({
      args: { filename: name, content: attrs.content },
    });
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
      openIframe(name, content)();
    }, 150);
  }
}

export function openExplorer() {
  return function (opts = {}) {
    let startPath = "";
    let title = "Explorer";
    if (opts) {
      title = opts.filename;
      startPath = opts.filename;
    }

    const win = makeWindow({
      icon: opts.icon,
      className: "no-padding",
      width: 640,
      height: 480,
      title: title,
      content: htmlToElement(`<div class="explorer-container"></div>`),
    });

    initExplorer(win, win.body.querySelector(".explorer-container"), startPath);
  };
}

function initExplorer(win, element, startPath) {
  let initpath = [
    ["0", "home", { canmodify: false }],
    ["1", "try_andy", { canmodify: false }],
  ];

  if (startPath) {
    initpath = startPath
      .split("/")
      .map((p, i) => [String(i), p, { canmodify: false }]);
  }

  const options = {
    // This allows drag-and-drop and cut/copy/paste to work between windows of the live demo.
    // Your application should either define the group uniquely for your application or not at all.
    group: "desk.glitchy.website",

    capturebrowser: true,

    initpath,

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
      openFile(entry.name, entry.attrs.content);
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
