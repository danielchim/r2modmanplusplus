import { r as reactExports, b as useAppStore, j as jsxRuntimeExports, a as useProfileStore } from "./index-D84i-0IV.js";
import { u as useModManagementStore, p as isVersionGreater, q as analyzeModDependencies, r as DependencyDownloadDialog, D as Download, j as TriangleAlert, s as MODS, v as Checkbox, k as PROFILES, C as CreateProfileDialog, P as Plus, L as List, S as Sheet, w as SheetTrigger, l as SheetContent, x as MOD_CATEGORIES } from "./sheet-B6Cmoxvh.js";
import { u as useSettingsStore, a as useDownloadStore, P as Progress, b as Pause, G as GAMES } from "./progress-DRd_MjCP.js";
import { U as Switch, T as Trash2, a3 as ChevronUp, C as ChevronDown, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuGroup, d as DropdownMenuLabel, f as DropdownMenuRadioGroup, g as DropdownMenuRadioItem, e as DropdownMenuSeparator, h as DropdownMenuItem, I as Input } from "./select-cz2npUlP.js";
import { c as createLucideIcon, a as cn, B as Button, L as LoaderCircle } from "./button-DGo68xNG.js";
import { E as EllipsisVertical, S as Search } from "./search-CchuWvBb.js";
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }]
];
const Grid3x3 = createLucideIcon("grid-3x3", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 5H3", key: "1qgfaw" }],
  ["path", { d: "M12 19H3", key: "yhmn1j" }],
  ["path", { d: "M14 3v4", key: "1sua03" }],
  ["path", { d: "M16 17v4", key: "1q0r14" }],
  ["path", { d: "M21 12h-9", key: "1o4lsq" }],
  ["path", { d: "M21 19h-5", key: "1rlt1p" }],
  ["path", { d: "M21 5h-7", key: "1oszz2" }],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M8 12H3", key: "a7s4jb" }]
];
const SlidersHorizontal = createLucideIcon("sliders-horizontal", __iconNode);
const ModTile = reactExports.memo(function ModTile2({ mod }) {
  const selectMod = useAppStore((s) => s.selectMod);
  const selectedModId = useAppStore((s) => s.selectedModId);
  const selectedGameId = useAppStore((s) => s.selectedGameId);
  const toggleMod = useModManagementStore((s) => s.toggleMod);
  const uninstallMod = useModManagementStore((s) => s.uninstallMod);
  const getDependencyWarnings = useModManagementStore((s) => s.getDependencyWarnings);
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame);
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions);
  const startDownload = useDownloadStore((s) => s.startDownload);
  const [showDependencyDialog, setShowDependencyDialog] = reactExports.useState(false);
  const isSelected = selectedModId === mod.id;
  const installedSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId]);
  const enabledSet = useModManagementStore((s) => s.enabledModsByGame[selectedGameId]);
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods);
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id]);
  const isInstalled = installedSet ? installedSet.has(mod.id) : false;
  const isEnabled = enabledSet ? enabledSet.has(mod.id) : false;
  const isUninstalling = uninstallingSet.has(mod.id);
  const depWarnings = getDependencyWarnings(selectedGameId, mod.id);
  const hasWarnings = isInstalled && depWarnings.length > 0;
  const isDownloading = downloadTask?.status === "downloading";
  const isQueued = downloadTask?.status === "queued";
  const isPaused = downloadTask?.status === "paused";
  const hasDownloadTask = isDownloading || isQueued || isPaused;
  const installedVersion = installedVersionsByGame[mod.gameId]?.[mod.id];
  const hasUpdate = isInstalled && installedVersion && isVersionGreater(mod.version, installedVersion);
  const installedVersionsForGame = installedVersionsByGame[mod.gameId];
  const depInfos = reactExports.useMemo(() => {
    const installedVersions = installedVersionsForGame || {};
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions
    });
  }, [mod, installedVersionsForGame, enforceDependencyVersions]);
  const handleActionClick = (e) => {
    e.stopPropagation();
    if (isInstalled) {
      uninstallMod(selectedGameId, mod.id);
    } else {
      const hasDepsToInstall = depInfos.some(
        (dep) => dep.resolvedMod && (dep.status === "not_installed" || dep.status === "installed_wrong")
      );
      if (hasDepsToInstall) {
        setShowDependencyDialog(true);
      } else {
        startDownload(mod.id, mod.gameId, mod.name, mod.version, mod.author, mod.iconUrl);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DependencyDownloadDialog,
      {
        mod,
        requestedVersion: mod.version,
        open: showDependencyDialog,
        onOpenChange: setShowDependencyDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "group relative flex flex-col overflow-hidden rounded-md border bg-card text-left transition-colors cursor-pointer",
          "hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isSelected ? "border-ring" : "border-border"
        ),
        onClick: () => selectMod(mod.id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square overflow-hidden bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: mod.iconUrl,
              alt: mod.name,
              className: "size-full object-cover transition-transform group-hover:scale-105"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-1 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-1 text-sm font-semibold", children: mod.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "by ",
              mod.author
            ] }),
            isDownloading && downloadTask ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: downloadTask.progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                downloadTask.progress.toFixed(0),
                "% • ",
                (downloadTask.speedBps / 1024 / 1024).toFixed(2),
                " MB/s"
              ] })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                mod.downloads.toLocaleString(),
                " downloads"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "size-2 rounded-full",
                    isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
                  )
                }
              )
            ] }),
            isInstalled && !isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Enabled" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: isEnabled,
                  onCheckedChange: () => toggleMod(selectedGameId, mod.id)
                }
              )
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: isInstalled ? "destructive" : "default",
                size: "sm",
                className: "mt-2 w-full",
                onClick: handleActionClick,
                disabled: hasDownloadTask || isUninstalling,
                children: isInstalled ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 mr-1.5 animate-spin" }),
                  "Uninstalling"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3 mr-1.5" }),
                  "Uninstall"
                ] }) }) : hasDownloadTask ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  isDownloading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 mr-1.5 animate-spin" }),
                  isPaused && /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-3 mr-1.5" }),
                  isQueued ? "Queued" : isPaused ? "Paused" : "Downloading"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3 mr-1.5" }),
                  "Download"
                ] })
              }
            )
          ] }),
          isInstalled && isEnabled && !hasWarnings && !hasUpdate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground", children: "Active" }) : null,
          hasUpdate && !hasWarnings ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500", children: "Update available" }) : null,
          hasWarnings ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3" }),
            "Missing deps"
          ] }) : null,
          isQueued && !hasWarnings && !hasUpdate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-xs font-medium", children: "Queued" }) : null,
          isPaused && !hasWarnings && !hasUpdate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500", children: "Paused" }) : null,
          isDownloading && downloadTask && !hasWarnings && !hasUpdate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-2 top-2 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-500", children: [
            downloadTask.progress.toFixed(0),
            "%"
          ] }) : null
        ]
      }
    )
  ] });
});
const ModListItem = reactExports.memo(function ModListItem2({ mod }) {
  const selectMod = useAppStore((s) => s.selectMod);
  const selectedModId = useAppStore((s) => s.selectedModId);
  const selectedGameId = useAppStore((s) => s.selectedGameId);
  const toggleMod = useModManagementStore((s) => s.toggleMod);
  const uninstallMod = useModManagementStore((s) => s.uninstallMod);
  const getDependencyWarnings = useModManagementStore((s) => s.getDependencyWarnings);
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame);
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions);
  const startDownload = useDownloadStore((s) => s.startDownload);
  const [showDependencyDialog, setShowDependencyDialog] = reactExports.useState(false);
  const isSelected = selectedModId === mod.id;
  const installedSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId]);
  const enabledSet = useModManagementStore((s) => s.enabledModsByGame[selectedGameId]);
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods);
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id]);
  const isInstalled = installedSet ? installedSet.has(mod.id) : false;
  const isEnabled = enabledSet ? enabledSet.has(mod.id) : false;
  const isUninstalling = uninstallingSet.has(mod.id);
  const depWarnings = getDependencyWarnings(selectedGameId, mod.id);
  const hasWarnings = isInstalled && depWarnings.length > 0;
  const isDownloading = downloadTask?.status === "downloading";
  const isQueued = downloadTask?.status === "queued";
  const isPaused = downloadTask?.status === "paused";
  const hasDownloadTask = isDownloading || isQueued || isPaused;
  const installedVersion = installedVersionsByGame[mod.gameId]?.[mod.id];
  const hasUpdate = isInstalled && installedVersion && isVersionGreater(mod.version, installedVersion);
  const installedVersionsForGame = installedVersionsByGame[mod.gameId];
  const depInfos = reactExports.useMemo(() => {
    const installedVersions = installedVersionsForGame || {};
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions
    });
  }, [mod, installedVersionsForGame, enforceDependencyVersions]);
  const handleActionClick = (e) => {
    e.stopPropagation();
    if (isInstalled) {
      uninstallMod(selectedGameId, mod.id);
    } else {
      const hasDepsToInstall = depInfos.some(
        (dep) => dep.resolvedMod && (dep.status === "not_installed" || dep.status === "installed_wrong")
      );
      if (hasDepsToInstall) {
        setShowDependencyDialog(true);
      } else {
        startDownload(mod.id, mod.gameId, mod.name, mod.version, mod.author, mod.iconUrl);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DependencyDownloadDialog,
      {
        mod,
        requestedVersion: mod.version,
        open: showDependencyDialog,
        onOpenChange: setShowDependencyDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => selectMod(mod.id),
        className: cn(
          "group flex w-full items-center gap-4 rounded-md border bg-card p-3 text-left transition-colors cursor-pointer",
          "hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isSelected ? "border-ring" : "border-border"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 shrink-0 overflow-hidden rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: mod.iconUrl,
              alt: mod.name,
              className: "size-full object-cover transition-transform group-hover:scale-105"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: mod.name }),
              isInstalled && isEnabled && !hasUpdate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground", children: "Active" }),
              hasUpdate && !hasWarnings && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500", children: "Update available" }),
              hasWarnings && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3" }),
                "Missing deps"
              ] }),
              isQueued && !hasUpdate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-2 py-0.5 text-xs font-medium", children: "Queued" }),
              isPaused && !hasUpdate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500", children: "Paused" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "by ",
              mod.author
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-xs text-muted-foreground", children: mod.description }),
            isDownloading && downloadTask ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: downloadTask.progress, className: "h-1.5 flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
                downloadTask.progress.toFixed(0),
                "%"
              ] })
            ] }) : null
          ] }),
          isInstalled && !isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-2", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: isEnabled,
                onCheckedChange: () => toggleMod(selectedGameId, mod.id)
              }
            )
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: mod.version }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              mod.downloads.toLocaleString(),
              " downloads"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(mod.lastUpdated).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: isInstalled ? "destructive" : "default",
              size: "sm",
              onClick: handleActionClick,
              className: "shrink-0",
              disabled: hasDownloadTask || isUninstalling,
              children: isInstalled ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 mr-1.5 animate-spin" }),
                "Uninstalling"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3 mr-1.5" }),
                "Uninstall"
              ] }) }) : hasDownloadTask ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                isDownloading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 mr-1.5 animate-spin" }),
                isPaused && /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-3 mr-1.5" }),
                isQueued ? "Queued" : isPaused ? "Paused" : "Downloading"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3 mr-1.5" }),
                "Download"
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "size-3 shrink-0 rounded-full",
                isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
              )
            }
          )
        ]
      }
    )
  ] });
});
function ModFilters({
  section,
  onSectionChange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  categoryCounts
}) {
  const [sectionsOpen, setSectionsOpen] = reactExports.useState(true);
  const [categoriesOpen, setCategoriesOpen] = reactExports.useState(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col border-r border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Filters" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSectionsOpen(!sectionsOpen),
            className: "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sections" }),
              sectionsOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 text-muted-foreground" })
            ]
          }
        ),
        sectionsOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onSectionChange("mod"),
              className: cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                section === "mod" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "size-4 rounded-full border-2 flex items-center justify-center",
                      section === "mod" ? "border-primary" : "border-muted-foreground/50"
                    ),
                    children: section === "mod" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-primary" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mods" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onSectionChange("modpack"),
              className: cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                section === "modpack" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "size-4 rounded-full border-2 flex items-center justify-center",
                      section === "modpack" ? "border-primary" : "border-muted-foreground/50"
                    ),
                    children: section === "modpack" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-primary" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Modpacks" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setCategoriesOpen(!categoriesOpen),
            className: "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Categories" }),
              categoriesOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 text-muted-foreground" })
            ]
          }
        ),
        categoriesOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[400px] overflow-y-auto space-y-1", children: categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const count = categoryCounts?.[category] ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: isSelected,
                    onCheckedChange: () => onToggleCategory(category)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: category }),
                count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: count })
              ]
            },
            category
          );
        }) }) })
      ] })
    ] }),
    selectedCategories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-t border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "sm",
        onClick: onClearCategories,
        className: "w-full",
        children: "Clear filters"
      }
    ) })
  ] });
}
function ModsLibrary() {
  const [createProfileOpen, setCreateProfileOpen] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState("grid");
  const [section, setSection] = reactExports.useState("mod");
  const [selectedCategories, setSelectedCategories] = reactExports.useState([]);
  const [filtersOpen, setFiltersOpen] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e) => {
      if (e.matches) {
        setFiltersOpen(true);
      }
    };
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const selectedGameId = useAppStore((s) => s.selectedGameId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setShowContextPanel = useAppStore((s) => s.setShowContextPanel);
  const selectMod = useAppStore((s) => s.selectMod);
  const tab = useAppStore((s) => s.modLibraryTab);
  const setTab = useAppStore((s) => s.setModLibraryTab);
  const installedModsSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId]);
  const activeProfileId = useProfileStore(
    (s) => s.activeProfileIdByGame[selectedGameId]
  );
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const currentGame = GAMES.find((g) => g.id === selectedGameId);
  const gameProfiles = PROFILES.filter((p) => p.gameId === selectedGameId);
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId);
  const handleCreateProfile = (profileName) => {
    console.log("Creating profile:", profileName, "for game:", selectedGameId);
  };
  const handleToggleCategory = (category) => {
    setSelectedCategories(
      (prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };
  const handleClearCategories = () => {
    setSelectedCategories([]);
  };
  const filteredMods = reactExports.useMemo(() => {
    let mods = MODS.filter((m) => m.gameId === selectedGameId);
    if (tab === "installed") {
      mods = mods.filter((m) => installedModsSet?.has(m.id));
    }
    mods = mods.filter((m) => m.kind === section);
    if (selectedCategories.length > 0) {
      mods = mods.filter(
        (m) => selectedCategories.some((cat) => m.categories.includes(cat))
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      mods = mods.filter(
        (m) => m.name.toLowerCase().includes(query) || m.author.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
      );
    }
    if (sortBy === "downloads") {
      mods = mods.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "updated") {
      mods = mods.sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    } else {
      mods = mods.sort((a, b) => a.name.localeCompare(b.name));
    }
    return mods;
  }, [selectedGameId, tab, section, selectedCategories, searchQuery, sortBy, installedModsSet]);
  const categoryCounts = reactExports.useMemo(() => {
    let baseMods = MODS.filter(
      (m) => m.gameId === selectedGameId && m.kind === section
    );
    if (tab === "installed") {
      baseMods = baseMods.filter((m) => installedModsSet?.has(m.id));
    }
    const counts = {};
    baseMods.forEach((mod) => {
      mod.categories.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return counts;
  }, [selectedGameId, section, tab, installedModsSet]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateProfileDialog,
      {
        open: createProfileOpen,
        onOpenChange: setCreateProfileOpen,
        onCreateProfile: handleCreateProfile
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[200px] shrink-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: currentGame?.bannerUrl,
            alt: currentGame?.name,
            className: "size-full object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-balance", children: currentGame?.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 right-6 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "default", size: "default", children: "Start Modded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "default", children: "Start Vanilla" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "default", children: "Open Game Folder" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-b border-border bg-card/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 px-6 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuTrigger,
              {
                render: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  }
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentProfile?.name ?? activeProfileId ?? "Default" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 text-muted-foreground" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenuContent,
              {
                className: "w-[280px] rounded-xl shadow-xl py-2 ring-1 ring-border/80",
                align: "start",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuGroup, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "px-3 py-2", children: "All Profiles" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      DropdownMenuRadioGroup,
                      {
                        value: activeProfileId ?? "",
                        onValueChange: (profileId) => setActiveProfile(selectedGameId, profileId),
                        children: gameProfiles.map((profile) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          DropdownMenuRadioItem,
                          {
                            value: profile.id,
                            className: "mx-1 gap-3 rounded-md px-3 py-2",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profile.name }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
                                profile.modCount,
                                " mods"
                              ] })
                            ]
                          },
                          profile.id
                        ))
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, { className: "mx-0 my-2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuItem,
                    {
                      className: "mx-1 gap-3 rounded-md px-3 py-2",
                      onClick: () => setCreateProfileOpen(true),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Create new profile" })
                      ]
                    }
                  ) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              "aria-label": "More options",
              onClick: () => {
                selectMod(null);
                setShowContextPanel(true);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "size-4" })
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: tab === "installed" ? "rounded-b-none border-b-2 border-primary" : "rounded-b-none",
              onClick: () => setTab("installed"),
              children: "Installed"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: tab === "online" ? "rounded-b-none border-b-2 border-primary" : "rounded-b-none",
              onClick: () => setTab("online"),
              children: "Online"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border bg-card px-6 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 border border-border rounded-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: viewMode === "grid" ? "secondary" : "ghost",
              size: "icon",
              className: "rounded-r-none",
              onClick: () => setViewMode("grid"),
              "aria-label": "Grid view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid3x3, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: viewMode === "list" ? "secondary" : "ghost",
              size: "icon",
              className: "rounded-l-none",
              onClick: () => setViewMode("list"),
              "aria-label": "List view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "size-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SheetTrigger,
            {
              className: "lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-accent hover:text-accent-foreground size-9",
              "aria-label": "Filter",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "left", className: "p-0 w-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ModFilters,
            {
              section,
              onSectionChange: setSection,
              categories: [...MOD_CATEGORIES],
              selectedCategories,
              onToggleCategory: handleToggleCategory,
              onClearCategories: handleClearCategories,
              categoryCounts
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            "aria-label": "Filter",
            className: "hidden lg:inline-flex",
            onClick: () => setFiltersOpen((v) => !v),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "size-4" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
        filtersOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block w-[280px] shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ModFilters,
          {
            section,
            onSectionChange: setSection,
            categories: [...MOD_CATEGORIES],
            selectedCategories,
            onToggleCategory: handleToggleCategory,
            onClearCategories: handleClearCategories,
            categoryCounts
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 lg:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold", children: tab === "installed" ? section === "mod" ? "Installed Mods" : "Installed Modpacks" : section === "mod" ? "All Mods" : "All Modpacks" }),
          filteredMods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[400px] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
              "No ",
              section === "mod" ? "mods" : "modpacks",
              " found"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: searchQuery || selectedCategories.length > 0 ? "Try clearing filters or adjusting your search" : tab === "installed" ? `No ${section === "mod" ? "mods" : "modpacks"} installed yet` : `No ${section === "mod" ? "mods" : "modpacks"} available` })
          ] }) }) : viewMode === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4", children: filteredMods.map((mod) => /* @__PURE__ */ jsxRuntimeExports.jsx(ModTile, { mod }, mod.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: filteredMods.map((mod) => /* @__PURE__ */ jsxRuntimeExports.jsx(ModListItem, { mod }, mod.id)) })
        ] }) })
      ] })
    ] })
  ] });
}
function HomeRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModsLibrary, {});
}
export {
  HomeRoute as component
};
