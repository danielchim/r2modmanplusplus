import { contextBridge, ipcRenderer } from "electron"

const electronTrpcChannel = "electron-trpc"
const exposeElectronTRPC = () => {
  const api = {
    sendMessage: (payload: unknown) => ipcRenderer.send(electronTrpcChannel, payload),
    onMessage: (callback: (payload: unknown) => void) =>
      ipcRenderer.on(electronTrpcChannel, (_event, message) => callback(message)),
  }

  contextBridge.exposeInMainWorld("electronTRPC", api)
}

const isDevEnvironment = (() => {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== "production"
  }
  return false
})()

const sanitizePayload = (payload: unknown, depth = 0): unknown => {
  if (depth > 4) {
    return "[Truncated]"
  }
  if (payload == null) {
    return payload
  }
  if (payload instanceof Error) {
    return {
      name: payload.name,
      message: payload.message,
      stack: payload.stack,
    }
  }
  if (typeof AbortController !== "undefined" && payload instanceof AbortController) {
    return "[AbortController]"
  }
  if (payload instanceof ArrayBuffer) {
    return `[ArrayBuffer ${payload.byteLength}]`
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, depth + 1))
  }
  if (typeof payload === "object") {
    const entries = Object.entries(payload)
    return entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[key] = sanitizePayload(value, depth + 1)
      return acc
    }, {})
  }
  return payload
}

const logIpcRenderer = (direction: string, channel: string, payload?: unknown) => {
  if (!isDevEnvironment) return
  if (typeof payload === "undefined") {
    console.debug(`[ipc:${direction}] ${channel}`)
    return
  }
  console.debug(`[ipc:${direction}] ${channel}`, sanitizePayload(payload))
}

const makeLoggable = (payload: unknown) => sanitizePayload(payload)

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
