import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback) => {
    ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  }
});
contextBridge.exposeInMainWorld("app", {
  version: "0.0.0"
  // You can dynamically read from package.json if needed
});
