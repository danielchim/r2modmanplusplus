import { c as createLucideIcon, d as useRenderElement, m as mergeProps, a as cn, j as cva } from "./button-DGo68xNG.js";
import { v as create, w as persist, r as reactExports, j as jsxRuntimeExports } from "./index-D84i-0IV.js";
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$4);
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$3);
const __iconNode$2 = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$1);
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
const GAMES = [
  {
    id: "bonelab",
    name: "BONELAB",
    iconUrl: "https://via.placeholder.com/64x64/7c3aed/ffffff?text=BL",
    bannerUrl: `/game_selection/bonelab.webp`
  },
  {
    id: "h3vr",
    name: "Hot Dogs, Horseshoes & Hand Grenades",
    iconUrl: "https://via.placeholder.com/64x64/dc2626/ffffff?text=H3",
    bannerUrl: `/game_selection/h3vr.webp`
  },
  {
    id: "ror2",
    name: "Risk of Rain 2",
    iconUrl: "https://via.placeholder.com/64x64/4a5568/ffffff?text=ROR2",
    bannerUrl: `/game_selection/ror2.webp`
  },
  {
    id: "valheim",
    name: "Valheim",
    iconUrl: "https://via.placeholder.com/64x64/0f766e/ffffff?text=VH",
    bannerUrl: `/game_selection/valheim.webp`
  },
  {
    id: "lethal-company",
    name: "Lethal Company",
    iconUrl: "https://via.placeholder.com/64x64/b91c1c/ffffff?text=LC",
    bannerUrl: `/game_selection/lethal-company.webp`
  },
  {
    id: "dyson-sphere",
    name: "Dyson Sphere Program",
    iconUrl: "https://via.placeholder.com/64x64/7c3aed/ffffff?text=DSP",
    bannerUrl: `/game_selection/dyson-sphere-program.webp`
  },
  {
    id: "20-minutes-till-dawn",
    name: "20 Minutes Till Dawn",
    iconUrl: "https://via.placeholder.com/64x64/dc2626/ffffff?text=20M",
    bannerUrl: `/game_selection/20-minutes-till-dawn.webp`
  },
  {
    id: "9-years-of-shadows",
    name: "9 Years of Shadows",
    iconUrl: "https://via.placeholder.com/64x64/ea580c/ffffff?text=9YS",
    bannerUrl: `/game_selection/9-years-of-shadows.webp`
  },
  {
    id: "across-the-obelisk",
    name: "Across the Obelisk",
    iconUrl: "https://via.placeholder.com/64x64/7c2d12/ffffff?text=ATO",
    bannerUrl: `/game_selection/across-the-obelisk.webp`
  },
  {
    id: "aegis-descend",
    name: "Aegis Descend",
    iconUrl: "https://via.placeholder.com/64x64/fbbf24/ffffff?text=AD",
    bannerUrl: `/game_selection/aegis-descend.webp`
  },
  {
    id: "against",
    name: "Against",
    iconUrl: "https://via.placeholder.com/64x64/1f2937/ffffff?text=AG",
    bannerUrl: `/game_selection/against.webp`
  },
  {
    id: "against-the-storm",
    name: "Against the Storm",
    iconUrl: "https://via.placeholder.com/64x64/65a30d/ffffff?text=ATS",
    bannerUrl: `/game_selection/against-the-storm.webp`
  },
  {
    id: "ale-and-tale",
    name: "Ale & Tale Tavern",
    iconUrl: "https://via.placeholder.com/64x64/d97706/ffffff?text=AT",
    bannerUrl: `/game_selection/ale-and-tale-tavern.webp`
  },
  {
    id: "aloft",
    name: "Aloft",
    iconUrl: "https://via.placeholder.com/64x64/0ea5e9/ffffff?text=AL",
    bannerUrl: `/game_selection/aloft.webp`
  },
  {
    id: "among-us",
    name: "Among Us",
    iconUrl: "https://via.placeholder.com/64x64/dc2626/ffffff?text=AU",
    bannerUrl: `/game_selection/among-us.webp`
  },
  {
    id: "an-untarnished-game",
    name: "An Untarnished Game",
    iconUrl: "https://via.placeholder.com/64x64/0891b2/ffffff?text=UG",
    bannerUrl: `/game_selection/an-unfinished-game.webp`
  },
  {
    id: "ancient-dungeon",
    name: "Ancient Dungeon VR",
    iconUrl: "https://via.placeholder.com/64x64/c026d3/ffffff?text=AD",
    bannerUrl: `/game_selection/ancient-dungeon-vr.webp`
  },
  {
    id: "aneurismy",
    name: "Aneurismy",
    iconUrl: "https://via.placeholder.com/64x64/e11d48/ffffff?text=AN",
    bannerUrl: `/game_selection/aneurism-iv.webp`
  },
  {
    id: "aquamarine",
    name: "Aquamarine",
    iconUrl: "https://via.placeholder.com/64x64/06b6d4/ffffff?text=AQ",
    bannerUrl: `/game_selection/aquamarine.webp`
  },
  {
    id: "aska",
    name: "ASKA",
    iconUrl: "https://via.placeholder.com/64x64/d97706/ffffff?text=AS",
    bannerUrl: `/game_selection/aska.webp`
  }
];
const useDownloadStore = create((set, get) => ({
  tasks: {},
  startDownload: (modId, gameId, modName, modVersion, modAuthor, modIconUrl) => {
    set((state) => {
      const bytesTotal = Math.floor(Math.random() * (100 * 1024 * 1024 - 5 * 1024 * 1024) + 5 * 1024 * 1024);
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            modId,
            gameId,
            modName,
            modVersion,
            modAuthor,
            modIconUrl,
            status: "queued",
            progress: 0,
            bytesDownloaded: 0,
            bytesTotal,
            speedBps: 0,
            lastTickAt: Date.now(),
            lastBytesDownloaded: 0
          }
        }
      };
    });
  },
  pauseDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task || task.status !== "downloading") return state;
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "paused",
            speedBps: 0
          }
        }
      };
    });
  },
  resumeDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task || task.status !== "paused") return state;
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "downloading",
            lastTickAt: Date.now(),
            lastBytesDownloaded: task.bytesDownloaded
          }
        }
      };
    });
  },
  cancelDownload: (modId) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[modId];
      return { tasks: newTasks };
    });
  },
  pauseAll: () => {
    set((state) => {
      const newTasks = { ...state.tasks };
      Object.keys(newTasks).forEach((modId) => {
        const task = newTasks[modId];
        if (task.status === "downloading" || task.status === "queued") {
          newTasks[modId] = {
            ...task,
            status: "paused",
            speedBps: 0
          };
        }
      });
      return { tasks: newTasks };
    });
  },
  resumeAll: (maxConcurrentDownloads) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      const currentDownloadingCount = Object.values(newTasks).filter(
        (t) => t.status === "downloading"
      ).length;
      const availableSlots = maxConcurrentDownloads - currentDownloadingCount;
      const pausedTasks = Object.values(newTasks).filter((t) => t.status === "paused");
      let resumedCount = 0;
      pausedTasks.forEach((task) => {
        if (resumedCount < availableSlots) {
          newTasks[task.modId] = {
            ...task,
            status: "downloading",
            lastTickAt: Date.now(),
            lastBytesDownloaded: task.bytesDownloaded
          };
          resumedCount++;
        } else {
          newTasks[task.modId] = {
            ...task,
            status: "queued"
          };
        }
      });
      return { tasks: newTasks };
    });
  },
  cancelAll: () => {
    set((state) => {
      const newTasks = { ...state.tasks };
      Object.keys(newTasks).forEach((modId) => {
        const task = newTasks[modId];
        if (task.status === "downloading" || task.status === "queued" || task.status === "paused") {
          delete newTasks[modId];
        }
      });
      return { tasks: newTasks };
    });
  },
  updateProgress: (modId, bytesDownloaded, speedBps) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task) return state;
      const progress = Math.min(100, Math.round(bytesDownloaded / task.bytesTotal * 100));
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            bytesDownloaded,
            progress,
            speedBps,
            lastTickAt: Date.now(),
            lastBytesDownloaded: bytesDownloaded
          }
        }
      };
    });
  },
  completeDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "completed",
            progress: 100,
            bytesDownloaded: task.bytesTotal,
            speedBps: 0
          }
        }
      };
    });
  },
  failDownload: (modId, error) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "error",
            speedBps: 0,
            error
          }
        }
      };
    });
  },
  setStatus: (modId, status) => {
    set((state) => {
      const task = state.tasks[modId];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status
          }
        }
      };
    });
  },
  // Queries
  getTask: (modId) => {
    return get().tasks[modId];
  },
  getTasksByGame: (gameId) => {
    return Object.values(get().tasks).filter((task) => task.gameId === gameId);
  },
  getDownloadingTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "downloading");
  },
  getQueuedTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "queued");
  },
  getPausedTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "paused");
  },
  getAllActiveTasks: () => {
    return Object.values(get().tasks).filter(
      (task) => task.status === "queued" || task.status === "downloading" || task.status === "paused"
    );
  }
}));
const defaultGlobalSettings = {
  dataFolder: "E:\\lmao",
  steamFolder: "C:\\Program Files (x86)\\Steam",
  speedLimitEnabled: false,
  speedLimitBps: 0,
  speedUnit: "Bps",
  maxConcurrentDownloads: 3,
  downloadCacheEnabled: true,
  preferredThunderstoreCdn: "main",
  enforceDependencyVersions: true,
  cardDisplayType: "collapsed",
  theme: "dark",
  funkyMode: false
};
const defaultPerGameSettings = {
  gameInstallFolder: "",
  launchParameters: "",
  onlineModListCacheDate: null
};
const useSettingsStore = create()(
  persist(
    (set, get) => ({
      global: defaultGlobalSettings,
      perGame: {},
      updateGlobal: (updates) => set((state) => ({
        global: { ...state.global, ...updates }
      })),
      updatePerGame: (gameId, updates) => set((state) => ({
        perGame: {
          ...state.perGame,
          [gameId]: {
            ...defaultPerGameSettings,
            ...state.perGame[gameId],
            ...updates
          }
        }
      })),
      getPerGame: (gameId) => {
        const state = get();
        return {
          ...defaultPerGameSettings,
          ...state.perGame[gameId]
        };
      }
    }),
    {
      name: "r2modman.settings"
    }
  )
);
function useRender(params) {
  return useRenderElement(params.defaultTagName ?? "div", params, params);
}
const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(badgeVariants({ className, variant }))
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant
    }
  });
}
const Progress = reactExports.forwardRef(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, value / max * 100));
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": max,
        "aria-valuenow": value,
        className: cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        ),
        ...props,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full bg-primary",
            style: { width: `${percentage}%` }
          }
        )
      }
    );
  }
);
Progress.displayName = "Progress";
export {
  Badge as B,
  CircleCheck as C,
  GAMES as G,
  Progress as P,
  X,
  useDownloadStore as a,
  Pause as b,
  CircleAlert as c,
  Play as d,
  useSettingsStore as u
};
