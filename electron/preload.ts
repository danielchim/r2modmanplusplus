import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback: (message: string) => void) => {
    ipcRenderer.on("main-process-message", (_event, message) => callback(message))
  },
})

// Optional: expose app version or other static info
contextBridge.exposeInMainWorld("app", {
  version: "0.0.0", // You can dynamically read from package.json if needed
})
