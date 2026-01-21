import { app, BrowserWindow } from "electron"
import path from "node:path"

// The built directory structure
//
// ├─┬─┬ out
// │ │ ├─┬ main
// │ │ │ └── index.js
// │ │ ├─┬ preload
// │ │ │ └── index.mjs
// │ │ └─┬ renderer
// │ │   └── index.html
// │
process.env.DIST = path.join(__dirname, "../renderer")
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../../public")

let win: BrowserWindow | null

function createWindow() {
  console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL)
  console.log("isPackaged:", app.isPackaged)
  
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "r2modmanplusplus",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open devTools in development
    win.webContents.openDevTools()
  } else {
    // win.loadFile('out/renderer/index.html')
    win.loadFile(path.join(process.env.DIST!, "index.html"))
  }
}

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

app.whenReady().then(createWindow)
