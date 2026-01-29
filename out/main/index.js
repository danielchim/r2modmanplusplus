import { shell, dialog, app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { createIPCHandler } from "electron-trpc-experimental/main";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const t = initTRPC.context().create({
  isServer: true,
  transformer: superjson
});
const publicProcedure = t.procedure;
const desktopRouter = t.router({
  /**
   * Open native folder selection dialog
   * Returns selected folder path or null if cancelled
   */
  selectFolder: publicProcedure.query(async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  }),
  /**
   * Open a folder in the system file explorer
   */
  openFolder: publicProcedure.input(z.object({ path: z.string() })).mutation(async ({ input }) => {
    await shell.openPath(input.path);
  }),
  /**
   * Health check / greeting query for testing
   */
  greeting: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return {
      text: `Hello ${input.name}`,
      timestamp: /* @__PURE__ */ new Date()
    };
  })
});
const appRouter = t.router({
  desktop: desktopRouter
});
async function createContext({ event }) {
  return {
    event
  };
}
process.env.DIST = path.join(__dirname, "../renderer");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../../public");
let win;
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
      nodeIntegration: false
    }
  });
  createIPCHandler({
    router: appRouter,
    createContext,
    windows: [win]
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  const devServerUrl = process.env.ELECTRON_RENDERER_URL ?? process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.handle("dialog:selectFolder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
});
ipcMain.handle("shell:openFolder", async (_event, folderPath) => {
  await shell.openPath(folderPath);
});
