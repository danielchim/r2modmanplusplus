const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-B27D7yuL.js","./index-knoBPdtK.js","./index-Dva3gDVL.css"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, _ as __vitePreload } from "./index-knoBPdtK.js";
import { c as createLucideIcon, a as cn, B as Button, L as LoaderCircle } from "./button-BJqcXv45.js";
import { I as Input, C as ChevronDown, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, h as DropdownMenuItem, aH as ExternalLink, T as Trash2, U as Switch, V as Select, W as SelectTrigger, X as SelectValue, Y as SelectContent, Z as SelectItem } from "./select-CIORbeWi.js";
import { i as FileCode, F as FolderOpen, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-CPhEa7Hq.js";
import { S as Search, E as EllipsisVertical } from "./search-DmwwEe9i.js";
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
function parseBepInExConfig(text) {
  const lines = text.split("\n");
  const sections = [];
  let currentSection = null;
  let currentItemComments = [];
  let currentItemMetadata = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("[") && line.endsWith("]")) {
      const sectionName = line.slice(1, -1);
      currentSection = {
        name: sectionName,
        displayName: sectionName.split(".").pop() || sectionName,
        items: []
      };
      sections.push(currentSection);
      currentItemComments = [];
      currentItemMetadata = {};
      continue;
    }
    if (line.startsWith("##")) {
      currentItemComments.push(line.slice(2).trim());
      continue;
    }
    if (line.startsWith("#")) {
      const metaLine = line.slice(1).trim();
      if (metaLine.startsWith("Setting type:")) {
        currentItemMetadata.settingType = metaLine.slice("Setting type:".length).trim();
      } else if (metaLine.startsWith("Default value:")) {
        currentItemMetadata.defaultValue = metaLine.slice("Default value:".length).trim();
      } else if (metaLine.startsWith("Acceptable values:")) {
        currentItemMetadata.acceptableValues = metaLine.slice("Acceptable values:".length).trim();
      }
      continue;
    }
    if (line.includes("=") && currentSection) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      const item = {
        key: key.trim(),
        value,
        type: inferType(currentItemMetadata.settingType, currentItemMetadata.acceptableValues),
        description: currentItemComments.join(" "),
        settingType: currentItemMetadata.settingType,
        defaultValue: currentItemMetadata.defaultValue
      };
      if (currentItemMetadata.acceptableValues) {
        item.acceptableValues = currentItemMetadata.acceptableValues.split(",").map((v) => v.trim());
      }
      currentSection.items.push(item);
      currentItemComments = [];
      currentItemMetadata = {};
      continue;
    }
    if (line === "" || line.startsWith("#")) {
      continue;
    }
  }
  return { sections, rawText: text };
}
function inferType(settingType, acceptableValues) {
  if (!settingType) return "text";
  const lower = settingType.toLowerCase();
  if (lower === "boolean") return "boolean";
  if (acceptableValues) {
    if (acceptableValues.toLowerCase().includes("multiple values")) {
      return "multiselect";
    }
    return "select";
  }
  if (lower.includes("int") || lower.includes("float") || lower.includes("double")) {
    return "number";
  }
  return "text";
}
function updateConfigValue(rawText, sectionName, key, newValue) {
  const lines = rawText.split("\n");
  let inTargetSection = false;
  let result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === `[${sectionName}]`) {
      inTargetSection = true;
      result.push(line);
      continue;
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      inTargetSection = false;
      result.push(line);
      continue;
    }
    if (inTargetSection && trimmed.includes("=")) {
      const [lineKey] = trimmed.split("=");
      if (lineKey.trim() === key) {
        const indent = line.match(/^\s*/)?.[0] || "";
        result.push(`${indent}${key} = ${newValue}`);
        continue;
      }
    }
    result.push(line);
  }
  return result.join("\n");
}
const BepInExCfg = "[Caching]\n\n## Enable/disable assembly metadata cache\n## Enabling this will speed up discovery of plugins and patchers by caching the metadata of all types BepInEx discovers.\n# Setting type: Boolean\n# Default value: true\nEnableAssemblyCache = true\n\n[Chainloader]\n\n## If enabled, hides BepInEx Manager GameObject from Unity.\n## This can fix loading issues in some games that attempt to prevent BepInEx from being loaded.\n## Use this only if you know what this option means, as it can affect functionality of some older plugins.\n## \n# Setting type: Boolean\n# Default value: false\nHideManagerGameObject = false\n\n[Harmony.Logger]\n\n## Specifies which Harmony log channels to listen to.\n## NOTE: IL channel dumps the whole patch methods, use only when needed!\n# Setting type: LogChannel\n# Default value: Warn, Error\n# Acceptable values: None, Info, IL, Warn, Error, Debug, All\n# Multiple values can be set at the same time by separating them with , (e.g. Debug, Warning)\nLogChannels = Warn, Error\n\n[Logging]\n\n## Enables showing unity log messages in the BepInEx logging system.\n# Setting type: Boolean\n# Default value: true\nUnityLogListening = true\n\n## If enabled, writes Standard Output messages to Unity log\n## NOTE: By default, Unity does so automatically. Only use this option if no console messages are visible in Unity log\n## \n# Setting type: Boolean\n# Default value: false\nLogConsoleToUnityLog = false\n\n[Logging.Console]\n\n## Enables showing a console for log output.\n# Setting type: Boolean\n# Default value: false\nEnabled = true\n\n## If enabled, will prevent closing the console (either by deleting the close button or in other platform-specific way).\n# Setting type: Boolean\n# Default value: false\nPreventClose = false\n\n## If true, console is set to the Shift-JIS encoding, otherwise UTF-8 encoding.\n# Setting type: Boolean\n# Default value: false\nShiftJisEncoding = false\n\n## Hints console manager on what handle to assign as StandardOut. Possible values:\n## Auto - lets BepInEx decide how to redirect console output\n## ConsoleOut - prefer redirecting to console output; if possible, closes original standard output\n## StandardOut - prefer redirecting to standard output; if possible, closes console out\n## \n# Setting type: ConsoleOutRedirectType\n# Default value: Auto\n# Acceptable values: Auto, ConsoleOut, StandardOut\nStandardOutType = Auto\n\n## Which log levels to show in the console output.\n# Setting type: LogLevel\n# Default value: Fatal, Error, Warning, Message, Info\n# Acceptable values: None, Fatal, Error, Warning, Message, Info, Debug, All\n# Multiple values can be set at the same time by separating them with , (e.g. Debug, Warning)\nLogLevels = Fatal, Error, Warning, Message, Info\n\n[Logging.Disk]\n\n## Include unity log messages in log file output.\n# Setting type: Boolean\n# Default value: false\nWriteUnityLog = true\n\n## Appends to the log file instead of overwriting, on game startup.\n# Setting type: Boolean\n# Default value: false\nAppendLog = false\n\n## Enables writing log messages to disk.\n# Setting type: Boolean\n# Default value: true\nEnabled = true\n\n## Which log leves are saved to the disk log output.\n# Setting type: LogLevel\n# Default value: Fatal, Error, Warning, Message, Info\n# Acceptable values: None, Fatal, Error, Warning, Message, Info, Debug, All\n# Multiple values can be set at the same time by separating them with , (e.g. Debug, Warning)\nLogLevels = Fatal, Error, Warning, Message, Info\n\n[Preloader]\n\n## Enables or disables runtime patches.\n## This should always be true, unless you cannot start the game due to a Harmony related issue (such as running .NET Standard runtime) or you know what you're doing.\n# Setting type: Boolean\n# Default value: true\nApplyRuntimePatches = true\n\n## Specifies which MonoMod backend to use for Harmony patches. Auto uses the best available backend.\n## This setting should only be used for development purposes (e.g. debugging in dnSpy). Other code might override this setting.\n# Setting type: MonoModBackend\n# Default value: auto\n# Acceptable values: auto, dynamicmethod, methodbuilder, cecil\nHarmonyBackend = auto\n\n## If enabled, BepInEx will save patched assemblies into BepInEx/DumpedAssemblies.\n## This can be used by developers to inspect and debug preloader patchers.\n# Setting type: Boolean\n# Default value: false\nDumpAssemblies = false\n\n## If enabled, BepInEx will load patched assemblies from BepInEx/DumpedAssemblies instead of memory.\n## This can be used to be able to load patched assemblies into debuggers like dnSpy.\n## If set to true, will override DumpAssemblies.\n# Setting type: Boolean\n# Default value: false\nLoadDumpedAssemblies = false\n\n## If enabled, BepInEx will call Debugger.Break() once before loading patched assemblies.\n## This can be used with debuggers like dnSpy to install breakpoints into patched assemblies before they are loaded.\n# Setting type: Boolean\n# Default value: false\nBreakBeforeLoadAssemblies = false\n\n[Preloader.Entrypoint]\n\n## The local filename of the assembly to target.\n# Setting type: String\n# Default value: UnityEngine.dll\nAssembly = UnityEngine.dll\n\n## The name of the type in the entrypoint assembly to search for the entrypoint method.\n# Setting type: String\n# Default value: Application\nType = Application\n\n## The name of the method in the specified entrypoint assembly and type to hook and load Chainloader from.\n# Setting type: String\n# Default value: .cctor\nMethod = .cctor\n\n";
const ModProjectYaml = "version: 1\n\ndependencies:\n\n  hard:\n\n    h3vr.otherloader: 1.0.0\n\nassets:\n\n  runtime:\n\n    sequential: true\n\n    nested:\n\n    - assets:\n\n        - path: any_*\n\n          plugin: h3vr.otherloader\n\n          loader: item_data\n\n    - assets:\n\n        - path: late_any_*\n\n          plugin: h3vr.otherloader\n\n          loader: item_unordered_late\n\n...";
const MonacoEditor = reactExports.lazy(() => __vitePreload(() => import("./index-B27D7yuL.js"), true ? __vite__mapDeps([0,1,2]) : void 0, import.meta.url));
const CONFIG_DOCS = [
  { id: "bepinex", title: "BepInEx", subtitle: "(BepInEx.cfg)", format: "cfg", initialText: BepInExCfg, category: "core" },
  { id: "bigger-lobby", title: "BiggerLobby", subtitle: "(Com.BiggerLobby.cfg)", format: "cfg", initialText: BepInExCfg, category: "user" },
  { id: "ftw-arms", title: "FTW Arms", subtitle: "(project.yaml)", format: "yaml", initialText: ModProjectYaml, category: "user" }
];
function ConfigEditorCenter() {
  const [selectedDocId, setSelectedDocId] = reactExports.useState("bepinex");
  const [mode, setMode] = reactExports.useState("gui");
  const [baselineText, setBaselineText] = reactExports.useState("");
  const [draftText, setDraftText] = reactExports.useState("");
  const [collapsedSections, setCollapsedSections] = reactExports.useState(/* @__PURE__ */ new Set());
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = reactExports.useState(false);
  const [fileToDelete, setFileToDelete] = reactExports.useState(null);
  const selectedDoc = CONFIG_DOCS.find((d) => d.id === selectedDocId);
  reactExports.useMemo(() => {
    setBaselineText(selectedDoc.initialText);
    setDraftText(selectedDoc.initialText);
  }, [selectedDoc.id]);
  const dirty = draftText !== baselineText;
  const parsedConfig = reactExports.useMemo(() => {
    if (selectedDoc.format === "cfg") {
      return parseBepInExConfig(draftText);
    }
    return null;
  }, [draftText, selectedDoc.format]);
  const handleSave = () => {
    setBaselineText(draftText);
  };
  const handleRevert = () => {
    setDraftText(baselineText);
  };
  const handleItemChange = (section, item, newValue) => {
    const updated = updateConfigValue(draftText, section.name, item.key, newValue);
    setDraftText(updated);
  };
  const handleRawTextChange = (value) => {
    if (value !== void 0) {
      setDraftText(value);
    }
  };
  const toggleCategoryCollapse = (category) => {
    const newSet = new Set(collapsedSections);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setCollapsedSections(newSet);
  };
  const handleOpenInExplorer = (doc) => {
    console.log(`Opening in explorer: ${doc.title} (${doc.subtitle})`);
    alert(`Open in Explorer: ${doc.title}

This would open the file location in your system file explorer.`);
  };
  const handleOpenInExternalEditor = (doc) => {
    console.log(`Opening in external editor: ${doc.title} (${doc.subtitle})`);
    alert(`Open in External Editor: ${doc.title}

This would open the file in your default text editor (e.g., VS Code, Notepad++).`);
  };
  const handleDeleteFile = (doc) => {
    setFileToDelete(doc);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (fileToDelete) {
      console.log(`Deleting file: ${fileToDelete.title} (${fileToDelete.subtitle})`);
      alert(`File Deleted: ${fileToDelete.title}

In a real app, this would delete the config file from disk.`);
      if (fileToDelete.id === selectedDocId) {
        const remainingDocs = CONFIG_DOCS.filter((d) => d.id !== fileToDelete.id);
        if (remainingDocs.length > 0) {
          setSelectedDocId(remainingDocs[0].id);
        }
      }
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };
  const canShowGui = selectedDoc.format === "cfg" && parsedConfig;
  const coreSystemDocs = CONFIG_DOCS.filter((d) => d.category === "core");
  const userModsDocs = CONFIG_DOCS.filter((d) => d.category === "user");
  const filteredCoreSystemDocs = coreSystemDocs.filter(
    (d) => d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUserModsDocs = userModsDocs.filter(
    (d) => d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-64 shrink-0 border-r border-border bg-muted/30 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Config Files" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search Configs...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "h-9 pl-8"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => toggleCategoryCollapse("core"),
              className: "flex w-full items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/50 rounded",
              children: [
                collapsedSections.has("core") ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Core System" })
              ]
            }
          ),
          !collapsedSections.has("core") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3 mt-1 space-y-1", children: filteredCoreSystemDocs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "group flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                selectedDocId === doc.id && "bg-primary/20 border-l-2 border-primary"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setSelectedDocId(doc.id),
                    className: "flex flex-1 items-center gap-2 min-w-0 text-left hover:opacity-80",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className: "size-4 shrink-0 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: doc.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: doc.subtitle })
                      ] }),
                      selectedDocId === doc.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 shrink-0 rounded-full bg-primary" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DropdownMenuTrigger,
                    {
                      className: "size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded hover:bg-accent",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "size-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleOpenInExplorer(doc), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "size-4 mr-2" }),
                      "Open in Explorer"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleOpenInExternalEditor(doc), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4 mr-2" }),
                      "Open in External Editor"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        onClick: () => handleDeleteFile(doc),
                        className: "text-destructive focus:text-destructive",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 mr-2" }),
                          "Delete File"
                        ]
                      }
                    )
                  ] })
                ] })
              ]
            },
            doc.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => toggleCategoryCollapse("user"),
              className: "flex w-full items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/50 rounded",
              children: [
                collapsedSections.has("user") ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "User Mods" })
              ]
            }
          ),
          !collapsedSections.has("user") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3 mt-1 space-y-1", children: filteredUserModsDocs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "group flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                selectedDocId === doc.id && "bg-primary/20 border-l-2 border-primary"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setSelectedDocId(doc.id),
                    className: "flex flex-1 items-center gap-2 min-w-0 text-left hover:opacity-80",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className: "size-4 shrink-0 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: doc.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: doc.subtitle })
                      ] }),
                      selectedDocId === doc.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 shrink-0 rounded-full bg-primary" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DropdownMenuTrigger,
                    {
                      className: "size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded hover:bg-accent",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "size-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleOpenInExplorer(doc), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "size-4 mr-2" }),
                      "Open in Explorer"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleOpenInExternalEditor(doc), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4 mr-2" }),
                      "Open in External Editor"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        onClick: () => handleDeleteFile(doc),
                        className: "text-destructive focus:text-destructive",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 mr-2" }),
                          "Delete File"
                        ]
                      }
                    )
                  ] })
                ] })
              ]
            },
            doc.id
          )) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col min-w-0 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-semibold", children: [
          "Configuring: ",
          selectedDoc.title
        ] }),
        canShowGui && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: mode === "raw" ? "default" : "outline",
            size: "sm",
            onClick: () => setMode(mode === "gui" ? "raw" : "gui"),
            children: "Toggle: Raw Edit Mode"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden min-h-0", children: mode === "gui" && canShowGui ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-5xl px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GuiMode,
        {
          parsedConfig,
          onItemChange: handleItemChange
        }
      ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin" }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RawMode,
        {
          value: draftText,
          language: getMonacoLanguage(selectedDoc.format),
          onChange: handleRawTextChange
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4", children: [
        dirty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-auto text-sm text-muted-foreground", children: "Unsaved changes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleRevert, disabled: !dirty, children: "Revert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "default", size: "sm", onClick: handleSave, disabled: !dirty, children: "Save Changes" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Config File?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "Are you sure you want to delete ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fileToDelete?.title }),
          " (",
          fileToDelete?.subtitle,
          ")?",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "This action cannot be undone. The file will be permanently removed from your system."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete File" })
      ] })
    ] }) })
  ] });
}
function GuiMode({
  parsedConfig,
  onItemChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: parsedConfig.sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold", children: section.displayName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-lg border border-border bg-card/50 p-4", children: section.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfigItemControl,
      {
        section,
        item,
        onChange: onItemChange
      },
      item.key
    )) })
  ] }, section.name)) });
}
function ConfigItemControl({
  section,
  item,
  onChange
}) {
  const handleBooleanChange = (checked) => {
    onChange(section, item, checked ? "true" : "false");
  };
  const handleSelectChange = (value) => {
    if (value) {
      onChange(section, item, value);
    }
  };
  const handleInputChange = (e) => {
    onChange(section, item, e.target.value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: item.key }),
      item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: item.description }),
      item.defaultValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Default: ",
        item.defaultValue
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center", children: [
      item.type === "boolean" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: item.value.toLowerCase() === "true",
          onCheckedChange: handleBooleanChange
        }
      ),
      item.type === "select" && item.acceptableValues && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item.value, onValueChange: handleSelectChange, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: item.acceptableValues.map((val) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: val }, val)) })
      ] }),
      (item.type === "text" || item.type === "number") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: item.type === "number" ? "number" : "text",
          value: item.value,
          onChange: handleInputChange,
          className: "h-8 w-[180px]"
        }
      )
    ] })
  ] });
}
function RawMode({
  value,
  language,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full p-4 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    MonacoEditor,
    {
      height: "100%",
      width: "100%",
      language,
      value,
      onChange,
      theme: "vs-dark",
      options: {
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        padding: { top: 16, bottom: 16 }
      }
    }
  ) }) });
}
function getMonacoLanguage(format) {
  switch (format) {
    case "json":
      return "json";
    case "yaml":
      return "yaml";
    case "cfg":
      return "plaintext";
  }
}
function ConfigEditorRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigEditorCenter, {});
}
export {
  ConfigEditorRoute as component
};
