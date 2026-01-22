"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  },
  // Desktop features
  selectFolder: () => electron.ipcRenderer.invoke("dialog:selectFolder"),
  openFolder: (folderPath) => electron.ipcRenderer.invoke("shell:openFolder", folderPath)
});
electron.contextBridge.exposeInMainWorld("app", {
  version: "0.0.0"
  // You can dynamically read from package.json if needed
});
