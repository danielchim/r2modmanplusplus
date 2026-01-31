import { app, BrowserWindow, ipcMain, dialog, shell } from "electron"
import path from "node:path"
import { createIPCHandler } from "electron-trpc-experimental/main"
import { appRouter } from "./trpc/router"
import { createContext } from "./trpc/context"
import { initializeDownloadManager } from "./downloads/manager"
import { getPathSettings } from "./downloads/settings-state"
import { closeAllCatalogs } from "./thunderstore/catalog"

// The built directory structure
//
// ├─┬─┬ out
// │ │ ├─┬ main
// │ │ │ └── index.js
// │ │ ├─┬ preload
// │ │ │ └── index.js
// │ │ └─┬ renderer
// │ │   └── index.html
// │
process.env.DIST = path.join(__dirname, "../renderer")
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../../public")

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "r2modmanplusplus",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Register tRPC IPC handler for this window
  createIPCHandler({
    router: appRouter,
    createContext,
    windows: [win],
  })

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  // In dev mode, electron-vite sets ELECTRON_RENDERER_URL
  // Fallback to VITE_DEV_SERVER_URL for compatibility with vite-plugin-electron
  const devServerUrl = process.env.ELECTRON_RENDERER_URL ?? process.env.VITE_DEV_SERVER_URL

  if (!app.isPackaged && devServerUrl) {
    win.loadURL(devServerUrl)
    // Open devTools in development
    win.webContents.openDevTools()
  } else {
    // Production: load from built renderer output
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

// Clean up resources before app quits
app.on("before-quit", () => {
  // Close all SQLite catalog connections
  closeAllCatalogs()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
    win = null
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Initialize app and download manager
app.whenReady().then(() => {
  // Initialize download manager with settings fetcher from shared state
  const downloadManager = initializeDownloadManager(
    getPathSettings,
    3, // Default max concurrent downloads (will be updated via tRPC)
    0  // Default speed limit (will be updated via tRPC)
  )
  
  createWindow()
  
  // Register window with download manager
  if (win) {
    downloadManager.registerWindow(win)
  }
})

// IPC Handlers for desktop features
ipcMain.handle("dialog:selectFolder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  })
  
  if (result.canceled) {
    return null
  }
  
  return result.filePaths[0]
})

ipcMain.handle("shell:openFolder", async (_event, folderPath: string) => {
  await shell.openPath(folderPath)
})
