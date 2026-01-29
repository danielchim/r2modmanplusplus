import { contextBridge, ipcRenderer } from "electron"
import { exposeElectronTRPC } from "electron-trpc-experimental/preload"

// Expose tRPC IPC bridge for type-safe communication
process.once("loaded", async () => {
  exposeElectronTRPC()
})

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback: (message: string) => void) => {
    ipcRenderer.on("main-process-message", (_event, message) => callback(message))
  },
  
  // Desktop features (legacy - can migrate to tRPC gradually)
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  openFolder: (folderPath: string) => ipcRenderer.invoke("shell:openFolder", folderPath),
})

// Optional: expose app version or other static info
contextBridge.exposeInMainWorld("app", {
  version: "0.0.0", // You can dynamically read from package.json if needed
})
