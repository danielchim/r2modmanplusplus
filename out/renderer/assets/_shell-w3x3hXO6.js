import { r as reactExports, u as useGameManagementStore, a as useProfileStore, b as useAppStore, j as jsxRuntimeExports, c as useRouterState, L as Link, O as Outlet } from "./index-D84i-0IV.js";
import { L as List, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, P as Plus, D as Download, d as Dialog, e as DialogContent, f as DialogHeader, g as DialogTitle, h as DialogDescription, i as DialogFooter, j as TriangleAlert, u as useModManagementStore, k as PROFILES, C as CreateProfileDialog, M as ModInspector, S as Sheet, l as SheetContent, m as DialogRoot, n as DialogClose$1, t as toast, o as Toaster } from "./sheet-B6Cmoxvh.js";
import { G as GAMES, X, u as useSettingsStore, a as useDownloadStore } from "./progress-DRd_MjCP.js";
import { c as createLucideIcon, B as Button, a as cn, f as formatErrorMessage, u as useStableCallback, b as useIsoLayoutEffect, d as useRenderElement, i as isElement, m as mergeProps, e as useMergedRefs } from "./button-DGo68xNG.js";
import { I as Input, D as DropdownMenu, a as DropdownMenuTrigger, C as ChevronDown, b as DropdownMenuContent, c as DropdownMenuGroup, d as DropdownMenuLabel, e as DropdownMenuSeparator, f as DropdownMenuRadioGroup, g as DropdownMenuRadioItem, h as DropdownMenuItem, T as Trash2, i as clamp, u as useBaseUiId, j as useFormContext, k as useFieldRootContext, l as useLabelableContext, m as useControlled, n as useValueAsRef, o as useField, p as useValueChanged, q as createChangeEventDetails, r as none, s as createGenericEventDetails, t as activeElement, v as ownerDocument, w as CompositeList, x as keyboard, y as inputChange, z as useDirection, A as drag, B as trackPress, E as useAnimationFrame, F as contains, G as useCSPContext, H as useLabelableId, J as useCompositeListItem, K as useOnMount, L as visuallyHidden, M as COMPOSITE_KEYS, N as HOME, O as END, P as ARROW_LEFT, Q as ARROW_DOWN, R as ARROW_RIGHT, S as ARROW_UP, U as Switch, V as Select, W as SelectTrigger, X as SelectValue, Y as SelectContent, Z as SelectItem, _ as DialogPortal, $ as DialogBackdrop, a0 as DialogPopup, a1 as DialogTitle$1, a2 as DialogClose } from "./select-cz2npUlP.js";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogMedia, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction, F as FolderOpen, i as FileCode } from "./alert-dialog-CTCtlElL.js";
import { S as Settings } from "./settings-BVUuLTNg.js";
const __iconNode$8 = [
  [
    "path",
    {
      d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
      key: "hh9hay"
    }
  ],
  ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }],
  ["path", { d: "M12 22V12", key: "d0xqtd" }]
];
const Box = createLucideIcon("box", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode$7);
const __iconNode$6 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode$6);
const __iconNode$5 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
];
const Globe = createLucideIcon("globe", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$1);
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
function AddGameDialog({ open, onOpenChange }) {
  const [query, setQuery] = reactExports.useState("");
  const addManagedGame = useGameManagementStore((s) => s.addManagedGame);
  const appendRecentManagedGame = useGameManagementStore(
    (s) => s.appendRecentManagedGame
  );
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile);
  const selectGame = useAppStore((s) => s.selectGame);
  const filteredGames = GAMES.filter(
    (game) => game.name.toLowerCase().includes(query.toLowerCase())
  );
  const handleGameClick = (game) => {
    addManagedGame(game.id);
    appendRecentManagedGame(game.id);
    ensureDefaultProfile(game.id);
    selectGame(game.id);
    onOpenChange(false);
    setQuery("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    AlertDialogContent,
    {
      className: "max-w-[80vw]! w-[80vw]! h-[80vh] p-0 gap-0 overflow-hidden flex flex-col",
      onOverlayClick: () => onOpenChange(false),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-1", children: "Game selection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Which game are you managing your mods for?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 flex-1 flex flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "text",
                placeholder: "Search for a game",
                value: query,
                onChange: (e) => setQuery(e.target.value),
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "size-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "game", className: "w-full flex-1 flex flex-col overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { variant: "line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "game", children: "Game" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "server", children: "Server" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "game", className: "mt-0 flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto p-4", children: filteredGames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground py-20 text-center text-sm", children: "No games found" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-8 gap-8", children: filteredGames.map((game) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleGameClick(game),
                className: "group relative aspect-3/4 overflow-hidden rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: game.bannerUrl,
                      alt: game.name,
                      className: "size-full object-cover",
                      onError: (e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='28' font-weight='600'%3E" + encodeURIComponent(game.name) + "%3C/text%3E%3C/svg%3E";
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-sm font-medium line-clamp-2", children: game.name }) }) })
                ]
              },
              game.id
            )) }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "server", className: "mt-0 flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full overflow-y-auto pr-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm mb-4", children: "Connect to a server to browse games." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-8 gap-8", children: GAMES.map((game) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => handleGameClick(game),
                  className: "group relative aspect-[3/4] overflow-hidden rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: game.bannerUrl,
                        alt: game.name,
                        className: "size-full object-cover",
                        onError: (e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='28' font-weight='600'%3E" + encodeURIComponent(game.name) + "%3C/text%3E%3C/svg%3E";
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-sm font-medium line-clamp-2", children: game.name }) }) })
                  ]
                },
                `server-${game.id}`
              )) })
            ] }) })
          ] })
        ] })
      ]
    }
  ) });
}
function GlobalRailContent({ onNavigate }) {
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const [addGameOpen, setAddGameOpen] = reactExports.useState(false);
  const selectedGameId = useAppStore((s) => s.selectedGameId);
  const selectGame = useAppStore((s) => s.selectGame);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const setModLibraryTab = useAppStore((s) => s.setModLibraryTab);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeProfileId = useProfileStore((s) => s.activeProfileIdByGame[selectedGameId]);
  const recentManagedGameIds = useGameManagementStore((s) => s.recentManagedGameIds);
  const selectedGame = GAMES.find((g) => g.id === selectedGameId) ?? GAMES[0];
  const recentGames = recentManagedGameIds.slice().reverse().slice(0, 3).map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== void 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AddGameDialog, { open: addGameOpen, onOpenChange: setAddGameOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col bg-card min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuTrigger,
          {
            render: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "w-full rounded-none border-none p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              }
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: selectedGame.bannerUrl,
                  alt: selectedGame.name,
                  className: "size-16 rounded object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-semibold truncate", children: selectedGame.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: activeProfileId ?? "No profile" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuContent,
          {
            className: "w-[288px] max-h-[80vh] flex flex-col rounded-xl shadow-xl py-2 ring-1 ring-border/80",
            align: "start",
            sideOffset: -90,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "p-0 font-normal text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: selectedGame.bannerUrl,
                    alt: selectedGame.name,
                    className: "size-14 rounded object-cover"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: selectedGame.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: activeProfileId ?? "No profile" })
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, { className: "mx-0 my-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto flex-1 min-h-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "px-3 py-2", children: "Games" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DropdownMenuRadioGroup,
                    {
                      value: selectedGameId,
                      onValueChange: (nextId) => {
                        selectGame(nextId);
                        onNavigate?.();
                      },
                      children: GAMES.map((game) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        DropdownMenuRadioItem,
                        {
                          value: game.id,
                          className: "mx-1 gap-3 rounded-md px-3 py-2",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "img",
                              {
                                src: game.bannerUrl,
                                alt: "",
                                className: "size-10 rounded object-cover"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: game.name })
                          ]
                        },
                        game.id
                      ))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, { className: "mx-0 my-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    className: "mx-1 gap-3 rounded-md px-3 py-2",
                    onClick: () => {
                      setMenuOpen(false);
                      setAddGameOpen(true);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add game" })
                    ]
                  }
                ) })
              ] })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", onClick: () => onNavigate?.(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: cn(
              "w-full justify-start gap-2",
              pathname === "/" && "bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Home" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", onClick: () => {
          setModLibraryTab("installed");
          onNavigate?.();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "w-full justify-start gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Installed Mods" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", onClick: () => {
          setModLibraryTab("online");
          onNavigate?.();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "w-full justify-start gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Online Mods" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/config-editor", onClick: () => onNavigate?.(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: cn(
              "w-full justify-start gap-2",
              pathname === "/config-editor" && "bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Config Editor" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "w-full justify-start gap-2",
            onClick: () => {
              setSettingsOpen(true);
              onNavigate?.();
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Settings" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Recently Managed" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: recentGames.map((game) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              selectGame(game.id);
              onNavigate?.();
            },
            className: "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: game.bannerUrl,
                  alt: game.name,
                  className: "size-12 rounded object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: game.name })
            ]
          },
          `recent-${game.id}`
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-t border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/downloads", className: "block", onClick: () => onNavigate?.(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: cn(
              "w-full justify-start gap-2",
              pathname === "/downloads" && "bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Downloads" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "w-full justify-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "SynapseCharlie" })
        ] })
      ] })
    ] })
  ] });
}
function GlobalRail() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-[240px] h-full shrink-0 flex-col border-r border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalRailContent, {}) });
}
function RenameProfileDialog({ open, onOpenChange, onRenameProfile, currentName }) {
  const [profileName, setProfileName] = reactExports.useState(currentName);
  reactExports.useEffect(() => {
    if (open) {
      setProfileName(currentName);
    }
  }, [open, currentName]);
  const handleRename = () => {
    if (profileName.trim() && profileName.trim() !== currentName) {
      onRenameProfile(profileName.trim());
      onOpenChange(false);
    }
  };
  const handleCancel = () => {
    setProfileName(currentName);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md",
      onOverlayClick: handleCancel,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Rename Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            'Enter a new name for your profile "',
            currentName,
            '".'
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "profile-name", className: "text-sm font-medium", children: "Profile Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "profile-name",
              placeholder: "e.g., Hardcore, Co-op, Testing",
              value: profileName,
              onChange: (e) => setProfileName(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              },
              autoFocus: true
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleRename,
              disabled: !profileName.trim() || profileName.trim() === currentName,
              children: "Rename Profile"
            }
          )
        ] })
      ]
    }
  ) });
}
function UninstallAllModsDialog({
  open,
  onOpenChange,
  modCount,
  onConfirm
}) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogMedia, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "text-destructive" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Uninstall All Mods?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
        "This will uninstall ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: modCount }),
        " mod",
        modCount === 1 ? "" : "s",
        " from the current profile. This action cannot be undone."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { variant: "destructive", onClick: handleConfirm, children: "Uninstall All" })
    ] })
  ] }) });
}
function GameDashboard() {
  const [createProfileOpen, setCreateProfileOpen] = reactExports.useState(false);
  const [renameProfileOpen, setRenameProfileOpen] = reactExports.useState(false);
  const [uninstallAllOpen, setUninstallAllOpen] = reactExports.useState(false);
  const selectedGameId = useAppStore((s) => s.selectedGameId);
  const openSettingsToGame = useAppStore((s) => s.openSettingsToGame);
  const activeProfileId = useProfileStore(
    (s) => s.activeProfileIdByGame[selectedGameId]
  );
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const uninstallAllMods = useModManagementStore((s) => s.uninstallAllMods);
  const installedModsSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId]);
  const installedModCount = installedModsSet?.size ?? 0;
  const handleCreateProfile = (profileName) => {
    console.log("Creating profile:", profileName, "for game:", selectedGameId);
  };
  const handleRenameProfile = (newName) => {
    console.log("Renaming profile:", activeProfileId, "to:", newName, "for game:", selectedGameId);
  };
  const handleUninstallAll = () => {
    uninstallAllMods(selectedGameId);
  };
  const gameProfiles = PROFILES.filter((p) => p.gameId === selectedGameId);
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateProfileDialog,
      {
        open: createProfileOpen,
        onOpenChange: setCreateProfileOpen,
        onCreateProfile: handleCreateProfile
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RenameProfileDialog,
      {
        open: renameProfileOpen,
        onOpenChange: setRenameProfileOpen,
        onRenameProfile: handleRenameProfile,
        currentName: currentProfile?.name ?? activeProfileId ?? "Default"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UninstallAllModsDialog,
      {
        open: uninstallAllOpen,
        onOpenChange: setUninstallAllOpen,
        modCount: installedModCount,
        onConfirm: handleUninstallAll
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-balance", children: "Profiles & Sync" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DropdownMenuTrigger,
          {
            render: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "w-full rounded-md border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Current Profile" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-medium", children: currentProfile?.name ?? activeProfileId ?? "Default" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuContent,
          {
            className: "w-[var(--anchor-width)] rounded-xl shadow-xl py-2 ring-1 ring-border/80",
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Import Profile Code" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Import Local Mod" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-full justify-start gap-2",
            onClick: () => setRenameProfileOpen(true),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Rename Profile" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            size: "sm",
            className: "w-full justify-start gap-2",
            onClick: () => setUninstallAllOpen(true),
            disabled: installedModCount === 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Uninstall All Mods" }),
              installedModCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs", children: [
                "(",
                installedModCount,
                ")"
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DropdownMenuTrigger,
          {
            render: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2" }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export Profile" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "start", className: "w-[var(--anchor-width)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export as File" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export as Code" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "w-full justify-start gap-2",
          onClick: () => openSettingsToGame(selectedGameId),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Game Settings" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto space-y-2 border-t border-border pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "default", size: "lg", className: "w-full", children: "Start Modded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "lg", className: "w-full", children: "Start Vanilla" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-primary", children: "Modded Game Ready" })
      ] })
    ] })
  ] });
}
function ContextPanel() {
  const selectedModId = useAppStore((s) => s.selectedModId);
  const setShowContextPanel = useAppStore((s) => s.setShowContextPanel);
  const [width, setWidth] = reactExports.useState(320);
  const [isResizing, setIsResizing] = reactExports.useState(false);
  const panelRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const constrainedWidth = Math.max(280, Math.min(800, newWidth));
      setWidth(constrainedWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: panelRef,
      className: "relative flex h-full shrink-0 flex-col overflow-y-auto border-l border-border bg-card",
      style: { width: `${width}px` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute left-0 top-0 z-10 h-full w-1 cursor-ew-resize hover:bg-primary/50 active:bg-primary",
            onMouseDown: (e) => {
              e.preventDefault();
              setIsResizing(true);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon-sm",
            onClick: () => setShowContextPanel(false),
            "aria-label": "Close panel",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
          }
        ) }),
        selectedModId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ModInspector, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(GameDashboard, {})
      ]
    }
  );
}
function MobileRailSheet({ open, onOpenChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "left", className: "p-0 w-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalRailContent, { onNavigate: () => onOpenChange(false) }) }) });
}
function isDesktop() {
  return typeof window !== "undefined" && (window.navigator.userAgent.includes("Electron") || // @ts-ignore - Tauri specific
  window.__TAURI__ !== void 0);
}
async function openFolder(path) {
  if (isDesktop()) {
    console.log("Desktop: Opening folder", path);
    await copyToClipboard(path);
    return;
  }
  await copyToClipboard(path);
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
async function selectFolder() {
  if (isDesktop()) {
    console.log("Desktop: Opening folder picker");
    return null;
  }
  const path = prompt("Enter folder path:");
  return path;
}
function SettingsRow({
  title,
  description,
  value,
  rightContent,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex items-start justify-between gap-8 py-6",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: title }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: description }),
          value && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: value })
        ] }),
        rightContent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-start pt-0.5", children: rightContent })
      ]
    }
  );
}
function LocationsPanel(_props) {
  const { dataFolder, steamFolder } = useSettingsStore((s) => s.global);
  const updateGlobal = useSettingsStore((s) => s.updateGlobal);
  const handleBrowseDataFolder = () => {
    openFolder(dataFolder);
  };
  const handleChangeDataFolder = async () => {
    const newPath = await selectFolder();
    if (newPath) {
      updateGlobal({ dataFolder: newPath });
    }
  };
  const handleChangeSteamFolder = async () => {
    const newPath = await selectFolder();
    if (newPath) {
      updateGlobal({ steamFolder: newPath });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Locations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage folder locations and paths for mod storage and game installations" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0 divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Data folder",
          description: "The folder where mods are stored for all games and profiles",
          value: dataFolder,
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleBrowseDataFolder,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "size-4 mr-2" }),
                  "Browse"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleChangeDataFolder,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "size-4 mr-2" }),
                  "Change"
                ]
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Steam folder",
          description: "The location of the Steam installation folder",
          value: steamFolder,
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleChangeSteamFolder,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "size-4 mr-2" }),
                "Change"
              ]
            }
          )
        }
      )
    ] })
  ] });
}
function areArraysEqual(array1, array2, itemComparer = (a, b) => a === b) {
  return array1.length === array2.length && array1.every((value, index) => itemComparer(value, array2[index]));
}
function asc(a, b) {
  return a - b;
}
function replaceArrayItemAtIndex(array, index, newValue) {
  const output = array.slice();
  output[index] = newValue;
  return output.sort(asc);
}
function getSliderValue(valueInput, index, min, max, range, values) {
  let newValue = valueInput;
  newValue = clamp(newValue, min, max);
  if (range) {
    newValue = replaceArrayItemAtIndex(
      values,
      index,
      // Bound the new value to the thumb's neighbours.
      clamp(newValue, values[index - 1] || -Infinity, values[index + 1] || Infinity)
    );
  }
  return newValue;
}
function validateMinimumDistance(values, step, minStepsBetweenValues) {
  if (!Array.isArray(values)) {
    return true;
  }
  const distances = values.reduce((acc, val, index, vals) => {
    if (index === vals.length - 1) {
      return acc;
    }
    acc.push(Math.abs(val - vals[index + 1]));
    return acc;
  }, []);
  return Math.min(...distances) >= step * minStepsBetweenValues;
}
const sliderStateAttributesMapping = {
  activeThumbIndex: () => null,
  max: () => null,
  min: () => null,
  minStepsBetweenValues: () => null,
  step: () => null,
  values: () => null
};
const SliderRootContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useSliderRootContext() {
  const context = reactExports.useContext(SliderRootContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(62));
  }
  return context;
}
function getSliderChangeEventReason(event2) {
  return "key" in event2 ? keyboard : inputChange;
}
function areValuesEqual(newValue, oldValue) {
  if (typeof newValue === "number" && typeof oldValue === "number") {
    return newValue === oldValue;
  }
  if (Array.isArray(newValue) && Array.isArray(oldValue)) {
    return areArraysEqual(newValue, oldValue);
  }
  return false;
}
const SliderRoot = /* @__PURE__ */ reactExports.forwardRef(function SliderRoot2(componentProps, forwardedRef) {
  const {
    "aria-labelledby": ariaLabelledByProp,
    className,
    defaultValue,
    disabled: disabledProp = false,
    id: idProp,
    format,
    largeStep = 10,
    locale,
    render,
    max = 100,
    min = 0,
    minStepsBetweenValues = 0,
    name: nameProp,
    onValueChange: onValueChangeProp,
    onValueCommitted: onValueCommittedProp,
    orientation = "horizontal",
    step = 1,
    thumbCollisionBehavior = "push",
    thumbAlignment = "center",
    value: valueProp,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const onValueChange = useStableCallback(onValueChangeProp);
  const onValueCommitted = useStableCallback(onValueCommittedProp);
  const {
    clearErrors
  } = useFormContext();
  const {
    state: fieldState,
    disabled: fieldDisabled,
    name: fieldName,
    setTouched,
    setDirty,
    validityData,
    shouldValidateOnChange,
    validation
  } = useFieldRootContext();
  const {
    labelId
  } = useLabelableContext();
  const ariaLabelledby = ariaLabelledByProp ?? labelId;
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const [valueUnwrapped, setValueUnwrapped] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? min,
    name: "Slider"
  });
  const sliderRef = reactExports.useRef(null);
  const controlRef = reactExports.useRef(null);
  const thumbRefs = reactExports.useRef([]);
  const pressedInputRef = reactExports.useRef(null);
  const pressedThumbCenterOffsetRef = reactExports.useRef(null);
  const pressedThumbIndexRef = reactExports.useRef(-1);
  const pressedValuesRef = reactExports.useRef(null);
  const lastChangedValueRef = reactExports.useRef(null);
  const lastChangeReasonRef = reactExports.useRef("none");
  const formatOptionsRef = useValueAsRef(format);
  const [active, setActiveState] = reactExports.useState(-1);
  const [lastUsedThumbIndex, setLastUsedThumbIndex] = reactExports.useState(-1);
  const [dragging, setDragging] = reactExports.useState(false);
  const [thumbMap, setThumbMap] = reactExports.useState(() => /* @__PURE__ */ new Map());
  const [indicatorPosition, setIndicatorPosition] = reactExports.useState([void 0, void 0]);
  const setActive = useStableCallback((value) => {
    setActiveState(value);
    if (value !== -1) {
      setLastUsedThumbIndex(value);
    }
  });
  useField({
    id,
    commit: validation.commit,
    value: valueUnwrapped,
    controlRef,
    name,
    getValue: () => valueUnwrapped
  });
  useValueChanged(valueUnwrapped, () => {
    clearErrors(name);
    if (shouldValidateOnChange()) {
      validation.commit(valueUnwrapped);
    } else {
      validation.commit(valueUnwrapped, true);
    }
    const initialValue = validityData.initialValue;
    let isDirty;
    if (Array.isArray(valueUnwrapped) && Array.isArray(initialValue)) {
      isDirty = !areArraysEqual(valueUnwrapped, initialValue);
    } else {
      isDirty = valueUnwrapped !== initialValue;
    }
    setDirty(isDirty);
  });
  const registerFieldControlRef = useStableCallback((element2) => {
    if (element2) {
      controlRef.current = element2;
    }
  });
  const range = Array.isArray(valueUnwrapped);
  const values = reactExports.useMemo(() => {
    if (!range) {
      return [clamp(valueUnwrapped, min, max)];
    }
    return valueUnwrapped.slice().sort(asc);
  }, [max, min, range, valueUnwrapped]);
  const setValue = useStableCallback((newValue, details) => {
    if (Number.isNaN(newValue) || areValuesEqual(newValue, valueUnwrapped)) {
      return;
    }
    const changeDetails = details ?? createChangeEventDetails(none, void 0, void 0, {
      activeThumbIndex: -1
    });
    lastChangeReasonRef.current = changeDetails.reason;
    const clonedEvent = new event.constructor(event.type, event);
    Object.defineProperty(clonedEvent, "target", {
      writable: true,
      value: {
        value: newValue,
        name
      }
    });
    changeDetails.event = clonedEvent;
    lastChangedValueRef.current = newValue;
    onValueChange(newValue, changeDetails);
    if (changeDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(newValue);
  });
  const handleInputChange = useStableCallback((valueInput, index, event2) => {
    const newValue = getSliderValue(valueInput, index, min, max, range, values);
    if (validateMinimumDistance(newValue, step, minStepsBetweenValues)) {
      const reason = getSliderChangeEventReason(event2);
      setValue(newValue, createChangeEventDetails(reason, event2.nativeEvent, void 0, {
        activeThumbIndex: index
      }));
      setTouched(true);
      const nextValue = lastChangedValueRef.current ?? newValue;
      onValueCommitted(nextValue, createGenericEventDetails(reason, event2.nativeEvent));
    }
  });
  useIsoLayoutEffect(() => {
    const activeEl = activeElement(ownerDocument(sliderRef.current));
    if (disabled && activeEl && sliderRef.current?.contains(activeEl)) {
      activeEl.blur();
    }
  }, [disabled]);
  if (disabled && active !== -1) {
    setActive(-1);
  }
  const state = reactExports.useMemo(() => ({
    ...fieldState,
    activeThumbIndex: active,
    disabled,
    dragging,
    orientation,
    max,
    min,
    minStepsBetweenValues,
    step,
    values
  }), [fieldState, active, disabled, dragging, max, min, minStepsBetweenValues, orientation, step, values]);
  const contextValue = reactExports.useMemo(() => ({
    active,
    controlRef,
    disabled,
    dragging,
    validation,
    formatOptionsRef,
    handleInputChange,
    indicatorPosition,
    inset: thumbAlignment !== "center",
    labelId: ariaLabelledby,
    largeStep,
    lastUsedThumbIndex,
    lastChangedValueRef,
    lastChangeReasonRef,
    locale,
    max,
    min,
    minStepsBetweenValues,
    name,
    onValueCommitted,
    orientation,
    pressedInputRef,
    pressedThumbCenterOffsetRef,
    pressedThumbIndexRef,
    pressedValuesRef,
    registerFieldControlRef,
    renderBeforeHydration: thumbAlignment === "edge",
    setActive,
    setDragging,
    setIndicatorPosition,
    setValue,
    state,
    step,
    thumbCollisionBehavior,
    thumbMap,
    thumbRefs,
    values
  }), [active, controlRef, ariaLabelledby, disabled, dragging, validation, formatOptionsRef, handleInputChange, indicatorPosition, largeStep, lastUsedThumbIndex, lastChangedValueRef, lastChangeReasonRef, locale, max, min, minStepsBetweenValues, name, onValueCommitted, orientation, pressedInputRef, pressedThumbCenterOffsetRef, pressedThumbIndexRef, pressedValuesRef, registerFieldControlRef, setActive, setDragging, setIndicatorPosition, setValue, state, step, thumbCollisionBehavior, thumbAlignment, thumbMap, thumbRefs, values]);
  const element = useRenderElement("div", componentProps, {
    state,
    ref: [forwardedRef, sliderRef],
    props: [{
      "aria-labelledby": ariaLabelledby,
      id,
      role: "group"
    }, validation.getValidationProps, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRootContext.Provider, {
    value: contextValue,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompositeList, {
      elementsRef: thumbRefs,
      onMapChange: setThumbMap,
      children: element
    })
  });
});
const cache = /* @__PURE__ */ new Map();
function getFormatter(locale, options) {
  const optionsString = JSON.stringify({
    locale,
    options
  });
  const cachedFormatter = cache.get(optionsString);
  if (cachedFormatter) {
    return cachedFormatter;
  }
  const formatter = new Intl.NumberFormat(locale, options);
  cache.set(optionsString, formatter);
  return formatter;
}
function formatNumber(value, locale, options) {
  if (value == null) {
    return "";
  }
  return getFormatter(locale, options).format(value);
}
function getMidpoint(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.right) / 2,
    y: (rect.top + rect.bottom) / 2
  };
}
function getDecimalPrecision(num) {
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split("e-");
    const matissaDecimalPart = parts[0].split(".")[1];
    return (matissaDecimalPart ? matissaDecimalPart.length : 0) + parseInt(parts[1], 10);
  }
  const decimalPart = num.toString().split(".")[1];
  return decimalPart ? decimalPart.length : 0;
}
function roundValueToStep(value, step, min) {
  const nearest = Math.round((value - min) / step) * step + min;
  return Number(nearest.toFixed(getDecimalPrecision(step)));
}
function getPushedThumbValues({
  values,
  index,
  nextValue,
  min,
  max,
  step,
  minStepsBetweenValues,
  initialValues
}) {
  if (values.length === 0) {
    return [];
  }
  const nextValues = values.slice();
  const minValueDifference = step * minStepsBetweenValues;
  const lastIndex = nextValues.length - 1;
  const baseInitialValues = initialValues ?? values;
  const indexMin = min + index * minValueDifference;
  const indexMax = max - (lastIndex - index) * minValueDifference;
  nextValues[index] = clamp(nextValue, indexMin, indexMax);
  for (let i = index + 1; i <= lastIndex; i += 1) {
    const minAllowed = nextValues[i - 1] + minValueDifference;
    const maxAllowed = max - (lastIndex - i) * minValueDifference;
    const initialValue = baseInitialValues[i] ?? nextValues[i];
    let candidate = Math.max(nextValues[i], minAllowed);
    if (initialValue < candidate) {
      candidate = Math.max(initialValue, minAllowed);
    }
    nextValues[i] = clamp(candidate, minAllowed, maxAllowed);
  }
  for (let i = index - 1; i >= 0; i -= 1) {
    const maxAllowed = nextValues[i + 1] - minValueDifference;
    const minAllowed = min + i * minValueDifference;
    const initialValue = baseInitialValues[i] ?? nextValues[i];
    let candidate = Math.min(nextValues[i], maxAllowed);
    if (initialValue > candidate) {
      candidate = Math.min(initialValue, maxAllowed);
    }
    nextValues[i] = clamp(candidate, minAllowed, maxAllowed);
  }
  for (let i = 0; i <= lastIndex; i += 1) {
    nextValues[i] = Number(nextValues[i].toFixed(12));
  }
  return nextValues;
}
function resolveThumbCollision({
  behavior,
  values,
  currentValues,
  initialValues,
  pressedIndex,
  nextValue,
  min,
  max,
  step,
  minStepsBetweenValues
}) {
  const activeValues = currentValues ?? values;
  const baselineValues = initialValues ?? values;
  const range = activeValues.length > 1;
  if (!range) {
    return {
      value: nextValue,
      thumbIndex: 0,
      didSwap: false
    };
  }
  const minValueDifference = step * minStepsBetweenValues;
  switch (behavior) {
    case "swap": {
      const pressedInitialValue = activeValues[pressedIndex];
      const epsilon = 1e-7;
      const candidateValues = activeValues.slice();
      const previousNeighbor = candidateValues[pressedIndex - 1];
      const nextNeighbor = candidateValues[pressedIndex + 1];
      const lowerBound = previousNeighbor != null ? previousNeighbor + minValueDifference : min;
      const upperBound = nextNeighbor != null ? nextNeighbor - minValueDifference : max;
      const constrainedValue = clamp(nextValue, lowerBound, upperBound);
      const pressedValueAfterClamp = Number(constrainedValue.toFixed(12));
      candidateValues[pressedIndex] = pressedValueAfterClamp;
      const movingForward = nextValue > pressedInitialValue;
      const movingBackward = nextValue < pressedInitialValue;
      const shouldSwapForward = movingForward && nextNeighbor != null && nextValue >= nextNeighbor - epsilon;
      const shouldSwapBackward = movingBackward && previousNeighbor != null && nextValue <= previousNeighbor + epsilon;
      if (!shouldSwapForward && !shouldSwapBackward) {
        return {
          value: candidateValues,
          thumbIndex: pressedIndex,
          didSwap: false
        };
      }
      const targetIndex = shouldSwapForward ? pressedIndex + 1 : pressedIndex - 1;
      const initialValuesForPush = candidateValues.map((_, index) => {
        if (index === pressedIndex) {
          return pressedValueAfterClamp;
        }
        const baseline = baselineValues[index];
        if (baseline != null) {
          return baseline;
        }
        return activeValues[index];
      });
      let nextValueForTarget = nextValue;
      if (shouldSwapForward) {
        nextValueForTarget = Math.max(nextValue, candidateValues[targetIndex]);
      } else {
        nextValueForTarget = Math.min(nextValue, candidateValues[targetIndex]);
      }
      const adjustedValues = getPushedThumbValues({
        values: candidateValues,
        index: targetIndex,
        nextValue: nextValueForTarget,
        min,
        max,
        step,
        minStepsBetweenValues,
        initialValues: initialValuesForPush
      });
      const neighborIndex = shouldSwapForward ? targetIndex - 1 : targetIndex + 1;
      if (neighborIndex >= 0 && neighborIndex < adjustedValues.length) {
        const previousValue = adjustedValues[neighborIndex - 1];
        const nextValueAfter = adjustedValues[neighborIndex + 1];
        let neighborLowerBound = previousValue != null ? previousValue + minValueDifference : min;
        neighborLowerBound = Math.max(neighborLowerBound, min + neighborIndex * minValueDifference);
        let neighborUpperBound = nextValueAfter != null ? nextValueAfter - minValueDifference : max;
        neighborUpperBound = Math.min(neighborUpperBound, max - (adjustedValues.length - 1 - neighborIndex) * minValueDifference);
        const restoredValue = clamp(pressedValueAfterClamp, neighborLowerBound, neighborUpperBound);
        adjustedValues[neighborIndex] = Number(restoredValue.toFixed(12));
      }
      return {
        value: adjustedValues,
        thumbIndex: targetIndex,
        didSwap: true
      };
    }
    case "push": {
      const nextValues = getPushedThumbValues({
        values: activeValues,
        index: pressedIndex,
        nextValue,
        min,
        max,
        step,
        minStepsBetweenValues
      });
      return {
        value: nextValues,
        thumbIndex: pressedIndex,
        didSwap: false
      };
    }
    case "none":
    default: {
      const candidateValues = activeValues.slice();
      const previousNeighbor = candidateValues[pressedIndex - 1];
      const nextNeighbor = candidateValues[pressedIndex + 1];
      const lowerBound = previousNeighbor != null ? previousNeighbor + minValueDifference : min;
      const upperBound = nextNeighbor != null ? nextNeighbor - minValueDifference : max;
      const constrainedValue = clamp(nextValue, lowerBound, upperBound);
      candidateValues[pressedIndex] = Number(constrainedValue.toFixed(12));
      return {
        value: candidateValues,
        thumbIndex: pressedIndex,
        didSwap: false
      };
    }
  }
}
const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;
function getControlOffset(styles, vertical) {
  if (!styles) {
    return {
      start: 0,
      end: 0
    };
  }
  function parseSize(value) {
    const parsed = value != null ? parseFloat(value) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const start = !vertical ? "InlineStart" : "Top";
  const end = !vertical ? "InlineEnd" : "Bottom";
  return {
    start: parseSize(styles[`border${start}Width`]) + parseSize(styles[`padding${start}`]),
    end: parseSize(styles[`border${end}Width`]) + parseSize(styles[`padding${end}`])
  };
}
function getFingerCoords(event2, touchIdRef) {
  if (touchIdRef.current != null && event2.changedTouches) {
    const touchEvent = event2;
    for (let i = 0; i < touchEvent.changedTouches.length; i += 1) {
      const touch = touchEvent.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        return {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    }
    return null;
  }
  return {
    x: event2.clientX,
    y: event2.clientY
  };
}
const SliderControl = /* @__PURE__ */ reactExports.forwardRef(function SliderControl2(componentProps, forwardedRef) {
  const {
    render: renderProp,
    className,
    ...elementProps
  } = componentProps;
  const {
    disabled,
    dragging,
    validation,
    inset,
    lastChangedValueRef,
    lastChangeReasonRef,
    max,
    min,
    minStepsBetweenValues,
    onValueCommitted,
    orientation,
    pressedInputRef,
    pressedThumbCenterOffsetRef,
    pressedThumbIndexRef,
    pressedValuesRef,
    registerFieldControlRef,
    renderBeforeHydration,
    setActive,
    setDragging,
    setValue,
    state,
    step,
    thumbCollisionBehavior,
    thumbRefs,
    values
  } = useSliderRootContext();
  const direction = useDirection();
  const range = values.length > 1;
  const vertical = orientation === "vertical";
  const controlRef = reactExports.useRef(null);
  const stylesRef = reactExports.useRef(null);
  const setStylesRef = useStableCallback((element2) => {
    if (element2 && stylesRef.current == null) {
      if (stylesRef.current == null) {
        stylesRef.current = getComputedStyle(element2);
      }
    }
  });
  const touchIdRef = reactExports.useRef(null);
  const moveCountRef = reactExports.useRef(0);
  const insetThumbOffsetRef = reactExports.useRef(0);
  const latestValuesRef = useValueAsRef(values);
  const updatePressedThumb = useStableCallback((nextIndex) => {
    if (pressedThumbIndexRef.current !== nextIndex) {
      pressedThumbIndexRef.current = nextIndex;
    }
    const thumbElement = thumbRefs.current[nextIndex];
    if (!thumbElement) {
      pressedThumbCenterOffsetRef.current = null;
      pressedInputRef.current = null;
      return;
    }
    pressedInputRef.current = thumbElement.querySelector('input[type="range"]');
  });
  const getFingerState = useStableCallback((fingerCoords) => {
    const control = controlRef.current;
    if (!control) {
      return null;
    }
    const {
      width,
      height,
      bottom,
      left,
      right
    } = control.getBoundingClientRect();
    const controlOffset = getControlOffset(stylesRef.current, vertical);
    const insetThumbOffset = insetThumbOffsetRef.current;
    const controlSize = (vertical ? height : width) - controlOffset.start - controlOffset.end - insetThumbOffset * 2;
    const thumbCenterOffset = pressedThumbCenterOffsetRef.current ?? 0;
    const fingerX = fingerCoords.x - thumbCenterOffset;
    const fingerY = fingerCoords.y - thumbCenterOffset;
    const valueSize = vertical ? bottom - fingerY - controlOffset.end : (direction === "rtl" ? right - fingerX : fingerX - left) - controlOffset.start;
    const valueRescaled = clamp((valueSize - insetThumbOffset) / controlSize, 0, 1);
    let newValue = (max - min) * valueRescaled + min;
    newValue = roundValueToStep(newValue, step, min);
    newValue = clamp(newValue, min, max);
    if (!range) {
      return {
        value: newValue,
        thumbIndex: 0,
        didSwap: false
      };
    }
    const thumbIndex = pressedThumbIndexRef.current;
    if (thumbIndex < 0) {
      return null;
    }
    const collisionResult = resolveThumbCollision({
      behavior: thumbCollisionBehavior,
      values,
      currentValues: latestValuesRef.current ?? values,
      initialValues: pressedValuesRef.current,
      pressedIndex: thumbIndex,
      nextValue: newValue,
      min,
      max,
      step,
      minStepsBetweenValues
    });
    if (thumbCollisionBehavior === "swap" && collisionResult.didSwap) {
      updatePressedThumb(collisionResult.thumbIndex);
    } else {
      pressedThumbIndexRef.current = collisionResult.thumbIndex;
    }
    return collisionResult;
  });
  const startPressing = useStableCallback((fingerCoords) => {
    pressedValuesRef.current = range ? values.slice() : null;
    latestValuesRef.current = values;
    const pressedThumbIndex = pressedThumbIndexRef.current;
    let closestThumbIndex = pressedThumbIndex;
    if (pressedThumbIndex > -1 && pressedThumbIndex < values.length) {
      if (values[pressedThumbIndex] === max) {
        let candidateIndex = pressedThumbIndex;
        while (candidateIndex > 0 && values[candidateIndex - 1] === max) {
          candidateIndex -= 1;
        }
        closestThumbIndex = candidateIndex;
      }
    } else {
      const axis = !vertical ? "x" : "y";
      let minDistance;
      closestThumbIndex = -1;
      for (let i = 0; i < thumbRefs.current.length; i += 1) {
        const thumbEl = thumbRefs.current[i];
        if (isElement(thumbEl)) {
          const midpoint = getMidpoint(thumbEl);
          const distance = Math.abs(fingerCoords[axis] - midpoint[axis]);
          if (minDistance === void 0 || distance <= minDistance) {
            closestThumbIndex = i;
            minDistance = distance;
          }
        }
      }
    }
    if (closestThumbIndex > -1 && closestThumbIndex !== pressedThumbIndex) {
      updatePressedThumb(closestThumbIndex);
    }
    if (inset) {
      const thumbEl = thumbRefs.current[closestThumbIndex];
      if (isElement(thumbEl)) {
        const thumbRect = thumbEl.getBoundingClientRect();
        const side = !vertical ? "width" : "height";
        insetThumbOffsetRef.current = thumbRect[side] / 2;
      }
    }
  });
  const focusThumb = useStableCallback((thumbIndex) => {
    thumbRefs.current?.[thumbIndex]?.querySelector('input[type="range"]')?.focus({
      preventScroll: true
    });
  });
  const handleTouchMove = useStableCallback((nativeEvent) => {
    const fingerCoords = getFingerCoords(nativeEvent, touchIdRef);
    if (fingerCoords == null) {
      return;
    }
    moveCountRef.current += 1;
    if (nativeEvent.type === "pointermove" && nativeEvent.buttons === 0) {
      handleTouchEnd(nativeEvent);
      return;
    }
    const finger = getFingerState(fingerCoords);
    if (finger == null) {
      return;
    }
    if (validateMinimumDistance(finger.value, step, minStepsBetweenValues)) {
      if (!dragging && moveCountRef.current > INTENTIONAL_DRAG_COUNT_THRESHOLD) {
        setDragging(true);
      }
      setValue(finger.value, createChangeEventDetails(drag, nativeEvent, void 0, {
        activeThumbIndex: finger.thumbIndex
      }));
      latestValuesRef.current = Array.isArray(finger.value) ? finger.value : [finger.value];
      if (finger.didSwap) {
        focusThumb(finger.thumbIndex);
      }
    }
  });
  function handleTouchEnd(nativeEvent) {
    setActive(-1);
    setDragging(false);
    pressedInputRef.current = null;
    pressedThumbCenterOffsetRef.current = null;
    const fingerCoords = getFingerCoords(nativeEvent, touchIdRef);
    const finger = fingerCoords != null ? getFingerState(fingerCoords) : null;
    if (finger != null) {
      const commitReason = lastChangeReasonRef.current;
      validation.commit(lastChangedValueRef.current ?? finger.value);
      onValueCommitted(lastChangedValueRef.current ?? finger.value, createGenericEventDetails(commitReason, nativeEvent));
    }
    if ("pointerType" in nativeEvent && controlRef.current?.hasPointerCapture(nativeEvent.pointerId)) {
      controlRef.current?.releasePointerCapture(nativeEvent.pointerId);
    }
    pressedThumbIndexRef.current = -1;
    touchIdRef.current = null;
    pressedValuesRef.current = null;
    stopListening();
  }
  const handleTouchStart = useStableCallback((nativeEvent) => {
    if (disabled) {
      return;
    }
    const touch = nativeEvent.changedTouches[0];
    if (touch != null) {
      touchIdRef.current = touch.identifier;
    }
    const fingerCoords = getFingerCoords(nativeEvent, touchIdRef);
    if (fingerCoords != null) {
      startPressing(fingerCoords);
      const finger = getFingerState(fingerCoords);
      if (finger == null) {
        return;
      }
      focusThumb(finger.thumbIndex);
      setValue(finger.value, createChangeEventDetails(trackPress, nativeEvent, void 0, {
        activeThumbIndex: finger.thumbIndex
      }));
      latestValuesRef.current = Array.isArray(finger.value) ? finger.value : [finger.value];
      if (finger.didSwap) {
        focusThumb(finger.thumbIndex);
      }
    }
    moveCountRef.current = 0;
    const doc = ownerDocument(controlRef.current);
    doc.addEventListener("touchmove", handleTouchMove, {
      passive: true
    });
    doc.addEventListener("touchend", handleTouchEnd, {
      passive: true
    });
  });
  const stopListening = useStableCallback(() => {
    const doc = ownerDocument(controlRef.current);
    doc.removeEventListener("pointermove", handleTouchMove);
    doc.removeEventListener("pointerup", handleTouchEnd);
    doc.removeEventListener("touchmove", handleTouchMove);
    doc.removeEventListener("touchend", handleTouchEnd);
    pressedValuesRef.current = null;
  });
  const focusFrame = useAnimationFrame();
  reactExports.useEffect(() => {
    const control = controlRef.current;
    if (!control) {
      return () => stopListening();
    }
    control.addEventListener("touchstart", handleTouchStart, {
      passive: true
    });
    return () => {
      control.removeEventListener("touchstart", handleTouchStart);
      focusFrame.cancel();
      stopListening();
    };
  }, [stopListening, handleTouchStart, controlRef, focusFrame]);
  reactExports.useEffect(() => {
    if (disabled) {
      stopListening();
    }
  }, [disabled, stopListening]);
  const element = useRenderElement("div", componentProps, {
    state,
    ref: [forwardedRef, registerFieldControlRef, controlRef, setStylesRef],
    props: [{
      ["data-base-ui-slider-control"]: renderBeforeHydration ? "" : void 0,
      onPointerDown(event2) {
        const control = controlRef.current;
        if (!control || disabled || event2.defaultPrevented || !isElement(event2.target) || // Only handle left clicks
        event2.button !== 0) {
          return;
        }
        const fingerCoords = getFingerCoords(event2, touchIdRef);
        if (fingerCoords != null) {
          startPressing(fingerCoords);
          const finger = getFingerState(fingerCoords);
          if (finger == null) {
            return;
          }
          const pressedOnFocusedThumb = contains(thumbRefs.current[finger.thumbIndex], activeElement(ownerDocument(control)));
          if (pressedOnFocusedThumb) {
            event2.preventDefault();
          } else {
            focusFrame.request(() => {
              focusThumb(finger.thumbIndex);
            });
          }
          setDragging(true);
          const pressedOnAnyThumb = pressedThumbCenterOffsetRef.current != null;
          if (!pressedOnAnyThumb) {
            setValue(finger.value, createChangeEventDetails(trackPress, event2.nativeEvent, void 0, {
              activeThumbIndex: finger.thumbIndex
            }));
            latestValuesRef.current = Array.isArray(finger.value) ? finger.value : [finger.value];
            if (finger.didSwap) {
              focusThumb(finger.thumbIndex);
            }
          }
        }
        if (event2.nativeEvent.pointerId) {
          control.setPointerCapture(event2.nativeEvent.pointerId);
        }
        moveCountRef.current = 0;
        const doc = ownerDocument(controlRef.current);
        doc.addEventListener("pointermove", handleTouchMove, {
          passive: true
        });
        doc.addEventListener("pointerup", handleTouchEnd, {
          once: true
        });
      },
      tabIndex: -1
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
const SliderTrack = /* @__PURE__ */ reactExports.forwardRef(function SliderTrack2(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state
  } = useSliderRootContext();
  const element = useRenderElement("div", componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      style: {
        position: "relative"
      }
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
function valueToPercent(value, min, max) {
  return (value - min) * 100 / (max - min);
}
let SliderThumbDataAttributes = /* @__PURE__ */ (function(SliderThumbDataAttributes2) {
  SliderThumbDataAttributes2["index"] = "data-index";
  SliderThumbDataAttributes2["dragging"] = "data-dragging";
  SliderThumbDataAttributes2["orientation"] = "data-orientation";
  SliderThumbDataAttributes2["disabled"] = "data-disabled";
  SliderThumbDataAttributes2["valid"] = "data-valid";
  SliderThumbDataAttributes2["invalid"] = "data-invalid";
  SliderThumbDataAttributes2["touched"] = "data-touched";
  SliderThumbDataAttributes2["dirty"] = "data-dirty";
  SliderThumbDataAttributes2["focused"] = "data-focused";
  return SliderThumbDataAttributes2;
})({});
const script = '!function(){const t=document.currentScript?.parentElement;if(!t)return;const e=t.closest("[data-base-ui-slider-control]");if(!e)return;const r=e.querySelector("[data-base-ui-slider-indicator]"),i=e.getBoundingClientRect(),n="vertical"===e.getAttribute("data-orientation")?"height":"width",o=e.querySelectorAll(\'input[type="range"]\'),l=o.length>1,s=o.length-1;let a=null,u=null;for(let t=0;t<o.length;t+=1){const e=o[t],y=parseFloat(e.getAttribute("value")??"");if(Number.isNaN(y))return;const c=e.parentElement;if(!c)return;const p=parseFloat(e.getAttribute("max")??"100"),g=parseFloat(e.getAttribute("min")??"0"),b=c?.getBoundingClientRect(),d=i[n]-b[n],m=100*(y-g)/(p-g),v=(b[n]/2+d*m/100)/i[n]*100;c.style.setProperty("--position",`${v}%`),Number.isFinite(v)&&(c.style.removeProperty("visibility"),r&&(0===t?(a=v,r.style.setProperty("--start-position",`${v}%`),l||r.style.removeProperty("visibility")):t===s&&(u=v-(a??0),r.style.setProperty("--end-position",`${v}%`),r.style.setProperty("--relative-size",`${u}%`),r.style.removeProperty("visibility"))))}}();';
const PAGE_UP = "PageUp";
const PAGE_DOWN = "PageDown";
const ALL_KEYS = /* @__PURE__ */ new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END, PAGE_UP, PAGE_DOWN]);
function getDefaultAriaValueText(values, index, format, locale) {
  if (index < 0) {
    return void 0;
  }
  if (values.length === 2) {
    if (index === 0) {
      return `${formatNumber(values[index], locale, format)} start range`;
    }
    return `${formatNumber(values[index], locale, format)} end range`;
  }
  return format ? formatNumber(values[index], locale, format) : void 0;
}
function getNewValue(thumbValue, step, direction, min, max) {
  return direction === 1 ? Math.min(thumbValue + step, max) : Math.max(thumbValue - step, min);
}
const SliderThumb = /* @__PURE__ */ reactExports.forwardRef(function SliderThumb2(componentProps, forwardedRef) {
  const {
    render,
    children: childrenProp,
    className,
    "aria-describedby": ariaDescribedByProp,
    "aria-label": ariaLabelProp,
    "aria-labelledby": ariaLabelledByProp,
    disabled: disabledProp = false,
    getAriaLabel: getAriaLabelProp,
    getAriaValueText: getAriaValueTextProp,
    id: idProp,
    index: indexProp,
    inputRef: inputRefProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    tabIndex: tabIndexProp,
    ...elementProps
  } = componentProps;
  const {
    nonce
  } = useCSPContext();
  const id = useBaseUiId(idProp);
  const {
    active: activeIndex,
    lastUsedThumbIndex,
    controlRef,
    disabled: contextDisabled,
    validation,
    formatOptionsRef,
    handleInputChange,
    inset,
    labelId,
    largeStep,
    locale,
    max,
    min,
    minStepsBetweenValues,
    name,
    orientation,
    pressedInputRef,
    pressedThumbCenterOffsetRef,
    pressedThumbIndexRef,
    renderBeforeHydration,
    setActive,
    setIndicatorPosition,
    state,
    step,
    values: sliderValues
  } = useSliderRootContext();
  const direction = useDirection();
  const disabled = disabledProp || contextDisabled;
  const range = sliderValues.length > 1;
  const vertical = orientation === "vertical";
  const rtl = direction === "rtl";
  const {
    setTouched,
    setFocused,
    validationMode
  } = useFieldRootContext();
  const thumbRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const defaultInputId = useBaseUiId();
  const labelableId = useLabelableId();
  const inputId = range ? defaultInputId : labelableId;
  const thumbMetadata = reactExports.useMemo(() => ({
    inputId
  }), [inputId]);
  const {
    ref: listItemRef,
    index: compositeIndex
  } = useCompositeListItem({
    metadata: thumbMetadata
  });
  const index = !range ? 0 : indexProp ?? compositeIndex;
  const last = index === sliderValues.length - 1;
  const thumbValue = sliderValues[index];
  const thumbValuePercent = valueToPercent(thumbValue, min, max);
  const [isMounted, setIsMounted] = reactExports.useState(false);
  const [positionPercent, setPositionPercent] = reactExports.useState();
  useOnMount(() => setIsMounted(true));
  const safeLastUsedThumbIndex = lastUsedThumbIndex >= 0 && lastUsedThumbIndex < sliderValues.length ? lastUsedThumbIndex : -1;
  const getInsetPosition = useStableCallback(() => {
    const control = controlRef.current;
    const thumb = thumbRef.current;
    if (!control || !thumb) {
      return;
    }
    const thumbRect = thumb.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    const side = vertical ? "height" : "width";
    const controlSize = controlRect[side] - thumbRect[side];
    const thumbOffsetFromControlEdge = thumbRect[side] / 2 + controlSize * thumbValuePercent / 100;
    const nextPositionPercent = thumbOffsetFromControlEdge / controlRect[side] * 100;
    setPositionPercent(nextPositionPercent);
    if (index === 0) {
      setIndicatorPosition((prevPosition) => [nextPositionPercent, prevPosition[1]]);
    } else if (last) {
      setIndicatorPosition((prevPosition) => [prevPosition[0], nextPositionPercent]);
    }
  });
  useIsoLayoutEffect(() => {
    if (inset) {
      queueMicrotask(getInsetPosition);
    }
  }, [getInsetPosition, inset]);
  useIsoLayoutEffect(() => {
    if (inset) {
      getInsetPosition();
    }
  }, [getInsetPosition, inset, thumbValuePercent]);
  const getThumbStyle = reactExports.useCallback(() => {
    const startEdge = vertical ? "bottom" : "insetInlineStart";
    const crossOffsetProperty = vertical ? "left" : "top";
    let zIndex;
    if (range) {
      if (activeIndex === index) {
        zIndex = 2;
      } else if (safeLastUsedThumbIndex === index) {
        zIndex = 1;
      }
    } else if (activeIndex === index) {
      zIndex = 1;
    }
    if (!inset) {
      if (!Number.isFinite(thumbValuePercent)) {
        return visuallyHidden;
      }
      return {
        position: "absolute",
        [startEdge]: `${thumbValuePercent}%`,
        [crossOffsetProperty]: "50%",
        translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
        zIndex
      };
    }
    return {
      ["--position"]: `${positionPercent}%`,
      visibility: renderBeforeHydration && !isMounted || positionPercent === void 0 ? "hidden" : void 0,
      position: "absolute",
      [startEdge]: "var(--position)",
      [crossOffsetProperty]: "50%",
      translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
      zIndex
    };
  }, [activeIndex, index, inset, isMounted, positionPercent, range, renderBeforeHydration, rtl, safeLastUsedThumbIndex, thumbValuePercent, vertical]);
  let cssWritingMode;
  if (orientation === "vertical") {
    cssWritingMode = rtl ? "vertical-rl" : "vertical-lr";
  }
  const inputProps = mergeProps({
    "aria-label": typeof getAriaLabelProp === "function" ? getAriaLabelProp(index) : ariaLabelProp,
    "aria-labelledby": ariaLabelledByProp ?? labelId,
    "aria-describedby": ariaDescribedByProp,
    "aria-orientation": orientation,
    "aria-valuenow": thumbValue,
    "aria-valuetext": typeof getAriaValueTextProp === "function" ? getAriaValueTextProp(formatNumber(thumbValue, locale, formatOptionsRef.current ?? void 0), thumbValue, index) : getDefaultAriaValueText(sliderValues, index, formatOptionsRef.current ?? void 0, locale),
    disabled,
    id: inputId,
    max,
    min,
    name,
    onChange(event2) {
      handleInputChange(event2.target.valueAsNumber, index, event2);
    },
    onFocus() {
      setActive(index);
      setFocused(true);
    },
    onBlur() {
      if (!thumbRef.current) {
        return;
      }
      setActive(-1);
      setTouched(true);
      setFocused(false);
      if (validationMode === "onBlur") {
        validation.commit(getSliderValue(thumbValue, index, min, max, range, sliderValues));
      }
    },
    onKeyDown(event2) {
      if (!ALL_KEYS.has(event2.key)) {
        return;
      }
      if (COMPOSITE_KEYS.has(event2.key)) {
        event2.stopPropagation();
      }
      let newValue = null;
      const roundedValue = roundValueToStep(thumbValue, step, min);
      switch (event2.key) {
        case ARROW_UP:
          newValue = getNewValue(roundedValue, event2.shiftKey ? largeStep : step, 1, min, max);
          break;
        case ARROW_RIGHT:
          newValue = getNewValue(roundedValue, event2.shiftKey ? largeStep : step, rtl ? -1 : 1, min, max);
          break;
        case ARROW_DOWN:
          newValue = getNewValue(roundedValue, event2.shiftKey ? largeStep : step, -1, min, max);
          break;
        case ARROW_LEFT:
          newValue = getNewValue(roundedValue, event2.shiftKey ? largeStep : step, rtl ? 1 : -1, min, max);
          break;
        case PAGE_UP:
          newValue = getNewValue(roundedValue, largeStep, 1, min, max);
          break;
        case PAGE_DOWN:
          newValue = getNewValue(roundedValue, largeStep, -1, min, max);
          break;
        case END:
          newValue = max;
          if (range) {
            newValue = Number.isFinite(sliderValues[index + 1]) ? sliderValues[index + 1] - step * minStepsBetweenValues : max;
          }
          break;
        case HOME:
          newValue = min;
          if (range) {
            newValue = Number.isFinite(sliderValues[index - 1]) ? sliderValues[index - 1] + step * minStepsBetweenValues : min;
          }
          break;
      }
      if (newValue !== null) {
        handleInputChange(newValue, index, event2);
        event2.preventDefault();
      }
    },
    step,
    style: {
      ...visuallyHidden,
      // So that VoiceOver's focus indicator matches the thumb's dimensions
      width: "100%",
      height: "100%",
      writingMode: cssWritingMode
    },
    tabIndex: tabIndexProp ?? void 0,
    type: "range",
    value: thumbValue ?? ""
  }, validation.getInputValidationProps);
  const mergedInputRef = useMergedRefs(inputRef, validation.inputRef, inputRefProp);
  const element = useRenderElement("div", componentProps, {
    state,
    ref: [forwardedRef, listItemRef, thumbRef],
    props: [{
      [SliderThumbDataAttributes.index]: index,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, {
        children: [childrenProp, /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
          ref: mergedInputRef,
          ...inputProps
        }), inset && !isMounted && renderBeforeHydration && // this must be rendered with the last thumb to ensure all
        // preceding thumbs are already rendered in the DOM
        last && /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
          nonce,
          dangerouslySetInnerHTML: {
            __html: script
          },
          suppressHydrationWarning: true
        })]
      }),
      id,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
      onPointerDown(event2) {
        pressedThumbIndexRef.current = index;
        if (thumbRef.current != null) {
          const axis = orientation === "horizontal" ? "x" : "y";
          const midpoint = getMidpoint(thumbRef.current);
          const offset = (orientation === "horizontal" ? event2.clientX : event2.clientY) - midpoint[axis];
          pressedThumbCenterOffsetRef.current = offset;
        }
        if (inputRef.current != null && pressedInputRef.current !== inputRef.current) {
          pressedInputRef.current = inputRef.current;
        }
      },
      style: getThumbStyle(),
      suppressHydrationWarning: renderBeforeHydration || void 0,
      tabIndex: -1
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
function getInsetStyles(vertical, range, start, end, renderBeforeHydration, mounted) {
  const visibility = start === void 0 || range && end === void 0 ? "hidden" : void 0;
  const startEdge = vertical ? "bottom" : "insetInlineStart";
  const mainSide = vertical ? "height" : "width";
  const crossSide = vertical ? "width" : "height";
  const styles = {
    visibility: renderBeforeHydration && !mounted ? "hidden" : visibility,
    position: vertical ? "absolute" : "relative",
    [crossSide]: "inherit"
  };
  styles["--start-position"] = `${start ?? 0}%`;
  if (!range) {
    styles[startEdge] = 0;
    styles[mainSide] = "var(--start-position)";
    return styles;
  }
  styles["--relative-size"] = `${(end ?? 0) - (start ?? 0)}%`;
  styles[startEdge] = "var(--start-position)";
  styles[mainSide] = "var(--relative-size)";
  return styles;
}
function getCenteredStyles(vertical, range, start, end) {
  const startEdge = vertical ? "bottom" : "insetInlineStart";
  const mainSide = vertical ? "height" : "width";
  const crossSide = vertical ? "width" : "height";
  const styles = {
    position: vertical ? "absolute" : "relative",
    [crossSide]: "inherit"
  };
  if (!range) {
    styles[startEdge] = 0;
    styles[mainSide] = `${start}%`;
    return styles;
  }
  const size = end - start;
  styles[startEdge] = `${start}%`;
  styles[mainSide] = `${size}%`;
  return styles;
}
const SliderIndicator = /* @__PURE__ */ reactExports.forwardRef(function SliderIndicator2(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    indicatorPosition,
    inset,
    max,
    min,
    orientation,
    renderBeforeHydration,
    state,
    values
  } = useSliderRootContext();
  const [isMounted, setIsMounted] = reactExports.useState(false);
  useOnMount(() => setIsMounted(true));
  const vertical = orientation === "vertical";
  const range = values.length > 1;
  const style = inset ? getInsetStyles(vertical, range, indicatorPosition[0], indicatorPosition[1], renderBeforeHydration, isMounted) : getCenteredStyles(vertical, range, valueToPercent(values[0], min, max), valueToPercent(values[values.length - 1], min, max));
  const element = useRenderElement("div", componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      ["data-base-ui-slider-indicator"]: renderBeforeHydration ? "" : void 0,
      style,
      suppressHydrationWarning: renderBeforeHydration || void 0
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
const Slider = reactExports.forwardRef(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
  const arrayValue = value !== void 0 ? Array.isArray(value) ? value : [value] : void 0;
  const arrayDefaultValue = defaultValue !== void 0 ? Array.isArray(defaultValue) ? defaultValue : [defaultValue] : void 0;
  const handleValueChange = (newValue) => {
    if (onValueChange) {
      if (typeof value === "number" || typeof defaultValue === "number") {
        onValueChange(Array.isArray(newValue) ? newValue[0] : newValue);
      } else {
        onValueChange(Array.isArray(newValue) ? [...newValue] : [newValue]);
      }
    }
  };
  const thumbCount = arrayValue?.length || arrayDefaultValue?.length || 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SliderRoot,
    {
      ref,
      value: arrayValue,
      defaultValue: arrayDefaultValue,
      onValueChange: handleValueChange,
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SliderControl, { className: cn("flex w-full touch-none items-center py-3 select-none", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SliderTrack, { className: "h-2 w-full rounded-full bg-muted shadow-[inset_0_0_0_1px] shadow-border select-none relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderIndicator, { className: "absolute h-full rounded-full bg-primary select-none" }),
        Array.from({ length: thumbCount }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderThumb,
          {
            index,
            className: "size-5 rounded-full bg-background border-2 border-primary select-none shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
          },
          index
        ))
      ] }) })
    }
  );
});
Slider.displayName = "Slider";
function formatSpeed(bps, unit) {
  if (bps === 0) return "Unlimited";
  const value = unit === "bps" ? bps * 8 : bps;
  const units = unit === "bps" ? ["b/s", "kbit/s", "Mbit/s", "Gbit/s"] : ["B/s", "KB/s", "MB/s", "GB/s"];
  const divisor = unit === "bps" ? 1e3 : 1024;
  let level = 0;
  let formatted = value;
  while (formatted >= divisor && level < units.length - 1) {
    formatted /= divisor;
    level++;
  }
  return `${formatted.toFixed(level > 0 ? 1 : 0)} ${units[level]}`;
}
function DownloadsPanel(_props) {
  const { speedLimitEnabled, speedLimitBps, speedUnit, maxConcurrentDownloads, downloadCacheEnabled } = useSettingsStore((s) => s.global);
  const updateGlobal = useSettingsStore((s) => s.updateGlobal);
  const minBps = 10 * 1024;
  const maxBps = 200 * 1024 * 1024;
  const bpsToSlider = (bps) => {
    if (bps <= minBps) return 0;
    if (bps >= maxBps) return 1e3;
    const logMin = Math.log(minBps);
    const logMax = Math.log(maxBps);
    const logValue = Math.log(bps);
    return Math.round((logValue - logMin) / (logMax - logMin) * 1e3);
  };
  const sliderToBps = (slider) => {
    if (slider <= 0) return minBps;
    if (slider >= 1e3) return maxBps;
    const logMin = Math.log(minBps);
    const logMax = Math.log(maxBps);
    const logValue = logMin + slider / 1e3 * (logMax - logMin);
    return Math.round(Math.exp(logValue));
  };
  const handleSpeedLimitChange = (enabled) => {
    updateGlobal({ speedLimitEnabled: enabled });
  };
  const handleSpeedValueChange = (value) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    const bps = sliderToBps(numValue);
    updateGlobal({ speedLimitBps: bps });
  };
  const handleUnitChange = (value) => {
    updateGlobal({ speedUnit: value });
  };
  const handleConcurrencyChange = (value) => {
    updateGlobal({ maxConcurrentDownloads: parseInt(value, 10) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Downloads" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Configure download behavior and bandwidth limits" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0 divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Limit download speed",
          description: "Enable bandwidth throttling for mod downloads",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: speedLimitEnabled,
              onCheckedChange: handleSpeedLimitChange
            }
          )
        }
      ),
      speedLimitEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Speed limit",
          description: `Current: ${formatSpeed(speedLimitBps, speedUnit)}`,
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 min-w-[300px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Slider,
              {
                min: 0,
                max: 1e3,
                step: 1,
                value: bpsToSlider(speedLimitBps),
                onValueChange: handleSpeedValueChange,
                disabled: !speedLimitEnabled,
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: speedUnit, onValueChange: (value) => value && handleUnitChange(value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Bps", children: "B/s" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bps", children: "b/s" })
              ] })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Max concurrent downloads",
          description: "Maximum number of mods to download simultaneously",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: maxConcurrentDownloads.toString(),
              onValueChange: (value) => value && handleConcurrencyChange(value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n.toString(), children: n }, n)) })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Download cache",
          description: "Cache downloaded mods to speed up reinstallation",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: downloadCacheEnabled,
              onCheckedChange: (checked) => updateGlobal({ downloadCacheEnabled: checked })
            }
          )
        }
      )
    ] })
  ] });
}
function DebuggingPanel(_props) {
  const handleCleanModCache = () => {
    console.log("Cleaning mod cache...");
  };
  const handleCleanOnlineModList = () => {
    console.log("Cleaning online mod list...");
  };
  const handleCopyLogFile = async () => {
    const logContents = "Sample log file contents...\nTimestamp: " + (/* @__PURE__ */ new Date()).toISOString();
    try {
      await navigator.clipboard.writeText(logContents);
      console.log("Log file copied to clipboard");
    } catch (err) {
      console.error("Failed to copy log file:", err);
    }
  };
  const handleCopyTroubleshootingInfo = async () => {
    const troubleshootingInfo = [
      "r2modman Troubleshooting Information",
      "================================",
      "App Version: 1.0.0",
      "Platform: " + navigator.platform,
      "User Agent: " + navigator.userAgent,
      "Timestamp: " + (/* @__PURE__ */ new Date()).toISOString(),
      "",
      "// Additional system info would go here"
    ].join("\n");
    try {
      await navigator.clipboard.writeText(troubleshootingInfo);
      console.log("Troubleshooting info copied to clipboard");
    } catch (err) {
      console.error("Failed to copy troubleshooting info:", err);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Debugging" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tools for troubleshooting and clearing cached data" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0 divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Clean mod cache",
          description: "Clear cached mod files to free up space",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCleanModCache, children: "Clean Cache" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Clean online mod list",
          description: "Clear the cached list of available mods from Thunderstore",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCleanOnlineModList, children: "Clean List" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Copy log file",
          description: "Copy the current log file to clipboard for debugging",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCopyLogFile, children: "Copy Logs" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Copy troubleshooting info",
          description: "Copy system and app information to help diagnose issues",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCopyTroubleshootingInfo, children: "Copy Info" })
        }
      )
    ] })
  ] });
}
function ModpacksPanel(_props) {
  const [showDependencies, setShowDependencies] = reactExports.useState(false);
  const mockDependencies = [
    "BepInEx-BepInExPack-5.4.21",
    "RiskofThunder-HookGenPatcher-1.2.3",
    "bbepis-BepInExConfigManager-17.1.0",
    "tristanmcpherson-R2API-5.0.3"
  ];
  const handleCopyDependencies = async () => {
    const dependencyString = mockDependencies.join("\n");
    try {
      await navigator.clipboard.writeText(dependencyString);
      console.log("Dependencies copied to clipboard");
    } catch (err) {
      console.error("Failed to copy dependencies:", err);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Modpacks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "View and manage modpack information" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0 divide-y divide-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Show dependency strings",
          description: "View all installed mods formatted as Author-ModName-Version",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setShowDependencies(true),
              children: "Show Dependencies"
            }
          )
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRoot, { open: showDependencies, onOpenChange: setShowDependencies, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogBackdrop, { className: "fixed inset-0 bg-black/50 z-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPopup, { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-h-[70vh] flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle$1, { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Dependency Strings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { className: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-100 dark:bg-gray-800 rounded p-4 font-mono text-sm", children: mockDependencies.map((dep, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-900 dark:text-gray-100", children: dep }, i)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleCopyDependencies,
              children: "Copy to Clipboard"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "default", size: "sm", children: "Close" }) })
        ] })
      ] })
    ] }) })
  ] });
}
function OtherPanel(_props) {
  const { theme, cardDisplayType, funkyMode, enforceDependencyVersions } = useSettingsStore((s) => s.global);
  const updateGlobal = useSettingsStore((s) => s.updateGlobal);
  const handleRefreshModList = () => {
    console.log("Refreshing online mod list...");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Appearance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Customize the look and feel of r2modman" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0 divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Theme",
          description: "Choose your preferred color scheme",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["system", "light", "dark"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: theme === mode ? "default" : "outline",
              size: "sm",
              onClick: () => updateGlobal({ theme: mode }),
              className: "capitalize",
              children: mode
            },
            mode
          )) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Card display type",
          description: "Choose how mod cards are displayed in the library",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: cardDisplayType,
              onValueChange: (value) => {
                if (value) updateGlobal({ cardDisplayType: value });
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "collapsed", children: "Collapsed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expanded", children: "Expanded" })
                ] })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Funky mode",
          description: "Enable experimental and fun UI effects",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: funkyMode,
              onCheckedChange: (checked) => updateGlobal({ funkyMode: checked })
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Refresh online mod list",
          description: "Fetch the latest list of available mods from Thunderstore",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleRefreshModList, children: "Refresh" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Mod Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Configure how mods and their dependencies are handled" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0 divide-y divide-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsRow,
      {
        title: "Enforce dependency versions",
        description: "When enabled, mods with specific version requirements will only accept that exact version. When disabled, any version of the dependency will be considered acceptable.",
        rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: enforceDependencyVersions,
            onCheckedChange: (checked) => updateGlobal({ enforceDependencyVersions: checked })
          }
        )
      }
    ) })
  ] });
}
function GameSettingsPanel({ gameId }) {
  const activeProfileIdByGame = useProfileStore((s) => s.activeProfileIdByGame);
  const { dataFolder } = useSettingsStore((s) => s.global);
  const getPerGame = useSettingsStore((s) => s.getPerGame);
  const updatePerGame = useSettingsStore((s) => s.updatePerGame);
  if (!gameId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Game Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No game selected" })
    ] }) });
  }
  const game = GAMES.find((g) => g.id === gameId);
  const perGameSettings = getPerGame(gameId);
  if (!game) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Game Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Game not found" })
    ] }) });
  }
  const handleChangeInstallFolder = async () => {
    const newPath = await selectFolder();
    if (newPath) {
      updatePerGame(gameId, { gameInstallFolder: newPath });
    }
  };
  const handleBrowseInstallFolder = (path) => {
    if (path) {
      openFolder(path);
    }
  };
  const handleLaunchParametersChange = (value) => {
    updatePerGame(gameId, { launchParameters: value });
  };
  const handleBrowseProfileFolder = () => {
    const profileId = activeProfileIdByGame[gameId];
    if (profileId) {
      const profilePath = `${dataFolder}/${gameId}/profiles/${profileId}`;
      openFolder(profilePath);
    }
  };
  const handleResetGameInstallation = () => {
    const confirmed = confirm(
      `Are you sure you want to reset the installation for ${game.name}? This will remove all mods and profiles.`
    );
    if (confirmed) {
      console.log(`Resetting game installation for ${gameId}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-2", children: game.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Configure settings for this game" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0 divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Game install folder",
          description: "Location where the game is installed",
          value: perGameSettings.gameInstallFolder || "Not set",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => handleBrowseInstallFolder(perGameSettings.gameInstallFolder),
                disabled: !perGameSettings.gameInstallFolder,
                children: "Browse"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleChangeInstallFolder,
                children: "Change"
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Launch parameters",
          description: "Additional command-line arguments to pass when launching the game",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: perGameSettings.launchParameters || "",
              onChange: (e) => handleLaunchParametersChange(e.target.value),
              placeholder: "e.g., --debug --windowed",
              className: "w-[300px]"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Active profile",
          description: "The currently selected profile for this game",
          value: activeProfileIdByGame[gameId] || "None",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleBrowseProfileFolder,
              disabled: !activeProfileIdByGame[gameId],
              children: "Browse Profile Folder"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingsRow,
        {
          title: "Reset game installation",
          description: "Remove all mods, profiles, and cached data for this game",
          rightContent: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "destructive",
              size: "sm",
              onClick: handleResetGameInstallation,
              children: "Reset Installation"
            }
          )
        }
      )
    ] })
  ] });
}
const staticNavigationSections = [
  {
    title: "General",
    items: [
      { id: "other", label: "Appearance", component: OtherPanel }
    ]
  },
  {
    title: "Mods",
    items: [
      { id: "locations", label: "Locations", component: LocationsPanel },
      { id: "downloads", label: "Downloads", component: DownloadsPanel },
      { id: "modpacks", label: "Modpacks", component: ModpacksPanel }
    ]
  },
  {
    title: "Advanced",
    items: [
      { id: "debugging", label: "Debugging", component: DebuggingPanel }
    ]
  }
];
function SettingsDialog() {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const settingsActiveSection = useAppStore((s) => s.settingsActiveSection);
  const managedGameIds = useGameManagementStore((s) => s.managedGameIds);
  const [activeSection, setActiveSection] = reactExports.useState(settingsActiveSection || "other");
  const [searchQuery] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (settingsActiveSection) {
      setActiveSection(settingsActiveSection);
    }
  }, [settingsActiveSection]);
  const handleOpenChange = (open) => {
    setSettingsOpen(open);
    if (!open) {
      setActiveSection("other");
      useAppStore.setState({ settingsActiveSection: null });
    }
  };
  const managedGames = managedGameIds.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean);
  const gamesSection = managedGames.length > 0 ? {
    title: "Games",
    items: managedGames.map((game) => ({
      id: `game-${game.id}`,
      label: game.name,
      component: GameSettingsPanel,
      gameId: game.id
    }))
  } : null;
  const allSections = [...staticNavigationSections];
  if (gamesSection) {
    allSections.push(gamesSection);
  }
  const activeItem = allSections.flatMap((section) => section.items).find((item) => item.id === activeSection);
  const ActiveComponent = activeItem?.component || OtherPanel;
  const activeGameId = activeItem && "gameId" in activeItem ? activeItem.gameId : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: settingsOpen, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-[1100px] w-[calc(100vw-2rem)] h-[min(720px,calc(100vh-2rem))] max-h-none p-0 overflow-hidden flex",
      onOverlayClick: () => handleOpenChange(false),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-60 shrink-0 border-r border-border bg-muted/30 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Settings" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto py-4", children: allSections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: section.title }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1 px-3", children: section.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setActiveSection(item.id),
                className: cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeSection === item.id ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                ),
                children: item.label
              },
              item.id
            )) })
          ] }, section.title)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon-sm",
              className: "shrink-0",
              "aria-label": "Close settings",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl px-12 py-8", children: activeGameId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveComponent, { searchQuery, gameId: activeGameId }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveComponent, { searchQuery }) }) })
        ] })
      ]
    }
  ) });
}
const TICK_INTERVAL = 500;
const MIN_SPEED_BPS = 500 * 1024;
const MAX_SPEED_BPS = 15 * 1024 * 1024;
const FAILURE_CHANCE = 1e-3;
function DownloadManager() {
  const tasks = useDownloadStore((s) => s.tasks);
  const getDownloadingTasks = useDownloadStore((s) => s.getDownloadingTasks);
  const getQueuedTasks = useDownloadStore((s) => s.getQueuedTasks);
  const updateProgress = useDownloadStore((s) => s.updateProgress);
  const completeDownload = useDownloadStore((s) => s.completeDownload);
  const failDownload = useDownloadStore((s) => s.failDownload);
  const setStatus = useDownloadStore((s) => s.setStatus);
  const cancelDownload = useDownloadStore((s) => s.cancelDownload);
  const installMod = useModManagementStore((s) => s.installMod);
  const maxConcurrentDownloads = useSettingsStore((s) => s.global.maxConcurrentDownloads);
  const speedLimitEnabled = useSettingsStore((s) => s.global.speedLimitEnabled);
  const speedLimitBps = useSettingsStore((s) => s.global.speedLimitBps);
  const previousTasksRef = reactExports.useRef({});
  const scheduledCleanupRef = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    const currentTasks = tasks;
    const previousTasks = previousTasksRef.current;
    Object.entries(currentTasks).forEach(([modId, task]) => {
      const prevTask = previousTasks[modId];
      if (!prevTask && task.status === "downloading") {
        toast.info(`Downloading ${task.modName}...`);
      }
      if (prevTask && prevTask.status !== "downloading" && task.status === "downloading") {
        toast.info(`Downloading ${task.modName}...`);
      }
      if (prevTask && prevTask.status !== "completed" && task.status === "completed") {
        toast.success(`${task.modName} installed successfully`);
        installMod(task.gameId, task.modId, task.modVersion);
      }
      if (prevTask && prevTask.status !== "error" && task.status === "error") {
        toast.error(`Failed to download ${task.modName}`, {
          description: task.error || "Unknown error"
        });
      }
    });
    previousTasksRef.current = currentTasks;
  }, [tasks, installMod]);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      let downloading = getDownloadingTasks();
      const queued = getQueuedTasks();
      if (downloading.length > maxConcurrentDownloads) {
        const tasksToPause = downloading.slice(maxConcurrentDownloads);
        tasksToPause.forEach((task) => {
          setStatus(task.modId, "paused");
        });
        downloading = getDownloadingTasks();
      }
      const availableSlots = maxConcurrentDownloads - downloading.length;
      if (availableSlots > 0 && queued.length > 0) {
        queued.slice(0, availableSlots).forEach((task) => {
          setStatus(task.modId, "downloading");
        });
      }
      downloading.forEach((task) => {
        if (Math.random() < FAILURE_CHANCE) {
          failDownload(task.modId, "Network connection lost");
          return;
        }
        let speedBps = Math.random() * (MAX_SPEED_BPS - MIN_SPEED_BPS) + MIN_SPEED_BPS;
        if (speedLimitEnabled && speedLimitBps > 0) {
          speedBps = Math.min(speedBps, speedLimitBps);
        }
        const bytesToAdd = speedBps * TICK_INTERVAL / 1e3;
        const newBytesDownloaded = Math.min(
          task.bytesDownloaded + bytesToAdd,
          task.bytesTotal
        );
        updateProgress(task.modId, newBytesDownloaded, speedBps);
        if (newBytesDownloaded >= task.bytesTotal) {
          completeDownload(task.modId);
        }
      });
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [
    getDownloadingTasks,
    getQueuedTasks,
    updateProgress,
    completeDownload,
    failDownload,
    setStatus,
    maxConcurrentDownloads,
    speedLimitEnabled,
    speedLimitBps
  ]);
  reactExports.useEffect(() => {
    const completedTasks = Object.values(tasks).filter((t) => t.status === "completed");
    completedTasks.forEach((task) => {
      if (!scheduledCleanupRef.current.has(task.modId)) {
        scheduledCleanupRef.current.add(task.modId);
        setTimeout(() => {
          cancelDownload(task.modId);
          scheduledCleanupRef.current.delete(task.modId);
        }, 1e4);
      }
    });
  }, [tasks, cancelDownload]);
  return null;
}
function AppShell({ children, showContextPanel = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  const showContextPanelState = useAppStore((s) => s.showContextPanel);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-dvh w-full overflow-hidden bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:flex h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalRail, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MobileRailSheet, { open: mobileMenuOpen, onOpenChange: setMobileMenuOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden shrink-0 border-b border-border bg-card px-4 py-2 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => setMobileMenuOpen(true),
            "aria-label": "Open menu",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-semibold", children: "r2modman" })
      ] }),
      children
    ] }),
    showContextPanel && showContextPanelState && /* @__PURE__ */ jsxRuntimeExports.jsx(ContextPanel, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsDialog, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadManager, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "bottom-right" })
  ] });
}
function ShellLayout() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const showContextPanel = pathname !== "/downloads";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { showContextPanel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  ShellLayout as component
};
