import { c as createLucideIcon, k as useRefWithInit, a as cn, B as Button } from "./button-DGo68xNG.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-D84i-0IV.js";
import { a4 as useDialogRootContext, av as DialogStore, at as useDialogRoot, au as DialogRootContext, a0 as DialogPopup, a1 as DialogTitle, aw as DialogDescription, a2 as DialogClose, _ as DialogPortal, $ as DialogBackdrop } from "./select-cz2npUlP.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 12.5 8 15l2 2.5", key: "1tg20x" }],
  ["path", { d: "m14 12.5 2 2.5-2 2.5", key: "yinavb" }]
];
const FileCode = createLucideIcon("file-code", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
];
const FolderOpen = createLucideIcon("folder-open", __iconNode);
function AlertDialogRoot(props) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const parentDialogRootContext = useDialogRootContext();
  const nested = Boolean(parentDialogRootContext);
  const store = useRefWithInit(() => {
    return handle?.store ?? new DialogStore({
      open: openProp ?? defaultOpen,
      activeTriggerId: triggerIdProp !== void 0 ? triggerIdProp : defaultTriggerIdProp,
      modal: true,
      disablePointerDismissal: true,
      nested,
      role: "alertdialog"
    });
  }).current;
  store.useControlledProp("open", openProp, defaultOpen);
  store.useControlledProp("activeTriggerId", triggerIdProp, defaultTriggerIdProp);
  store.useSyncedValue("nested", nested);
  store.useContextCallback("onOpenChange", onOpenChange);
  store.useContextCallback("onOpenChangeComplete", onOpenChangeComplete);
  const payload = store.useState("payload");
  useDialogRoot({
    store,
    actionsRef,
    parentContext: parentDialogRootContext?.store.context
  });
  const contextValue = reactExports.useMemo(() => ({
    store
  }), [store]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRootContext.Provider, {
    value: contextValue,
    children: typeof children === "function" ? children({
      payload
    }) : children
  });
}
function AlertDialog({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogRoot, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogPortal({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  onClick,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogBackdrop,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
        className
      ),
      onClick,
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  size = "default",
  onOverlayClick,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, { onClick: onOverlayClick }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogPopup,
      {
        "data-slot": "alert-dialog-content",
        "data-size": size,
        className: cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-6 rounded-xl p-6 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogMedia({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-media",
      className: cn("bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8", className),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogTitle,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogDescription,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      "data-slot": "alert-dialog-action",
      className: cn(className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogClose,
    {
      "data-slot": "alert-dialog-cancel",
      className: cn(className),
      render: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant, size }),
      ...props
    }
  );
}
export {
  AlertDialog as A,
  FolderOpen as F,
  AlertDialogContent as a,
  AlertDialogHeader as b,
  AlertDialogMedia as c,
  AlertDialogTitle as d,
  AlertDialogDescription as e,
  AlertDialogFooter as f,
  AlertDialogCancel as g,
  AlertDialogAction as h,
  FileCode as i
};
