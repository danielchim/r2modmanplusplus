import { j as jsxRuntimeExports } from "./index-D84i-0IV.js";
import { c as createLucideIcon, B as Button, a as cn, L as LoaderCircle } from "./button-DGo68xNG.js";
import { a as useDownloadStore, u as useSettingsStore, d as Play, b as Pause, X, G as GAMES, B as Badge, P as Progress, c as CircleAlert, C as CircleCheck } from "./progress-DRd_MjCP.js";
import { S as Settings } from "./settings-BVUuLTNg.js";
const __iconNode$1 = [
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Clock = createLucideIcon("clock", __iconNode$1);
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode);
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
function formatSpeed(bps) {
  return `${formatBytes(bps)}/s`;
}
function getStatusBadgeVariant(status) {
  switch (status) {
    case "downloading":
      return "default";
    case "completed":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}
function getStatusIcon(status) {
  switch (status) {
    case "downloading":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin" });
    case "completed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3" });
    case "error":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3" });
    case "queued":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" });
    default:
      return null;
  }
}
function getStatusLabel(status) {
  switch (status) {
    case "queued":
      return "Queued";
    case "downloading":
      return "Downloading";
    case "completed":
      return "Completed";
    case "error":
      return "Failed";
    case "paused":
      return "Paused";
  }
}
function DownloadsPage() {
  const tasks = useDownloadStore((s) => s.tasks);
  const pauseDownload = useDownloadStore((s) => s.pauseDownload);
  const resumeDownload = useDownloadStore((s) => s.resumeDownload);
  const cancelDownload = useDownloadStore((s) => s.cancelDownload);
  const pauseAll = useDownloadStore((s) => s.pauseAll);
  const resumeAll = useDownloadStore((s) => s.resumeAll);
  const cancelAll = useDownloadStore((s) => s.cancelAll);
  const getAllActiveTasks = useDownloadStore((s) => s.getAllActiveTasks);
  const getPausedTasks = useDownloadStore((s) => s.getPausedTasks);
  const startDownload = useDownloadStore((s) => s.startDownload);
  const maxConcurrentDownloads = useSettingsStore((s) => s.global.maxConcurrentDownloads);
  const allTasks = Object.values(tasks);
  const activeTasks = getAllActiveTasks();
  const pausedTasks = getPausedTasks();
  const tasksByGame = allTasks.reduce((acc, task) => {
    if (!acc[task.gameId]) {
      acc[task.gameId] = [];
    }
    acc[task.gameId].push(task);
    return acc;
  }, {});
  const activeDownloads = allTasks.filter(
    (d) => d.status === "downloading"
  ).length;
  const totalSpeed = allTasks.filter((d) => d.status === "downloading").reduce((sum, task) => sum + task.speedBps, 0);
  const queuedCount = activeTasks.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-7xl px-6 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border border-border bg-gradient-to-br from-sky-900/20 via-slate-900/30 to-slate-950/40 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-balance", children: "Downloads" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-pretty", children: "Manage your mod downloads and installation queue" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Download" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium tabular-nums", children: formatSpeed(totalSpeed) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Upload" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium tabular-nums", children: "0 B/s" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium tabular-nums", children: activeDownloads })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
          "Upcoming ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "(",
            queuedCount,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: queuedCount === 0 ? "No downloads in the queue" : `${activeDownloads} active, ${queuedCount - activeDownloads} pending` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: queuedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        pausedTasks.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => resumeAll(maxConcurrentDownloads),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 mr-1.5" }),
              "Resume All"
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: pauseAll,
            disabled: activeDownloads === 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-4 mr-1.5" }),
              "Pause All"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            size: "sm",
            onClick: cancelAll,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4 mr-1.5" }),
              "Cancel All"
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: allTasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-muted/50 p-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No downloads in your queue" }) }) : Object.entries(tasksByGame).map(([gameId, gameTasks]) => {
      const game = GAMES.find((g) => g.id === gameId);
      if (!game) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: game.bannerUrl,
              alt: game.name,
              className: "size-8 rounded object-cover"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: game.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              gameTasks.length,
              " ",
              gameTasks.length === 1 ? "download" : "downloads"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: gameTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "rounded-lg border border-border bg-card p-4",
              task.status === "completed" && "opacity-60"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: task.modIconUrl,
                  alt: task.modName,
                  className: "size-12 shrink-0 rounded object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-balance", children: task.modName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      "by ",
                      task.modAuthor,
                      " · v",
                      task.modVersion
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: getStatusBadgeVariant(task.status), className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    getStatusIcon(task.status),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getStatusLabel(task.status) })
                  ] }) })
                ] }),
                (task.status === "downloading" || task.status === "paused") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: task.progress, max: 100 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums", children: [
                      formatBytes(task.bytesDownloaded),
                      " / ",
                      formatBytes(task.bytesTotal),
                      " (",
                      task.progress,
                      "%)"
                    ] }),
                    task.status === "downloading" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatSpeed(task.speedBps) })
                  ] })
                ] }),
                task.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "Downloaded ",
                  formatBytes(task.bytesTotal),
                  " successfully"
                ] }),
                task.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive", children: task.error || "Download failed" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
                task.status === "downloading" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => pauseDownload(task.modId), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-4" }) }),
                task.status === "paused" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => resumeDownload(task.modId), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4" }) }),
                task.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      onClick: () => startDownload(
                        task.modId,
                        task.gameId,
                        task.modName,
                        task.modVersion,
                        task.modAuthor,
                        task.modIconUrl
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => cancelDownload(task.modId), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
                ] }),
                (task.status === "queued" || task.status === "downloading" || task.status === "paused") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => cancelDownload(task.modId), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
              ] })
            ] })
          },
          task.modId
        )) })
      ] }, gameId);
    }) })
  ] }) });
}
function DownloadsRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadsPage, {});
}
export {
  DownloadsRoute as component
};
