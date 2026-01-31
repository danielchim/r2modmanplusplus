import { app, shell, dialog, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { createIPCHandler } from "electron-trpc-experimental/main";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { createHash } from "crypto";
import require$$1$1, { gunzip } from "zlib";
import require$$1, { promisify } from "util";
import require$$0, { promises } from "fs";
import { join, normalize, resolve, dirname, basename } from "path";
import require$$4, { EventEmitter } from "events";
import require$$6 from "stream";
import require$$0$1 from "buffer";
import { pipeline } from "stream/promises";
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
function parseDependencyString(dep) {
  const trimmed = dep.trim();
  if (!trimmed) {
    return {
      raw: dep,
      fullString: dep,
      owner: "",
      name: "",
      key: "",
      isValid: false
    };
  }
  const parts = trimmed.split("-");
  if (parts.length < 2) {
    return {
      raw: dep,
      fullString: dep,
      owner: "",
      name: trimmed,
      key: trimmed,
      isValid: false
    };
  }
  if (parts.length === 2) {
    const [owner2, name2] = parts;
    return {
      raw: dep,
      fullString: dep,
      owner: owner2,
      name: name2,
      key: `${owner2}-${name2}`,
      isValid: true
    };
  }
  const owner = parts[0];
  const version = parts[parts.length - 1];
  const name = parts.slice(1, -1).join("-");
  return {
    raw: dep,
    fullString: dep,
    owner,
    name,
    version,
    requiredVersion: version,
    key: `${owner}-${name}`,
    isValid: true
  };
}
function computeDependencyStatus({
  parsed,
  resolvedMod,
  installedVersion,
  enforceVersions
}) {
  if (!resolvedMod) {
    return "unresolved";
  }
  if (!installedVersion) {
    return "not_installed";
  }
  if (enforceVersions && parsed.requiredVersion) {
    if (installedVersion !== parsed.requiredVersion) {
      return "installed_wrong";
    }
  }
  return "installed_correct";
}
async function resolveDependencies(params) {
  const {
    packageIndexUrl,
    gameId,
    dependencies,
    installedVersions,
    enforceVersions
  } = params;
  const packages = await ensureCommunityCached(packageIndexUrl);
  const packageMap = /* @__PURE__ */ new Map();
  for (const pkg of packages) {
    const key = `${pkg.owner}-${pkg.name}`;
    packageMap.set(key, pkg);
  }
  const results = [];
  for (const depString of dependencies) {
    const parsed = parseDependencyString(depString);
    let resolvedMod = void 0;
    if (parsed.isValid && parsed.key) {
      const pkg = packageMap.get(parsed.key);
      if (pkg && pkg.versions.length > 0) {
        resolvedMod = transformPackage(pkg, gameId);
      }
    }
    const installedVersion = resolvedMod ? installedVersions[resolvedMod.id] : void 0;
    const status = computeDependencyStatus({
      parsed,
      resolvedMod: resolvedMod || null,
      installedVersion,
      enforceVersions
    });
    results.push({
      raw: depString,
      parsed,
      resolvedMod,
      status,
      installedVersion,
      requiredVersion: parsed.requiredVersion
    });
  }
  return results;
}
async function ensureDir(dirPath) {
  try {
    await promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
      throw error;
    }
  }
}
async function pathExists(path2) {
  try {
    await promises.access(path2);
    return true;
  } catch {
    return false;
  }
}
function isPathSafe(parentDir, childPath) {
  const normalizedParent = normalize(resolve(parentDir));
  const normalizedChild = normalize(resolve(parentDir, childPath));
  return normalizedChild.startsWith(normalizedParent);
}
async function safeUnlink(filePath) {
  try {
    await promises.unlink(filePath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      throw error;
    }
  }
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var yauzl$1 = {};
var fdSlicer = {};
var pend;
var hasRequiredPend;
function requirePend() {
  if (hasRequiredPend) return pend;
  hasRequiredPend = 1;
  pend = Pend;
  function Pend() {
    this.pending = 0;
    this.max = Infinity;
    this.listeners = [];
    this.waiting = [];
    this.error = null;
  }
  Pend.prototype.go = function(fn) {
    if (this.pending < this.max) {
      pendGo(this, fn);
    } else {
      this.waiting.push(fn);
    }
  };
  Pend.prototype.wait = function(cb) {
    if (this.pending === 0) {
      cb(this.error);
    } else {
      this.listeners.push(cb);
    }
  };
  Pend.prototype.hold = function() {
    return pendHold(this);
  };
  function pendHold(self) {
    self.pending += 1;
    var called = false;
    return onCb;
    function onCb(err) {
      if (called) throw new Error("callback called twice");
      called = true;
      self.error = self.error || err;
      self.pending -= 1;
      if (self.waiting.length > 0 && self.pending < self.max) {
        pendGo(self, self.waiting.shift());
      } else if (self.pending === 0) {
        var listeners = self.listeners;
        self.listeners = [];
        listeners.forEach(cbListener);
      }
    }
    function cbListener(listener) {
      listener(self.error);
    }
  }
  function pendGo(self, fn) {
    fn(pendHold(self));
  }
  return pend;
}
var hasRequiredFdSlicer;
function requireFdSlicer() {
  if (hasRequiredFdSlicer) return fdSlicer;
  hasRequiredFdSlicer = 1;
  var fs = require$$0;
  var util = require$$1;
  var stream = require$$6;
  var Readable = stream.Readable;
  var Writable = stream.Writable;
  var PassThrough = stream.PassThrough;
  var Pend = requirePend();
  var EventEmitter2 = require$$4.EventEmitter;
  fdSlicer.createFromBuffer = createFromBuffer;
  fdSlicer.createFromFd = createFromFd;
  fdSlicer.BufferSlicer = BufferSlicer;
  fdSlicer.FdSlicer = FdSlicer;
  util.inherits(FdSlicer, EventEmitter2);
  function FdSlicer(fd, options2) {
    options2 = options2 || {};
    EventEmitter2.call(this);
    this.fd = fd;
    this.pend = new Pend();
    this.pend.max = 1;
    this.refCount = 0;
    this.autoClose = !!options2.autoClose;
  }
  FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
    var self = this;
    self.pend.go(function(cb) {
      fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer2) {
        cb();
        callback(err, bytesRead, buffer2);
      });
    });
  };
  FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
    var self = this;
    self.pend.go(function(cb) {
      fs.write(self.fd, buffer, offset, length, position, function(err, written, buffer2) {
        cb();
        callback(err, written, buffer2);
      });
    });
  };
  FdSlicer.prototype.createReadStream = function(options2) {
    return new ReadStream(this, options2);
  };
  FdSlicer.prototype.createWriteStream = function(options2) {
    return new WriteStream(this, options2);
  };
  FdSlicer.prototype.ref = function() {
    this.refCount += 1;
  };
  FdSlicer.prototype.unref = function() {
    var self = this;
    self.refCount -= 1;
    if (self.refCount > 0) return;
    if (self.refCount < 0) throw new Error("invalid unref");
    if (self.autoClose) {
      fs.close(self.fd, onCloseDone);
    }
    function onCloseDone(err) {
      if (err) {
        self.emit("error", err);
      } else {
        self.emit("close");
      }
    }
  };
  util.inherits(ReadStream, Readable);
  function ReadStream(context, options2) {
    options2 = options2 || {};
    Readable.call(this, options2);
    this.context = context;
    this.context.ref();
    this.start = options2.start || 0;
    this.endOffset = options2.end;
    this.pos = this.start;
    this.destroyed = false;
  }
  ReadStream.prototype._read = function(n) {
    var self = this;
    if (self.destroyed) return;
    var toRead = Math.min(self._readableState.highWaterMark, n);
    if (self.endOffset != null) {
      toRead = Math.min(toRead, self.endOffset - self.pos);
    }
    if (toRead <= 0) {
      self.destroyed = true;
      self.push(null);
      self.context.unref();
      return;
    }
    self.context.pend.go(function(cb) {
      if (self.destroyed) return cb();
      var buffer = Buffer.allocUnsafe(toRead);
      fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
        if (err) {
          self.destroy(err);
        } else if (bytesRead === 0) {
          self.destroyed = true;
          self.push(null);
          self.context.unref();
        } else {
          self.pos += bytesRead;
          self.push(buffer.slice(0, bytesRead));
        }
        cb();
      });
    });
  };
  ReadStream.prototype.destroy = function(err) {
    if (this.destroyed) return;
    err = err || new Error("stream destroyed");
    this.destroyed = true;
    this.emit("error", err);
    this.context.unref();
  };
  util.inherits(WriteStream, Writable);
  function WriteStream(context, options2) {
    options2 = options2 || {};
    Writable.call(this, options2);
    this.context = context;
    this.context.ref();
    this.start = options2.start || 0;
    this.endOffset = options2.end == null ? Infinity : +options2.end;
    this.bytesWritten = 0;
    this.pos = this.start;
    this.destroyed = false;
    this.on("finish", this.destroy.bind(this));
  }
  WriteStream.prototype._write = function(buffer, encoding, callback) {
    var self = this;
    if (self.destroyed) return;
    if (self.pos + buffer.length > self.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = "ETOOBIG";
      self.destroy();
      callback(err);
      return;
    }
    self.context.pend.go(function(cb) {
      if (self.destroyed) return cb();
      fs.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err2, bytes) {
        if (err2) {
          self.destroy();
          cb();
          callback(err2);
        } else {
          self.bytesWritten += bytes;
          self.pos += bytes;
          self.emit("progress");
          cb();
          callback();
        }
      });
    });
  };
  WriteStream.prototype.destroy = function() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.context.unref();
  };
  util.inherits(BufferSlicer, EventEmitter2);
  function BufferSlicer(buffer, options2) {
    EventEmitter2.call(this);
    options2 = options2 || {};
    this.refCount = 0;
    this.buffer = buffer;
    this.maxChunkSize = options2.maxChunkSize || Number.MAX_SAFE_INTEGER;
  }
  BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
    if (!(0 <= offset && offset <= buffer.length)) throw new RangeError("offset outside buffer: 0 <= " + offset + " <= " + buffer.length);
    if (position < 0) throw new RangeError("position is negative: " + position);
    if (offset + length > buffer.length) {
      length = buffer.length - offset;
    }
    if (position + length > this.buffer.length) {
      length = this.buffer.length - position;
    }
    if (length <= 0) {
      setImmediate(function() {
        callback(null, 0);
      });
      return;
    }
    this.buffer.copy(buffer, offset, position, position + length);
    setImmediate(function() {
      callback(null, length);
    });
  };
  BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
    buffer.copy(this.buffer, position, offset, offset + length);
    setImmediate(function() {
      callback(null, length, buffer);
    });
  };
  BufferSlicer.prototype.createReadStream = function(options2) {
    options2 = options2 || {};
    var readStream = new PassThrough(options2);
    readStream.destroyed = false;
    readStream.start = options2.start || 0;
    readStream.endOffset = options2.end;
    readStream.pos = readStream.endOffset || this.buffer.length;
    var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
    var offset = 0;
    while (true) {
      var nextOffset = offset + this.maxChunkSize;
      if (nextOffset >= entireSlice.length) {
        if (offset < entireSlice.length) {
          readStream.write(entireSlice.slice(offset, entireSlice.length));
        }
        break;
      }
      readStream.write(entireSlice.slice(offset, nextOffset));
      offset = nextOffset;
    }
    readStream.end();
    readStream.destroy = function() {
      readStream.destroyed = true;
    };
    return readStream;
  };
  BufferSlicer.prototype.createWriteStream = function(options2) {
    var bufferSlicer = this;
    options2 = options2 || {};
    var writeStream = new Writable(options2);
    writeStream.start = options2.start || 0;
    writeStream.endOffset = options2.end == null ? this.buffer.length : +options2.end;
    writeStream.bytesWritten = 0;
    writeStream.pos = writeStream.start;
    writeStream.destroyed = false;
    writeStream._write = function(buffer, encoding, callback) {
      if (writeStream.destroyed) return;
      var end = writeStream.pos + buffer.length;
      if (end > writeStream.endOffset) {
        var err = new Error("maximum file length exceeded");
        err.code = "ETOOBIG";
        writeStream.destroyed = true;
        callback(err);
        return;
      }
      buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);
      writeStream.bytesWritten += buffer.length;
      writeStream.pos = end;
      writeStream.emit("progress");
      callback();
    };
    writeStream.destroy = function() {
      writeStream.destroyed = true;
    };
    return writeStream;
  };
  BufferSlicer.prototype.ref = function() {
    this.refCount += 1;
  };
  BufferSlicer.prototype.unref = function() {
    this.refCount -= 1;
    if (this.refCount < 0) {
      throw new Error("invalid unref");
    }
  };
  function createFromBuffer(buffer, options2) {
    return new BufferSlicer(buffer, options2);
  }
  function createFromFd(fd, options2) {
    return new FdSlicer(fd, options2);
  }
  return fdSlicer;
}
var bufferCrc32;
var hasRequiredBufferCrc32;
function requireBufferCrc32() {
  if (hasRequiredBufferCrc32) return bufferCrc32;
  hasRequiredBufferCrc32 = 1;
  var Buffer2 = require$$0$1.Buffer;
  var CRC_TABLE = [
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918e3,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
  ];
  if (typeof Int32Array !== "undefined") {
    CRC_TABLE = new Int32Array(CRC_TABLE);
  }
  function ensureBuffer(input) {
    if (Buffer2.isBuffer(input)) {
      return input;
    }
    var hasNewBufferAPI = typeof Buffer2.alloc === "function" && typeof Buffer2.from === "function";
    if (typeof input === "number") {
      return hasNewBufferAPI ? Buffer2.alloc(input) : new Buffer2(input);
    } else if (typeof input === "string") {
      return hasNewBufferAPI ? Buffer2.from(input) : new Buffer2(input);
    } else {
      throw new Error("input must be buffer, number, or string, received " + typeof input);
    }
  }
  function bufferizeInt(num) {
    var tmp = ensureBuffer(4);
    tmp.writeInt32BE(num, 0);
    return tmp;
  }
  function _crc32(buf, previous) {
    buf = ensureBuffer(buf);
    if (Buffer2.isBuffer(previous)) {
      previous = previous.readUInt32BE(0);
    }
    var crc = ~~previous ^ -1;
    for (var n = 0; n < buf.length; n++) {
      crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
    }
    return crc ^ -1;
  }
  function crc32() {
    return bufferizeInt(_crc32.apply(null, arguments));
  }
  crc32.signed = function() {
    return _crc32.apply(null, arguments);
  };
  crc32.unsigned = function() {
    return _crc32.apply(null, arguments) >>> 0;
  };
  bufferCrc32 = crc32;
  return bufferCrc32;
}
var hasRequiredYauzl;
function requireYauzl() {
  if (hasRequiredYauzl) return yauzl$1;
  hasRequiredYauzl = 1;
  var fs = require$$0;
  var zlib = require$$1$1;
  var fd_slicer = requireFdSlicer();
  var crc32 = requireBufferCrc32();
  var util = require$$1;
  var EventEmitter2 = require$$4.EventEmitter;
  var Transform = require$$6.Transform;
  var PassThrough = require$$6.PassThrough;
  var Writable = require$$6.Writable;
  yauzl$1.open = open;
  yauzl$1.fromFd = fromFd;
  yauzl$1.fromBuffer = fromBuffer;
  yauzl$1.fromRandomAccessReader = fromRandomAccessReader;
  yauzl$1.dosDateTimeToDate = dosDateTimeToDate;
  yauzl$1.getFileNameLowLevel = getFileNameLowLevel;
  yauzl$1.validateFileName = validateFileName;
  yauzl$1.parseExtraFields = parseExtraFields;
  yauzl$1.ZipFile = ZipFile;
  yauzl$1.Entry = Entry;
  yauzl$1.LocalFileHeader = LocalFileHeader;
  yauzl$1.RandomAccessReader = RandomAccessReader;
  function open(path2, options2, callback) {
    if (typeof options2 === "function") {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) options2 = {};
    if (options2.autoClose == null) options2.autoClose = true;
    if (options2.lazyEntries == null) options2.lazyEntries = false;
    if (options2.decodeStrings == null) options2.decodeStrings = true;
    if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
    if (options2.strictFileNames == null) options2.strictFileNames = false;
    if (callback == null) callback = defaultCallback;
    fs.open(path2, "r", function(err, fd) {
      if (err) return callback(err);
      fromFd(fd, options2, function(err2, zipfile) {
        if (err2) fs.close(fd, defaultCallback);
        callback(err2, zipfile);
      });
    });
  }
  function fromFd(fd, options2, callback) {
    if (typeof options2 === "function") {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) options2 = {};
    if (options2.autoClose == null) options2.autoClose = false;
    if (options2.lazyEntries == null) options2.lazyEntries = false;
    if (options2.decodeStrings == null) options2.decodeStrings = true;
    if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
    if (options2.strictFileNames == null) options2.strictFileNames = false;
    if (callback == null) callback = defaultCallback;
    fs.fstat(fd, function(err, stats) {
      if (err) return callback(err);
      var reader = fd_slicer.createFromFd(fd, { autoClose: true });
      fromRandomAccessReader(reader, stats.size, options2, callback);
    });
  }
  function fromBuffer(buffer, options2, callback) {
    if (typeof options2 === "function") {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) options2 = {};
    options2.autoClose = false;
    if (options2.lazyEntries == null) options2.lazyEntries = false;
    if (options2.decodeStrings == null) options2.decodeStrings = true;
    if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
    if (options2.strictFileNames == null) options2.strictFileNames = false;
    var reader = fd_slicer.createFromBuffer(buffer, { maxChunkSize: 65536 });
    fromRandomAccessReader(reader, buffer.length, options2, callback);
  }
  function fromRandomAccessReader(reader, totalSize, options2, callback) {
    if (typeof options2 === "function") {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) options2 = {};
    if (options2.autoClose == null) options2.autoClose = true;
    if (options2.lazyEntries == null) options2.lazyEntries = false;
    if (options2.decodeStrings == null) options2.decodeStrings = true;
    var decodeStrings = !!options2.decodeStrings;
    if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
    if (options2.strictFileNames == null) options2.strictFileNames = false;
    if (callback == null) callback = defaultCallback;
    if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
    if (totalSize > Number.MAX_SAFE_INTEGER) {
      throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
    }
    reader.ref();
    var eocdrWithoutCommentSize = 22;
    var zip64EocdlSize = 20;
    var maxCommentSize = 65535;
    var bufferSize = Math.min(zip64EocdlSize + eocdrWithoutCommentSize + maxCommentSize, totalSize);
    var buffer = newBuffer(bufferSize);
    var bufferReadStart = totalSize - buffer.length;
    readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
      if (err) return callback(err);
      for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
        if (buffer.readUInt32LE(i) !== 101010256) continue;
        var eocdrBuffer = buffer.subarray(i);
        var diskNumber = eocdrBuffer.readUInt16LE(4);
        var entryCount = eocdrBuffer.readUInt16LE(10);
        var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
        var commentLength = eocdrBuffer.readUInt16LE(20);
        var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
        if (commentLength !== expectedCommentLength) {
          return callback(new Error("Invalid comment length. Expected: " + expectedCommentLength + ". Found: " + commentLength + ". Are there extra bytes at the end of the file? Or is the end of central dir signature `PK☺☻` in the comment?"));
        }
        var comment = decodeStrings ? decodeBuffer(eocdrBuffer.subarray(22), false) : eocdrBuffer.subarray(22);
        if (i - zip64EocdlSize >= 0 && buffer.readUInt32LE(i - zip64EocdlSize) === 117853008) {
          var zip64EocdlBuffer = buffer.subarray(i - zip64EocdlSize, i - zip64EocdlSize + zip64EocdlSize);
          var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
          var zip64EocdrBuffer = newBuffer(56);
          return readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err2) {
            if (err2) return callback(err2);
            if (zip64EocdrBuffer.readUInt32LE(0) !== 101075792) {
              return callback(new Error("invalid zip64 end of central directory record signature"));
            }
            diskNumber = zip64EocdrBuffer.readUInt32LE(16);
            if (diskNumber !== 0) {
              return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
            }
            entryCount = readUInt64LE(zip64EocdrBuffer, 32);
            centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
            return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
          });
        }
        if (diskNumber !== 0) {
          return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
        }
        return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
      }
      callback(new Error("End of central directory record signature not found. Either not a zip file, or file is truncated."));
    });
  }
  util.inherits(ZipFile, EventEmitter2);
  function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
    var self = this;
    EventEmitter2.call(self);
    self.reader = reader;
    self.reader.on("error", function(err) {
      emitError(self, err);
    });
    self.reader.once("close", function() {
      self.emit("close");
    });
    self.readEntryCursor = centralDirectoryOffset;
    self.fileSize = fileSize;
    self.entryCount = entryCount;
    self.comment = comment;
    self.entriesRead = 0;
    self.autoClose = !!autoClose;
    self.lazyEntries = !!lazyEntries;
    self.decodeStrings = !!decodeStrings;
    self.validateEntrySizes = !!validateEntrySizes;
    self.strictFileNames = !!strictFileNames;
    self.isOpen = true;
    self.emittedError = false;
    if (!self.lazyEntries) self._readEntry();
  }
  ZipFile.prototype.close = function() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.reader.unref();
  };
  function emitErrorAndAutoClose(self, err) {
    if (self.autoClose) self.close();
    emitError(self, err);
  }
  function emitError(self, err) {
    if (self.emittedError) return;
    self.emittedError = true;
    self.emit("error", err);
  }
  ZipFile.prototype.readEntry = function() {
    if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
    this._readEntry();
  };
  ZipFile.prototype._readEntry = function() {
    var self = this;
    if (self.entryCount === self.entriesRead) {
      setImmediate(function() {
        if (self.autoClose) self.close();
        if (self.emittedError) return;
        self.emit("end");
      });
      return;
    }
    if (self.emittedError) return;
    var buffer = newBuffer(46);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
      if (err) return emitErrorAndAutoClose(self, err);
      if (self.emittedError) return;
      var entry = new Entry();
      var signature = buffer.readUInt32LE(0);
      if (signature !== 33639248) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
      entry.versionMadeBy = buffer.readUInt16LE(4);
      entry.versionNeededToExtract = buffer.readUInt16LE(6);
      entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
      entry.compressionMethod = buffer.readUInt16LE(10);
      entry.lastModFileTime = buffer.readUInt16LE(12);
      entry.lastModFileDate = buffer.readUInt16LE(14);
      entry.crc32 = buffer.readUInt32LE(16);
      entry.compressedSize = buffer.readUInt32LE(20);
      entry.uncompressedSize = buffer.readUInt32LE(24);
      entry.fileNameLength = buffer.readUInt16LE(28);
      entry.extraFieldLength = buffer.readUInt16LE(30);
      entry.fileCommentLength = buffer.readUInt16LE(32);
      entry.internalFileAttributes = buffer.readUInt16LE(36);
      entry.externalFileAttributes = buffer.readUInt32LE(38);
      entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);
      if (entry.generalPurposeBitFlag & 64) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));
      self.readEntryCursor += 46;
      buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err2) {
        if (err2) return emitErrorAndAutoClose(self, err2);
        if (self.emittedError) return;
        entry.fileNameRaw = buffer.subarray(0, entry.fileNameLength);
        var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
        entry.extraFieldRaw = buffer.subarray(entry.fileNameLength, fileCommentStart);
        entry.fileCommentRaw = buffer.subarray(fileCommentStart, fileCommentStart + entry.fileCommentLength);
        try {
          entry.extraFields = parseExtraFields(entry.extraFieldRaw);
        } catch (err3) {
          return emitErrorAndAutoClose(self, err3);
        }
        if (self.decodeStrings) {
          var isUtf8 = (entry.generalPurposeBitFlag & 2048) !== 0;
          entry.fileComment = decodeBuffer(entry.fileCommentRaw, isUtf8);
          entry.fileName = getFileNameLowLevel(entry.generalPurposeBitFlag, entry.fileNameRaw, entry.extraFields, self.strictFileNames);
          var errorMessage = validateFileName(entry.fileName);
          if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
        } else {
          entry.fileComment = entry.fileCommentRaw;
          entry.fileName = entry.fileNameRaw;
        }
        entry.comment = entry.fileComment;
        self.readEntryCursor += buffer.length;
        self.entriesRead += 1;
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id !== 1) continue;
          var zip64EiefBuffer = extraField.data;
          var index = 0;
          if (entry.uncompressedSize === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
            }
            entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
          if (entry.compressedSize === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
            }
            entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
          if (entry.relativeOffsetOfLocalHeader === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
            }
            entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
          break;
        }
        if (self.validateEntrySizes && entry.compressionMethod === 0) {
          var expectedCompressedSize = entry.uncompressedSize;
          if (entry.isEncrypted()) {
            expectedCompressedSize += 12;
          }
          if (entry.compressedSize !== expectedCompressedSize) {
            var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
            return emitErrorAndAutoClose(self, new Error(msg));
          }
        }
        self.emit("entry", entry);
        if (!self.lazyEntries) self._readEntry();
      });
    });
  };
  ZipFile.prototype.openReadStream = function(entry, options2, callback) {
    var self = this;
    var relativeStart = 0;
    var relativeEnd = entry.compressedSize;
    if (callback == null) {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) {
      options2 = {};
    } else {
      if (options2.decrypt != null) {
        if (!entry.isEncrypted()) {
          throw new Error("options.decrypt can only be specified for encrypted entries");
        }
        if (options2.decrypt !== false) throw new Error("invalid options.decrypt value: " + options2.decrypt);
        if (entry.isCompressed()) {
          if (options2.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false");
        }
      }
      if (options2.decompress != null) {
        if (!entry.isCompressed()) {
          throw new Error("options.decompress can only be specified for compressed entries");
        }
        if (!(options2.decompress === false || options2.decompress === true)) {
          throw new Error("invalid options.decompress value: " + options2.decompress);
        }
      }
      if (options2.start != null || options2.end != null) {
        if (entry.isCompressed() && options2.decompress !== false) {
          throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
        }
        if (entry.isEncrypted() && options2.decrypt !== false) {
          throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
        }
      }
      if (options2.start != null) {
        relativeStart = options2.start;
        if (relativeStart < 0) throw new Error("options.start < 0");
        if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
      }
      if (options2.end != null) {
        relativeEnd = options2.end;
        if (relativeEnd < 0) throw new Error("options.end < 0");
        if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
        if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
      }
    }
    if (!self.isOpen) return callback(new Error("closed"));
    if (entry.isEncrypted()) {
      if (options2.decrypt !== false) return callback(new Error("entry is encrypted, and options.decrypt !== false"));
    }
    var decompress;
    if (entry.compressionMethod === 0) {
      decompress = false;
    } else if (entry.compressionMethod === 8) {
      decompress = options2.decompress != null ? options2.decompress : true;
    } else {
      return callback(new Error("unsupported compression method: " + entry.compressionMethod));
    }
    self.readLocalFileHeader(entry, { minimal: true }, function(err, localFileHeader) {
      if (err) return callback(err);
      self.openReadStreamLowLevel(
        localFileHeader.fileDataStart,
        entry.compressedSize,
        relativeStart,
        relativeEnd,
        decompress,
        entry.uncompressedSize,
        callback
      );
    });
  };
  ZipFile.prototype.openReadStreamLowLevel = function(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize, callback) {
    var self = this;
    var readStream = self.reader.createReadStream({
      start: fileDataStart + relativeStart,
      end: fileDataStart + relativeEnd
    });
    var endpointStream = readStream;
    if (decompress) {
      var destroyed = false;
      var inflateFilter = zlib.createInflateRaw();
      readStream.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed) inflateFilter.emit("error", err);
        });
      });
      readStream.pipe(inflateFilter);
      if (self.validateEntrySizes) {
        endpointStream = new AssertByteCountStream(uncompressedSize);
        inflateFilter.on("error", function(err) {
          setImmediate(function() {
            if (!destroyed) endpointStream.emit("error", err);
          });
        });
        inflateFilter.pipe(endpointStream);
      } else {
        endpointStream = inflateFilter;
      }
      installDestroyFn(endpointStream, function() {
        destroyed = true;
        if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
        readStream.unpipe(inflateFilter);
        readStream.destroy();
      });
    }
    callback(null, endpointStream);
  };
  ZipFile.prototype.readLocalFileHeader = function(entry, options2, callback) {
    var self = this;
    if (callback == null) {
      callback = options2;
      options2 = null;
    }
    if (options2 == null) options2 = {};
    self.reader.ref();
    var buffer = newBuffer(30);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
      try {
        if (err) return callback(err);
        var signature = buffer.readUInt32LE(0);
        if (signature !== 67324752) {
          return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
        }
        var fileNameLength = buffer.readUInt16LE(26);
        var extraFieldLength = buffer.readUInt16LE(28);
        var fileDataStart = entry.relativeOffsetOfLocalHeader + 30 + fileNameLength + extraFieldLength;
        if (fileDataStart + entry.compressedSize > self.fileSize) {
          return callback(new Error("file data overflows file bounds: " + fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
        }
        if (options2.minimal) {
          return callback(null, { fileDataStart });
        }
        var localFileHeader = new LocalFileHeader();
        localFileHeader.fileDataStart = fileDataStart;
        localFileHeader.versionNeededToExtract = buffer.readUInt16LE(4);
        localFileHeader.generalPurposeBitFlag = buffer.readUInt16LE(6);
        localFileHeader.compressionMethod = buffer.readUInt16LE(8);
        localFileHeader.lastModFileTime = buffer.readUInt16LE(10);
        localFileHeader.lastModFileDate = buffer.readUInt16LE(12);
        localFileHeader.crc32 = buffer.readUInt32LE(14);
        localFileHeader.compressedSize = buffer.readUInt32LE(18);
        localFileHeader.uncompressedSize = buffer.readUInt32LE(22);
        localFileHeader.fileNameLength = fileNameLength;
        localFileHeader.extraFieldLength = extraFieldLength;
        buffer = newBuffer(fileNameLength + extraFieldLength);
        self.reader.ref();
        readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader + 30, function(err2) {
          try {
            if (err2) return callback(err2);
            localFileHeader.fileName = buffer.subarray(0, fileNameLength);
            localFileHeader.extraField = buffer.subarray(fileNameLength);
            return callback(null, localFileHeader);
          } finally {
            self.reader.unref();
          }
        });
      } finally {
        self.reader.unref();
      }
    });
  };
  function Entry() {
  }
  Entry.prototype.getLastModDate = function(options2) {
    if (options2 == null) options2 = {};
    if (!options2.forceDosFormat) {
      for (var i = 0; i < this.extraFields.length; i++) {
        var extraField = this.extraFields[i];
        if (extraField.id === 21589) {
          var data = extraField.data;
          if (data.length < 5) continue;
          var flags = data[0];
          var HAS_MTIME = 1;
          if (!(flags & HAS_MTIME)) continue;
          var posixTimestamp = data.readInt32LE(1);
          return new Date(posixTimestamp * 1e3);
        } else if (extraField.id === 10) {
          var data = extraField.data;
          var cursor = 4;
          while (cursor < data.length + 4) {
            var tag = data.readUInt16LE(cursor);
            cursor += 2;
            var size = data.readUInt16LE(cursor);
            cursor += 2;
            if (tag !== 1) {
              cursor += size;
              continue;
            }
            if (size < 8 || cursor + size > data.length) break;
            var hundredNanoSecondsSince1601 = 4294967296 * data.readInt32LE(cursor + 4) + data.readUInt32LE(cursor);
            var millisecondsSince1970 = hundredNanoSecondsSince1601 / 1e4 - 116444736e5;
            return new Date(millisecondsSince1970);
          }
        }
      }
    }
    return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime, options2.timezone);
  };
  Entry.prototype.isEncrypted = function() {
    return (this.generalPurposeBitFlag & 1) !== 0;
  };
  Entry.prototype.isCompressed = function() {
    return this.compressionMethod === 8;
  };
  function LocalFileHeader() {
  }
  function dosDateTimeToDate(date, time, timezone) {
    var day = date & 31;
    var month = (date >> 5 & 15) - 1;
    var year = (date >> 9 & 127) + 1980;
    var millisecond = 0;
    var second = (time & 31) * 2;
    var minute = time >> 5 & 63;
    var hour = time >> 11 & 31;
    if (timezone == null || timezone === "local") {
      return new Date(year, month, day, hour, minute, second, millisecond);
    } else if (timezone === "UTC") {
      return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
    } else {
      throw new Error("unrecognized options.timezone: " + options.timezone);
    }
  }
  function getFileNameLowLevel(generalPurposeBitFlag, fileNameBuffer, extraFields, strictFileNames) {
    var fileName = null;
    for (var i = 0; i < extraFields.length; i++) {
      var extraField = extraFields[i];
      if (extraField.id === 28789) {
        if (extraField.data.length < 6) {
          continue;
        }
        if (extraField.data.readUInt8(0) !== 1) {
          continue;
        }
        var oldNameCrc32 = extraField.data.readUInt32LE(1);
        if (crc32.unsigned(fileNameBuffer) !== oldNameCrc32) {
          continue;
        }
        fileName = decodeBuffer(extraField.data.subarray(5), true);
        break;
      }
    }
    if (fileName == null) {
      var isUtf8 = (generalPurposeBitFlag & 2048) !== 0;
      fileName = decodeBuffer(fileNameBuffer, isUtf8);
    }
    if (!strictFileNames) {
      fileName = fileName.replace(/\\/g, "/");
    }
    return fileName;
  }
  function validateFileName(fileName) {
    if (fileName.indexOf("\\") !== -1) {
      return "invalid characters in fileName: " + fileName;
    }
    if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
      return "absolute path: " + fileName;
    }
    if (fileName.split("/").indexOf("..") !== -1) {
      return "invalid relative path: " + fileName;
    }
    return null;
  }
  function parseExtraFields(extraFieldBuffer) {
    var extraFields = [];
    var i = 0;
    while (i < extraFieldBuffer.length - 3) {
      var headerId = extraFieldBuffer.readUInt16LE(i + 0);
      var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
      var dataStart = i + 4;
      var dataEnd = dataStart + dataSize;
      if (dataEnd > extraFieldBuffer.length) throw new Error("extra field length exceeds extra field buffer size");
      var dataBuffer = extraFieldBuffer.subarray(dataStart, dataEnd);
      extraFields.push({
        id: headerId,
        data: dataBuffer
      });
      i = dataEnd;
    }
    return extraFields;
  }
  function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
    if (length === 0) {
      return setImmediate(function() {
        callback(null, newBuffer(0));
      });
    }
    reader.read(buffer, offset, length, position, function(err, bytesRead) {
      if (err) return callback(err);
      if (bytesRead < length) {
        return callback(new Error("unexpected EOF"));
      }
      callback();
    });
  }
  util.inherits(AssertByteCountStream, Transform);
  function AssertByteCountStream(byteCount) {
    Transform.call(this);
    this.actualByteCount = 0;
    this.expectedByteCount = byteCount;
  }
  AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
    this.actualByteCount += chunk.length;
    if (this.actualByteCount > this.expectedByteCount) {
      var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
      return cb(new Error(msg));
    }
    cb(null, chunk);
  };
  AssertByteCountStream.prototype._flush = function(cb) {
    if (this.actualByteCount < this.expectedByteCount) {
      var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
      return cb(new Error(msg));
    }
    cb();
  };
  util.inherits(RandomAccessReader, EventEmitter2);
  function RandomAccessReader() {
    EventEmitter2.call(this);
    this.refCount = 0;
  }
  RandomAccessReader.prototype.ref = function() {
    this.refCount += 1;
  };
  RandomAccessReader.prototype.unref = function() {
    var self = this;
    self.refCount -= 1;
    if (self.refCount > 0) return;
    if (self.refCount < 0) throw new Error("invalid unref");
    self.close(onCloseDone);
    function onCloseDone(err) {
      if (err) return self.emit("error", err);
      self.emit("close");
    }
  };
  RandomAccessReader.prototype.createReadStream = function(options2) {
    if (options2 == null) options2 = {};
    var start = options2.start;
    var end = options2.end;
    if (start === end) {
      var emptyStream = new PassThrough();
      setImmediate(function() {
        emptyStream.end();
      });
      return emptyStream;
    }
    var stream = this._readStreamForRange(start, end);
    var destroyed = false;
    var refUnrefFilter = new RefUnrefFilter(this);
    stream.on("error", function(err) {
      setImmediate(function() {
        if (!destroyed) refUnrefFilter.emit("error", err);
      });
    });
    installDestroyFn(refUnrefFilter, function() {
      stream.unpipe(refUnrefFilter);
      refUnrefFilter.unref();
      stream.destroy();
    });
    var byteCounter = new AssertByteCountStream(end - start);
    refUnrefFilter.on("error", function(err) {
      setImmediate(function() {
        if (!destroyed) byteCounter.emit("error", err);
      });
    });
    installDestroyFn(byteCounter, function() {
      destroyed = true;
      refUnrefFilter.unpipe(byteCounter);
      refUnrefFilter.destroy();
    });
    return stream.pipe(refUnrefFilter).pipe(byteCounter);
  };
  RandomAccessReader.prototype._readStreamForRange = function(start, end) {
    throw new Error("not implemented");
  };
  RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
    var readStream = this.createReadStream({ start: position, end: position + length });
    var writeStream = new Writable();
    var written = 0;
    writeStream._write = function(chunk, encoding, cb) {
      chunk.copy(buffer, offset + written, 0, chunk.length);
      written += chunk.length;
      cb();
    };
    writeStream.on("finish", callback);
    readStream.on("error", function(error) {
      callback(error);
    });
    readStream.pipe(writeStream);
  };
  RandomAccessReader.prototype.close = function(callback) {
    setImmediate(callback);
  };
  util.inherits(RefUnrefFilter, PassThrough);
  function RefUnrefFilter(context) {
    PassThrough.call(this);
    this.context = context;
    this.context.ref();
    this.unreffedYet = false;
  }
  RefUnrefFilter.prototype._flush = function(cb) {
    this.unref();
    cb();
  };
  RefUnrefFilter.prototype.unref = function(cb) {
    if (this.unreffedYet) return;
    this.unreffedYet = true;
    this.context.unref();
  };
  var cp437 = "\0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
  function decodeBuffer(buffer, isUtf8) {
    if (isUtf8) {
      return buffer.toString("utf8");
    } else {
      var result = "";
      for (var i = 0; i < buffer.length; i++) {
        result += cp437[buffer[i]];
      }
      return result;
    }
  }
  function readUInt64LE(buffer, offset) {
    var lower32 = buffer.readUInt32LE(offset);
    var upper32 = buffer.readUInt32LE(offset + 4);
    return upper32 * 4294967296 + lower32;
  }
  var newBuffer;
  if (typeof Buffer.allocUnsafe === "function") {
    newBuffer = function(len) {
      return Buffer.allocUnsafe(len);
    };
  } else {
    newBuffer = function(len) {
      return new Buffer(len);
    };
  }
  function installDestroyFn(stream, fn) {
    if (typeof stream.destroy === "function") {
      stream._destroy = function(err, cb) {
        fn();
        if (cb != null) cb(err);
      };
    } else {
      stream.destroy = fn;
    }
  }
  function defaultCallback(err) {
    if (err) throw err;
  }
  return yauzl$1;
}
var yauzlExports = requireYauzl();
const yauzl = /* @__PURE__ */ getDefaultExportFromCjs(yauzlExports);
async function extractZip(zipPath, destDir) {
  await ensureDir(destDir);
  return new Promise((resolve2, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        return reject(new Error(`Failed to open zip file: ${err.message}`));
      }
      if (!zipfile) {
        return reject(new Error("Failed to open zip file: zipfile is undefined"));
      }
      let errorOccurred = false;
      zipfile.on("entry", (entry) => {
        if (errorOccurred) return;
        if (!isPathSafe(destDir, entry.fileName)) {
          errorOccurred = true;
          zipfile.close();
          return reject(new Error(`Unsafe zip entry detected: ${entry.fileName} attempts to escape extraction directory`));
        }
        const fullPath = join(destDir, entry.fileName);
        if (entry.fileName.endsWith("/")) {
          ensureDir(fullPath).then(() => zipfile.readEntry()).catch((error) => {
            errorOccurred = true;
            zipfile.close();
            reject(error);
          });
          return;
        }
        zipfile.openReadStream(entry, (err2, readStream) => {
          if (err2) {
            errorOccurred = true;
            zipfile.close();
            return reject(new Error(`Failed to read zip entry ${entry.fileName}: ${err2.message}`));
          }
          if (!readStream) {
            errorOccurred = true;
            zipfile.close();
            return reject(new Error(`Failed to read zip entry ${entry.fileName}: readStream is undefined`));
          }
          ensureDir(dirname(fullPath)).then(async () => {
            const writeStream = await promises.open(fullPath, "w");
            try {
              await pipeline(readStream, writeStream.createWriteStream());
              await writeStream.close();
              zipfile.readEntry();
            } catch (error) {
              errorOccurred = true;
              await writeStream.close();
              zipfile.close();
              reject(error);
            }
          }).catch((error) => {
            errorOccurred = true;
            zipfile.close();
            reject(error);
          });
        });
      });
      zipfile.on("end", () => {
        if (!errorOccurred) {
          resolve2();
        }
      });
      zipfile.on("error", (error) => {
        if (!errorOccurred) {
          errorOccurred = true;
          reject(error);
        }
      });
      zipfile.readEntry();
    });
  });
}
class TokenBucket {
  tokens;
  lastRefill;
  capacity;
  refillRate;
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  async consume(tokens) {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1e3;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
    if (this.tokens < tokens) {
      const waitTime = (tokens - this.tokens) / this.refillRate * 1e3;
      await new Promise((resolve2) => setTimeout(resolve2, waitTime));
      this.tokens = 0;
    } else {
      this.tokens -= tokens;
    }
  }
  updateRate(newRate) {
    this.refillRate = newRate;
  }
}
async function downloadMod(options2) {
  const {
    archivePath,
    extractPath,
    ignoreCache,
    downloadUrl,
    speedLimitBps,
    onProgress,
    abortSignal
  } = options2;
  if (!ignoreCache && await pathExists(extractPath)) {
    return {
      extractedPath: extractPath,
      archivePath,
      bytesTotal: 0,
      fromCache: true
    };
  }
  await ensureDir(extractPath);
  const archiveDir = archivePath.substring(0, archivePath.lastIndexOf("/"));
  await ensureDir(archiveDir);
  const tempArchivePath = `${archivePath}.part`;
  try {
    if (abortSignal?.aborted) {
      throw new Error("Download aborted before starting");
    }
    const response = await fetch(downloadUrl, {
      signal: abortSignal,
      headers: {
        "Accept": "application/zip, application/octet-stream"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }
    const rateLimiter = speedLimitBps && speedLimitBps > 0 ? new TokenBucket(speedLimitBps * 2, speedLimitBps) : null;
    const fileHandle = await promises.open(tempArchivePath, "w");
    const hasher = createHash("sha256");
    let bytesDownloaded = 0;
    try {
      while (true) {
        if (abortSignal?.aborted) {
          throw new Error("Download aborted");
        }
        const { done, value } = await reader.read();
        if (done) break;
        if (rateLimiter) {
          await rateLimiter.consume(value.length);
        }
        await fileHandle.write(value);
        hasher.update(value);
        bytesDownloaded += value.length;
        if (onProgress) {
          onProgress(bytesDownloaded, contentLength);
        }
      }
      await fileHandle.close();
      await promises.rename(tempArchivePath, archivePath);
      await extractZip(archivePath, extractPath);
      return {
        extractedPath: extractPath,
        archivePath,
        bytesTotal: bytesDownloaded,
        sha256: hasher.digest("hex"),
        fromCache: false
      };
    } catch (error) {
      await fileHandle.close();
      await safeUnlink(tempArchivePath);
      throw error;
    }
  } catch (error) {
    await safeUnlink(tempArchivePath);
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("aborted")) {
        throw new Error("Download was cancelled");
      }
      throw new Error(`Download failed: ${error.message}`);
    }
    throw error;
  }
}
class DownloadQueue extends EventEmitter {
  jobs = /* @__PURE__ */ new Map();
  maxConcurrent;
  speedLimitBps;
  lastProgressUpdate = /* @__PURE__ */ new Map();
  constructor(maxConcurrent = 3, speedLimitBps = 0) {
    super();
    this.maxConcurrent = maxConcurrent;
    this.speedLimitBps = speedLimitBps;
  }
  /**
   * Enqueues a download
   */
  enqueue(job) {
    const fullJob = {
      ...job,
      status: "queued",
      bytesDownloaded: 0,
      bytesTotal: 0,
      speedBps: 0
    };
    this.jobs.set(job.downloadId, fullJob);
    this.emit("job-updated", fullJob);
    this.processQueue();
    return job.downloadId;
  }
  /**
   * Cancels a download
   */
  cancel(downloadId) {
    const job = this.jobs.get(downloadId);
    if (!job) return;
    if (job.status === "downloading" && job.abortController) {
      job.abortController.abort();
    }
    job.status = "cancelled";
    this.jobs.delete(downloadId);
    this.emit("job-updated", job);
  }
  /**
   * Pauses a download
   */
  pause(downloadId) {
    const job = this.jobs.get(downloadId);
    if (!job) return;
    if (job.status === "downloading" && job.abortController) {
      job.abortController.abort();
    }
    job.status = "paused";
    this.emit("job-updated", job);
    this.processQueue();
  }
  /**
   * Resumes a paused download
   */
  resume(downloadId) {
    const job = this.jobs.get(downloadId);
    if (!job || job.status !== "paused") return;
    job.status = "queued";
    this.emit("job-updated", job);
    this.processQueue();
  }
  /**
   * Updates concurrency limit
   */
  setMaxConcurrent(max) {
    this.maxConcurrent = max;
    this.processQueue();
  }
  /**
   * Updates speed limit
   */
  setSpeedLimit(speedLimitBps) {
    this.speedLimitBps = speedLimitBps;
  }
  /**
   * Gets all jobs
   */
  getJobs() {
    return Array.from(this.jobs.values());
  }
  /**
   * Gets a specific job
   */
  getJob(downloadId) {
    return this.jobs.get(downloadId);
  }
  /**
   * Clears completed/failed/cancelled jobs
   */
  clearInactive() {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "completed" || job.status === "error" || job.status === "cancelled") {
        this.jobs.delete(id);
      }
    }
  }
  /**
   * Process queue - start downloads up to concurrency limit
   */
  processQueue() {
    const activeCount = Array.from(this.jobs.values()).filter((j) => j.status === "downloading").length;
    const availableSlots = this.maxConcurrent - activeCount;
    if (availableSlots <= 0) return;
    const queued = Array.from(this.jobs.values()).filter((j) => j.status === "queued").slice(0, availableSlots);
    for (const job of queued) {
      this.startDownload(job);
    }
  }
  /**
   * Starts a download job
   */
  async startDownload(job) {
    job.status = "downloading";
    job.abortController = new AbortController();
    job.bytesDownloaded = 0;
    job.speedBps = 0;
    this.emit("job-updated", job);
    let lastBytes = 0;
    let lastTime = Date.now();
    try {
      const result = await downloadMod({
        gameId: job.gameId,
        author: job.author,
        name: job.name,
        version: job.version,
        downloadUrl: job.downloadUrl,
        archivePath: job.archivePath,
        extractPath: job.extractPath,
        ignoreCache: job.ignoreCache,
        speedLimitBps: this.speedLimitBps > 0 ? this.speedLimitBps : void 0,
        abortSignal: job.abortController.signal,
        onProgress: (bytesDownloaded, bytesTotal) => {
          job.bytesDownloaded = bytesDownloaded;
          job.bytesTotal = bytesTotal;
          const now = Date.now();
          const elapsed = (now - lastTime) / 1e3;
          if (elapsed >= 0.5) {
            const bytesDelta = bytesDownloaded - lastBytes;
            job.speedBps = Math.round(bytesDelta / elapsed);
            lastBytes = bytesDownloaded;
            lastTime = now;
            const lastUpdate = this.lastProgressUpdate.get(job.downloadId) || 0;
            if (now - lastUpdate >= 200) {
              this.emit("job-progress", job.downloadId, bytesDownloaded, bytesTotal, job.speedBps);
              this.lastProgressUpdate.set(job.downloadId, now);
            }
          }
        }
      });
      job.status = "completed";
      job.result = result;
      job.bytesDownloaded = result.bytesTotal;
      job.bytesTotal = result.bytesTotal;
      job.speedBps = 0;
      this.emit("job-updated", job);
      this.emit("job-completed", job.downloadId, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (job.status === "downloading") {
        job.status = "error";
        job.error = errorMessage;
        job.speedBps = 0;
        this.emit("job-updated", job);
        this.emit("job-failed", job.downloadId, errorMessage);
      }
    } finally {
      this.processQueue();
    }
  }
}
function sanitizePathSegment(segment) {
  return segment.replace(/[/\\:*?"<>|]/g, "_").trim().substring(0, 200);
}
function ensureGameSubdir(root, gameId) {
  if (!root) return "";
  const normalizedRoot = normalize(root);
  const base = basename(normalizedRoot);
  if (base === gameId) {
    return normalizedRoot;
  }
  return join(normalizedRoot, gameId);
}
function resolveGamePaths(gameId, settings) {
  const { dataFolder, modDownloadFolder: globalModDownloadFolder, cacheFolder: globalCacheFolder } = settings.global;
  const perGame = settings.perGame[gameId] || {};
  const modCacheRoot = perGame.modCacheFolder ? perGame.modCacheFolder : join(dataFolder, gameId, "cache");
  const archiveRoot = perGame.modDownloadFolder ? ensureGameSubdir(perGame.modDownloadFolder, gameId) : globalModDownloadFolder ? ensureGameSubdir(globalModDownloadFolder, gameId) : join(dataFolder, "downloads", gameId);
  const metadataCache = perGame.cacheFolder ? join(perGame.cacheFolder, "thunderstore") : globalCacheFolder ? join(globalCacheFolder, "thunderstore") : join(dataFolder, "cache", "thunderstore");
  const profilesRoot = join(dataFolder, gameId, "profiles");
  return {
    modCacheRoot,
    archiveRoot,
    metadataCache,
    profilesRoot
  };
}
function getExtractedModPath(modCacheRoot, author, name, version) {
  const authorMod = sanitizePathSegment(`${author}-${name}`);
  const versionSafe = sanitizePathSegment(version);
  return join(modCacheRoot, authorMod, versionSafe);
}
function getArchivePath(archiveRoot, author, name, version) {
  const authorMod = sanitizePathSegment(`${author}-${name}`);
  const versionSafe = sanitizePathSegment(version);
  return join(archiveRoot, authorMod, `${versionSafe}.zip`);
}
function applyThunderstoreCdn(downloadUrl, preferredCdn) {
  if (preferredCdn === "main") {
    return downloadUrl;
  }
  const url = new URL(downloadUrl);
  url.searchParams.set("cdn", preferredCdn);
  return url.toString();
}
const isDevEnvironment = (() => {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
})();
function sanitizePayload(payload, depth = 0) {
  if (depth > 4) {
    return "[Truncated]";
  }
  if (payload == null) {
    return payload;
  }
  if (payload instanceof Error) {
    return {
      name: payload.name,
      message: payload.message,
      stack: payload.stack
    };
  }
  if (typeof AbortController !== "undefined" && payload instanceof AbortController) {
    return "[AbortController]";
  }
  if (payload instanceof ArrayBuffer) {
    return `[ArrayBuffer ${payload.byteLength}]`;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, depth + 1));
  }
  if (typeof payload === "object") {
    const entries = Object.entries(payload);
    return entries.reduce((acc, [key, value]) => {
      acc[key] = sanitizePayload(value, depth + 1);
      return acc;
    }, {});
  }
  return payload;
}
function logIpcRenderer(direction, channel, payload) {
  if (!isDevEnvironment) return;
  if (typeof payload === "undefined") {
    console.debug(`[ipc:${direction}] ${channel}`);
    return;
  }
  console.debug(`[ipc:${direction}] ${channel}`, sanitizePayload(payload));
}
class DownloadManager {
  queue;
  settingsFetcher;
  windows = [];
  constructor(settingsFetcher, maxConcurrent = 3, speedLimitBps = 0) {
    this.settingsFetcher = settingsFetcher;
    this.queue = new DownloadQueue(maxConcurrent, speedLimitBps);
    this.queue.on("job-updated", (job) => {
      this.broadcastToRenderers("download:updated", job);
    });
    this.queue.on("job-progress", (downloadId, bytesDownloaded, bytesTotal, speedBps) => {
      this.broadcastToRenderers("download:progress", { downloadId, bytesDownloaded, bytesTotal, speedBps });
    });
    this.queue.on("job-completed", (downloadId, result) => {
      this.broadcastToRenderers("download:completed", { downloadId, result });
    });
    this.queue.on("job-failed", (downloadId, error) => {
      this.broadcastToRenderers("download:failed", { downloadId, error });
    });
  }
  /**
   * Registers a window to receive download events
   */
  registerWindow(window) {
    if (!this.windows.includes(window)) {
      this.windows.push(window);
    }
    window.on("closed", () => {
      this.windows = this.windows.filter((w) => w !== window);
    });
  }
  /**
   * Broadcasts an event to all registered renderer windows
   */
  broadcastToRenderers(channel, data) {
    logIpcRenderer("main->renderer", channel, data);
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    }
  }
  /**
   * Enqueues a download
   */
  enqueue(params) {
    const settings = this.settingsFetcher();
    const paths = resolveGamePaths(params.gameId, settings);
    const extractPath = getExtractedModPath(paths.modCacheRoot, params.author, params.name, params.version);
    const archivePath = getArchivePath(paths.archiveRoot, params.author, params.name, params.version);
    const downloadUrl = applyThunderstoreCdn(params.downloadUrl, params.preferredCdn);
    const downloadId = `${params.gameId}:${params.modId}:${params.version}`;
    return this.queue.enqueue({
      downloadId,
      gameId: params.gameId,
      modId: params.modId,
      author: params.author,
      name: params.name,
      version: params.version,
      downloadUrl,
      archivePath,
      extractPath,
      ignoreCache: params.ignoreCache
    });
  }
  /**
   * Cancels a download
   */
  cancel(downloadId) {
    this.queue.cancel(downloadId);
  }
  /**
   * Pauses a download
   */
  pause(downloadId) {
    this.queue.pause(downloadId);
  }
  /**
   * Resumes a download
   */
  resume(downloadId) {
    this.queue.resume(downloadId);
  }
  /**
   * Gets all downloads
   */
  getDownloads() {
    return this.queue.getJobs();
  }
  /**
   * Gets a specific download
   */
  getDownload(downloadId) {
    return this.queue.getJob(downloadId);
  }
  /**
   * Updates concurrency limit
   */
  setMaxConcurrent(max) {
    this.queue.setMaxConcurrent(max);
  }
  /**
   * Updates speed limit
   */
  setSpeedLimit(speedLimitBps) {
    this.queue.setSpeedLimit(speedLimitBps);
  }
  /**
   * Clears completed/failed downloads
   */
  clearInactive() {
    this.queue.clearInactive();
  }
}
let instance = null;
function initializeDownloadManager(settingsFetcher, maxConcurrent = 3, speedLimitBps = 0) {
  if (!instance) {
    instance = new DownloadManager(settingsFetcher, maxConcurrent, speedLimitBps);
  }
  return instance;
}
function getDownloadManager() {
  if (!instance) {
    throw new Error("Download manager not initialized");
  }
  return instance;
}
const pathSettings = {
  global: {
    dataFolder: app.getPath("userData"),
    modDownloadFolder: "",
    cacheFolder: ""
  },
  perGame: {}
};
function getPathSettings() {
  return pathSettings;
}
function setPathSettings(next) {
  if (next.global) {
    pathSettings.global = {
      dataFolder: next.global.dataFolder ?? pathSettings.global.dataFolder,
      modDownloadFolder: next.global.modDownloadFolder ?? "",
      cacheFolder: next.global.cacheFolder ?? ""
    };
  }
  if (next.perGame) {
    pathSettings.perGame = {};
    for (const [gameId, settings] of Object.entries(next.perGame)) {
      pathSettings.perGame[gameId] = {
        modDownloadFolder: settings.modDownloadFolder ?? "",
        cacheFolder: settings.cacheFolder ?? "",
        modCacheFolder: settings.modCacheFolder ?? ""
      };
    }
  }
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
  }),
  /**
   * Resolve dependencies for a mod within the same Thunderstore community
   * Returns dependency info with resolved mods and installation status
   */
  resolveDependencies: publicProcedure.input(
    z.object({
      packageIndexUrl: z.string(),
      gameId: z.string(),
      dependencies: z.array(z.string()),
      installedVersions: z.record(z.string(), z.string()),
      enforceVersions: z.boolean()
    })
  ).query(async ({ input }) => {
    return await resolveDependencies(input);
  })
});
const downloadsRouter = t.router({
  /**
   * Enqueue a download
   */
  enqueue: publicProcedure.input(
    z.object({
      gameId: z.string(),
      modId: z.string(),
      author: z.string(),
      name: z.string(),
      version: z.string(),
      downloadUrl: z.string(),
      preferredCdn: z.string(),
      ignoreCache: z.boolean()
    })
  ).mutation(({ input }) => {
    const manager = getDownloadManager();
    return manager.enqueue(input);
  }),
  /**
   * Cancel a download
   */
  cancel: publicProcedure.input(z.object({ downloadId: z.string() })).mutation(({ input }) => {
    const manager = getDownloadManager();
    manager.cancel(input.downloadId);
  }),
  /**
   * Pause a download
   */
  pause: publicProcedure.input(z.object({ downloadId: z.string() })).mutation(({ input }) => {
    const manager = getDownloadManager();
    manager.pause(input.downloadId);
  }),
  /**
   * Resume a download
   */
  resume: publicProcedure.input(z.object({ downloadId: z.string() })).mutation(({ input }) => {
    const manager = getDownloadManager();
    manager.resume(input.downloadId);
  }),
  /**
   * Get all downloads
   */
  getAll: publicProcedure.query(() => {
    const manager = getDownloadManager();
    return manager.getDownloads();
  }),
  /**
   * Get a specific download
   */
  get: publicProcedure.input(z.object({ downloadId: z.string() })).query(({ input }) => {
    const manager = getDownloadManager();
    return manager.getDownload(input.downloadId);
  }),
  /**
   * Clear completed/failed downloads
   */
  clearInactive: publicProcedure.mutation(() => {
    const manager = getDownloadManager();
    manager.clearInactive();
  }),
  /**
   * Update settings
   */
  updateSettings: publicProcedure.input(
    z.object({
      maxConcurrent: z.number().optional(),
      speedLimitBps: z.number().optional(),
      pathSettings: z.object({
        global: z.object({
          dataFolder: z.string(),
          modDownloadFolder: z.string(),
          cacheFolder: z.string()
        }).optional(),
        perGame: z.record(z.string(), z.object({
          modDownloadFolder: z.string(),
          cacheFolder: z.string(),
          modCacheFolder: z.string()
        })).optional()
      }).optional()
    })
  ).mutation(({ input }) => {
    const manager = getDownloadManager();
    if (input.maxConcurrent !== void 0) {
      manager.setMaxConcurrent(input.maxConcurrent);
    }
    if (input.speedLimitBps !== void 0) {
      manager.setSpeedLimit(input.speedLimitBps);
    }
    if (input.pathSettings) {
      setPathSettings(input.pathSettings);
    }
  })
});
const appRouter = t.router({
  desktop: desktopRouter,
  thunderstore: thunderstoreRouter,
  downloads: downloadsRouter
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
app.whenReady().then(() => {
  const downloadManager = initializeDownloadManager(
    getPathSettings,
    3,
    // Default max concurrent downloads (will be updated via tRPC)
    0
    // Default speed limit (will be updated via tRPC)
  );
  createWindow();
  if (win) {
    downloadManager.registerWindow(win);
  }
});
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
