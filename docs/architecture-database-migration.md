# 状态管理架构：从 Zustand 迁移到后端数据库

## 1. 现状架构

### 整体数据流

```
┌─────────────────────────────────────────────────────────┐
│  Renderer Process (React)                               │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Zustand      │  │ React Query  │  │ DownloadBridge│  │
│  │ Stores       │  │ (tRPC hooks) │  │ (IPC listener)│  │
│  │ + localStorage│  │              │  │               │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│─────────┼─────────────────┼───────────────────┼──────────│
│         │        electron-trpc (IPC)          │          │
│─────────┼─────────────────┼───────────────────┼──────────│
│         ▼                 ▼                   ▼          │
│  Main Process (Node.js)                                  │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ tRPC Router  │  │ DownloadMgr   │  │ SQLite       │  │
│  │ (8 routers)  │  │ (Queue+Events)│  │ (TS Catalog) │  │
│  └──────────────┘  └───────────────┘  └──────────────┘  │
│         │                 │                   │          │
│─────────┼─────────────────┼───────────────────┼──────────│
│         ▼                 ▼                   ▼          │
│  Filesystem / Thunderstore API / Game Processes          │
└─────────────────────────────────────────────────────────┘
```

### 当前 6 个 Zustand Store 的职责

| Store | 持久化 | 位置 | 职责 |
|-------|--------|------|------|
| `useAppStore` | 否 | 内存 | UI 导航状态：当前视图、选中项、搜索、排序 |
| `useDownloadStore` | 否 | 内存 | 下载任务运行时状态，由 DownloadBridge 从主进程同步 |
| `useGameManagementStore` | 是 | `r2modman.gameManagement` | 用户管理的游戏列表、最近使用、默认游戏 |
| `useSettingsStore` | 是 | `r2modman.settings` | 全局设置 + 每游戏设置（路径、下载、UI 偏好） |
| `useProfileStore` | 是 | `r2modman.profiles` | 每游戏的 Profile 列表及激活状态 |
| `useModManagementStore` | 是 | `mod-management-storage.v2` | 每 Profile 的 mod 安装/启用/版本/依赖警告 |

### 当前的问题

1. **数据分散** —— 用户数据分布在 4 个 localStorage key 中，跨 store 引用靠 string ID 手动关联，没有引用完整性
2. **渲染进程持有权威数据** —— 持久化数据在 renderer 的 localStorage 中，main process 需要通过 tRPC 反向查询才能获取
3. **Settings 同步** —— DownloadBridge 需要手动把 settings 变更推送到 main process 的内存缓存（`settings-state.ts`）
4. **无法跨窗口共享** —— 如果未来需要多窗口，localStorage 的 store 不会自动同步

---

## 2. 目标架构

将 4 个持久化 store 迁移到 main process 的 SQLite 数据库。Renderer 通过 tRPC 读写，不再直接持有权威状态。

```
┌───────────────────────────────────────────────────────────┐
│  Renderer Process                                         │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ useAppStore  │  │ useDownload  │  │ React Query    │  │
│  │ (UI 瞬态)    │  │ Store (瞬态) │  │ (tRPC hooks)   │  │
│  │ Zustand      │  │ Zustand      │  │ 缓存 + 失效    │  │
│  └──────────────┘  └──────────────┘  └───────┬────────┘  │
│                                               │           │
│───────────────────────────────────────────────┼───────────│
│                    electron-trpc (IPC)        │           │
│───────────────────────────────────────────────┼───────────│
│                                               ▼           │
│  Main Process                                             │
│                                                           │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐   │
│  │ tRPC Router  │  │ DownloadMgr   │  │ SQLite DB    │   │
│  │              │─>│               │─>│              │   │
│  │ games.*      │  │               │  │ Game         │   │
│  │ settings.*   │  │               │  │ GameSettings │   │
│  │ profiles.*   │  │               │  │ Profile      │   │
│  │ mods.*       │  │               │  │ ProfileMod   │   │
│  └──────────────┘  └───────────────┘  │ GlobalSettings│   │
│                                       │ Mod (cache)  │   │
│                                       └──────────────┘   │
└───────────────────────────────────────────────────────────┘
```

**核心变化：**
- 权威数据源从 renderer localStorage 移到 main process SQLite
- Renderer 通过 React Query + tRPC 查询，自动缓存和失效
- Main process 的 DownloadManager、PathResolver 等可以直接读 DB，不需要 settings 同步桥
- `useAppStore` 和 `useDownloadStore` 保留在前端 Zustand（纯 UI/运行时状态）

---

## 3. 数据库实体设计

### ER 关系图

```
┌──────────────────┐
│  GlobalSettings  │  (单例，一行)
└──────────────────┘

┌────────┐ 1  0..1 ┌──────────────┐
│  Game  │────────>│ GameSettings │
└────────┘         └──────────────┘
    │ 1
    │ N
┌─────────┐ 1   N ┌─────────────┐ N   1 ┌─────┐ N   1 ┌────────┐
│ Profile │──────>│ ProfileMod  │──────>│ Mod │──────>│  Game  │
└─────────┘       └─────────────┘       └─────┘       └────────┘
```

### 3.1 GlobalSettings（单例）

应用级全局配置。始终存在一行。

```sql
CREATE TABLE global_settings (
    id          INTEGER PRIMARY KEY CHECK (id = 1),  -- 强制单例

    -- 路径
    data_folder           TEXT NOT NULL DEFAULT '',
    steam_folder          TEXT NOT NULL DEFAULT '',
    mod_download_folder   TEXT NOT NULL DEFAULT '',
    cache_folder          TEXT NOT NULL DEFAULT '',

    -- 下载
    speed_limit_enabled       INTEGER NOT NULL DEFAULT 0,  -- boolean
    speed_limit_bps           INTEGER NOT NULL DEFAULT 0,
    speed_unit                TEXT NOT NULL DEFAULT 'Bps',
    max_concurrent_downloads  INTEGER NOT NULL DEFAULT 3,
    download_cache_enabled    INTEGER NOT NULL DEFAULT 1,
    preferred_thunderstore_cdn TEXT NOT NULL DEFAULT 'main',
    auto_install_mods         INTEGER NOT NULL DEFAULT 1,

    -- Mod
    enforce_dependency_versions INTEGER NOT NULL DEFAULT 1,

    -- UI
    card_display_type TEXT NOT NULL DEFAULT 'collapsed',
    theme             TEXT NOT NULL DEFAULT 'dark',
    language          TEXT NOT NULL DEFAULT 'en',
    funky_mode        INTEGER NOT NULL DEFAULT 0
);
```

### 3.2 Game

用户管理的游戏。表中有记录 = 已管理，无需额外的 `managedGameIds` 数组。

```sql
CREATE TABLE game (
    id               TEXT PRIMARY KEY,           -- Thunderstore community identifier
    is_default       INTEGER NOT NULL DEFAULT 0, -- 全局唯一 true（应用层保证）
    last_accessed_at TEXT,                        -- ISO8601，替代 recentManagedGameIds
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**原 store 字段映射：**
- `managedGameIds` → `SELECT id FROM game`
- `recentManagedGameIds` → `SELECT id FROM game ORDER BY last_accessed_at DESC LIMIT 10`
- `defaultGameId` → `SELECT id FROM game WHERE is_default = 1`

### 3.3 GameSettings

每游戏的自定义设置。**独立于 Game 表**，便于重置（DELETE 整行即恢复默认）和与 GlobalSettings 做层级合并。

```sql
CREATE TABLE game_settings (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id  TEXT NOT NULL UNIQUE REFERENCES game(id) ON DELETE CASCADE,

    -- 可覆盖全局的字段（nullable = 继承 GlobalSettings）
    mod_download_folder      TEXT,  -- NULL → 继承 global
    cache_folder             TEXT,  -- NULL → 继承 global

    -- 仅 per-game 的字段
    install_folder           TEXT NOT NULL DEFAULT '',
    mod_cache_folder         TEXT NOT NULL DEFAULT '',
    launch_parameters        TEXT NOT NULL DEFAULT '',
    online_mod_list_cache_date TEXT   -- ISO8601 or NULL
);
```

**三层 Fallback 逻辑：**

```
最终值 = per-game 字段 ?? global 字段 ?? 硬编码默认值
```

```typescript
function getEffectiveSettings(gameId: string) {
    const defaults = DEFAULT_GAME_SETTINGS
    const global = db.select().from(globalSettings).where(eq(id, 1)).get()
    const perGame = db.select().from(gameSettings).where(eq(gameId, gameId)).get()

    return {
        modDownloadFolder: perGame?.modDownloadFolder ?? global.modDownloadFolder ?? defaults.modDownloadFolder,
        cacheFolder:       perGame?.cacheFolder       ?? global.cacheFolder       ?? defaults.cacheFolder,
        installFolder:     perGame?.installFolder      ?? defaults.installFolder,
        // ...
    }
}
```

**重置操作：**

| 操作 | SQL |
|------|-----|
| 重置单个字段 | `UPDATE game_settings SET cache_folder = NULL WHERE game_id = ?` |
| 重置所有设置 | `DELETE FROM game_settings WHERE game_id = ?` |
| 删除游戏时自动清理 | `ON DELETE CASCADE` 自动处理 |

### 3.4 Profile

每个游戏下的 mod 配置方案。

```sql
CREATE TABLE profile (
    id         TEXT PRIMARY KEY,              -- '{gameId}-{uuid}' 或 '{gameId}-default'
    game_id    TEXT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,    -- 每游戏唯一 true
    is_active  INTEGER NOT NULL DEFAULT 0,    -- 每游戏唯一 true
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_profile_game ON profile(game_id);
```

### 3.5 ProfileMod（关联表）

Profile 中安装的 mod。合并了原来的 4 个 map：`installedModsByProfile`、`enabledModsByProfile`、`installedModVersionsByProfile`、`dependencyWarningsByProfile`。

```sql
CREATE TABLE profile_mod (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id          TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
    mod_id              TEXT NOT NULL,  -- Thunderstore full_name，如 'Author-ModName'
    installed_version   TEXT NOT NULL,
    enabled             INTEGER NOT NULL DEFAULT 1,
    dependency_warnings TEXT,           -- JSON array，如 '["missing-dep-1","missing-dep-2"]'

    UNIQUE(profile_id, mod_id)
);

CREATE INDEX idx_profile_mod_profile ON profile_mod(profile_id);
CREATE INDEX idx_profile_mod_mod     ON profile_mod(mod_id);
```

### 3.6 Mod（Thunderstore 缓存）

Thunderstore API 的本地缓存。非用户数据，可随时重建。

> 注：目前已有独立的 SQLite catalog（`thunderstore-catalog/*.db`）。此表是可选的，取决于是否要统一到同一个 DB。

```sql
CREATE TABLE mod (
    id              TEXT PRIMARY KEY,  -- Thunderstore full_name
    game_id         TEXT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    author          TEXT NOT NULL,
    icon_url        TEXT,
    latest_version  TEXT,
    description     TEXT,
    cached_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mod_game ON mod(game_id);
```

---

## 4. 不入库的部分

| 原 Store | 迁移后位置 | 原因 |
|----------|-----------|------|
| `useAppStore` | 保留 Zustand（前端内存） | 纯 UI 瞬态状态：当前视图、选中项、搜索词、排序方向 |
| `useDownloadStore` | 保留 Zustand（前端内存） | 下载任务是运行时生命周期，进程退出即清空 |

---

## 5. 迁移后的数据流

### 5.1 读取流程（以"获取当前游戏的 Profile 列表"为例）

```
React Component
    │
    │  const { data } = trpc.profiles.list.useQuery({ gameId })
    │
    ▼
React Query ──── 缓存命中? ──── 是 → 直接返回缓存数据
    │                                  (staleTime 内不重新请求)
    │ 否
    ▼
electron-trpc (IPC)
    │
    ▼
Main Process: profilesRouter.list
    │
    │  db.select().from(profile).where(eq(gameId, input.gameId))
    │
    ▼
SQLite DB → 返回 Profile[]
    │
    ▼
React Query 缓存 → Component 渲染
```

### 5.2 写入流程（以"安装 mod"为例）

```
React Component
    │
    │  trpc.mods.install.useMutation()
    │
    ▼
Main Process: modsRouter.install
    │
    │  1. 文件操作：拷贝 mod 文件到 profile 目录
    │  2. db.insert(profileMod).values({ profileId, modId, version, enabled: true })
    │  3. 返回成功
    │
    ▼
React Query 自动失效
    │
    │  onSuccess: () => {
    │      queryClient.invalidateQueries(['profiles', gameId, 'mods'])
    │  }
    │
    ▼
UI 自动刷新已安装 mod 列表
```

### 5.3 Settings 读取流程（三层合并）

```
React Component
    │
    │  trpc.settings.getEffective.useQuery({ gameId })
    │
    ▼
Main Process: settingsRouter.getEffective
    │
    │  const defaults = DEFAULT_GAME_SETTINGS
    │  const global   = db.select(globalSettings).get()
    │  const perGame  = db.select(gameSettings).where(gameId).get()
    │
    │  return { ...defaults, ...global, ...perGame }   // NULL 字段自动跳过
    │
    ▼
React Query 缓存 → Component 使用合并后的 effective settings
```

### 5.4 Settings 重置流程

```
React Component
    │
    │  trpc.settings.resetPerGame.useMutation()
    │
    ▼
Main Process: settingsRouter.resetPerGame
    │
    │  db.delete(gameSettings).where(eq(gameId, input.gameId))
    │  // 行被删除，下次读取自动 fallback 到 GlobalSettings
    │
    ▼
React Query 失效 → 重新 fetch → 返回的是 global 层的值
```

### 5.5 下载流程（混合模式：DB + Zustand）

下载任务仍是运行时状态，但 main process 可以直接从 DB 读取路径设置，不再需要 settings 同步桥。

```
用户点击安装
    │
    ▼
Renderer: trpc.downloads.enqueue.mutate({ gameId, modId, version })
    │
    ▼
Main Process:
    │  1. 从 DB 读取 effective settings（路径、CDN 偏好、速度限制）
    │     ── 不再需要从 renderer 同步 settings ──
    │  2. 创建 DownloadJob，加入 Queue
    │  3. Queue 按并发数调度
    │
    ▼
DownloadQueue 事件 → IPC broadcast → DownloadBridge → useDownloadStore 更新
    │
    ▼
下载完成 + autoInstall 开启?
    │  是 → trpc.mods.install.mutate()
    │       → 文件拷贝 + DB 写入 profile_mod
    │       → React Query 失效 → UI 刷新
```

---

## 6. 迁移策略

### 第一阶段：建库 + 双写

1. 在 main process 中初始化 SQLite（`better-sqlite3`，复用现有依赖）
2. 应用启动时检测 localStorage 数据，自动迁移到 DB
3. 新的 tRPC procedure 读写 DB
4. 旧的 Zustand store 暂时保留，逐步替换调用方

### 第二阶段：切换读取源

1. 将 React 组件中的 `useXxxStore()` 调用替换为 `trpc.xxx.useQuery()`
2. 写操作改为 `trpc.xxx.useMutation()` + `invalidateQueries`
3. Main process 内部直接读 DB（DownloadManager、PathResolver 等）

### 第三阶段：清理

1. 删除 4 个持久化 Zustand store（GameManagement、Settings、Profile、ModManagement）
2. 删除 DownloadBridge 中的 settings 同步逻辑
3. 删除 `settings-state.ts`（main process 的 settings 内存缓存）
4. 清理 localStorage 迁移代码（或保留一个版本做兼容）

---

## 7. 附：完整实体字段对照表

| 原 Store | 原字段 | 目标实体 | 目标字段 |
|----------|--------|---------|---------|
| GameManagement | `managedGameIds` | `game` | 表中所有行 |
| GameManagement | `recentManagedGameIds` | `game` | `last_accessed_at` 排序 |
| GameManagement | `defaultGameId` | `game` | `is_default` |
| Settings | `global.*` | `global_settings` | 对应字段 |
| Settings | `perGame[gameId].*` | `game_settings` | 对应字段（共有字段 nullable） |
| Profile | `profilesByGame` | `profile` | `game_id` 外键关联 |
| Profile | `activeProfileIdByGame` | `profile` | `is_active` |
| ModManagement | `installedModsByProfile` | `profile_mod` | 行的存在 = 已安装 |
| ModManagement | `enabledModsByProfile` | `profile_mod` | `enabled` |
| ModManagement | `installedModVersionsByProfile` | `profile_mod` | `installed_version` |
| ModManagement | `dependencyWarningsByProfile` | `profile_mod` | `dependency_warnings` (JSON) |
| ModManagement | `uninstallingMods` | 不入库 | 保留前端 Zustand |
