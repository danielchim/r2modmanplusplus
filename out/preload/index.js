"use strict";
const electron = require("electron");
const o = "electron-trpc", C = () => {
  const t = {
    sendMessage: (e) => electron.ipcRenderer.send(o, e),
    onMessage: (e) => electron.ipcRenderer.on(o, (c, r) => e(r))
  };
  electron.contextBridge.exposeInMainWorld("electronTRPC", t);
};
const isDevEnvironment = (() => {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
})();
function sanitizePayload(payload, depth = 0) {
  if (depth > 4) {
    return "[Truncated]";
  }
  if (payload == null) {
    return payload;
  }
  if (payload instanceof Error) {
    return {
      name: payload.name,
      message: payload.message,
      stack: payload.stack
    };
  }
  if (typeof AbortController !== "undefined" && payload instanceof AbortController) {
    return "[AbortController]";
  }
  if (payload instanceof ArrayBuffer) {
    return `[ArrayBuffer ${payload.byteLength}]`;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, depth + 1));
  }
  if (typeof payload === "object") {
    const entries = Object.entries(payload);
    return entries.reduce((acc, [key, value]) => {
      acc[key] = sanitizePayload(value, depth + 1);
      return acc;
    }, {});
  }
  return payload;
}
function logIpcRenderer(direction, channel, payload) {
  if (!isDevEnvironment) return;
  if (typeof payload === "undefined") {
    console.debug(`[ipc:${direction}] ${channel}`);
    return;
  }
  console.debug(`[ipc:${direction}] ${channel}`, sanitizePayload(payload));
}
function makeLoggable(payload) {
  return sanitizePayload(payload);
}
process.once("loaded", async () => {
  C();
});
electron.contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback) => {
    const handler = (_event, message) => {
      logIpcRenderer("main->renderer", "main-process-message", message);
      callback(message);
    };
    electron.ipcRenderer.on("main-process-message", handler);
    return () => electron.ipcRenderer.removeListener("main-process-message", handler);
  },
  // Desktop features (legacy - can migrate to tRPC gradually)
  selectFolder: () => {
    logIpcRenderer("renderer->main", "dialog:selectFolder");
    return electron.ipcRenderer.invoke("dialog:selectFolder").then((result) => {
      logIpcRenderer("main->renderer", "dialog:selectFolder", result);
      return result;
    });
  },
  openFolder: (folderPath) => {
    logIpcRenderer("renderer->main", "shell:openFolder", { folderPath });
    return electron.ipcRenderer.invoke("shell:openFolder", folderPath).then((result) => {
      logIpcRenderer("main->renderer", "shell:openFolder", result);
      return result;
    });
  },
  // Download events
  onDownloadUpdated: (callback) => {
    const handler = (_event, data) => {
      logIpcRenderer("main->renderer", "download:updated", data);
      callback(makeLoggable(data));
    };
    electron.ipcRenderer.on("download:updated", handler);
    return () => electron.ipcRenderer.removeListener("download:updated", handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => {
      logIpcRenderer("main->renderer", "download:progress", data);
      callback(makeLoggable(data));
    };
    electron.ipcRenderer.on("download:progress", handler);
    return () => electron.ipcRenderer.removeListener("download:progress", handler);
  },
  onDownloadCompleted: (callback) => {
    const handler = (_event, data) => {
      logIpcRenderer("main->renderer", "download:completed", data);
      callback(makeLoggable(data));
    };
    electron.ipcRenderer.on("download:completed", handler);
    return () => electron.ipcRenderer.removeListener("download:completed", handler);
  },
  onDownloadFailed: (callback) => {
    const handler = (_event, data) => {
      logIpcRenderer("main->renderer", "download:failed", data);
      callback(makeLoggable(data));
    };
    electron.ipcRenderer.on("download:failed", handler);
    return () => electron.ipcRenderer.removeListener("download:failed", handler);
  }
});
electron.contextBridge.exposeInMainWorld("app", {
  version: "0.0.0"
  // You can dynamically read from package.json if needed
});
