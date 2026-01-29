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
  openFolder: (folderPath) => electron.ipcRenderer.invoke("shell:openFolder", folderPath)
});
electron.contextBridge.exposeInMainWorld("app", {
  version: "0.0.0"
  // You can dynamically read from package.json if needed
});
