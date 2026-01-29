import { app, shell, dialog, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { createIPCHandler } from "electron-trpc-experimental/main";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { createHash } from "crypto";
import { gunzip } from "zlib";
import { promisify } from "util";
import { promises } from "fs";
import { join } from "path";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const gunzipAsync = promisify(gunzip);
const ALLOWED_HOSTS = /* @__PURE__ */ new Set([
  "thunderstore.io",
  "gcdn.thunderstore.io"
]);
function validateThunderstoreUrl(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new Error(`URL not from allowed Thunderstore host: ${hostname}`);
  }
}
function computeHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
async function fetchGzipJson(url, timeoutMs = 6e4) {
  validateThunderstoreUrl(url);
  const fetchedAt = /* @__PURE__ */ new Date();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json, application/octet-stream"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = computeHash(buffer);
    const decompressed = await gunzipAsync(buffer);
    const jsonString = decompressed.toString("utf-8");
    const content = JSON.parse(jsonString);
    return {
      content,
      hash,
      fetchedAt
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
      }
      throw new Error(`Failed to fetch gzip blob from ${url}: ${error.message}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
function getCacheKey(packageIndexUrl) {
  return createHash("sha256").update(packageIndexUrl).digest("hex").substring(0, 16);
}
function getCacheDir() {
  return join(app.getPath("userData"), "thunderstore-cache");
}
function getCacheFilePath(cacheKey) {
  return join(getCacheDir(), `${cacheKey}.json`);
}
async function ensureCacheDir() {
  const dir = getCacheDir();
  try {
    await promises.mkdir(dir, { recursive: true });
  } catch (error) {
  }
}
async function loadCache(packageIndexUrl) {
  const cacheKey = getCacheKey(packageIndexUrl);
  const filePath = getCacheFilePath(cacheKey);
  try {
    const content = await promises.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    if (!Array.isArray(data.packages) || !data.packageIndexUrl || !data.indexHash) {
      console.warn(`Invalid cache structure for ${cacheKey}`);
      return null;
    }
    data.cachedAt = new Date(data.cachedAt);
    return data;
  } catch (error) {
    return null;
  }
}
async function saveCache(packageIndexUrl, packages, indexHash) {
  await ensureCacheDir();
  const cacheKey = getCacheKey(packageIndexUrl);
  const filePath = getCacheFilePath(cacheKey);
  const data = {
    packages,
    packageIndexUrl,
    indexHash,
    cachedAt: /* @__PURE__ */ new Date()
  };
  await promises.writeFile(filePath, JSON.stringify(data), "utf-8");
}
function transformVersion(version) {
  return {
    version_number: version.version_number,
    datetime_created: version.date_created,
    download_count: version.downloads,
    download_url: version.download_url,
    install_url: `ror2mm://v1/install/thunderstore.io/${version.full_name}/${version.version_number}/`
  };
}
function isModpack(categories) {
  return categories.some((cat) => cat.toLowerCase() === "modpacks");
}
function transformPackage(pkg, gameId) {
  const latestVersion = pkg.versions[0];
  if (!latestVersion) {
    throw new Error(`Package ${pkg.full_name} has no versions`);
  }
  return {
    id: pkg.uuid4,
    gameId,
    kind: isModpack(pkg.categories) ? "modpack" : "mod",
    name: pkg.name,
    author: pkg.owner,
    description: latestVersion.description,
    version: latestVersion.version_number,
    downloads: latestVersion.downloads,
    iconUrl: latestVersion.icon,
    isInstalled: false,
    isEnabled: false,
    lastUpdated: pkg.date_updated,
    dependencies: latestVersion.dependencies || [],
    categories: pkg.categories,
    readmeHtml: "",
    // Fetched separately via getReadme
    versions: pkg.versions.map(transformVersion)
  };
}
function transformPackages(packages, gameId) {
  return packages.filter((pkg) => pkg.versions.length > 0).map((pkg) => transformPackage(pkg, gameId));
}
async function ensureCommunityCached(packageIndexUrl) {
  const indexResult = await fetchGzipJson(packageIndexUrl);
  const chunkUrls = indexResult.content;
  const indexHash = indexResult.hash;
  const cached = await loadCache(packageIndexUrl);
  if (cached && cached.indexHash === indexHash) {
    console.log(`Using cached packages for ${packageIndexUrl} (${cached.packages.length} packages)`);
    return cached.packages;
  }
  console.log(`Fetching ${chunkUrls.length} chunks for ${packageIndexUrl}`);
  const chunkPromises = chunkUrls.map((url) => fetchGzipJson(url));
  const chunkResults = await Promise.all(chunkPromises);
  const allPackages = [];
  for (const result of chunkResults) {
    allPackages.push(...result.content);
  }
  console.log(`Fetched ${allPackages.length} packages for ${packageIndexUrl}`);
  await saveCache(packageIndexUrl, allPackages, indexHash);
  return allPackages;
}
async function searchPackages(params) {
  const {
    packageIndexUrl,
    gameId,
    query = "",
    section = "all",
    sort = "updated",
    cursor = 0,
    limit = 20
  } = params;
  const packages = await ensureCommunityCached(packageIndexUrl);
  let filtered = packages.filter((pkg) => {
    if (pkg.is_deprecated) return false;
    if (pkg.versions.length === 0) return false;
    if (section === "modpack") {
      const hasModpackCategory = pkg.categories.some((cat) => cat.toLowerCase() === "modpacks");
      if (!hasModpackCategory) return false;
    } else if (section === "mod") {
      const hasModpackCategory = pkg.categories.some((cat) => cat.toLowerCase() === "modpacks");
      if (hasModpackCategory) return false;
    }
    if (query) {
      const searchLower = query.toLowerCase();
      return pkg.name.toLowerCase().includes(searchLower);
    }
    return true;
  });
  filtered.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      case "downloads": {
        const aDownloads = a.versions[0]?.downloads || 0;
        const bDownloads = b.versions[0]?.downloads || 0;
        return bDownloads - aDownloads;
      }
      case "updated":
      default: {
        const aDate = new Date(a.date_updated).getTime();
        const bDate = new Date(b.date_updated).getTime();
        return bDate - aDate;
      }
    }
  });
  const total = filtered.length;
  const start = cursor;
  const end = start + limit;
  const page = filtered.slice(start, end);
  const items = transformPackages(page, gameId);
  const nextCursor = end < total ? end : null;
  return {
    items,
    nextCursor,
    total
  };
}
async function getPackage(packageIndexUrl, gameId, uuid4) {
  const packages = await ensureCommunityCached(packageIndexUrl);
  const pkg = packages.find((p) => p.uuid4 === uuid4);
  if (!pkg || pkg.versions.length === 0) {
    return null;
  }
  const [mod] = transformPackages([pkg], gameId);
  return mod || null;
}
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
const thunderstoreRouter = t.router({
  /**
   * Search packages with filtering, sorting, and pagination
   */
  searchPackages: publicProcedure.input(
    z.object({
      packageIndexUrl: z.string(),
      gameId: z.string(),
      query: z.string().optional(),
      section: z.enum(["all", "mod", "modpack"]).optional(),
      sort: z.enum(["name", "downloads", "updated"]).optional(),
      cursor: z.number().optional(),
      limit: z.number().optional()
    })
  ).query(async ({ input }) => {
    return await searchPackages(input);
  }),
  /**
   * Get a single package by UUID
   */
  getPackage: publicProcedure.input(
    z.object({
      packageIndexUrl: z.string(),
      gameId: z.string(),
      uuid4: z.string()
    })
  ).query(async ({ input }) => {
    return await getPackage(input.packageIndexUrl, input.gameId, input.uuid4);
  }),
  /**
   * Fetch README HTML from Thunderstore Cyberstorm API
   * This runs in main process to avoid CORS issues
   */
  getReadme: publicProcedure.input(
    z.object({
      owner: z.string(),
      name: z.string()
    })
  ).query(async ({ input }) => {
    const url = `https://thunderstore.io/api/cyberstorm/markdown-preview/community/content/${input.owner}/${input.name}/`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const html = await response.text();
      return html;
    } catch (error) {
      console.error(`Failed to fetch README for ${input.owner}/${input.name}:`, error);
      return "";
    }
  })
});
const appRouter = t.router({
  desktop: desktopRouter,
  thunderstore: thunderstoreRouter
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
