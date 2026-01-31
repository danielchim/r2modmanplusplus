import { contextBridge, ipcRenderer } from "electron"
import { exposeElectronTRPC } from "electron-trpc-experimental/preload"
import { logIpcRenderer, makeLoggable } from "./logger"

// Expose tRPC IPC bridge for type-safe communication
process.once("loaded", async () => {
  exposeElectronTRPC()
})

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Example API: you can extend this with more methods as needed
  onMainProcessMessage: (callback: (message: string) => void) => {
    const handler = (_event: unknown, message: string) => {
      logIpcRenderer("main->renderer", "main-process-message", message)
      callback(message)
    }
    ipcRenderer.on("main-process-message", handler)
    return () => ipcRenderer.removeListener("main-process-message", handler)
  },
  
  // Desktop features (legacy - can migrate to tRPC gradually)
  selectFolder: () => {
    logIpcRenderer("renderer->main", "dialog:selectFolder")
    return ipcRenderer.invoke("dialog:selectFolder").then((result) => {
      logIpcRenderer("main->renderer", "dialog:selectFolder", result)
      return result
    })
  },
  openFolder: (folderPath: string) => {
    logIpcRenderer("renderer->main", "shell:openFolder", { folderPath })
    return ipcRenderer.invoke("shell:openFolder", folderPath).then((result) => {
      logIpcRenderer("main->renderer", "shell:openFolder", result)
      return result
    })
  },
  
  // Download events
  onDownloadUpdated: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => {
      logIpcRenderer("main->renderer", "download:updated", data)
      callback(makeLoggable(data))
    }
    ipcRenderer.on("download:updated", handler)
    return () => ipcRenderer.removeListener("download:updated", handler)
  },
  onDownloadProgress: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => {
      logIpcRenderer("main->renderer", "download:progress", data)
      callback(makeLoggable(data))
    }
    ipcRenderer.on("download:progress", handler)
    return () => ipcRenderer.removeListener("download:progress", handler)
  },
  onDownloadCompleted: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => {
      logIpcRenderer("main->renderer", "download:completed", data)
      callback(makeLoggable(data))
    }
    ipcRenderer.on("download:completed", handler)
    return () => ipcRenderer.removeListener("download:completed", handler)
  },
  onDownloadFailed: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => {
      logIpcRenderer("main->renderer", "download:failed", data)
      callback(makeLoggable(data))
    }
    ipcRenderer.on("download:failed", handler)
    return () => ipcRenderer.removeListener("download:failed", handler)
  },
})

// Optional: expose app version or other static info
contextBridge.exposeInMainWorld("app", {
  version: "0.0.0", // You can dynamically read from package.json if needed
})
