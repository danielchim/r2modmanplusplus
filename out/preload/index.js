"use strict";
const electron = require("electron");
const o = "electron-trpc", C = () => {
  const t = {
    sendMessage: (e) => electron.ipcRenderer.send(o, e),
    onMessage: (e) => electron.ipcRenderer.on(o, (c, r) => e(r))
  };
  electron.contextBridge.exposeInMainWorld("electronTRPC", t);
};
process.once("loaded", async () => {
  C();
});
electron.contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  },
  // Desktop features (legacy - can migrate to tRPC gradually)
  selectFolder: () => electron.ipcRenderer.invoke("dialog:selectFolder"),
  openFolder: (folderPath) => electron.ipcRenderer.invoke("shell:openFolder", folderPath),
  // Download events
  onDownloadUpdated: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:updated", handler);
    return () => electron.ipcRenderer.removeListener("download:updated", handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:progress", handler);
    return () => electron.ipcRenderer.removeListener("download:progress", handler);
  },
  onDownloadCompleted: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:completed", handler);
    return () => electron.ipcRenderer.removeListener("download:completed", handler);
  },
  onDownloadFailed: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:failed", handler);
    return () => electron.ipcRenderer.removeListener("download:failed", handler);
  }
});
electron.contextBridge.exposeInMainWorld("app", {
  version: "0.0.0"
  // You can dynamically read from package.json if needed
});
