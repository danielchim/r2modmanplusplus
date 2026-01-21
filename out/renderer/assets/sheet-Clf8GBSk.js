import { c as createLucideIcon, f as formatErrorMessage, g as useButton, d as useRenderElement, u as useStableCallback, b as useIsoLayoutEffect, e as useMergedRefs, E as EMPTY_ARRAY$1, h as EMPTY_OBJECT, C as CompositeRootContext, a as cn$1, j as cva, k as useRefWithInit, B as Button, N as NOOP, m as mergeProps, L as LoaderCircle } from "./button-BJqcXv45.js";
import { S as Subscribable, p as pendingThenable, d as resolveEnabled, s as shallowEqualObjects, e as resolveStaleTime, n as noop, i as isServer, f as isValidTimeout, t as timeUntilStale, g as timeoutManager, h as focusManager, k as fetchState, l as replaceData, m as notifyManager, r as reactExports, o as shouldThrowError, q as useQueryClient, W as We, R as ReactDOM, j as jsxRuntimeExports, v as create$1, w as persist, b as useAppStore } from "./index-knoBPdtK.js";
import { a4 as useDialogRootContext, u as useBaseUiId, a5 as useTriggerDataForwarding, a6 as useClick, a7 as useInteractions, a8 as CLICK_TRIGGER_IDENTIFIER, a9 as triggerOpenStateMapping, z as useDirection, m as useControlled, w as CompositeList, aa as useCompositeItem, t as activeElement, v as ownerDocument, F as contains, q as createChangeEventDetails, r as none, J as useCompositeListItem, ab as scrollIntoViewIfNeeded, ac as ALL_KEYS, ad as ARROW_KEYS, ae as isNativeInput, af as getMinListIndex, ag as getMaxListIndex, ah as createGridCellMap, ai as isListIndexDisabled, aj as getGridNavigatedIndex, ak as getGridCellIndexOfCorner, Q as ARROW_DOWN, R as ARROW_RIGHT, al as getGridCellIndices, N as HOME, O as END, P as ARROW_LEFT, S as ARROW_UP, am as findNonDisabledListIndex, an as isIndexOutOfListBounds, ao as VERTICAL_KEYS_WITH_EXTRA_KEYS, ap as VERTICAL_KEYS, aq as HORIZONTAL_KEYS_WITH_EXTRA_KEYS, ar as HORIZONTAL_KEYS, as as MODIFIER_KEYS, at as useDialogRoot, au as DialogRootContext, av as DialogStore, a0 as DialogPopup, a1 as DialogTitle$1, aw as DialogDescription$1, _ as DialogPortal$1, $ as DialogBackdrop, a2 as DialogClose$1, I as Input, ax as Separator$1, ay as fieldValidityMapping, j as useFormContext, k as useFieldRootContext, l as useLabelableContext, o as useField, p as useValueChanged, az as visuallyHiddenInput, L as visuallyHidden, aA as useTransitionStatus, aB as useOpenChangeComplete, aC as transitionStatusMapping, aD as Check, aE as useTimeout, G as useCSPContext, aF as styleDisableScrollbar, i as clamp, aG as isWebKit, aH as ExternalLink, U as Switch, T as Trash2, V as Select, W as SelectTrigger, X as SelectValue, Y as SelectContent, Z as SelectItem } from "./select-CIORbeWi.js";
import { u as useSettingsStore, a as useDownloadStore, B as Badge, C as CircleCheck, c as CircleAlert, X, b as Pause, P as Progress, d as Play } from "./progress-BkKxo1Zo.js";
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.#currentThenable = pendingThenable();
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #currentThenable;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && this.#currentThenable.status === "pending") {
            this.#currentThenable.reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (isServer || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = timeoutManager.setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (isServer || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = timeoutManager.setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId) {
      timeoutManager.clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId) {
      timeoutManager.clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: newState.dataUpdateCount > 0 || newState.errorUpdateCount > 0,
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: this.#currentThenable,
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = this.#currentThenable = nextResult.promise = pendingThenable();
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = this.#currentThenable;
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    this.#notify({ listeners: shouldNotifyListeners() });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp2 = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp2(originalStaleTime(...args)) : clamp2(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer2, queryClient) {
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer2(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !isServer && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query?.promise
    );
    promise?.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
const __iconNode$a = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$a);
const __iconNode$9 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$9);
const __iconNode$8 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M3 5h.01", key: "18ugdj" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 19h.01", key: "noohij" }],
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 19h13", key: "m83p4d" }]
];
const List = createLucideIcon("list", __iconNode$5);
const __iconNode$4 = [
  ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }],
  ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }],
  ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }],
  ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }],
  ["path", { d: "M12 12V8", key: "2874zd" }]
];
const Network = createLucideIcon("network", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
];
const Package = createLucideIcon("package", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
function __insertCSS(code) {
  if (typeof document == "undefined") return;
  let head = document.head || document.getElementsByTagName("head")[0];
  let style = document.createElement("style");
  style.type = "text/css";
  head.appendChild(style);
  style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
const getAsset = (type) => {
  switch (type) {
    case "success":
      return SuccessIcon;
    case "info":
      return InfoIcon;
    case "warning":
      return WarningIcon;
    case "error":
      return ErrorIcon;
    default:
      return null;
  }
};
const bars = Array(12).fill(0);
const Loader = ({ visible, className }) => {
  return /* @__PURE__ */ We.createElement("div", {
    className: [
      "sonner-loading-wrapper",
      className
    ].filter(Boolean).join(" "),
    "data-visible": visible
  }, /* @__PURE__ */ We.createElement("div", {
    className: "sonner-spinner"
  }, bars.map((_, i) => /* @__PURE__ */ We.createElement("div", {
    className: "sonner-loading-bar",
    key: `spinner-bar-${i}`
  }))));
};
const SuccessIcon = /* @__PURE__ */ We.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ We.createElement("path", {
  fillRule: "evenodd",
  d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  clipRule: "evenodd"
}));
const WarningIcon = /* @__PURE__ */ We.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ We.createElement("path", {
  fillRule: "evenodd",
  d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
  clipRule: "evenodd"
}));
const InfoIcon = /* @__PURE__ */ We.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ We.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  clipRule: "evenodd"
}));
const ErrorIcon = /* @__PURE__ */ We.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ We.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
  clipRule: "evenodd"
}));
const CloseIcon = /* @__PURE__ */ We.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /* @__PURE__ */ We.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /* @__PURE__ */ We.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));
const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = We.useState(document.hidden);
  We.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", callback);
    return () => window.removeEventListener("visibilitychange", callback);
  }, []);
  return isDocumentHidden;
};
let toastsCounter = 1;
class Observer {
  constructor() {
    this.subscribe = (subscriber) => {
      this.subscribers.push(subscriber);
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(index, 1);
      };
    };
    this.publish = (data) => {
      this.subscribers.forEach((subscriber) => subscriber(data));
    };
    this.addToast = (data) => {
      this.publish(data);
      this.toasts = [
        ...this.toasts,
        data
      ];
    };
    this.create = (data) => {
      var _data_id;
      const { message, ...rest } = data;
      const id = typeof (data == null ? void 0 : data.id) === "number" || ((_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
      const alreadyExists = this.toasts.find((toast2) => {
        return toast2.id === id;
      });
      const dismissible = data.dismissible === void 0 ? true : data.dismissible;
      if (this.dismissedToasts.has(id)) {
        this.dismissedToasts.delete(id);
      }
      if (alreadyExists) {
        this.toasts = this.toasts.map((toast2) => {
          if (toast2.id === id) {
            this.publish({
              ...toast2,
              ...data,
              id,
              title: message
            });
            return {
              ...toast2,
              ...data,
              id,
              dismissible,
              title: message
            };
          }
          return toast2;
        });
      } else {
        this.addToast({
          title: message,
          ...rest,
          dismissible,
          id
        });
      }
      return id;
    };
    this.dismiss = (id) => {
      if (id) {
        this.dismissedToasts.add(id);
        requestAnimationFrame(() => this.subscribers.forEach((subscriber) => subscriber({
          id,
          dismiss: true
        })));
      } else {
        this.toasts.forEach((toast2) => {
          this.subscribers.forEach((subscriber) => subscriber({
            id: toast2.id,
            dismiss: true
          }));
        });
      }
      return id;
    };
    this.message = (message, data) => {
      return this.create({
        ...data,
        message
      });
    };
    this.error = (message, data) => {
      return this.create({
        ...data,
        message,
        type: "error"
      });
    };
    this.success = (message, data) => {
      return this.create({
        ...data,
        type: "success",
        message
      });
    };
    this.info = (message, data) => {
      return this.create({
        ...data,
        type: "info",
        message
      });
    };
    this.warning = (message, data) => {
      return this.create({
        ...data,
        type: "warning",
        message
      });
    };
    this.loading = (message, data) => {
      return this.create({
        ...data,
        type: "loading",
        message
      });
    };
    this.promise = (promise, data) => {
      if (!data) {
        return;
      }
      let id = void 0;
      if (data.loading !== void 0) {
        id = this.create({
          ...data,
          promise,
          type: "loading",
          message: data.loading,
          description: typeof data.description !== "function" ? data.description : void 0
        });
      }
      const p = Promise.resolve(promise instanceof Function ? promise() : promise);
      let shouldDismiss = id !== void 0;
      let result;
      const originalPromise = p.then(async (response) => {
        result = [
          "resolve",
          response
        ];
        const isReactElementResponse = We.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({
            id,
            type: "default",
            message: response
          });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
          const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !We.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (response instanceof Error) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !We.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (data.success !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !We.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "success",
            description,
            ...toastSettings
          });
        }
      }).catch(async (error) => {
        result = [
          "reject",
          error
        ];
        if (data.error !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
          const description = typeof data.description === "function" ? await data.description(error) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !We.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        }
      }).finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = void 0;
        }
        data.finally == null ? void 0 : data.finally.call(data);
      });
      const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
      if (typeof id !== "string" && typeof id !== "number") {
        return {
          unwrap
        };
      } else {
        return Object.assign(id, {
          unwrap
        });
      }
    };
    this.custom = (jsx, data) => {
      const id = (data == null ? void 0 : data.id) || toastsCounter++;
      this.create({
        jsx: jsx(id),
        id,
        ...data
      });
      return id;
    };
    this.getActiveToasts = () => {
      return this.toasts.filter((toast2) => !this.dismissedToasts.has(toast2.id));
    };
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}
const ToastState = new Observer();
const toastFunction = (message, data) => {
  const id = (data == null ? void 0 : data.id) || toastsCounter++;
  ToastState.addToast({
    title: message,
    ...data,
    id
  });
  return id;
};
const isHttpResponse = (data) => {
  return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
const basicToast = toastFunction;
const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();
const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading
}, {
  getHistory,
  getToasts
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function isAction(action) {
  return action.label !== void 0;
}
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "24px";
const MOBILE_VIEWPORT_OFFSET = "16px";
const TOAST_LIFETIME = 4e3;
const TOAST_WIDTH = 356;
const GAP = 14;
const SWIPE_THRESHOLD = 45;
const TIME_BEFORE_UNMOUNT = 200;
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function getDefaultSwipeDirections(position) {
  const [y, x] = position.split("-");
  const directions = [];
  if (y) {
    directions.push(y);
  }
  if (x) {
    directions.push(x);
  }
  return directions;
}
const Toast = (props) => {
  var _toast_classNames, _toast_classNames1, _toast_classNames2, _toast_classNames3, _toast_classNames4, _toast_classNames5, _toast_classNames6, _toast_classNames7, _toast_classNames8;
  const { invert: ToasterInvert, toast: toast2, unstyled, interacting, setHeights, visibleToasts, heights, index, toasts, expanded, removeToast, defaultRichColors, closeButton: closeButtonFromToaster, style, cancelButtonStyle, actionButtonStyle, className = "", descriptionClassName = "", duration: durationFromToaster, position, gap, expandByDefault, classNames, icons, closeButtonAriaLabel = "Close toast" } = props;
  const [swipeDirection, setSwipeDirection] = We.useState(null);
  const [swipeOutDirection, setSwipeOutDirection] = We.useState(null);
  const [mounted, setMounted] = We.useState(false);
  const [removed, setRemoved] = We.useState(false);
  const [swiping, setSwiping] = We.useState(false);
  const [swipeOut, setSwipeOut] = We.useState(false);
  const [isSwiped, setIsSwiped] = We.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = We.useState(0);
  const [initialHeight, setInitialHeight] = We.useState(0);
  const remainingTime = We.useRef(toast2.duration || durationFromToaster || TOAST_LIFETIME);
  const dragStartTime = We.useRef(null);
  const toastRef = We.useRef(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast2.type;
  const dismissible = toast2.dismissible !== false;
  const toastClassname = toast2.className || "";
  const toastDescriptionClassname = toast2.descriptionClassName || "";
  const heightIndex = We.useMemo(() => heights.findIndex((height) => height.toastId === toast2.id) || 0, [
    heights,
    toast2.id
  ]);
  const closeButton = We.useMemo(() => {
    var _toast_closeButton;
    return (_toast_closeButton = toast2.closeButton) != null ? _toast_closeButton : closeButtonFromToaster;
  }, [
    toast2.closeButton,
    closeButtonFromToaster
  ]);
  const duration = We.useMemo(() => toast2.duration || durationFromToaster || TOAST_LIFETIME, [
    toast2.duration,
    durationFromToaster
  ]);
  const closeTimerStartTimeRef = We.useRef(0);
  const offset = We.useRef(0);
  const lastCloseTimerStartTimeRef = We.useRef(0);
  const pointerStartRef = We.useRef(null);
  const [y, x] = position.split("-");
  const toastsHeightBefore = We.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) {
        return prev;
      }
      return prev + curr.height;
    }, 0);
  }, [
    heights,
    heightIndex
  ]);
  const isDocumentHidden = useIsDocumentHidden();
  const invert = toast2.invert || ToasterInvert;
  const disabled = toastType === "loading";
  offset.current = We.useMemo(() => heightIndex * gap + toastsHeightBefore, [
    heightIndex,
    toastsHeightBefore
  ]);
  We.useEffect(() => {
    remainingTime.current = duration;
  }, [
    duration
  ]);
  We.useEffect(() => {
    setMounted(true);
  }, []);
  We.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;
      setInitialHeight(height);
      setHeights((h) => [
        {
          toastId: toast2.id,
          height,
          position: toast2.position
        },
        ...h
      ]);
      return () => setHeights((h) => h.filter((height2) => height2.toastId !== toast2.id));
    }
  }, [
    setHeights,
    toast2.id
  ]);
  We.useLayoutEffect(() => {
    if (!mounted) return;
    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = "auto";
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;
    setInitialHeight(newHeight);
    setHeights((heights2) => {
      const alreadyExists = heights2.find((height) => height.toastId === toast2.id);
      if (!alreadyExists) {
        return [
          {
            toastId: toast2.id,
            height: newHeight,
            position: toast2.position
          },
          ...heights2
        ];
      } else {
        return heights2.map((height) => height.toastId === toast2.id ? {
          ...height,
          height: newHeight
        } : height);
      }
    });
  }, [
    mounted,
    toast2.title,
    toast2.description,
    setHeights,
    toast2.id,
    toast2.jsx,
    toast2.action,
    toast2.cancel
  ]);
  const deleteToast = We.useCallback(() => {
    setRemoved(true);
    setOffsetBeforeRemove(offset.current);
    setHeights((h) => h.filter((height) => height.toastId !== toast2.id));
    setTimeout(() => {
      removeToast(toast2);
    }, TIME_BEFORE_UNMOUNT);
  }, [
    toast2,
    removeToast,
    setHeights,
    offset
  ]);
  We.useEffect(() => {
    if (toast2.promise && toastType === "loading" || toast2.duration === Infinity || toast2.type === "loading") return;
    let timeoutId;
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
        remainingTime.current = remainingTime.current - elapsedTime;
      }
      lastCloseTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
    };
    const startTimer = () => {
      if (remainingTime.current === Infinity) return;
      closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
      timeoutId = setTimeout(() => {
        toast2.onAutoClose == null ? void 0 : toast2.onAutoClose.call(toast2, toast2);
        deleteToast();
      }, remainingTime.current);
    };
    if (expanded || interacting || isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }
    return () => clearTimeout(timeoutId);
  }, [
    expanded,
    interacting,
    toast2,
    toastType,
    isDocumentHidden,
    deleteToast
  ]);
  We.useEffect(() => {
    if (toast2.delete) {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    }
  }, [
    deleteToast,
    toast2.delete
  ]);
  function getLoadingIcon() {
    var _toast_classNames9;
    if (icons == null ? void 0 : icons.loading) {
      var _toast_classNames12;
      return /* @__PURE__ */ We.createElement("div", {
        className: cn(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames12 = toast2.classNames) == null ? void 0 : _toast_classNames12.loader, "sonner-loader"),
        "data-visible": toastType === "loading"
      }, icons.loading);
    }
    return /* @__PURE__ */ We.createElement(Loader, {
      className: cn(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames9 = toast2.classNames) == null ? void 0 : _toast_classNames9.loader),
      visible: toastType === "loading"
    });
  }
  const icon = toast2.icon || (icons == null ? void 0 : icons[toastType]) || getAsset(toastType);
  var _toast_richColors, _icons_close;
  return /* @__PURE__ */ We.createElement("li", {
    tabIndex: 0,
    ref: toastRef,
    className: cn(className, toastClassname, classNames == null ? void 0 : classNames.toast, toast2 == null ? void 0 : (_toast_classNames = toast2.classNames) == null ? void 0 : _toast_classNames.toast, classNames == null ? void 0 : classNames.default, classNames == null ? void 0 : classNames[toastType], toast2 == null ? void 0 : (_toast_classNames1 = toast2.classNames) == null ? void 0 : _toast_classNames1[toastType]),
    "data-sonner-toast": "",
    "data-rich-colors": (_toast_richColors = toast2.richColors) != null ? _toast_richColors : defaultRichColors,
    "data-styled": !Boolean(toast2.jsx || toast2.unstyled || unstyled),
    "data-mounted": mounted,
    "data-promise": Boolean(toast2.promise),
    "data-swiped": isSwiped,
    "data-removed": removed,
    "data-visible": isVisible,
    "data-y-position": y,
    "data-x-position": x,
    "data-index": index,
    "data-front": isFront,
    "data-swiping": swiping,
    "data-dismissible": dismissible,
    "data-type": toastType,
    "data-invert": invert,
    "data-swipe-out": swipeOut,
    "data-swipe-direction": swipeOutDirection,
    "data-expanded": Boolean(expanded || expandByDefault && mounted),
    "data-testid": toast2.testId,
    style: {
      "--index": index,
      "--toasts-before": index,
      "--z-index": toasts.length - index,
      "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
      "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
      ...style,
      ...toast2.style
    },
    onDragEnd: () => {
      setSwiping(false);
      setSwipeDirection(null);
      pointerStartRef.current = null;
    },
    onPointerDown: (event) => {
      if (event.button === 2) return;
      if (disabled || !dismissible) return;
      dragStartTime.current = /* @__PURE__ */ new Date();
      setOffsetBeforeRemove(offset.current);
      event.target.setPointerCapture(event.pointerId);
      if (event.target.tagName === "BUTTON") return;
      setSwiping(true);
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    },
    onPointerUp: () => {
      var _toastRef_current, _toastRef_current1, _dragStartTime_current;
      if (swipeOut || !dismissible) return;
      pointerStartRef.current = null;
      const swipeAmountX = Number(((_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0);
      const swipeAmountY = Number(((_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0);
      const timeTaken = (/* @__PURE__ */ new Date()).getTime() - ((_dragStartTime_current = dragStartTime.current) == null ? void 0 : _dragStartTime_current.getTime());
      const swipeAmount = swipeDirection === "x" ? swipeAmountX : swipeAmountY;
      const velocity = Math.abs(swipeAmount) / timeTaken;
      if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
        setOffsetBeforeRemove(offset.current);
        toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
        if (swipeDirection === "x") {
          setSwipeOutDirection(swipeAmountX > 0 ? "right" : "left");
        } else {
          setSwipeOutDirection(swipeAmountY > 0 ? "down" : "up");
        }
        deleteToast();
        setSwipeOut(true);
        return;
      } else {
        var _toastRef_current2, _toastRef_current3;
        (_toastRef_current2 = toastRef.current) == null ? void 0 : _toastRef_current2.style.setProperty("--swipe-amount-x", `0px`);
        (_toastRef_current3 = toastRef.current) == null ? void 0 : _toastRef_current3.style.setProperty("--swipe-amount-y", `0px`);
      }
      setIsSwiped(false);
      setSwiping(false);
      setSwipeDirection(null);
    },
    onPointerMove: (event) => {
      var _window_getSelection, _toastRef_current, _toastRef_current1;
      if (!pointerStartRef.current || !dismissible) return;
      const isHighlighted = ((_window_getSelection = window.getSelection()) == null ? void 0 : _window_getSelection.toString().length) > 0;
      if (isHighlighted) return;
      const yDelta = event.clientY - pointerStartRef.current.y;
      const xDelta = event.clientX - pointerStartRef.current.x;
      var _props_swipeDirections;
      const swipeDirections = (_props_swipeDirections = props.swipeDirections) != null ? _props_swipeDirections : getDefaultSwipeDirections(position);
      if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
        setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y");
      }
      let swipeAmount = {
        x: 0,
        y: 0
      };
      const getDampening = (delta) => {
        const factor = Math.abs(delta) / 20;
        return 1 / (1.5 + factor);
      };
      if (swipeDirection === "y") {
        if (swipeDirections.includes("top") || swipeDirections.includes("bottom")) {
          if (swipeDirections.includes("top") && yDelta < 0 || swipeDirections.includes("bottom") && yDelta > 0) {
            swipeAmount.y = yDelta;
          } else {
            const dampenedDelta = yDelta * getDampening(yDelta);
            swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
          }
        }
      } else if (swipeDirection === "x") {
        if (swipeDirections.includes("left") || swipeDirections.includes("right")) {
          if (swipeDirections.includes("left") && xDelta < 0 || swipeDirections.includes("right") && xDelta > 0) {
            swipeAmount.x = xDelta;
          } else {
            const dampenedDelta = xDelta * getDampening(xDelta);
            swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
          }
        }
      }
      if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
        setIsSwiped(true);
      }
      (_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.setProperty("--swipe-amount-x", `${swipeAmount.x}px`);
      (_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.setProperty("--swipe-amount-y", `${swipeAmount.y}px`);
    }
  }, closeButton && !toast2.jsx && toastType !== "loading" ? /* @__PURE__ */ We.createElement("button", {
    "aria-label": closeButtonAriaLabel,
    "data-disabled": disabled,
    "data-close-button": true,
    onClick: disabled || !dismissible ? () => {
    } : () => {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    },
    className: cn(classNames == null ? void 0 : classNames.closeButton, toast2 == null ? void 0 : (_toast_classNames2 = toast2.classNames) == null ? void 0 : _toast_classNames2.closeButton)
  }, (_icons_close = icons == null ? void 0 : icons.close) != null ? _icons_close : CloseIcon) : null, (toastType || toast2.icon || toast2.promise) && toast2.icon !== null && ((icons == null ? void 0 : icons[toastType]) !== null || toast2.icon) ? /* @__PURE__ */ We.createElement("div", {
    "data-icon": "",
    className: cn(classNames == null ? void 0 : classNames.icon, toast2 == null ? void 0 : (_toast_classNames3 = toast2.classNames) == null ? void 0 : _toast_classNames3.icon)
  }, toast2.promise || toast2.type === "loading" && !toast2.icon ? toast2.icon || getLoadingIcon() : null, toast2.type !== "loading" ? icon : null) : null, /* @__PURE__ */ We.createElement("div", {
    "data-content": "",
    className: cn(classNames == null ? void 0 : classNames.content, toast2 == null ? void 0 : (_toast_classNames4 = toast2.classNames) == null ? void 0 : _toast_classNames4.content)
  }, /* @__PURE__ */ We.createElement("div", {
    "data-title": "",
    className: cn(classNames == null ? void 0 : classNames.title, toast2 == null ? void 0 : (_toast_classNames5 = toast2.classNames) == null ? void 0 : _toast_classNames5.title)
  }, toast2.jsx ? toast2.jsx : typeof toast2.title === "function" ? toast2.title() : toast2.title), toast2.description ? /* @__PURE__ */ We.createElement("div", {
    "data-description": "",
    className: cn(descriptionClassName, toastDescriptionClassname, classNames == null ? void 0 : classNames.description, toast2 == null ? void 0 : (_toast_classNames6 = toast2.classNames) == null ? void 0 : _toast_classNames6.description)
  }, typeof toast2.description === "function" ? toast2.description() : toast2.description) : null), /* @__PURE__ */ We.isValidElement(toast2.cancel) ? toast2.cancel : toast2.cancel && isAction(toast2.cancel) ? /* @__PURE__ */ We.createElement("button", {
    "data-button": true,
    "data-cancel": true,
    style: toast2.cancelButtonStyle || cancelButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.cancel)) return;
      if (!dismissible) return;
      toast2.cancel.onClick == null ? void 0 : toast2.cancel.onClick.call(toast2.cancel, event);
      deleteToast();
    },
    className: cn(classNames == null ? void 0 : classNames.cancelButton, toast2 == null ? void 0 : (_toast_classNames7 = toast2.classNames) == null ? void 0 : _toast_classNames7.cancelButton)
  }, toast2.cancel.label) : null, /* @__PURE__ */ We.isValidElement(toast2.action) ? toast2.action : toast2.action && isAction(toast2.action) ? /* @__PURE__ */ We.createElement("button", {
    "data-button": true,
    "data-action": true,
    style: toast2.actionButtonStyle || actionButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.action)) return;
      toast2.action.onClick == null ? void 0 : toast2.action.onClick.call(toast2.action, event);
      if (event.defaultPrevented) return;
      deleteToast();
    },
    className: cn(classNames == null ? void 0 : classNames.actionButton, toast2 == null ? void 0 : (_toast_classNames8 = toast2.classNames) == null ? void 0 : _toast_classNames8.actionButton)
  }, toast2.action.label) : null);
};
function getDocumentDirection() {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr";
  const dirAttribute = document.documentElement.getAttribute("dir");
  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction;
  }
  return dirAttribute;
}
function assignOffset(defaultOffset, mobileOffset) {
  const styles = {};
  [
    defaultOffset,
    mobileOffset
  ].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
    function assignAll(offset2) {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof offset2 === "number" ? `${offset2}px` : offset2;
      });
    }
    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object") {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        if (offset[key] === void 0) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof offset[key] === "number" ? `${offset[key]}px` : offset[key];
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });
  return styles;
}
const Toaster = /* @__PURE__ */ We.forwardRef(function Toaster2(props, ref) {
  const { id, invert, position = "bottom-right", hotkey = [
    "altKey",
    "KeyT"
  ], expand, closeButton, className, offset, mobileOffset, theme = "light", richColors, duration, style, visibleToasts = VISIBLE_TOASTS_AMOUNT, toastOptions, dir = getDocumentDirection(), gap = GAP, icons, containerAriaLabel = "Notifications" } = props;
  const [toasts, setToasts] = We.useState([]);
  const filteredToasts = We.useMemo(() => {
    if (id) {
      return toasts.filter((toast2) => toast2.toasterId === id);
    }
    return toasts.filter((toast2) => !toast2.toasterId);
  }, [
    toasts,
    id
  ]);
  const possiblePositions = We.useMemo(() => {
    return Array.from(new Set([
      position
    ].concat(filteredToasts.filter((toast2) => toast2.position).map((toast2) => toast2.position))));
  }, [
    filteredToasts,
    position
  ]);
  const [heights, setHeights] = We.useState([]);
  const [expanded, setExpanded] = We.useState(false);
  const [interacting, setInteracting] = We.useState(false);
  const [actualTheme, setActualTheme] = We.useState(theme !== "system" ? theme : typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light");
  const listRef = We.useRef(null);
  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  const lastFocusedElementRef = We.useRef(null);
  const isFocusWithinRef = We.useRef(false);
  const removeToast = We.useCallback((toastToRemove) => {
    setToasts((toasts2) => {
      var _toasts_find;
      if (!((_toasts_find = toasts2.find((toast2) => toast2.id === toastToRemove.id)) == null ? void 0 : _toasts_find.delete)) {
        ToastState.dismiss(toastToRemove.id);
      }
      return toasts2.filter(({ id: id2 }) => id2 !== toastToRemove.id);
    });
  }, []);
  We.useEffect(() => {
    return ToastState.subscribe((toast2) => {
      if (toast2.dismiss) {
        requestAnimationFrame(() => {
          setToasts((toasts2) => toasts2.map((t) => t.id === toast2.id ? {
            ...t,
            delete: true
          } : t));
        });
        return;
      }
      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setToasts((toasts2) => {
            const indexOfExistingToast = toasts2.findIndex((t) => t.id === toast2.id);
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts2.slice(0, indexOfExistingToast),
                {
                  ...toasts2[indexOfExistingToast],
                  ...toast2
                },
                ...toasts2.slice(indexOfExistingToast + 1)
              ];
            }
            return [
              toast2,
              ...toasts2
            ];
          });
        });
      });
    });
  }, [
    toasts
  ]);
  We.useEffect(() => {
    if (theme !== "system") {
      setActualTheme(theme);
      return;
    }
    if (theme === "system") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    }
    if (typeof window === "undefined") return;
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      darkMediaQuery.addEventListener("change", ({ matches }) => {
        if (matches) {
          setActualTheme("dark");
        } else {
          setActualTheme("light");
        }
      });
    } catch (error) {
      darkMediaQuery.addListener(({ matches }) => {
        try {
          if (matches) {
            setActualTheme("dark");
          } else {
            setActualTheme("light");
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, [
    theme
  ]);
  We.useEffect(() => {
    if (toasts.length <= 1) {
      setExpanded(false);
    }
  }, [
    toasts
  ]);
  We.useEffect(() => {
    const handleKeyDown = (event) => {
      var _listRef_current;
      const isHotkeyPressed = hotkey.every((key) => event[key] || event.code === key);
      if (isHotkeyPressed) {
        var _listRef_current1;
        setExpanded(true);
        (_listRef_current1 = listRef.current) == null ? void 0 : _listRef_current1.focus();
      }
      if (event.code === "Escape" && (document.activeElement === listRef.current || ((_listRef_current = listRef.current) == null ? void 0 : _listRef_current.contains(document.activeElement)))) {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hotkey
  ]);
  We.useEffect(() => {
    if (listRef.current) {
      return () => {
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus({
            preventScroll: true
          });
          lastFocusedElementRef.current = null;
          isFocusWithinRef.current = false;
        }
      };
    }
  }, [
    listRef.current
  ]);
  return (
    // Remove item from normal navigation flow, only available via hotkey
    /* @__PURE__ */ We.createElement("section", {
      ref,
      "aria-label": `${containerAriaLabel} ${hotkeyLabel}`,
      tabIndex: -1,
      "aria-live": "polite",
      "aria-relevant": "additions text",
      "aria-atomic": "false",
      suppressHydrationWarning: true
    }, possiblePositions.map((position2, index) => {
      var _heights_;
      const [y, x] = position2.split("-");
      if (!filteredToasts.length) return null;
      return /* @__PURE__ */ We.createElement("ol", {
        key: position2,
        dir: dir === "auto" ? getDocumentDirection() : dir,
        tabIndex: -1,
        ref: listRef,
        className,
        "data-sonner-toaster": true,
        "data-sonner-theme": actualTheme,
        "data-y-position": y,
        "data-x-position": x,
        style: {
          "--front-toast-height": `${((_heights_ = heights[0]) == null ? void 0 : _heights_.height) || 0}px`,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${gap}px`,
          ...style,
          ...assignOffset(offset, mobileOffset)
        },
        onBlur: (event) => {
          if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
            isFocusWithinRef.current = false;
            if (lastFocusedElementRef.current) {
              lastFocusedElementRef.current.focus({
                preventScroll: true
              });
              lastFocusedElementRef.current = null;
            }
          }
        },
        onFocus: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          if (!isFocusWithinRef.current) {
            isFocusWithinRef.current = true;
            lastFocusedElementRef.current = event.relatedTarget;
          }
        },
        onMouseEnter: () => setExpanded(true),
        onMouseMove: () => setExpanded(true),
        onMouseLeave: () => {
          if (!interacting) {
            setExpanded(false);
          }
        },
        onDragEnd: () => setExpanded(false),
        onPointerDown: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          setInteracting(true);
        },
        onPointerUp: () => setInteracting(false)
      }, filteredToasts.filter((toast2) => !toast2.position && index === 0 || toast2.position === position2).map((toast2, index2) => {
        var _toastOptions_duration, _toastOptions_closeButton;
        return /* @__PURE__ */ We.createElement(Toast, {
          key: toast2.id,
          icons,
          index: index2,
          toast: toast2,
          defaultRichColors: richColors,
          duration: (_toastOptions_duration = toastOptions == null ? void 0 : toastOptions.duration) != null ? _toastOptions_duration : duration,
          className: toastOptions == null ? void 0 : toastOptions.className,
          descriptionClassName: toastOptions == null ? void 0 : toastOptions.descriptionClassName,
          invert,
          visibleToasts,
          closeButton: (_toastOptions_closeButton = toastOptions == null ? void 0 : toastOptions.closeButton) != null ? _toastOptions_closeButton : closeButton,
          interacting,
          position: position2,
          style: toastOptions == null ? void 0 : toastOptions.style,
          unstyled: toastOptions == null ? void 0 : toastOptions.unstyled,
          classNames: toastOptions == null ? void 0 : toastOptions.classNames,
          cancelButtonStyle: toastOptions == null ? void 0 : toastOptions.cancelButtonStyle,
          actionButtonStyle: toastOptions == null ? void 0 : toastOptions.actionButtonStyle,
          closeButtonAriaLabel: toastOptions == null ? void 0 : toastOptions.closeButtonAriaLabel,
          removeToast,
          toasts: filteredToasts.filter((t) => t.position == toast2.position),
          heights: heights.filter((h) => h.position == toast2.position),
          setHeights,
          expandByDefault: expand,
          gap,
          expanded,
          swipeDirections: props.swipeDirections
        });
      }));
    }))
  );
});
const DialogTrigger = /* @__PURE__ */ reactExports.forwardRef(function DialogTrigger2(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    id: idProp,
    payload,
    handle,
    ...elementProps
  } = componentProps;
  const dialogRootContext = useDialogRootContext(true);
  const store = handle?.store ?? dialogRootContext?.store;
  if (!store) {
    throw new Error(formatErrorMessage(79));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const floatingContext = store.useState("floatingRootContext");
  const isOpenedByThisTrigger = store.useState("isOpenedByTrigger", thisTriggerId);
  const triggerElementRef = reactExports.useRef(null);
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload
  });
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const click = useClick(floatingContext, {
    enabled: floatingContext != null
  });
  const localInteractionProps = useInteractions([click]);
  const state = reactExports.useMemo(() => ({
    disabled,
    open: isOpenedByThisTrigger
  }), [disabled, isOpenedByThisTrigger]);
  const rootTriggerProps = store.useState("triggerProps", isMountedByThisTrigger);
  return useRenderElement("button", componentProps, {
    state,
    ref: [buttonRef, forwardedRef, registerTrigger, triggerElementRef],
    props: [localInteractionProps.getReferenceProps(), rootTriggerProps, {
      [CLICK_TRIGGER_IDENTIFIER]: "",
      id: thisTriggerId
    }, elementProps, getButtonProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
});
const TabsRootContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useTabsRootContext() {
  const context = reactExports.useContext(TabsRootContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(64));
  }
  return context;
}
let TabsRootDataAttributes = /* @__PURE__ */ (function(TabsRootDataAttributes2) {
  TabsRootDataAttributes2["activationDirection"] = "data-activation-direction";
  TabsRootDataAttributes2["orientation"] = "data-orientation";
  return TabsRootDataAttributes2;
})({});
const tabsStateAttributesMapping = {
  tabActivationDirection: (dir) => ({
    [TabsRootDataAttributes.activationDirection]: dir
  })
};
const TabsRoot = /* @__PURE__ */ reactExports.forwardRef(function TabsRoot2(componentProps, forwardedRef) {
  const {
    className,
    defaultValue: defaultValueProp = 0,
    onValueChange: onValueChangeProp,
    orientation = "horizontal",
    render,
    value: valueProp,
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  const hasExplicitDefaultValueProp = Object.hasOwn(componentProps, "defaultValue");
  const tabPanelRefs = reactExports.useRef([]);
  const [mountedTabPanels, setMountedTabPanels] = reactExports.useState(() => /* @__PURE__ */ new Map());
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValueProp,
    name: "Tabs",
    state: "value"
  });
  const isControlled = valueProp !== void 0;
  const [tabMap, setTabMap] = reactExports.useState(() => /* @__PURE__ */ new Map());
  const [tabActivationDirection, setTabActivationDirection] = reactExports.useState("none");
  const onValueChange = useStableCallback((newValue, eventDetails) => {
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValue(newValue);
    setTabActivationDirection(eventDetails.activationDirection);
  });
  const registerMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels((prev) => {
      if (prev.get(panelValue) === panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.set(panelValue, panelId);
      return next;
    });
  });
  const unregisterMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels((prev) => {
      if (!prev.has(panelValue) || prev.get(panelValue) !== panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(panelValue);
      return next;
    });
  });
  const getTabPanelIdByValue = reactExports.useCallback((tabValue) => {
    return mountedTabPanels.get(tabValue);
  }, [mountedTabPanels]);
  const getTabIdByPanelValue = reactExports.useCallback((tabPanelValue) => {
    for (const tabMetadata of tabMap.values()) {
      if (tabPanelValue === tabMetadata?.value) {
        return tabMetadata?.id;
      }
    }
    return void 0;
  }, [tabMap]);
  const getTabElementBySelectedValue = reactExports.useCallback((selectedValue) => {
    if (selectedValue === void 0) {
      return null;
    }
    for (const [tabElement, tabMetadata] of tabMap.entries()) {
      if (tabMetadata != null && selectedValue === (tabMetadata.value ?? tabMetadata.index)) {
        return tabElement;
      }
    }
    return null;
  }, [tabMap]);
  const tabsContextValue = reactExports.useMemo(() => ({
    direction,
    getTabElementBySelectedValue,
    getTabIdByPanelValue,
    getTabPanelIdByValue,
    onValueChange,
    orientation,
    registerMountedTabPanel,
    setTabMap,
    unregisterMountedTabPanel,
    tabActivationDirection,
    value
  }), [direction, getTabElementBySelectedValue, getTabIdByPanelValue, getTabPanelIdByValue, onValueChange, orientation, registerMountedTabPanel, setTabMap, unregisterMountedTabPanel, tabActivationDirection, value]);
  const selectedTabMetadata = reactExports.useMemo(() => {
    for (const tabMetadata of tabMap.values()) {
      if (tabMetadata != null && tabMetadata.value === value) {
        return tabMetadata;
      }
    }
    return void 0;
  }, [tabMap, value]);
  const firstEnabledTabValue = reactExports.useMemo(() => {
    for (const tabMetadata of tabMap.values()) {
      if (tabMetadata != null && !tabMetadata.disabled) {
        return tabMetadata.value;
      }
    }
    return void 0;
  }, [tabMap]);
  useIsoLayoutEffect(() => {
    if (isControlled || tabMap.size === 0) {
      return;
    }
    const selectionIsDisabled = selectedTabMetadata?.disabled;
    const selectionIsMissing = selectedTabMetadata == null && value !== null;
    const shouldHonorExplicitDefaultSelection = hasExplicitDefaultValueProp && selectionIsDisabled && value === defaultValueProp;
    if (shouldHonorExplicitDefaultSelection) {
      return;
    }
    if (!selectionIsDisabled && !selectionIsMissing) {
      return;
    }
    const fallbackValue = firstEnabledTabValue ?? null;
    if (value === fallbackValue) {
      return;
    }
    setValue(fallbackValue);
    setTabActivationDirection("none");
  }, [defaultValueProp, firstEnabledTabValue, hasExplicitDefaultValueProp, isControlled, selectedTabMetadata, setTabActivationDirection, setValue, tabMap, value]);
  const state = {
    orientation,
    tabActivationDirection
  };
  const element = useRenderElement("div", componentProps, {
    state,
    ref: forwardedRef,
    props: elementProps,
    stateAttributesMapping: tabsStateAttributesMapping
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsRootContext.Provider, {
    value: tabsContextValue,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompositeList, {
      elementsRef: tabPanelRefs,
      children: element
    })
  });
});
const ACTIVE_COMPOSITE_ITEM = "data-composite-item-active";
const TabsListContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useTabsListContext() {
  const context = reactExports.useContext(TabsListContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(65));
  }
  return context;
}
const TabsTab = /* @__PURE__ */ reactExports.forwardRef(function TabsTab2(componentProps, forwardedRef) {
  const {
    className,
    disabled = false,
    render,
    value,
    id: idProp,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    value: activeTabValue,
    getTabPanelIdByValue,
    orientation
  } = useTabsRootContext();
  const {
    activateOnFocus,
    highlightedTabIndex,
    onTabActivation,
    setHighlightedTabIndex,
    tabsListElement
  } = useTabsListContext();
  const id = useBaseUiId(idProp);
  const tabMetadata = reactExports.useMemo(() => ({
    disabled,
    id,
    value
  }), [disabled, id, value]);
  const {
    compositeProps,
    compositeRef,
    index
    // hook is used instead of the CompositeItem component
    // because the index is needed for Tab internals
  } = useCompositeItem({
    metadata: tabMetadata
  });
  const active = value === activeTabValue;
  const isNavigatingRef = reactExports.useRef(false);
  useIsoLayoutEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    if (!(active && index > -1 && highlightedTabIndex !== index)) {
      return;
    }
    const listElement = tabsListElement;
    if (listElement != null) {
      const activeEl = activeElement(ownerDocument(listElement));
      if (activeEl && contains(listElement, activeEl)) {
        return;
      }
    }
    if (!disabled) {
      setHighlightedTabIndex(index);
    }
  }, [active, index, highlightedTabIndex, setHighlightedTabIndex, disabled, tabsListElement]);
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true
  });
  const tabPanelId = getTabPanelIdByValue(value);
  const isPressingRef = reactExports.useRef(false);
  const isMainButtonRef = reactExports.useRef(false);
  function onClick(event) {
    if (active || disabled) {
      return;
    }
    onTabActivation(value, createChangeEventDetails(none, event.nativeEvent, void 0, {
      activationDirection: "none"
    }));
  }
  function onFocus(event) {
    if (active) {
      return;
    }
    if (index > -1 && !disabled) {
      setHighlightedTabIndex(index);
    }
    if (disabled) {
      return;
    }
    if (activateOnFocus && (!isPressingRef.current || // keyboard or touch focus
    isPressingRef.current && isMainButtonRef.current)) {
      onTabActivation(value, createChangeEventDetails(none, event.nativeEvent, void 0, {
        activationDirection: "none"
      }));
    }
  }
  function onPointerDown(event) {
    if (active || disabled) {
      return;
    }
    isPressingRef.current = true;
    function handlePointerUp() {
      isPressingRef.current = false;
      isMainButtonRef.current = false;
    }
    if (!event.button || event.button === 0) {
      isMainButtonRef.current = true;
      const doc = ownerDocument(event.currentTarget);
      doc.addEventListener("pointerup", handlePointerUp, {
        once: true
      });
    }
  }
  const state = reactExports.useMemo(() => ({
    disabled,
    active,
    orientation
  }), [disabled, active, orientation]);
  const element = useRenderElement("button", componentProps, {
    state,
    ref: [forwardedRef, buttonRef, compositeRef],
    props: [compositeProps, {
      role: "tab",
      "aria-controls": tabPanelId,
      "aria-selected": active,
      id,
      onClick,
      onFocus,
      onPointerDown,
      [ACTIVE_COMPOSITE_ITEM]: active ? "" : void 0,
      onKeyDownCapture() {
        isNavigatingRef.current = true;
      }
    }, elementProps, getButtonProps]
  });
  return element;
});
let TabsPanelDataAttributes = /* @__PURE__ */ (function(TabsPanelDataAttributes2) {
  TabsPanelDataAttributes2["index"] = "data-index";
  TabsPanelDataAttributes2["activationDirection"] = "data-activation-direction";
  TabsPanelDataAttributes2["orientation"] = "data-orientation";
  TabsPanelDataAttributes2["hidden"] = "data-hidden";
  return TabsPanelDataAttributes2;
})({});
const TabsPanel = /* @__PURE__ */ reactExports.forwardRef(function TabPanel(componentProps, forwardedRef) {
  const {
    className,
    value,
    render,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    value: selectedValue,
    getTabIdByPanelValue,
    orientation,
    tabActivationDirection,
    registerMountedTabPanel,
    unregisterMountedTabPanel
  } = useTabsRootContext();
  const id = useBaseUiId();
  const metadata = reactExports.useMemo(() => ({
    id,
    value
  }), [id, value]);
  const {
    ref: listItemRef,
    index
  } = useCompositeListItem({
    metadata
  });
  const hidden = value !== selectedValue;
  const correspondingTabId = getTabIdByPanelValue(value);
  const state = reactExports.useMemo(() => ({
    hidden,
    orientation,
    tabActivationDirection
  }), [hidden, orientation, tabActivationDirection]);
  const element = useRenderElement("div", componentProps, {
    state,
    ref: [forwardedRef, listItemRef],
    props: [{
      "aria-labelledby": correspondingTabId,
      hidden,
      id: id ?? void 0,
      role: "tabpanel",
      tabIndex: hidden ? -1 : 0,
      [TabsPanelDataAttributes.index]: index
    }, elementProps],
    stateAttributesMapping: tabsStateAttributesMapping
  });
  useIsoLayoutEffect(() => {
    if (hidden && !keepMounted) {
      return void 0;
    }
    if (id == null) {
      return void 0;
    }
    registerMountedTabPanel(value, id);
    return () => {
      unregisterMountedTabPanel(value, id);
    };
  }, [hidden, keepMounted, value, id, registerMountedTabPanel, unregisterMountedTabPanel]);
  const shouldRender = !hidden || keepMounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
function isElementDisabled(element) {
  return element == null || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}
const EMPTY_ARRAY = [];
function useCompositeRoot(params) {
  const {
    itemSizes,
    cols = 1,
    loopFocus = true,
    dense = false,
    orientation = "both",
    direction,
    highlightedIndex: externalHighlightedIndex,
    onHighlightedIndexChange: externalSetHighlightedIndex,
    rootRef: externalRef,
    enableHomeAndEndKeys = false,
    stopEventPropagation = false,
    disabledIndices,
    modifierKeys = EMPTY_ARRAY
  } = params;
  const [internalHighlightedIndex, internalSetHighlightedIndex] = reactExports.useState(0);
  const isGrid = cols > 1;
  const rootRef = reactExports.useRef(null);
  const mergedRef = useMergedRefs(rootRef, externalRef);
  const elementsRef = reactExports.useRef([]);
  const hasSetDefaultIndexRef = reactExports.useRef(false);
  const highlightedIndex = externalHighlightedIndex ?? internalHighlightedIndex;
  const onHighlightedIndexChange = useStableCallback((index, shouldScrollIntoView = false) => {
    (externalSetHighlightedIndex ?? internalSetHighlightedIndex)(index);
    if (shouldScrollIntoView) {
      const newActiveItem = elementsRef.current[index];
      scrollIntoViewIfNeeded(rootRef.current, newActiveItem, direction, orientation);
    }
  });
  const onMapChange = useStableCallback((map) => {
    if (map.size === 0 || hasSetDefaultIndexRef.current) {
      return;
    }
    hasSetDefaultIndexRef.current = true;
    const sortedElements = Array.from(map.keys());
    const activeItem = sortedElements.find((compositeElement) => compositeElement?.hasAttribute(ACTIVE_COMPOSITE_ITEM)) ?? null;
    const activeIndex = activeItem ? sortedElements.indexOf(activeItem) : -1;
    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex);
    }
    scrollIntoViewIfNeeded(rootRef.current, activeItem, direction, orientation);
  });
  const props = reactExports.useMemo(() => ({
    "aria-orientation": orientation === "both" ? void 0 : orientation,
    ref: mergedRef,
    onFocus(event) {
      const element = rootRef.current;
      if (!element || !isNativeInput(event.target)) {
        return;
      }
      event.target.setSelectionRange(0, event.target.value.length ?? 0);
    },
    onKeyDown(event) {
      const RELEVANT_KEYS = enableHomeAndEndKeys ? ALL_KEYS : ARROW_KEYS;
      if (!RELEVANT_KEYS.has(event.key)) {
        return;
      }
      if (isModifierKeySet(event, modifierKeys)) {
        return;
      }
      const element = rootRef.current;
      if (!element) {
        return;
      }
      const isRtl = direction === "rtl";
      const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT;
      const forwardKey = {
        horizontal: horizontalForwardKey,
        vertical: ARROW_DOWN,
        both: horizontalForwardKey
      }[orientation];
      const horizontalBackwardKey = isRtl ? ARROW_RIGHT : ARROW_LEFT;
      const backwardKey = {
        horizontal: horizontalBackwardKey,
        vertical: ARROW_UP,
        both: horizontalBackwardKey
      }[orientation];
      if (isNativeInput(event.target) && !isElementDisabled(event.target)) {
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;
        const textContent = event.target.value ?? "";
        if (selectionStart == null || event.shiftKey || selectionStart !== selectionEnd) {
          return;
        }
        if (event.key !== backwardKey && selectionStart < textContent.length) {
          return;
        }
        if (event.key !== forwardKey && selectionStart > 0) {
          return;
        }
      }
      let nextIndex = highlightedIndex;
      const minIndex = getMinListIndex(elementsRef, disabledIndices);
      const maxIndex = getMaxListIndex(elementsRef, disabledIndices);
      if (isGrid) {
        const sizes = itemSizes || Array.from({
          length: elementsRef.current.length
        }, () => ({
          width: 1,
          height: 1
        }));
        const cellMap = createGridCellMap(sizes, cols, dense);
        const minGridIndex = cellMap.findIndex((index) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices));
        const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices) ? cellIndex : foundIndex, -1);
        nextIndex = cellMap[getGridNavigatedIndex({
          current: cellMap.map((itemIndex) => itemIndex ? elementsRef.current[itemIndex] : null)
        }, {
          event,
          orientation,
          loopFocus,
          cols,
          // treat undefined (empty grid spaces) as disabled indices so we
          // don't end up in them
          disabledIndices: getGridCellIndices([...disabledIndices || elementsRef.current.map((_, index) => isListIndexDisabled(elementsRef, index) ? index : void 0), void 0], cellMap),
          minIndex: minGridIndex,
          maxIndex: maxGridIndex,
          prevIndex: getGridCellIndexOfCorner(
            highlightedIndex > maxIndex ? minIndex : highlightedIndex,
            sizes,
            cellMap,
            cols,
            // use a corner matching the edge closest to the direction we're
            // moving in so we don't end up in the same item. Prefer
            // top/left over bottom/right.
            // eslint-disable-next-line no-nested-ternary
            event.key === ARROW_DOWN ? "bl" : event.key === ARROW_RIGHT ? "tr" : "tl"
          ),
          rtl: isRtl
        })];
      }
      const forwardKeys = {
        horizontal: [horizontalForwardKey],
        vertical: [ARROW_DOWN],
        both: [horizontalForwardKey, ARROW_DOWN]
      }[orientation];
      const backwardKeys = {
        horizontal: [horizontalBackwardKey],
        vertical: [ARROW_UP],
        both: [horizontalBackwardKey, ARROW_UP]
      }[orientation];
      const preventedKeys = isGrid ? RELEVANT_KEYS : {
        horizontal: enableHomeAndEndKeys ? HORIZONTAL_KEYS_WITH_EXTRA_KEYS : HORIZONTAL_KEYS,
        vertical: enableHomeAndEndKeys ? VERTICAL_KEYS_WITH_EXTRA_KEYS : VERTICAL_KEYS,
        both: RELEVANT_KEYS
      }[orientation];
      if (enableHomeAndEndKeys) {
        if (event.key === HOME) {
          nextIndex = minIndex;
        } else if (event.key === END) {
          nextIndex = maxIndex;
        }
      }
      if (nextIndex === highlightedIndex && (forwardKeys.includes(event.key) || backwardKeys.includes(event.key))) {
        if (loopFocus && nextIndex === maxIndex && forwardKeys.includes(event.key)) {
          nextIndex = minIndex;
        } else if (loopFocus && nextIndex === minIndex && backwardKeys.includes(event.key)) {
          nextIndex = maxIndex;
        } else {
          nextIndex = findNonDisabledListIndex(elementsRef, {
            startingIndex: nextIndex,
            decrement: backwardKeys.includes(event.key),
            disabledIndices
          });
        }
      }
      if (nextIndex !== highlightedIndex && !isIndexOutOfListBounds(elementsRef, nextIndex)) {
        if (stopEventPropagation) {
          event.stopPropagation();
        }
        if (preventedKeys.has(event.key)) {
          event.preventDefault();
        }
        onHighlightedIndexChange(nextIndex, true);
        queueMicrotask(() => {
          elementsRef.current[nextIndex]?.focus();
        });
      }
    }
  }), [cols, dense, direction, disabledIndices, elementsRef, enableHomeAndEndKeys, highlightedIndex, isGrid, itemSizes, loopFocus, mergedRef, modifierKeys, onHighlightedIndexChange, orientation, stopEventPropagation]);
  return reactExports.useMemo(() => ({
    props,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices,
    onMapChange,
    relayKeyboardEvent: props.onKeyDown
  }), [props, highlightedIndex, onHighlightedIndexChange, elementsRef, disabledIndices, onMapChange]);
}
function isModifierKeySet(event, ignoredModifierKeys) {
  for (const key of MODIFIER_KEYS.values()) {
    if (ignoredModifierKeys.includes(key)) {
      continue;
    }
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}
function CompositeRoot(componentProps) {
  const {
    render,
    className,
    refs = EMPTY_ARRAY$1,
    props = EMPTY_ARRAY$1,
    state = EMPTY_OBJECT,
    stateAttributesMapping,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    orientation,
    dense,
    itemSizes,
    loopFocus,
    cols,
    enableHomeAndEndKeys,
    onMapChange: onMapChangeProp,
    stopEventPropagation = true,
    rootRef,
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    tag = "div",
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  const {
    props: defaultProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    onMapChange: onMapChangeUnwrapped,
    relayKeyboardEvent
  } = useCompositeRoot({
    itemSizes,
    cols,
    loopFocus,
    dense,
    orientation,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    rootRef,
    stopEventPropagation,
    enableHomeAndEndKeys,
    direction,
    disabledIndices,
    modifierKeys
  });
  const element = useRenderElement(tag, componentProps, {
    state,
    ref: refs,
    props: [defaultProps, ...props, elementProps],
    stateAttributesMapping
  });
  const contextValue = reactExports.useMemo(() => ({
    highlightedIndex,
    onHighlightedIndexChange,
    highlightItemOnHover,
    relayKeyboardEvent
  }), [highlightedIndex, onHighlightedIndexChange, highlightItemOnHover, relayKeyboardEvent]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CompositeRootContext.Provider, {
    value: contextValue,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompositeList, {
      elementsRef,
      onMapChange: (newMap) => {
        onMapChangeProp?.(newMap);
        onMapChangeUnwrapped(newMap);
      },
      children: element
    })
  });
}
const TabsList$1 = /* @__PURE__ */ reactExports.forwardRef(function TabsList2(componentProps, forwardedRef) {
  const {
    activateOnFocus = false,
    className,
    loopFocus = true,
    render,
    ...elementProps
  } = componentProps;
  const {
    getTabElementBySelectedValue,
    onValueChange,
    orientation,
    value,
    setTabMap,
    tabActivationDirection
  } = useTabsRootContext();
  const [highlightedTabIndex, setHighlightedTabIndex] = reactExports.useState(0);
  const [tabsListElement, setTabsListElement] = reactExports.useState(null);
  const detectActivationDirection = useActivationDirectionDetector(
    value,
    // the old value
    orientation,
    tabsListElement,
    getTabElementBySelectedValue
  );
  const onTabActivation = useStableCallback((newValue, eventDetails) => {
    if (newValue !== value) {
      const activationDirection = detectActivationDirection(newValue);
      eventDetails.activationDirection = activationDirection;
      onValueChange(newValue, eventDetails);
    }
  });
  const state = reactExports.useMemo(() => ({
    orientation,
    tabActivationDirection
  }), [orientation, tabActivationDirection]);
  const defaultProps = {
    "aria-orientation": orientation === "vertical" ? "vertical" : void 0,
    role: "tablist"
  };
  const tabsListContextValue = reactExports.useMemo(() => ({
    activateOnFocus,
    highlightedTabIndex,
    onTabActivation,
    setHighlightedTabIndex,
    tabsListElement,
    value
  }), [activateOnFocus, highlightedTabIndex, onTabActivation, setHighlightedTabIndex, tabsListElement, value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsListContext.Provider, {
    value: tabsListContextValue,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompositeRoot, {
      render,
      className,
      state,
      refs: [forwardedRef, setTabsListElement],
      props: [defaultProps, elementProps],
      stateAttributesMapping: tabsStateAttributesMapping,
      highlightedIndex: highlightedTabIndex,
      enableHomeAndEndKeys: true,
      loopFocus,
      orientation,
      onHighlightedIndexChange: setHighlightedTabIndex,
      onMapChange: setTabMap,
      disabledIndices: EMPTY_ARRAY$1
    })
  });
});
function getInset(tab, tabsList) {
  const {
    left: tabLeft,
    top: tabTop
  } = tab.getBoundingClientRect();
  const {
    left: listLeft,
    top: listTop
  } = tabsList.getBoundingClientRect();
  const left = tabLeft - listLeft;
  const top = tabTop - listTop;
  return {
    left,
    top
  };
}
function useActivationDirectionDetector(activeTabValue, orientation, tabsListElement, getTabElement) {
  const [previousTabEdge, setPreviousTabEdge] = reactExports.useState(null);
  useIsoLayoutEffect(() => {
    if (activeTabValue == null || tabsListElement == null) {
      setPreviousTabEdge(null);
      return;
    }
    const activeTab = getTabElement(activeTabValue);
    if (activeTab == null) {
      setPreviousTabEdge(null);
      return;
    }
    const {
      left,
      top
    } = getInset(activeTab, tabsListElement);
    setPreviousTabEdge(orientation === "horizontal" ? left : top);
  }, [orientation, getTabElement, tabsListElement, activeTabValue]);
  return reactExports.useCallback((newValue) => {
    if (newValue === activeTabValue) {
      return "none";
    }
    if (newValue == null) {
      setPreviousTabEdge(null);
      return "none";
    }
    if (newValue != null && tabsListElement != null) {
      const activeTabElement = getTabElement(newValue);
      if (activeTabElement != null) {
        const {
          left,
          top
        } = getInset(activeTabElement, tabsListElement);
        if (previousTabEdge == null) {
          setPreviousTabEdge(orientation === "horizontal" ? left : top);
          return "none";
        }
        if (orientation === "horizontal") {
          if (left < previousTabEdge) {
            setPreviousTabEdge(left);
            return "left";
          }
          if (left > previousTabEdge) {
            setPreviousTabEdge(left);
            return "right";
          }
        } else if (top < previousTabEdge) {
          setPreviousTabEdge(top);
          return "up";
        } else if (top > previousTabEdge) {
          setPreviousTabEdge(top);
          return "down";
        }
      }
    }
    return "none";
  }, [getTabElement, orientation, previousTabEdge, tabsListElement, activeTabValue]);
}
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TabsRoot,
    {
      "data-slot": "tabs",
      "data-orientation": orientation,
      className: cn$1(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      ),
      ...props
    }
  );
}
const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TabsList$1,
    {
      "data-slot": "tabs-list",
      "data-variant": variant,
      className: cn$1(tabsListVariants({ variant }), className),
      ...props
    }
  );
}
function TabsTrigger({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TabsTab,
    {
      "data-slot": "tabs-trigger",
      className: cn$1(
        "gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      ),
      ...props
    }
  );
}
function TabsContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TabsPanel,
    {
      "data-slot": "tabs-content",
      className: cn$1("text-sm flex-1 outline-none", className),
      ...props
    }
  );
}
const FieldItemContext = /* @__PURE__ */ reactExports.createContext({
  disabled: false
});
function useFieldItemContext() {
  const context = reactExports.useContext(FieldItemContext);
  return context;
}
const CheckboxGroupContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useCheckboxGroupContext(optional = true) {
  const context = reactExports.useContext(CheckboxGroupContext);
  if (context === void 0 && !optional) {
    throw new Error(formatErrorMessage(3));
  }
  return context;
}
const useModManagementStore = create$1()(
  persist(
    (set, get) => ({
      // Initial state with some pre-installed BONELAB mods
      installedModsByGame: {
        bonelab: /* @__PURE__ */ new Set([
          "772e464e-aba3-4c0e-be61-0f3efe588b60",
          // BoneLib
          "f21c391c-0bc5-431d-a233-95323b95e01b"
          // r2modman
        ])
      },
      enabledModsByGame: {
        bonelab: /* @__PURE__ */ new Set([
          "772e464e-aba3-4c0e-be61-0f3efe588b60",
          // BoneLib (enabled)
          "f21c391c-0bc5-431d-a233-95323b95e01b"
          // r2modman (enabled)
        ])
      },
      installedModVersionsByGame: {
        bonelab: {
          "772e464e-aba3-4c0e-be61-0f3efe588b60": "1.0.0",
          // BoneLib
          "f21c391c-0bc5-431d-a233-95323b95e01b": "1.0.0"
          // r2modman
        }
      },
      dependencyWarningsByGame: {},
      uninstallingMods: /* @__PURE__ */ new Set(),
      installMod: (gameId, modId, version) => {
        const currentInstalled = get().installedModsByGame;
        const currentEnabled = get().enabledModsByGame;
        const currentVersions = get().installedModVersionsByGame;
        const installedSet = currentInstalled[gameId] || /* @__PURE__ */ new Set();
        const enabledSet = currentEnabled[gameId] || /* @__PURE__ */ new Set();
        const versionsMap = currentVersions[gameId] || {};
        installedSet.add(modId);
        enabledSet.add(modId);
        versionsMap[modId] = version;
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: new Set(installedSet)
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: new Set(enabledSet)
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: { ...versionsMap }
          }
        });
      },
      uninstallMod: async (gameId, modId) => {
        const currentUninstalling = get().uninstallingMods;
        currentUninstalling.add(modId);
        set({
          uninstallingMods: new Set(currentUninstalling)
        });
        await new Promise((resolve) => setTimeout(resolve, 1e3 + Math.random() * 1e3));
        const currentInstalled = get().installedModsByGame;
        const currentEnabled = get().enabledModsByGame;
        const currentVersions = get().installedModVersionsByGame;
        const currentWarnings = get().dependencyWarningsByGame;
        const installedSet = currentInstalled[gameId] || /* @__PURE__ */ new Set();
        const enabledSet = currentEnabled[gameId] || /* @__PURE__ */ new Set();
        const versionsMap = { ...currentVersions[gameId] || {} };
        const warningsMap = { ...currentWarnings[gameId] || {} };
        installedSet.delete(modId);
        enabledSet.delete(modId);
        delete versionsMap[modId];
        delete warningsMap[modId];
        const updatedUninstalling = get().uninstallingMods;
        updatedUninstalling.delete(modId);
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: new Set(installedSet)
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: new Set(enabledSet)
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: versionsMap
          },
          dependencyWarningsByGame: {
            ...currentWarnings,
            [gameId]: warningsMap
          },
          uninstallingMods: new Set(updatedUninstalling)
        });
        toast.success("Uninstalled successfully");
      },
      uninstallAllMods: (gameId) => {
        const currentInstalled = get().installedModsByGame;
        const currentEnabled = get().enabledModsByGame;
        const currentVersions = get().installedModVersionsByGame;
        const currentWarnings = get().dependencyWarningsByGame;
        const installedSet = currentInstalled[gameId] || /* @__PURE__ */ new Set();
        const modCount = installedSet.size;
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: /* @__PURE__ */ new Set()
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: /* @__PURE__ */ new Set()
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: {}
          },
          dependencyWarningsByGame: {
            ...currentWarnings,
            [gameId]: {}
          }
        });
        if (modCount > 0) {
          toast.success(`Uninstalled ${modCount} mod${modCount === 1 ? "" : "s"} successfully`);
        } else {
          toast.info("No mods to uninstall");
        }
        return modCount;
      },
      isModInstalled: (gameId, modId) => {
        const gameSet = get().installedModsByGame[gameId];
        return gameSet ? gameSet.has(modId) : false;
      },
      getInstalledModIds: (gameId) => {
        const gameSet = get().installedModsByGame[gameId];
        return gameSet ? Array.from(gameSet) : [];
      },
      getInstalledVersion: (gameId, modId) => {
        const versionsMap = get().installedModVersionsByGame[gameId];
        return versionsMap ? versionsMap[modId] : void 0;
      },
      enableMod: (gameId, modId) => {
        const current = get().enabledModsByGame;
        const gameSet = current[gameId] || /* @__PURE__ */ new Set();
        gameSet.add(modId);
        set({
          enabledModsByGame: {
            ...current,
            [gameId]: new Set(gameSet)
          }
        });
      },
      disableMod: (gameId, modId) => {
        const current = get().enabledModsByGame;
        const gameSet = current[gameId] || /* @__PURE__ */ new Set();
        gameSet.delete(modId);
        set({
          enabledModsByGame: {
            ...current,
            [gameId]: new Set(gameSet)
          }
        });
      },
      toggleMod: (gameId, modId) => {
        const isEnabled = get().isModEnabled(gameId, modId);
        if (isEnabled) {
          get().disableMod(gameId, modId);
        } else {
          get().enableMod(gameId, modId);
        }
      },
      isModEnabled: (gameId, modId) => {
        const gameSet = get().enabledModsByGame[gameId];
        return gameSet ? gameSet.has(modId) : false;
      },
      setDependencyWarnings: (gameId, modId, warnings) => {
        const current = get().dependencyWarningsByGame;
        const gameWarnings = current[gameId] || {};
        set({
          dependencyWarningsByGame: {
            ...current,
            [gameId]: {
              ...gameWarnings,
              [modId]: warnings
            }
          }
        });
      },
      clearDependencyWarnings: (gameId, modId) => {
        const current = get().dependencyWarningsByGame;
        const gameWarnings = { ...current[gameId] || {} };
        delete gameWarnings[modId];
        set({
          dependencyWarningsByGame: {
            ...current,
            [gameId]: gameWarnings
          }
        });
      },
      getDependencyWarnings: (gameId, modId) => {
        const gameWarnings = get().dependencyWarningsByGame[gameId];
        return gameWarnings ? gameWarnings[modId] || [] : [];
      }
    }),
    {
      name: "mod-management-storage",
      // Custom serialization for Set
      partialize: (state) => ({
        installedModsByGame: Object.fromEntries(
          Object.entries(state.installedModsByGame).map(([gameId, modSet]) => [
            gameId,
            Array.from(modSet)
          ])
        ),
        enabledModsByGame: Object.fromEntries(
          Object.entries(state.enabledModsByGame).map(([gameId, modSet]) => [
            gameId,
            Array.from(modSet)
          ])
        ),
        installedModVersionsByGame: state.installedModVersionsByGame,
        dependencyWarningsByGame: state.dependencyWarningsByGame
      }),
      // Custom deserialization for Set
      merge: (persistedState, currentState) => ({
        ...currentState,
        installedModsByGame: Object.fromEntries(
          Object.entries(persistedState.installedModsByGame || {}).map(
            ([gameId, modIds]) => [gameId, new Set(modIds)]
          )
        ),
        enabledModsByGame: Object.fromEntries(
          Object.entries(persistedState.enabledModsByGame || {}).map(
            ([gameId, modIds]) => [gameId, new Set(modIds)]
          )
        ),
        installedModVersionsByGame: persistedState.installedModVersionsByGame || {},
        dependencyWarningsByGame: persistedState.dependencyWarningsByGame || {}
      })
    }
  )
);
const PROFILES = [
  // Risk of Rain 2 profiles
  { id: "ror2-default", gameId: "ror2", name: "Default", modCount: 0 },
  { id: "ror2-coop", gameId: "ror2", name: "Co-op with Steve", modCount: 12 },
  { id: "ror2-hardcore", gameId: "ror2", name: "Hardcore Solo", modCount: 8 },
  { id: "ror2-testing", gameId: "ror2", name: "Testing", modCount: 45 },
  // Valheim profiles
  { id: "valheim-default", gameId: "valheim", name: "Default", modCount: 0 },
  { id: "valheim-building", gameId: "valheim", name: "Building Focus", modCount: 15 },
  // Lethal Company profiles
  { id: "lc-default", gameId: "lethal-company", name: "Default", modCount: 0 },
  { id: "lc-chaos", gameId: "lethal-company", name: "Chaos Mode", modCount: 23 },
  // Dyson Sphere profiles
  { id: "dsp-default", gameId: "dyson-sphere", name: "Default", modCount: 0 }
];
function DialogRoot(props) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    disablePointerDismissal = false,
    modal = true,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const parentDialogRootContext = useDialogRootContext(true);
  const nested = Boolean(parentDialogRootContext);
  const store = useRefWithInit(() => {
    return handle?.store ?? new DialogStore({
      open: openProp ?? defaultOpen,
      activeTriggerId: triggerIdProp !== void 0 ? triggerIdProp : defaultTriggerIdProp,
      modal,
      disablePointerDismissal,
      nested
    });
  }).current;
  store.useControlledProp("open", openProp, defaultOpen);
  store.useControlledProp("activeTriggerId", triggerIdProp, defaultTriggerIdProp);
  store.useSyncedValues({
    disablePointerDismissal,
    nested,
    modal
  });
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
function Dialog({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRoot, { "data-slot": "dialog", ...props });
}
function DialogPortal({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal$1, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  onClick,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogBackdrop,
    {
      "data-slot": "dialog-overlay",
      className: cn$1(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
        className
      ),
      onClick,
      ...props
    }
  );
}
function DialogContent({
  className,
  onOverlayClick,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, { onClick: onOverlayClick }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogPopup,
      {
        "data-slot": "dialog-content",
        className: cn$1(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-6 rounded-xl p-6 ring-1 duration-100 max-w-lg fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        ),
        ...props
      }
    )
  ] });
}
function DialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn$1("grid gap-1.5", className),
      ...props
    }
  );
}
function DialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn$1("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogTitle$1,
    {
      "data-slot": "dialog-title",
      className: cn$1("text-lg font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogDescription$1,
    {
      "data-slot": "dialog-description",
      className: cn$1("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function DialogClose({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogClose$1,
    {
      "data-slot": "dialog-close",
      className: cn$1(className),
      ...props
    }
  );
}
function CreateProfileDialog({ open, onOpenChange, onCreateProfile }) {
  const [profileName, setProfileName] = reactExports.useState("");
  const handleCreate = () => {
    if (profileName.trim()) {
      onCreateProfile(profileName.trim());
      setProfileName("");
      onOpenChange(false);
    }
  };
  const handleCancel = () => {
    setProfileName("");
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md",
      onOverlayClick: handleCancel,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create New Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter a name for your new profile. You can use profiles to manage different mod configurations." })
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
                  handleCreate();
                }
              },
              autoFocus: true
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreate, disabled: !profileName.trim(), children: "Create Profile" })
        ] })
      ]
    }
  ) });
}
const MOD_CATEGORIES = [
  "Audio",
  "Cheats",
  "Client-side",
  "Communication",
  "Content",
  "Cosmetic",
  "Frameworks",
  "Gameplay",
  "Graphics",
  "Items",
  "Libraries",
  "Misc",
  "Modpacks",
  "Multiplayer",
  "Networking",
  "Performance",
  "QoL",
  "Server-side",
  "Tools",
  "UI",
  "Visual",
  "Weapons"
];
const sampleModsJson = /* @__PURE__ */ JSON.parse(`[{"name":"BoneLib","full_name":"bonelib-BoneLib","owner":"bonelib","package_url":"https://thunderstore.io/c/bonelab/p/bonelib/BoneLib/","donation_link":null,"date_created":"2025-12-13T01:07:48.224004+00:00","date_updated":"2025-12-27T22:20:52.406516+00:00","uuid4":"772e464e-aba3-4c0e-be61-0f3efe588b60","rating_score":8,"is_pinned":true,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"BoneLib","full_name":"bonelib-BoneLib-3.2.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/bonelib-BoneLib-3.2.0.png","version_number":"3.2.0","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/bonelib/BoneLib/3.2.0/","downloads":30304,"date_created":"2025-12-27T22:20:51.912675+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"95dc30f0-1a3a-45a3-82f4-81a4c7fef8b7","file_size":4892536},{"name":"BoneLib","full_name":"bonelib-BoneLib-3.1.5","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/bonelib-BoneLib-3.1.5.png","version_number":"3.1.5","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/bonelib/BoneLib/3.1.5/","downloads":8521,"date_created":"2025-12-23T13:20:15.248970+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"0780b7e5-4191-4e8c-87e5-4eb3c21c8678","file_size":4832239},{"name":"BoneLib","full_name":"bonelib-BoneLib-3.1.4","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/bonelib-BoneLib-3.1.4.png","version_number":"3.1.4","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/bonelib/BoneLib/3.1.4/","downloads":1936,"date_created":"2025-12-22T18:31:01.729579+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"80b427b2-091c-4a9f-8804-031859581249","file_size":3798556},{"name":"BoneLib","full_name":"bonelib-BoneLib-3.1.3","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/bonelib-BoneLib-3.1.3.png","version_number":"3.1.3","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/bonelib/BoneLib/3.1.3/","downloads":10429,"date_created":"2025-12-13T01:31:02.408033+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"5a509174-03ee-40cd-868e-cefb5b0ff73f","file_size":3880477},{"name":"BoneLib","full_name":"bonelib-BoneLib-3.1.2","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/bonelib-BoneLib-3.1.2.png","version_number":"3.1.2","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/bonelib/BoneLib/3.1.2/","downloads":1912,"date_created":"2025-12-13T01:07:48.741373+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"d8c1bd00-304e-4dea-b6b5-32fe4b41e749","file_size":3836780}]},{"name":"r2modman","full_name":"ebkr-r2modman","owner":"ebkr","package_url":"https://thunderstore.io/c/bonelab/p/ebkr/r2modman/","donation_link":"https://www.mcsuk.org/make-a-donation/","date_created":"2019-06-05T15:09:31.571563+00:00","date_updated":"2025-11-22T12:34:03.972449+00:00","uuid4":"f21c391c-0bc5-431d-a233-95323b95e01b","rating_score":1235,"is_pinned":true,"is_deprecated":false,"has_nsfw_content":false,"categories":[],"versions":[{"name":"r2modman","full_name":"ebkr-r2modman-3.2.11","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.11.png","version_number":"3.2.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.11/","downloads":374519,"date_created":"2025-11-22T12:33:58.943650+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"dd45d18f-877a-45a5-a9a4-9dbd6a267f56","file_size":287350696},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.10","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.10.png","version_number":"3.2.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.10/","downloads":60717,"date_created":"2025-11-12T16:00:21.863302+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6e861179-b377-451b-8979-dd0a79fb2fbd","file_size":287115682},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.9","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.9.png","version_number":"3.2.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.9/","downloads":138896,"date_created":"2025-10-19T16:53:01.522847+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bb45f36b-f629-4c86-9498-34161006e94f","file_size":296842471},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.8","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.8.png","version_number":"3.2.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.8/","downloads":121452,"date_created":"2025-09-26T13:06:39.196866+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fad26a65-72ef-44a6-a95d-20636fa79c66","file_size":296567523},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.7","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.7.png","version_number":"3.2.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.7/","downloads":11809,"date_created":"2025-09-23T14:20:54.348322+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c7667895-0fda-453a-a207-a1ad38282267","file_size":296563545},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.6","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.6.png","version_number":"3.2.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.6/","downloads":20116,"date_created":"2025-09-19T15:50:18.168579+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6f966be8-e251-4db2-a3d1-f95e243d70b4","file_size":291256215},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.5","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.5.png","version_number":"3.2.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.5/","downloads":927,"date_created":"2025-09-19T12:50:39.944189+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cdef324d-035e-402d-99ca-f60528b70d8c","file_size":291256058},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.4","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.4.png","version_number":"3.2.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.4/","downloads":542,"date_created":"2025-09-19T10:38:48.141922+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3b488cb9-7fc1-44bf-99bd-93cc1954481b","file_size":291254131},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.3","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.3.png","version_number":"3.2.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.3/","downloads":244499,"date_created":"2025-08-04T07:52:17.294419+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3879d2a3-4dc8-480c-8829-26dddcd76e3c","file_size":255452916},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.2","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.2.png","version_number":"3.2.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.2/","downloads":36854,"date_created":"2025-07-28T13:46:39.635732+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"abf5fc69-6d8a-4053-a592-a37635aeadc5","file_size":255309477},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.1","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.1.png","version_number":"3.2.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.1/","downloads":211946,"date_created":"2025-06-26T07:59:40.412997+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0b829dd2-4e65-4461-a17a-b7b3a0c830ba","file_size":254994183},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.0","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.0.png","version_number":"3.2.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.0/","downloads":215022,"date_created":"2025-05-18T17:33:43.029426+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fd53cb5f-4448-4503-890f-a86d0e42dabf","file_size":252941837},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.58","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.58.png","version_number":"3.1.58","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.58/","downloads":240532,"date_created":"2025-04-17T19:45:04.048092+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fa03bc7e-33d8-4406-ae24-be507122da30","file_size":252539929},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.57","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.57.png","version_number":"3.1.57","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.57/","downloads":391867,"date_created":"2025-03-10T19:23:06.585609+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3ca900e1-d920-4afe-8cba-dd2ba070e90f","file_size":250695216},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.56","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.56.png","version_number":"3.1.56","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.56/","downloads":66243,"date_created":"2025-02-26T18:31:40.214524+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"e92e5c90-56f8-4360-9c15-17a8a426c401","file_size":250054587},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.55","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.55.png","version_number":"3.1.55","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.55/","downloads":483456,"date_created":"2024-12-10T22:39:58.350433+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4da72c7d-0c2d-40c0-a5fd-20693641060f","file_size":249804671},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.54","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.54.png","version_number":"3.1.54","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.54/","downloads":134629,"date_created":"2024-11-16T17:44:20.210556+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"05b94202-3ce9-4428-b6ad-f2dff1272037","file_size":249301001},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.53","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.53.png","version_number":"3.1.53","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.53/","downloads":16272,"date_created":"2024-11-13T22:28:23.418406+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0165783e-6cb0-4370-9ff1-87574d784259","file_size":249300530},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.52","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.52.png","version_number":"3.1.52","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.52/","downloads":48344,"date_created":"2024-11-04T19:05:06.051386+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"264e92ab-60f3-4df3-9cc7-79ddccd15d00","file_size":249158064},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.51","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.51.png","version_number":"3.1.51","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.51/","downloads":80118,"date_created":"2024-10-21T20:31:16.730326+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"52c2356b-4945-426e-958b-cbb0f578b57a","file_size":206719223},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.50","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.50_1JSysFW.png","version_number":"3.1.50","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.50/","downloads":184134,"date_created":"2024-09-14T11:04:52.878145+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5c475758-0850-4f64-b205-dc3b0356031a","file_size":205245933},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.49","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.49.png","version_number":"3.1.49","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.49/","downloads":502542,"date_created":"2024-06-18T18:25:08.373381+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"daed4043-f83c-4177-9d96-af5051f98a21","file_size":203351266},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.48","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.48.png","version_number":"3.1.48","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.48/","downloads":476563,"date_created":"2024-04-06T11:26:19.181731+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fb82d798-7ad6-49b4-acc4-0343d4606afa","file_size":201573108},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.47","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.47.png","version_number":"3.1.47","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.47/","downloads":426463,"date_created":"2024-02-15T21:35:13.517238+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2accf607-9a07-41a4-a72c-268ec1c98afe","file_size":201082192},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.46","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.46.png","version_number":"3.1.46","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.46/","downloads":576967,"date_created":"2024-01-14T22:30:18.014155+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"da5d829a-9672-4f43-9ca0-0ac946cb6a58","file_size":199795193},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.45","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.45.png","version_number":"3.1.45","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.45/","downloads":1425331,"date_created":"2023-11-24T17:45:34.982794+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"25b7b6f3-6804-4d3a-8b94-9c31f99d678a","file_size":199387810},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.44","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.44.png","version_number":"3.1.44","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.44/","downloads":186186,"date_created":"2023-10-01T22:03:58.031195+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0ac93cdf-dac8-4bb1-8e7e-2f33023f4492","file_size":198809707},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.43","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.43.png","version_number":"3.1.43","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.43/","downloads":119184,"date_created":"2023-08-22T20:32:53.759077+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"085a4ded-f59a-4bbb-b1f7-0aa5edf11075","file_size":198587541},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.42","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.42.png","version_number":"3.1.42","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.42/","downloads":264236,"date_created":"2023-05-26T16:16:34.396998+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"efc56670-2f06-4ff4-bb85-a2dd0b5a4d41","file_size":197180625},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.41","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.41.png","version_number":"3.1.41","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.41/","downloads":109228,"date_created":"2023-04-15T22:14:49.850876+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"e4626a4e-d211-4e01-b520-d3d0d14a678c","file_size":196779372},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.40","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.40.png","version_number":"3.1.40","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.40/","downloads":43838,"date_created":"2023-04-01T21:51:47.327008+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4a7bc9ef-fea4-4073-9f90-ad8753c8d092","file_size":196770408},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.39","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.39.png","version_number":"3.1.39","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.39/","downloads":95685,"date_created":"2023-03-03T23:53:41.546486+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b8ec9537-c61d-4c61-bd86-b0d0d1b36c5e","file_size":196509260},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.38","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.38.png","version_number":"3.1.38","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.38/","downloads":14219,"date_created":"2023-02-26T20:57:45.065115+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c33e29b4-0cdb-4ec5-ae3d-05eec6f0d030","file_size":196144109},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.37","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.37.png","version_number":"3.1.37","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.37/","downloads":18785,"date_created":"2023-02-20T17:39:44.486182+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b2fc7bd0-8c13-453f-9862-def571e848ab","file_size":195334783},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.36","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.36.png","version_number":"3.1.36","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.36/","downloads":78227,"date_created":"2023-01-27T21:03:34.924308+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4126ca3e-56ae-4cf9-9a81-f41487f6c549","file_size":195097752},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.35","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.35.png","version_number":"3.1.35","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.35/","downloads":54386,"date_created":"2023-01-07T19:24:26.829809+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8258dc9f-90b9-4f57-9d1d-b26b2177533c","file_size":195051581},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.34","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.34.png","version_number":"3.1.34","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.34/","downloads":90648,"date_created":"2022-11-28T18:44:53.435253+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1fecd87a-5b79-475c-ad8b-d6d031195323","file_size":195044531},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.33","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.33.png","version_number":"3.1.33","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.33/","downloads":21502,"date_created":"2022-11-19T18:38:05.397261+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9de94141-3fda-4e70-8f35-b1ccadeed20a","file_size":195043337},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.32","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.32.png","version_number":"3.1.32","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.32/","downloads":113993,"date_created":"2022-08-29T13:56:41.160962+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f4acf4ba-bccc-40ad-84dd-4f00c38aabfe","file_size":194791512},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.31","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.31.png","version_number":"3.1.31","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.31/","downloads":79314,"date_created":"2022-07-03T21:41:22.525428+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7cd3c96d-6077-4b6f-a287-e589b2216a9d","file_size":206966569},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.29","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.29.png","version_number":"3.1.29","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.29/","downloads":24582,"date_created":"2022-06-18T14:44:40.441264+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9bf02e23-3f79-4c41-a0a5-7ea6175080fe","file_size":193504102},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.28","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.28.png","version_number":"3.1.28","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.28/","downloads":68836,"date_created":"2022-05-07T17:49:51.800253+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3d38b6d2-d0f2-4bd9-a923-b7e933e9d62b","file_size":193464136},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.27","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.27.png","version_number":"3.1.27","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.27/","downloads":124996,"date_created":"2022-02-18T21:19:12.171802+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a4a37e90-eb98-4380-8340-c86e97fda2b3","file_size":192900000},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.26","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.26.png","version_number":"3.1.26","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.26/","downloads":3376,"date_created":"2022-02-18T21:04:12.121436+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6bc475e4-be6e-4c8d-9294-c81c13a1044c","file_size":192899789},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.25","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.25.png","version_number":"3.1.25","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.25/","downloads":145064,"date_created":"2021-11-24T21:27:52.161403+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"27b058fb-b9e2-435a-8f09-85ca5f6a265b","file_size":141989592},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.24","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.24.png","version_number":"3.1.24","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.24/","downloads":27074,"date_created":"2021-11-05T17:58:46.564940+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b76cd8af-a41c-4eb1-aeea-3aa6a0136cf9","file_size":141846352},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.23","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.23.png","version_number":"3.1.23","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.23/","downloads":4482,"date_created":"2021-11-04T21:33:56.132925+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6823e272-5cc8-4e0e-b072-87a920d47656","file_size":141845325},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.22","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.22.png","version_number":"3.1.22","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.22/","downloads":5410,"date_created":"2021-11-03T07:56:49.015663+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c788483f-f45f-48ee-a75a-8c8df2bcf1ed","file_size":141707711},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.21","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.21.png","version_number":"3.1.21","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.21/","downloads":5741,"date_created":"2021-11-01T18:50:59.634082+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"010aafb2-8d71-4ad5-83aa-6c5edb8f3819","file_size":141704558},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.20","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.20.png","version_number":"3.1.20","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.20/","downloads":40733,"date_created":"2021-10-01T19:58:22.922910+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a9597530-7d20-458b-9b23-f46f90ef534b","file_size":141672201},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.19","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.19.png","version_number":"3.1.19","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.19/","downloads":58498,"date_created":"2021-08-21T12:04:42.976125+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3ce6cb4a-4d52-4f60-b15e-e1cf81d15fc9","file_size":141431944},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.18","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.18.png","version_number":"3.1.18","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.18/","downloads":3623,"date_created":"2021-08-21T10:18:02.353937+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c7e42327-a0bd-40d1-ba56-cddc5fcd1958","file_size":141432030},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.17","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.17.png","version_number":"3.1.17","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.17/","downloads":83223,"date_created":"2021-07-01T19:49:57.272642+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5557a39c-7b89-4dc0-9d6a-c91beb62d7dd","file_size":141027100},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.16","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.16.png","version_number":"3.1.16","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.16/","downloads":23935,"date_created":"2021-06-16T13:47:37.250819+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ce56db96-3017-403f-8dfe-fe60a9871dbf","file_size":140721045},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.15","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.15.png","version_number":"3.1.15","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.15/","downloads":17842,"date_created":"2021-06-05T08:48:09.493728+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cb37c95a-80af-47fa-a716-4e904d9d0fb4","file_size":140557597},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.14","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.14.png","version_number":"3.1.14","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.14/","downloads":39464,"date_created":"2021-05-11T23:00:41.936347+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"774ee629-d199-4586-8d44-68b4dde9b9d9","file_size":140416573},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.13","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.13.png","version_number":"3.1.13","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.13/","downloads":14687,"date_created":"2021-05-04T20:57:28.308621+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0b1c945f-72e1-48b6-a0ba-a7870ce7b0e8","file_size":140210352},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.12","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.12.png","version_number":"3.1.12","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.12/","downloads":16400,"date_created":"2021-04-27T20:41:57.956109+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"938fc7f9-7472-45dd-a973-77a64f671ff4","file_size":140208926},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.11","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.11.png","version_number":"3.1.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.11/","downloads":8024,"date_created":"2021-04-25T17:29:12.936395+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"437bda28-c81d-4467-b471-899cc0ef7628","file_size":140210416},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.10","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.10.png","version_number":"3.1.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.10/","downloads":44556,"date_created":"2021-04-05T11:25:42.845926+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bcdfed58-9ea5-4328-b385-d8972a174fd9","file_size":139037805},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.9","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.9.png","version_number":"3.1.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.9/","downloads":97175,"date_created":"2021-03-06T01:47:51.126103+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9661b257-a500-48a4-8674-99b27b3b8a75","file_size":138769707},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.8","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.8.png","version_number":"3.1.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.8/","downloads":6953,"date_created":"2021-03-05T01:05:53.155707+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3471e06d-460e-46e4-9f53-e298ed262ed3","file_size":138770094},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.7","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.7.png","version_number":"3.1.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.7/","downloads":20189,"date_created":"2021-02-27T00:16:58.129002+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ace681e0-70a5-4ca7-b5c4-896cd306bbd8","file_size":138770349},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.6","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.6.png","version_number":"3.1.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.6/","downloads":11475,"date_created":"2021-02-23T23:21:28.504369+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8d74f7d5-c9d7-4a8b-a9b1-d5bf0ffb6ae0","file_size":138770617},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.5","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.5.png","version_number":"3.1.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.5/","downloads":17730,"date_created":"2021-02-16T02:42:39.660146+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"58e51ed3-ab07-4916-aa94-1437c039ee7a","file_size":138768953},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.4","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.4.png","version_number":"3.1.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.4/","downloads":3977,"date_created":"2021-02-16T00:59:54.156292+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c3fa7414-6f4a-4a10-a2b3-10c22e821f20","file_size":138768295},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.3","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.3.png","version_number":"3.1.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.3/","downloads":4018,"date_created":"2021-02-15T21:15:25.010105+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"d822e87d-1cb5-430d-a853-366dc551f814","file_size":138769637},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.1.png","version_number":"3.1.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.1/","downloads":17856,"date_created":"2021-02-02T09:49:27.558948+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5cc9c434-ffd3-489b-a8f9-e0128a98e097","file_size":138793373},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.0","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.0.png","version_number":"3.1.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.0/","downloads":15740,"date_created":"2021-01-24T15:12:55.028434+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"61a0d304-61e4-40e6-9ad6-11a112204de9","file_size":138791851},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.36","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.36.png","version_number":"3.0.36","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.36/","downloads":66325,"date_created":"2020-11-03T22:07:15.233505+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1abefb9e-1353-4b5f-ad96-e40d6ed5228e","file_size":53237788},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.35","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.35.png","version_number":"3.0.35","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.35/","downloads":5345,"date_created":"2020-11-01T13:00:46.209298+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2249534a-8068-4c3d-95dc-765c2086775f","file_size":53208052},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.34","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.34.png","version_number":"3.0.34","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.34/","downloads":6169,"date_created":"2020-10-28T16:03:12.802670+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bd5f3ead-854d-4359-a0bf-7611671ec878","file_size":53210022},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.33","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.33.png","version_number":"3.0.33","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.33/","downloads":14015,"date_created":"2020-10-10T10:55:25.597028+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"28c6e3e3-2516-4636-a2e9-bb9aed37f11b","file_size":53196580},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.32","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.32.png","version_number":"3.0.32","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.32/","downloads":6758,"date_created":"2020-10-07T22:06:05.165560+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c5ed04f4-734f-4ef8-98b7-f02afc1b5699","file_size":53203796},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.31","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.31.png","version_number":"3.0.31","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.31/","downloads":21254,"date_created":"2020-09-19T19:21:01.854032+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8fe86420-dab9-4b97-8aef-c0701d362875","file_size":53191625},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.30","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.30.png","version_number":"3.0.30","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.30/","downloads":8508,"date_created":"2020-09-16T23:35:59.163280+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7039df24-9780-4b2a-bb68-b49fe5900462","file_size":53235837},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.29","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.29.png","version_number":"3.0.29","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.29/","downloads":16708,"date_created":"2020-09-09T12:09:16.440621+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2e14a0f2-0eab-47ba-9ccd-afa8e64eb4d5","file_size":52899999},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.28","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.28.png","version_number":"3.0.28","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.28/","downloads":17580,"date_created":"2020-09-02T15:27:09.290875+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"282bb8b3-94f4-4ecc-a83e-24e396901df0","file_size":52900568},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.27","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.27.png","version_number":"3.0.27","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.27/","downloads":9099,"date_created":"2020-08-31T09:35:43.375268+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"051bb42f-bc30-4e5d-a230-d73621be048c","file_size":52898826},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.26","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.26.png","version_number":"3.0.26","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.26/","downloads":30518,"date_created":"2020-08-22T13:44:02.822746+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"250a4434-3ebd-4cf6-9e75-8a25628ee455","file_size":52898637},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.25","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.25.png","version_number":"3.0.25","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.25/","downloads":4325,"date_created":"2020-08-22T11:17:32.662235+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8452d436-02dd-4af3-a8c7-27ea26de529d","file_size":52899542},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.24","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.24.png","version_number":"3.0.24","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.24/","downloads":26569,"date_created":"2020-07-26T10:56:47.223818+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c9e8bb9e-fea7-442f-8764-6a72d00b6807","file_size":52889331},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.23","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.23.png","version_number":"3.0.23","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.23/","downloads":3897,"date_created":"2020-07-26T10:49:12.980491+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1eceeacc-131a-477d-a95b-04b06946a58c","file_size":52887807},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.22","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.22.png","version_number":"3.0.22","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.22/","downloads":8566,"date_created":"2020-06-28T00:32:00.892236+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7810259f-28e8-4cad-9c65-b2644bba9336","file_size":45977362},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.21","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.21.png","version_number":"3.0.21","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.21/","downloads":4490,"date_created":"2020-06-25T20:07:59.326660+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9ab3e881-3e2f-47e0-b7ef-81c09f9418d3","file_size":45976229},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.20","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.20.png","version_number":"3.0.20","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.20/","downloads":7333,"date_created":"2020-06-01T17:51:41.040774+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"142bd181-95b3-431a-9eb7-020dae4311c4","file_size":45972997},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.19","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.19.png","version_number":"3.0.19","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.19/","downloads":6842,"date_created":"2020-05-19T19:51:46.755064+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"06341f41-8272-4507-b1ef-e05afc645b55","file_size":45971086},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.18","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.18.png","version_number":"3.0.18","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.18/","downloads":4612,"date_created":"2020-05-17T18:38:46.989461+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f72dbb6a-8bf8-4c84-aa9d-ec16feceb37d","file_size":45972431},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.17","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.17.png","version_number":"3.0.17","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.17/","downloads":9112,"date_created":"2020-04-28T15:47:08.327588+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"84d88b06-e5d5-48dc-bc75-f10f069d69a8","file_size":45971108},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.16","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.16.png","version_number":"3.0.16","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.16/","downloads":3877,"date_created":"2020-04-26T20:50:33.762356+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"811f56d5-bd99-4073-8055-7d00cbeaf4a1","file_size":45971017},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.15","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.15.png","version_number":"3.0.15","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.15/","downloads":5111,"date_created":"2020-04-19T19:26:24.229587+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2cbc9319-fc3a-4695-8f8b-79ca98b80238","file_size":45970732},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.14","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.14.png","version_number":"3.0.14","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.14/","downloads":5901,"date_created":"2020-04-11T20:48:55.179139+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"d3dfdfeb-666f-4358-bece-28b5a439c471","file_size":45967135},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.13","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.13.png","version_number":"3.0.13","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.13/","downloads":4639,"date_created":"2020-04-08T15:57:04.532117+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2218ca5e-450b-4e76-b981-035f785cb13f","file_size":45966646},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.12","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.12.png","version_number":"3.0.12","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.12/","downloads":6006,"date_created":"2020-04-03T21:09:45.911160+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b6459cc2-4835-420f-902e-adb72d4b1afd","file_size":45965599},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.11","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.11.png","version_number":"3.0.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.11/","downloads":5106,"date_created":"2020-04-01T16:31:25.864749+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4835a095-341c-4751-bf70-fc56e9cd1586","file_size":45965597},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.10","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.10.png","version_number":"3.0.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.10/","downloads":5411,"date_created":"2020-03-20T18:36:04.691592+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b7ebf430-5a70-416f-9dc4-768790b00cfd","file_size":45954540},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.9","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.9.png","version_number":"3.0.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.9/","downloads":5412,"date_created":"2020-03-07T22:02:18.696065+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f76e0601-1ddc-40f5-a096-8bf0f95d2049","file_size":49835583},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.8","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.8.png","version_number":"3.0.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.8/","downloads":4075,"date_created":"2020-03-01T17:17:32.370347+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ae4e7926-99f6-4682-bf32-ef8c4c04c60b","file_size":49834827},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.7","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.7.png","version_number":"3.0.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.7/","downloads":5544,"date_created":"2020-02-05T21:11:38.692056+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3db7a39a-1885-4746-ae21-f02cd26ff334","file_size":49841664},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.6","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.6.png","version_number":"3.0.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.6/","downloads":4554,"date_created":"2020-01-29T20:44:38.572881+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6b856917-6f31-4fa7-af8c-6eef91b35b2b","file_size":48875224},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.5","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.5.png","version_number":"3.0.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.5/","downloads":4277,"date_created":"2020-01-26T16:29:42.148829+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"49482233-a207-416d-9470-9a7e9593bfec","file_size":48875529},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.4","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.4.png","version_number":"3.0.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.4/","downloads":4542,"date_created":"2020-01-22T21:41:01.925077+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cb11e8f5-edfc-4b53-a732-dc517f099567","file_size":48872825},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.3","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.3.png","version_number":"3.0.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.3/","downloads":3757,"date_created":"2020-01-21T20:50:49.148746+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4ad9f13b-93db-4b48-88a7-ba072c187277","file_size":48872148},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.2","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.2.png","version_number":"3.0.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.2/","downloads":4104,"date_created":"2020-01-20T21:45:34.413078+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a6c21e47-ff57-42be-85e3-d67c44b7090c","file_size":48873010},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.1.png","version_number":"3.0.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.1/","downloads":4081,"date_created":"2020-01-19T21:33:27.192961+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"60527d80-09bd-4700-b16c-4c816c972d62","file_size":48871570},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.0","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.0.png","version_number":"3.0.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.0/","downloads":3773,"date_created":"2020-01-19T12:00:03.164284+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5bb643f3-816c-4e42-972d-23df84c01174","file_size":48871582},{"name":"r2modman","full_name":"ebkr-r2modman-2.1.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-2.1.1.png","version_number":"2.1.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/2.1.1/","downloads":6291,"date_created":"2019-10-27T13:19:52.253451+00:00","website_url":"https://github.com/ebkr/r2modman","is_active":true,"uuid4":"24f82a1a-81e4-4997-ae56-30e60e007b56","file_size":61410151}]},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader","owner":"LavaGang","package_url":"https://thunderstore.io/c/bonelab/p/LavaGang/MelonLoader/","donation_link":null,"date_created":"2021-08-02T22:11:11.176280+00:00","date_updated":"2025-06-21T05:22:37.880760+00:00","uuid4":"6aa7d416-831b-443d-95d5-e093b06178ce","rating_score":119,"is_pinned":true,"is_deprecated":false,"has_nsfw_content":false,"categories":[],"versions":[{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.7.1","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.7.1.png","version_number":"0.7.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.7.1/","downloads":267500,"date_created":"2025-06-21T05:22:36.695227+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"a2abb2d3-e161-4458-a7ef-0ca834e4fcff","file_size":10978601},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.7.0","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.7.0.png","version_number":"0.7.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.7.0/","downloads":157573,"date_created":"2025-02-04T16:49:43.703619+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"e4323732-75e0-4fb4-b9f1-903cf10f4ded","file_size":11113303},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.6.6","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.6.6.png","version_number":"0.6.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.6.6/","downloads":33071,"date_created":"2024-11-12T18:54:22.294214+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"656b035d-79e0-459f-8b90-496ceeeef8ba","file_size":20924757},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.6.5","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.6.5.png","version_number":"0.6.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.6.5/","downloads":15971,"date_created":"2024-09-26T00:33:58.263470+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"b3191882-dcd7-4815-a98c-ca8ad2f5d201","file_size":21911219},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.6.4","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.6.4.png","version_number":"0.6.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.6.4/","downloads":37264,"date_created":"2024-06-26T02:35:11.403256+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"15f48663-bb2c-4ef8-9649-9812ad33bdcc","file_size":21938720},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.6.3","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.6.3.png","version_number":"0.6.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.6.3/","downloads":2651,"date_created":"2024-06-23T23:00:06.377730+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"24658a74-a7e6-4615-b560-cc51a38ce277","file_size":21940715},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.7","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.7.png","version_number":"0.5.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.7/","downloads":264864,"date_created":"2022-10-27T18:55:31.142242+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"d770c123-ce73-4dbf-be14-0cf361544eb5","file_size":18438014},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.6","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.6.png","version_number":"0.5.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.6/","downloads":19616,"date_created":"2022-09-29T17:29:11.371706+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"17d15aa3-0b3c-46e3-97be-55e58a445bc9","file_size":18297074},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.4","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.4.png","version_number":"0.5.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.4/","downloads":116429,"date_created":"2022-03-26T02:59:56.923389+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"67f1053a-f7ee-448e-a44a-2d7704b24b21","file_size":18360569},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.3","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.3.png","version_number":"0.5.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.3/","downloads":20128,"date_created":"2022-01-28T19:18:44.598511+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"cd562bcf-2406-497e-85b0-4ee1921bf7bd","file_size":17984148},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.2","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.2.png","version_number":"0.5.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.2/","downloads":19689,"date_created":"2021-12-10T02:27:51.530210+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"605ee3ab-da5e-42ed-bccb-07b92790f393","file_size":17670492},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.5.1","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.5.1.png","version_number":"0.5.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.5.1/","downloads":1436,"date_created":"2021-12-09T02:50:55.365107+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"a884e85e-53ad-4430-b35e-39421579e467","file_size":17670437},{"name":"MelonLoader","full_name":"LavaGang-MelonLoader-0.4.3","description":"The World's First Universal Mod Loader for Unity Games compatible with both Il2Cpp and Mono","icon":"https://gcdn.thunderstore.io/live/repository/icons/LavaGang-MelonLoader-0.4.3.png","version_number":"0.4.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/LavaGang/MelonLoader/0.4.3/","downloads":23790,"date_created":"2021-08-02T22:11:44.619527+00:00","website_url":"https://github.com/LavaGang/MelonLoader","is_active":true,"uuid4":"ff320b78-b801-4a2a-906a-7807ba51996a","file_size":17328612}]},{"name":"BoneLib","full_name":"gnonme-BoneLib","owner":"gnonme","package_url":"https://thunderstore.io/c/bonelab/p/gnonme/BoneLib/","donation_link":"https://ko-fi.com/gnonme","date_created":"2022-10-02T21:32:50.043726+00:00","date_updated":"2025-12-13T01:16:56.647103+00:00","uuid4":"04f50563-562b-42e6-aa54-b0ecf14da060","rating_score":72,"is_pinned":true,"is_deprecated":true,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"BoneLib","full_name":"gnonme-BoneLib-3.1.3","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-3.1.3.png","version_number":"3.1.3","dependencies":["LavaGang-MelonLoader-0.6.6","bonelib-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/3.1.3/","downloads":22180,"date_created":"2025-12-13T01:16:56.095607+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"a726789c-fcfb-4b73-8537-73bf5382bfd5","file_size":22911},{"name":"BoneLib","full_name":"gnonme-BoneLib-3.1.2","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-3.1.2.png","version_number":"3.1.2","dependencies":["LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/3.1.2/","downloads":207348,"date_created":"2025-01-18T18:56:15.857963+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"f9b4551a-e20f-4533-af4e-5105ee6a56cb","file_size":3836780},{"name":"BoneLib","full_name":"gnonme-BoneLib-3.0.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-3.0.0.png","version_number":"3.0.0","dependencies":["LavaGang-MelonLoader-0.6.4"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/3.0.0/","downloads":74878,"date_created":"2024-08-02T01:08:14.396573+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"d4d65f5d-ed4d-4eb6-880e-ce8bea908a4b","file_size":3835520},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.4.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.4.0.png","version_number":"2.4.0","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.4.0/","downloads":134527,"date_created":"2023-11-18T20:02:08.693272+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"d716f1fd-46a6-431c-a475-f43d05bd5546","file_size":1457890},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.3.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.3.0.png","version_number":"2.3.0","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.3.0/","downloads":9461,"date_created":"2023-11-02T01:09:22.577779+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"ced246e7-84dd-458d-a06d-0fe97b6222af","file_size":1443829},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.2.2","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.2.2.png","version_number":"2.2.2","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.2.2/","downloads":1860,"date_created":"2023-10-31T01:36:56.892001+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"083d99bf-dc1c-42b8-8990-7b58ed67c790","file_size":1435099},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.2.1","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.2.1.png","version_number":"2.2.1","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.2.1/","downloads":141846,"date_created":"2023-03-05T18:45:03.791662+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"0b4249bd-2318-4e49-b63a-060e9f982bc6","file_size":1422650},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.2.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.2.0.png","version_number":"2.2.0","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.2.0/","downloads":30206,"date_created":"2022-12-27T21:21:04.026474+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"dbfc9f61-7883-496c-948c-9d6097397b15","file_size":1422789},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.1.1","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.1.1.png","version_number":"2.1.1","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.1.1/","downloads":3612,"date_created":"2022-12-20T18:38:00.767927+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"3764621c-bd57-427b-b6c4-70a3b307ce51","file_size":686740},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.1.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.1.0.png","version_number":"2.1.0","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.1.0/","downloads":2276,"date_created":"2022-12-17T20:35:40.175040+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"179b5363-d4f3-4453-a81c-ea8e07d9d7de","file_size":686698},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.0.1","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.0.1.png","version_number":"2.0.1","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.0.1/","downloads":4982,"date_created":"2022-12-10T18:16:54.935470+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"01b5b990-8744-41ca-82c7-8b4f63611af6","file_size":686295},{"name":"BoneLib","full_name":"gnonme-BoneLib-2.0.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-2.0.0.png","version_number":"2.0.0","dependencies":["LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/2.0.0/","downloads":1280,"date_created":"2022-12-10T02:36:56.332989+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"45e754bc-b42a-42ad-aadc-f2f0f5689635","file_size":686256},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.4.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.4.0.png","version_number":"1.4.0","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.4.0/","downloads":7276,"date_created":"2022-11-11T21:49:18.593952+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"944b5db2-9dec-4fd4-b629-e5741e0f0725","file_size":40970},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.3.1","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.3.1.png","version_number":"1.3.1","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.3.1/","downloads":4608,"date_created":"2022-10-29T23:40:52.607853+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"09aa90ff-b1af-44b8-bfc0-11e079dbd2c3","file_size":39248},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.3.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.3.0.png","version_number":"1.3.0","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.3.0/","downloads":585,"date_created":"2022-10-29T20:52:37.363347+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"5ff4e886-9bc3-49dc-8ed1-4f44394ccf08","file_size":39099},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.2.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.2.0.png","version_number":"1.2.0","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.2.0/","downloads":4002,"date_created":"2022-10-19T16:17:27.167348+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"36d3c8a7-e704-43a0-92cf-3508e7fd20a6","file_size":34920},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.1.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.1.0.png","version_number":"1.1.0","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.1.0/","downloads":6672,"date_created":"2022-10-08T05:08:41.209008+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"5b135ce2-e921-4421-9ed5-5584ac9ce63a","file_size":28318},{"name":"BoneLib","full_name":"gnonme-BoneLib-1.0.0","description":"A BONELAB mod for making life easier for other mod creators.","icon":"https://gcdn.thunderstore.io/live/repository/icons/gnonme-BoneLib-1.0.0.png","version_number":"1.0.0","dependencies":["LavaGang-MelonLoader-0.5.6"],"download_url":"https://thunderstore.io/package/download/gnonme/BoneLib/1.0.0/","downloads":1094,"date_created":"2022-10-02T21:32:50.685242+00:00","website_url":"https://github.com/yowchap/BoneLib","is_active":true,"uuid4":"72153fb2-501e-4a10-ae9e-4a0bc343de11","file_size":22356}]},{"name":"BoneFPS","full_name":"Zooks-BoneFPS","owner":"Zooks","package_url":"https://thunderstore.io/c/bonelab/p/Zooks/BoneFPS/","donation_link":null,"date_created":"2026-01-14T16:02:07.031717+00:00","date_updated":"2026-01-17T20:00:33.395970+00:00","uuid4":"b97b618e-1e72-4e69-9d1b-96db8036abd3","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"BoneFPS","full_name":"Zooks-BoneFPS-1.0.3","description":"An extensive optimization mod for BONELAB with 60+ configurable options.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Zooks-BoneFPS-1.0.3.png","version_number":"1.0.3","dependencies":["LavaGang-MelonLoader-0.6.6","gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Zooks/BoneFPS/1.0.3/","downloads":146,"date_created":"2026-01-17T20:00:32.991043+00:00","website_url":"https://thunderstore.io/c/bonelab/","is_active":true,"uuid4":"8d4c47dd-61a0-4759-a024-dd9b2aa3a079","file_size":325378},{"name":"BoneFPS","full_name":"Zooks-BoneFPS-1.0.2","description":"An extensive optimization mod for BONELAB with 60+ configurable options.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Zooks-BoneFPS-1.0.2.png","version_number":"1.0.2","dependencies":["LavaGang-MelonLoader-0.6.6","gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Zooks/BoneFPS/1.0.2/","downloads":505,"date_created":"2026-01-15T13:31:11.873143+00:00","website_url":"https://thunderstore.io/c/bonelab/","is_active":true,"uuid4":"260ae7f0-e0aa-4318-97eb-c99b08b42806","file_size":100381},{"name":"BoneFPS","full_name":"Zooks-BoneFPS-1.0.1","description":"An extensive optimization mod for BONELAB with 60+ configurable options.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Zooks-BoneFPS-1.0.1.png","version_number":"1.0.1","dependencies":["LavaGang-MelonLoader-0.6.6","gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Zooks/BoneFPS/1.0.1/","downloads":278,"date_created":"2026-01-14T19:12:22.399406+00:00","website_url":"https://thunderstore.io/c/bonelab/","is_active":true,"uuid4":"b3ba30da-a940-4b59-8abb-7da255204e28","file_size":79550},{"name":"BoneFPS","full_name":"Zooks-BoneFPS-1.0.0","description":"An extensive optimization mod for BONELAB with 60+ configurable options.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Zooks-BoneFPS-1.0.0.png","version_number":"1.0.0","dependencies":["LavaGang-MelonLoader-0.6.6","gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Zooks/BoneFPS/1.0.0/","downloads":52,"date_created":"2026-01-14T16:02:10.695042+00:00","website_url":"https://thunderstore.io/c/bonelab/","is_active":true,"uuid4":"9e7f3a1f-013b-4e72-b467-41cd95238e7e","file_size":253288}]},{"name":"NodeNullbody","full_name":"Volta-NodeNullbody","owner":"Volta","package_url":"https://thunderstore.io/c/bonelab/p/Volta/NodeNullbody/","donation_link":null,"date_created":"2026-01-15T19:42:26.509584+00:00","date_updated":"2026-01-15T19:42:31.300964+00:00","uuid4":"44d87368-3049-4a44-8b40-50c11780b549","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Custom Audio"],"versions":[{"name":"NodeNullbody","full_name":"Volta-NodeNullbody-1.0.0","description":"Replaces the normal nullbody sfx with the old nullbody sounds from nodes video.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volta-NodeNullbody-1.0.0.png","version_number":"1.0.0","dependencies":["gnonme-BoneLib-1.0.0","TrevTV-AudioReplacer-1.7.0","TrevTV-AudioImportLib-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volta/NodeNullbody/1.0.0/","downloads":116,"date_created":"2026-01-15T19:42:30.940942+00:00","website_url":"https://youtu.be/2E30vb3bmMc?si=9DjzOqfQrV35ezm9","is_active":true,"uuid4":"b0e737ed-4c33-47d6-b502-aa1d1b0ff02b","file_size":488080}]},{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings","owner":"Jorink","package_url":"https://thunderstore.io/c/bonelab/p/Jorink/QuestGraphicsSettings/","donation_link":null,"date_created":"2026-01-10T22:36:07.577844+00:00","date_updated":"2026-01-13T22:17:49.441775+00:00","uuid4":"310a7a42-46ce-4a74-ba41-f65a97d2f81f","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings-1.2.0","description":"A mod that brings some graphics settings to Quest devices.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Jorink-QuestGraphicsSettings-1.2.0.png","version_number":"1.2.0","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.5"],"download_url":"https://thunderstore.io/package/download/Jorink/QuestGraphicsSettings/1.2.0/","downloads":763,"date_created":"2026-01-13T22:17:48.944512+00:00","website_url":"https://github.com/MJorink/QuestGraphicsSettings","is_active":true,"uuid4":"133dfc97-aa5b-44c0-b1dd-e30d723c0b8f","file_size":11157},{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings-1.1.2","description":"A mod that brings some graphics settings to Quest devices.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Jorink-QuestGraphicsSettings-1.1.2.png","version_number":"1.1.2","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.5"],"download_url":"https://thunderstore.io/package/download/Jorink/QuestGraphicsSettings/1.1.2/","downloads":275,"date_created":"2026-01-12T20:32:01.032896+00:00","website_url":"https://github.com/MJorink/QuestGraphicsSettings","is_active":true,"uuid4":"905c8e5c-f619-40e7-8e89-11ccad2bc259","file_size":9201},{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings-1.1.1","description":"A mod that brings some graphics settings to Quest devices.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Jorink-QuestGraphicsSettings-1.1.1.png","version_number":"1.1.1","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.5"],"download_url":"https://thunderstore.io/package/download/Jorink/QuestGraphicsSettings/1.1.1/","downloads":237,"date_created":"2026-01-11T21:05:00.379214+00:00","website_url":"https://github.com/MJorink/QuestGraphicsSettings","is_active":true,"uuid4":"0a09fa57-6a6c-4ea6-b0e3-6ba3eaf37547","file_size":8746},{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings-1.1.0","description":"A mod that brings some graphics settings to Quest devices.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Jorink-QuestGraphicsSettings-1.1.0.png","version_number":"1.1.0","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.5"],"download_url":"https://thunderstore.io/package/download/Jorink/QuestGraphicsSettings/1.1.0/","downloads":39,"date_created":"2026-01-11T20:15:18.772449+00:00","website_url":"https://github.com/MJorink/QuestGraphicsSettings","is_active":true,"uuid4":"144749ab-6b40-4eee-8cf2-5dd4346aae8b","file_size":8788},{"name":"QuestGraphicsSettings","full_name":"Jorink-QuestGraphicsSettings-1.0.0","description":"A mod that brings some graphics settings to Quest devices.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Jorink-QuestGraphicsSettings-1.0.0.png","version_number":"1.0.0","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.5"],"download_url":"https://thunderstore.io/package/download/Jorink/QuestGraphicsSettings/1.0.0/","downloads":356,"date_created":"2026-01-10T22:36:09.782946+00:00","website_url":"https://github.com/MJorink/QuestGraphicsSettings","is_active":true,"uuid4":"f2468b07-3879-4f94-8d80-1cf88cc5fcf9","file_size":7820}]},{"name":"ColVis","full_name":"Evro-ColVis","owner":"Evro","package_url":"https://thunderstore.io/c/bonelab/p/Evro/ColVis/","donation_link":null,"date_created":"2026-01-13T20:28:16.557171+00:00","date_updated":"2026-01-13T20:28:21.237539+00:00","uuid4":"7eb387e2-6940-4abf-8dfe-a4b83ab5e338","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"ColVis","full_name":"Evro-ColVis-1.0.0","description":"Visualize the RigManager's Colliders","icon":"https://gcdn.thunderstore.io/live/repository/icons/Evro-ColVis-1.0.0.png","version_number":"1.0.0","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Evro/ColVis/1.0.0/","downloads":106,"date_created":"2026-01-13T20:28:20.805916+00:00","website_url":"https://github.com/EvroDeveloper/ColVis","is_active":true,"uuid4":"8148db1a-5d3c-4c16-a853-b9fa828858e1","file_size":40731}]},{"name":"ULTRAKILL_SOUNDEFFECT_REPLACER","full_name":"SPOODERO0-ULTRAKILL_SOUNDEFFECT_REPLACER","owner":"SPOODERO0","package_url":"https://thunderstore.io/c/bonelab/p/SPOODERO0/ULTRAKILL_SOUNDEFFECT_REPLACER/","donation_link":null,"date_created":"2025-02-27T23:42:35.897363+00:00","date_updated":"2026-01-12T03:21:30.569422+00:00","uuid4":"5ac840bb-5790-439f-a969-7ff1d4abe16f","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Custom Audio"],"versions":[{"name":"ULTRAKILL_SOUNDEFFECT_REPLACER","full_name":"SPOODERO0-ULTRAKILL_SOUNDEFFECT_REPLACER-1.1.0","description":"Replaces Bonelab's sound effect with ultrakill's sound effect","icon":"https://gcdn.thunderstore.io/live/repository/icons/SPOODERO0-ULTRAKILL_SOUNDEFFECT_REPLACER-1.1.0.png","version_number":"1.1.0","dependencies":["TrevTV-AudioReplacer-1.7.0"],"download_url":"https://thunderstore.io/package/download/SPOODERO0/ULTRAKILL_SOUNDEFFECT_REPLACER/1.1.0/","downloads":80,"date_created":"2026-01-12T03:21:30.200152+00:00","website_url":"https://store.steampowered.com/app/1229490/ULTRAKILL/","is_active":true,"uuid4":"d710133a-7b9d-4c91-b1fd-94ceb4e58ce0","file_size":82038},{"name":"ULTRAKILL_SOUNDEFFECT_REPLACER","full_name":"SPOODERO0-ULTRAKILL_SOUNDEFFECT_REPLACER-1.0.0","description":"Replaces Bonelab's sound effect with ultrakill's sound effect","icon":"https://gcdn.thunderstore.io/live/repository/icons/SPOODERO0-ULTRAKILL_SOUNDEFFECT_REPLACER-1.0.0.png","version_number":"1.0.0","dependencies":["TrevTV-AudioReplacer-1.7.0"],"download_url":"https://thunderstore.io/package/download/SPOODERO0/ULTRAKILL_SOUNDEFFECT_REPLACER/1.0.0/","downloads":793,"date_created":"2025-02-27T23:42:38.823416+00:00","website_url":"https://store.steampowered.com/app/1229490/ULTRAKILL/","is_active":true,"uuid4":"26977ad2-3679-48ec-9c74-5cdf7902fbf0","file_size":27368}]},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod","owner":"Dommygutman","package_url":"https://thunderstore.io/c/bonelab/p/Dommygutman/DestructibleAvatarCodeMod/","donation_link":null,"date_created":"2025-09-07T18:45:53.138011+00:00","date_updated":"2026-01-11T23:26:06.022400+00:00","uuid4":"11ef1fc0-14e3-4962-9706-dfaaee296090","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.1.15","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.1.15.png","version_number":"1.1.15","dependencies":["gnonme-BoneLib-3.1.2","Lakatrazz-Fusion-1.13.1"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.1.15/","downloads":502,"date_created":"2026-01-11T23:26:05.669083+00:00","website_url":"","is_active":true,"uuid4":"68a0feed-27be-4562-a49a-cb252464e1b1","file_size":16024},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.1.1","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.1.1.png","version_number":"1.1.1","dependencies":["gnonme-BoneLib-3.1.2","Lakatrazz-Fusion-1.12.2"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.1.1/","downloads":2885,"date_created":"2025-10-29T23:56:22.770183+00:00","website_url":"","is_active":true,"uuid4":"05e2dd66-cacd-4d2f-b37a-0ec1426ab264","file_size":15933},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.1.0","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.1.0.png","version_number":"1.1.0","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.1.0/","downloads":1245,"date_created":"2025-09-19T05:38:48.673676+00:00","website_url":"","is_active":true,"uuid4":"76165e64-a376-4e39-bec7-97c1a1492e49","file_size":15417},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.0.3","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.0.3.png","version_number":"1.0.3","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.0.3/","downloads":688,"date_created":"2025-09-08T22:13:02.426474+00:00","website_url":"","is_active":true,"uuid4":"f9392f53-08d5-40bb-ab79-6de714857337","file_size":15180},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.0.2","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.0.2.png","version_number":"1.0.2","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.0.2/","downloads":81,"date_created":"2025-09-08T21:59:01.948788+00:00","website_url":"","is_active":true,"uuid4":"6519da3a-2243-4498-88a7-439b570ebd34","file_size":15139},{"name":"DestructibleAvatarCodeMod","full_name":"Dommygutman-DestructibleAvatarCodeMod-1.0.1","description":"A Code mod for a specific set of avatars that makes them destrucible","icon":"https://gcdn.thunderstore.io/live/repository/icons/Dommygutman-DestructibleAvatarCodeMod-1.0.1.png","version_number":"1.0.1","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Dommygutman/DestructibleAvatarCodeMod/1.0.1/","downloads":210,"date_created":"2025-09-07T18:45:56.677186+00:00","website_url":"","is_active":true,"uuid4":"63b0b4dc-6c1d-46d8-8a24-d1c681bb86ee","file_size":15075}]},{"name":"EVIL_Ford","full_name":"PhoenixDoesStuff-EVIL_Ford","owner":"PhoenixDoesStuff","package_url":"https://thunderstore.io/c/bonelab/p/PhoenixDoesStuff/EVIL_Ford/","donation_link":null,"date_created":"2026-01-11T19:36:25.050943+00:00","date_updated":"2026-01-11T19:36:40.607929+00:00","uuid4":"ea775ab1-0289-42c7-bd0c-cc2c3c9cc093","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Custom Audio"],"versions":[{"name":"EVIL_Ford","full_name":"PhoenixDoesStuff-EVIL_Ford-1.0.0","description":"ford but evil voicelines","icon":"https://gcdn.thunderstore.io/live/repository/icons/PhoenixDoesStuff-EVIL_Ford-1.0.0.png","version_number":"1.0.0","dependencies":["gnonme-BoneLib-1.0.0","TrevTV-AudioReplacer-1.7.0","TrevTV-AudioImportLib-1.3.0"],"download_url":"https://thunderstore.io/package/download/PhoenixDoesStuff/EVIL_Ford/1.0.0/","downloads":96,"date_created":"2026-01-11T19:36:39.907219+00:00","website_url":"","is_active":true,"uuid4":"1dd7f75e-d3c9-422d-9b12-8b89c3ff8ee3","file_size":966872}]},{"name":"Titanfall_2_Hitmarkers_remade_by_Relz","full_name":"relyz_ducke-Titanfall_2_Hitmarkers_remade_by_Relz","owner":"relyz_ducke","package_url":"https://thunderstore.io/c/bonelab/p/relyz_ducke/Titanfall_2_Hitmarkers_remade_by_Relz/","donation_link":null,"date_created":"2026-01-11T05:11:29.005536+00:00","date_updated":"2026-01-11T05:11:30.794548+00:00","uuid4":"87c1f25c-1153-483e-9643-fe89c430e600","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"Titanfall_2_Hitmarkers_remade_by_Relz","full_name":"relyz_ducke-Titanfall_2_Hitmarkers_remade_by_Relz-1.0.2","description":"a hitmarker mod that kinda looks like Tf2s. orginally made by sprite vr, whomes youtube chanel is linked above.","icon":"https://gcdn.thunderstore.io/live/repository/icons/relyz_ducke-Titanfall_2_Hitmarkers_remade_by_Relz-1.0.2.png","version_number":"1.0.2","dependencies":["TrevTV-AudioImportLib-1.2.0","NotEnoughPhotons-Hitmarkers-2.7.5"],"download_url":"https://thunderstore.io/package/download/relyz_ducke/Titanfall_2_Hitmarkers_remade_by_Relz/1.0.2/","downloads":197,"date_created":"2026-01-11T05:11:30.334011+00:00","website_url":"https://www.youtube.com/channel/UCPkqQ75Wvmk0CcRHCDU_eFw","is_active":true,"uuid4":"3f424c6e-c262-4d02-a44a-18bd735ee771","file_size":951674}]},{"name":"TimeScaleInvarientGridAnimation","full_name":"doge15567-TimeScaleInvarientGridAnimation","owner":"doge15567","package_url":"https://thunderstore.io/c/bonelab/p/doge15567/TimeScaleInvarientGridAnimation/","donation_link":null,"date_created":"2026-01-10T06:33:03.847815+00:00","date_updated":"2026-01-10T06:33:06.320803+00:00","uuid4":"aa9185a8-aded-4c40-89da-ecbdb525fc73","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"TimeScaleInvarientGridAnimation","full_name":"doge15567-TimeScaleInvarientGridAnimation-1.0.0","description":"Makes menus not open slow in slowmode","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-TimeScaleInvarientGridAnimation-1.0.0.png","version_number":"1.0.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/doge15567/TimeScaleInvarientGridAnimation/1.0.0/","downloads":248,"date_created":"2026-01-10T06:33:05.984725+00:00","website_url":"https://github.com/doge15567/TimeScaleInvarientGridAnimation/","is_active":true,"uuid4":"070f1933-6487-482a-b662-56479adf0e93","file_size":54701}]},{"name":"SelfHarm","full_name":"Sooka-SelfHarm","owner":"Sooka","package_url":"https://thunderstore.io/c/bonelab/p/Sooka/SelfHarm/","donation_link":null,"date_created":"2026-01-06T14:28:49.482952+00:00","date_updated":"2026-01-06T14:28:50.504685+00:00","uuid4":"e82ced7f-5c59-41e8-83a0-4c51e0b57ea7","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":true,"categories":["Code Mods"],"versions":[{"name":"SelfHarm","full_name":"Sooka-SelfHarm-2.0.0","description":"Harm youself with items you should not have been able to harm yourself with | Original mod by notnotnotswipez and MajedCT.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Sooka-SelfHarm-2.0.0.png","version_number":"2.0.0","dependencies":["gnonme-BoneLib-3.1.2"],"download_url":"https://thunderstore.io/package/download/Sooka/SelfHarm/2.0.0/","downloads":628,"date_created":"2026-01-06T14:28:50.085825+00:00","website_url":"","is_active":true,"uuid4":"c8d0dca0-df82-438e-af0b-2922b4bbf3a4","file_size":90435}]},{"name":"Fusion","full_name":"Lakatrazz-Fusion","owner":"Lakatrazz","package_url":"https://thunderstore.io/c/bonelab/p/Lakatrazz/Fusion/","donation_link":"https://ko-fi.com/lakatrazz","date_created":"2023-03-14T17:04:38.245476+00:00","date_updated":"2026-01-05T20:41:36.754482+00:00","uuid4":"bde67cf5-e1b0-473f-a661-13412a04d9b7","rating_score":98,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.13.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.13.1.png","version_number":"1.13.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.13.1/","downloads":19799,"date_created":"2026-01-05T20:41:36.088755+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"f23a0e18-61b8-4245-ab4c-bdbbc4341c7c","file_size":771512},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.13.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.13.0.png","version_number":"1.13.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.13.0/","downloads":5327,"date_created":"2026-01-04T05:41:02.650830+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"d46b6eb5-4496-4bcc-9cec-abf4214f8e5c","file_size":771810},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.12.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.12.2.png","version_number":"1.12.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.12.2/","downloads":166951,"date_created":"2025-06-17T18:54:38.426487+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"60086db7-c5e0-4ec8-8a7f-da300edba04b","file_size":765299},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.12.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.12.1.png","version_number":"1.12.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.12.1/","downloads":299,"date_created":"2025-06-17T18:32:28.501393+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"86217f73-7e3f-4313-8906-acdebc4a531b","file_size":765189},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.12.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.12.0.png","version_number":"1.12.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.12.0/","downloads":1003,"date_created":"2025-06-17T04:18:57.811618+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"3f67fd03-28c4-4668-ac8d-c01fff4e8234","file_size":765310},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.11.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.11.2.png","version_number":"1.11.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.11.2/","downloads":903,"date_created":"2025-06-16T21:40:44.455427+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"86ab1c4b-de4c-4e5b-a22d-bdecd3ed1d38","file_size":764467},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.11.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.11.1.png","version_number":"1.11.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.11.1/","downloads":378,"date_created":"2025-06-16T19:29:45.121838+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"78be01c5-2836-4008-be17-08cf080fe49f","file_size":763649},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.11.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.11.0.png","version_number":"1.11.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.11.0/","downloads":1563,"date_created":"2025-06-16T00:47:22.812603+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"1d1d2ebf-2af4-475d-af2e-2aaca7b95065","file_size":763447},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.10.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.10.2.png","version_number":"1.10.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.10.2/","downloads":731,"date_created":"2025-06-15T20:08:58.918837+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"b8c56adb-121a-46db-8fa1-f96ba4916438","file_size":762851},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.10.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.10.1.png","version_number":"1.10.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.10.1/","downloads":361,"date_created":"2025-06-15T18:16:12.214388+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"2afb26fb-9884-41d0-81c5-b7357e599c33","file_size":762500},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.10.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.10.0.png","version_number":"1.10.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.10.0/","downloads":336,"date_created":"2025-06-15T17:02:53.016986+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"1a15402a-63b1-43f5-8cb3-b9e17c75206c","file_size":763564},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.9.3","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.9.3.png","version_number":"1.9.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.9.3/","downloads":87885,"date_created":"2024-11-30T17:37:29.519885+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"380bbfa5-2da2-4c31-918a-89b808c11b5b","file_size":5175260},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.9.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.9.2.png","version_number":"1.9.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.9.2/","downloads":2459,"date_created":"2024-11-29T00:03:42.627206+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"b8b372c8-5878-441e-97fa-0e299e949c36","file_size":5175515},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.9.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.9.1.png","version_number":"1.9.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.9.1/","downloads":2287,"date_created":"2024-11-27T20:11:28.355871+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"18ff3060-81d5-4000-b740-6fb3de2db457","file_size":5174492},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.9.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.9.0.png","version_number":"1.9.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.9.0/","downloads":795,"date_created":"2024-11-27T18:07:28.611506+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"6508ba84-efd4-481e-b64c-e44c392de1cb","file_size":5169053},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.8.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.8.0.png","version_number":"1.8.0","dependencies":["gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.8.0/","downloads":30144,"date_created":"2024-08-30T22:32:54.410839+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"5c550127-0ae5-4688-882d-258f1e9aa692","file_size":5134130},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.7.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.7.0.png","version_number":"1.7.0","dependencies":["gnonme-BoneLib-3.0.0"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.7.0/","downloads":13287,"date_created":"2024-08-11T21:54:14.165395+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"d723fec0-1353-4730-b884-90f562e2efba","file_size":4805900},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.6.3","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.6.3.png","version_number":"1.6.3","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.6.3/","downloads":51890,"date_created":"2024-03-12T02:31:44.125433+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"caecc362-f1d5-4a58-91b8-835526c97a26","file_size":71758323},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.6.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.6.2.png","version_number":"1.6.2","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.6.2/","downloads":1386,"date_created":"2024-03-10T20:49:47.044280+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"5bec7c88-7e00-4152-a39d-a58b75b1f942","file_size":71749836},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.6.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.6.1.png","version_number":"1.6.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.6.1/","downloads":327,"date_created":"2024-03-10T20:31:44.007588+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"cbd7fd04-2e8d-4214-a10e-2a89b137a150","file_size":71749842},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.6.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.6.0.png","version_number":"1.6.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.6.0/","downloads":630,"date_created":"2024-03-10T20:20:00.884303+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"748fc679-66c9-4033-afd7-f046623d70f5","file_size":71757525},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.5.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.5.1.png","version_number":"1.5.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.5.1/","downloads":54201,"date_created":"2023-10-30T02:55:18.782301+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"19e698f8-904d-45ba-b691-0e4d0ddcaee0","file_size":67527049},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.5.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.5.0.png","version_number":"1.5.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.5.0/","downloads":35778,"date_created":"2023-09-02T20:04:47.526810+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"1a14bed9-b27d-49e9-b1ec-c33667e60919","file_size":67527907},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.4.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.4.1.png","version_number":"1.4.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.4.1/","downloads":33480,"date_created":"2023-05-25T17:49:55.313975+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"6aba6211-409e-49ae-9f86-34b2cb66371f","file_size":26009341},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.4.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.4.0.png","version_number":"1.4.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.4.0/","downloads":824,"date_created":"2023-05-25T01:03:33.507634+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"d7d6a5fa-057c-4544-a22e-2cd6dac91d73","file_size":26009305},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.3.2","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.3.2.png","version_number":"1.3.2","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.3.2/","downloads":8255,"date_created":"2023-04-23T16:53:55.287335+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"66ed78df-2782-4cea-b103-e5b5a71e6501","file_size":26003004},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.3.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.3.1.png","version_number":"1.3.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.3.1/","downloads":580,"date_created":"2023-04-23T03:23:00.149793+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"8b0f01e7-39e2-43c9-984b-fd3a7ed394ae","file_size":26003075},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.3.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.3.0.png","version_number":"1.3.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.3.0/","downloads":15345,"date_created":"2023-03-23T00:30:20.525892+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"9ab5cd29-aa98-4a04-a439-95487a6dadc5","file_size":25986252},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.2.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.2.1.png","version_number":"1.2.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.2.1/","downloads":7553,"date_created":"2023-03-18T19:45:31.484316+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"baa48100-b9a8-4c6b-ac88-cc50569cba16","file_size":25984513},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.2.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.2.0.png","version_number":"1.2.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.2.0/","downloads":740,"date_created":"2023-03-18T18:39:16.223678+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"be39d8c3-bfe5-4a2c-81fe-781b6db7b528","file_size":25985730},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.1.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.1.1.png","version_number":"1.1.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.1.1/","downloads":8259,"date_created":"2023-03-15T23:31:14.511698+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"ff1fd13a-218a-4ff3-a074-5d736df57438","file_size":25973964},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.1.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.1.0.png","version_number":"1.1.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.1.0/","downloads":1217,"date_created":"2023-03-15T21:17:05.311120+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"a76d2de3-1e27-424a-8bd3-ede95df2c13c","file_size":25974394},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.0.1","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.0.1.png","version_number":"1.0.1","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.0.1/","downloads":5053,"date_created":"2023-03-14T20:42:44.210986+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"ccd5c82f-69d4-4a30-8c3e-60aa86da5f82","file_size":25971767},{"name":"Fusion","full_name":"Lakatrazz-Fusion-1.0.0","description":"A multiplayer mod for BONELAB, taking advantage of its physical interaction.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lakatrazz-Fusion-1.0.0.png","version_number":"1.0.0","dependencies":["gnonme-BoneLib-2.2.1"],"download_url":"https://thunderstore.io/package/download/Lakatrazz/Fusion/1.0.0/","downloads":3786,"date_created":"2023-03-14T17:04:39.293765+00:00","website_url":"https://github.com/Lakatrazz/BONELAB-Fusion","is_active":true,"uuid4":"971e8b87-62b2-4e5c-9b0f-07ecb9f7f69a","file_size":25971348}]},{"name":"AdjustHandRotations","full_name":"Potato_Caravans_Team-AdjustHandRotations","owner":"Potato_Caravans_Team","package_url":"https://thunderstore.io/c/bonelab/p/Potato_Caravans_Team/AdjustHandRotations/","donation_link":null,"date_created":"2026-01-05T18:38:03.486452+00:00","date_updated":"2026-01-05T18:38:04.942010+00:00","uuid4":"25c72b4b-4167-4890-a342-21f23d88570a","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"AdjustHandRotations","full_name":"Potato_Caravans_Team-AdjustHandRotations-1.0.0","description":"This mod rotates (the items in) your hand to make them point straight. Works on vanilla items, random modded items do not seem to rotate. Why? I have no idea! At least the vanilla items are 'usable' on quest 2 now...","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potato_Caravans_Team-AdjustHandRotations-1.0.0.png","version_number":"1.0.0","dependencies":["LavaGang-MelonLoader-0.7.1"],"download_url":"https://thunderstore.io/package/download/Potato_Caravans_Team/AdjustHandRotations/1.0.0/","downloads":489,"date_created":"2026-01-05T18:38:04.532163+00:00","website_url":"","is_active":true,"uuid4":"93fc7ae2-24aa-4a41-97b3-15ebaf3e10ff","file_size":40831}]},{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste","owner":"Fizzyhex","package_url":"https://thunderstore.io/c/bonelab/p/Fizzyhex/PalletPaste/","donation_link":null,"date_created":"2024-08-20T00:52:55.622502+00:00","date_updated":"2026-01-05T18:19:53.313532+00:00","uuid4":"98114490-0db9-45d3-9ea5-2cdea314c7ae","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste-2.1.0","description":"Install Mod.io mods from your clipboard at runtime, via Fusion's downloader.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Fizzyhex-PalletPaste-2.1.0.png","version_number":"2.1.0","dependencies":["Lakatrazz-Fusion-1.13.0"],"download_url":"https://thunderstore.io/package/download/Fizzyhex/PalletPaste/2.1.0/","downloads":289,"date_created":"2026-01-05T18:19:52.941397+00:00","website_url":"https://github.com/Fizzyhex/BONELAB-Pallet-Paste","is_active":true,"uuid4":"48fe5e44-0428-4c5a-a72e-fa4540bb6ec4","file_size":27320},{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste-2.0.0","description":"Install Mod.io mods from your clipboard at runtime, via Fusion's downloader.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Fizzyhex-PalletPaste-2.0.0.png","version_number":"2.0.0","dependencies":["Lakatrazz-Fusion-1.9.3"],"download_url":"https://thunderstore.io/package/download/Fizzyhex/PalletPaste/2.0.0/","downloads":1706,"date_created":"2024-12-01T22:31:40.685220+00:00","website_url":"https://github.com/Fizzyhex/BONELAB-Pallet-Paste","is_active":true,"uuid4":"da45824f-46f7-4f73-b0be-73ea2a9b3807","file_size":24657},{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste-1.0.2","description":"Install Mod.io mods from your clipboard at runtime, via Fusion's downloader.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Fizzyhex-PalletPaste-1.0.2.png","version_number":"1.0.2","dependencies":["Lakatrazz-Fusion-1.9.3"],"download_url":"https://thunderstore.io/package/download/Fizzyhex/PalletPaste/1.0.2/","downloads":128,"date_created":"2024-12-01T03:25:20.788461+00:00","website_url":"https://github.com/Fizzyhex/BONELAB-Pallet-Paste","is_active":true,"uuid4":"e8b76b1a-919a-45c9-bcc3-33e87ee582f6","file_size":23073},{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste-1.0.1","description":"Install Mod.io mods from your clipboard at runtime, via Fusion's downloader.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Fizzyhex-PalletPaste-1.0.1.png","version_number":"1.0.1","dependencies":["Lakatrazz-Fusion-1.9.3"],"download_url":"https://thunderstore.io/package/download/Fizzyhex/PalletPaste/1.0.1/","downloads":62,"date_created":"2024-12-01T03:08:38.853960+00:00","website_url":"https://github.com/Fizzyhex/BONELAB-Pallet-Paste","is_active":true,"uuid4":"4881cbbd-500e-4e06-96e1-fb5ee32fdba9","file_size":23077},{"name":"PalletPaste","full_name":"Fizzyhex-PalletPaste-1.0.0","description":"Install Mod.io mods from your clipboard at runtime, via Fusion's downloader.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Fizzyhex-PalletPaste-1.0.0.png","version_number":"1.0.0","dependencies":["Lakatrazz-Fusion-1.7.0"],"download_url":"https://thunderstore.io/package/download/Fizzyhex/PalletPaste/1.0.0/","downloads":639,"date_created":"2024-08-20T00:52:57.353149+00:00","website_url":"https://github.com/Fizzyhex/BONELAB-Pallet-Paste","is_active":true,"uuid4":"b3762f64-8c08-455c-8d53-c996a7657744","file_size":22947}]},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools","owner":"doge15567","package_url":"https://thunderstore.io/c/bonelab/p/doge15567/MoreItemsInDevTools/","donation_link":null,"date_created":"2024-03-25T01:10:47.978669+00:00","date_updated":"2026-01-05T06:04:07.495200+00:00","uuid4":"cdf0d6d2-36ab-438c-b51b-1cb1e5b36c6d","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-4.0.0","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-4.0.0.png","version_number":"4.0.0","dependencies":["bonelib-BoneLib-3.2.0","LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/4.0.0/","downloads":1285,"date_created":"2026-01-05T06:04:07.136562+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"82da082a-a426-41d6-994d-4a454e92d9a6","file_size":66033},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-3.1.4","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-3.1.4.png","version_number":"3.1.4","dependencies":["gnonme-BoneLib-3.0.0","LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/3.1.4/","downloads":5850,"date_created":"2025-06-15T21:40:14.024002+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"c51553e3-4710-4571-b9c4-2a093cfc97cf","file_size":65260},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-3.0.4","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-3.0.4.png","version_number":"3.0.4","dependencies":["gnonme-BoneLib-3.0.0","LavaGang-MelonLoader-0.6.6"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/3.0.4/","downloads":3949,"date_created":"2024-12-04T18:51:14.640965+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"9ecafbd7-31b4-4473-bc1c-d5aa6d8dc058","file_size":65174},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-3.0.3","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-3.0.3.png","version_number":"3.0.3","dependencies":["gnonme-BoneLib-3.0.0","LavaGang-MelonLoader-0.6.4"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/3.0.3/","downloads":1759,"date_created":"2024-08-21T00:58:57.546835+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"7d02898a-da12-4f30-8e6e-7441c12ac319","file_size":73774},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-3.0.1","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-3.0.1.png","version_number":"3.0.1","dependencies":["gnonme-BoneLib-2.4.0","LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/3.0.1/","downloads":1401,"date_created":"2024-04-27T01:56:24.880251+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"6a77b140-7c03-4df6-9c23-871ea9e489a6","file_size":64384},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-3.0.0","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-3.0.0.png","version_number":"3.0.0","dependencies":["gnonme-BoneLib-2.4.0","LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/3.0.0/","downloads":93,"date_created":"2024-04-26T21:23:42.188248+00:00","website_url":"https://github.com/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"36e86dfd-a1d3-4cbf-9b44-e60d16a204bc","file_size":64666},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-2.0.0","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-2.0.0.png","version_number":"2.0.0","dependencies":["gnonme-BoneLib-2.4.0","LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/2.0.0/","downloads":665,"date_created":"2024-03-27T23:09:21.445786+00:00","website_url":"https://thunderstore.io/c/bonelab/p/doge15567/MoreItemsInDevTools/","is_active":true,"uuid4":"78e86942-4601-4d53-a3b9-472f7120ab04","file_size":62717},{"name":"MoreItemsInDevTools","full_name":"doge15567-MoreItemsInDevTools-1.0.0","description":"Adds more user-definable items to list of items spawned by dev tools cheat","icon":"https://gcdn.thunderstore.io/live/repository/icons/doge15567-MoreItemsInDevTools-1.0.0.png","version_number":"1.0.0","dependencies":["gnonme-BoneLib-2.4.0","LavaGang-MelonLoader-0.5.7"],"download_url":"https://thunderstore.io/package/download/doge15567/MoreItemsInDevTools/1.0.0/","downloads":308,"date_created":"2024-03-25T01:10:50.300083+00:00","website_url":"https://github.com/thunderstore-io","is_active":true,"uuid4":"b00e1a3c-a919-40b9-a8bd-7ceba223f4f1","file_size":61203}]},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker","owner":"notnotnotswipez","package_url":"https://thunderstore.io/c/bonelab/p/notnotnotswipez/ModioModNetworker/","donation_link":"https://ko-fi.com/notnotnotswipez","date_created":"2023-04-30T06:58:00.176746+00:00","date_updated":"2026-01-05T05:43:14.038360+00:00","uuid4":"f7ad6973-c254-466e-bd0d-bfabc3f0b8c1","rating_score":27,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.7.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.7.0.png","version_number":"2.7.0","dependencies":["Lakatrazz-Fusion-1.13.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.7.0/","downloads":3898,"date_created":"2026-01-05T05:43:13.509191+00:00","website_url":"","is_active":true,"uuid4":"0641d839-8e9d-431e-801c-e89978f617e5","file_size":3443814},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.6.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.6.0.png","version_number":"2.6.0","dependencies":["Lakatrazz-Fusion-1.11.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.6.0/","downloads":25203,"date_created":"2025-06-16T17:05:19.259958+00:00","website_url":"","is_active":true,"uuid4":"379e8b25-b89c-49d0-8067-aed852a62205","file_size":3443404},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.5.1","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.5.1.png","version_number":"2.5.1","dependencies":["Lakatrazz-Fusion-1.9.3"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.5.1/","downloads":10762,"date_created":"2025-01-20T06:33:52.281249+00:00","website_url":"","is_active":true,"uuid4":"bc581ba5-be85-4488-bc47-bf791432d4a7","file_size":3443378},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.5.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.5.0.png","version_number":"2.5.0","dependencies":["Lakatrazz-Fusion-1.9.3"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.5.0/","downloads":111,"date_created":"2025-01-20T04:30:22.508800+00:00","website_url":"","is_active":true,"uuid4":"5fafc3d0-fcef-445c-b332-86bec9145972","file_size":3443367},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.4.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.4.0.png","version_number":"2.4.0","dependencies":["Lakatrazz-Fusion-1.8.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.4.0/","downloads":7947,"date_created":"2024-10-17T07:18:13.936937+00:00","website_url":"","is_active":true,"uuid4":"23311335-2ba7-4441-bda9-6d9c7fc55989","file_size":3713860},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.3.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.3.0.png","version_number":"2.3.0","dependencies":["Lakatrazz-Fusion-1.6.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.3.0/","downloads":6676,"date_created":"2024-08-14T01:17:16.696912+00:00","website_url":"","is_active":true,"uuid4":"e5dcf36d-908c-4854-ac5b-048034f83e9d","file_size":3590920},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.2.3","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.2.3.png","version_number":"2.2.3","dependencies":["Lakatrazz-Fusion-1.6.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.2.3/","downloads":16474,"date_created":"2024-03-13T06:09:47.445276+00:00","website_url":"","is_active":true,"uuid4":"3cc74ec6-5993-465e-b5eb-788e6fdf075a","file_size":3233461},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.2.2","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.2.2.png","version_number":"2.2.2","dependencies":["Lakatrazz-Fusion-1.6.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.2.2/","downloads":731,"date_created":"2024-03-12T02:29:00.994280+00:00","website_url":"","is_active":true,"uuid4":"196c6da0-8848-4e39-8131-266f69a9a0cc","file_size":3233383},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.2.1","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.2.1.png","version_number":"2.2.1","dependencies":["Lakatrazz-Fusion-1.6.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.2.1/","downloads":538,"date_created":"2024-03-10T20:26:48.320613+00:00","website_url":"","is_active":true,"uuid4":"84de188b-30d0-4043-81ea-0f2adb19b4e4","file_size":3233388},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.2.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.2.0.png","version_number":"2.2.0","dependencies":["Lakatrazz-Fusion-1.6.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.2.0/","downloads":315,"date_created":"2024-03-10T20:21:09.464102+00:00","website_url":"","is_active":true,"uuid4":"ceee97b6-f3e0-436f-8af3-4ec405cb877b","file_size":3241478},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.1.1","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.1.1.png","version_number":"2.1.1","dependencies":["Lakatrazz-Fusion-1.5.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.1.1/","downloads":25265,"date_created":"2023-09-03T04:58:14.230072+00:00","website_url":"","is_active":true,"uuid4":"d44d1b09-1f86-41ff-969d-f836467dcfde","file_size":3241291},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.1.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.1.0.png","version_number":"2.1.0","dependencies":["Lakatrazz-Fusion-1.5.0"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.1.0/","downloads":683,"date_created":"2023-09-03T02:17:35.231801+00:00","website_url":"","is_active":true,"uuid4":"bc8be0fe-65da-4ed3-9a82-c36954bf2218","file_size":3240874},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-2.0.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-2.0.0.png","version_number":"2.0.0","dependencies":["Lakatrazz-Fusion-1.4.1"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/2.0.0/","downloads":5286,"date_created":"2023-07-05T02:53:26.174501+00:00","website_url":"","is_active":true,"uuid4":"6a61ae1e-e9b2-4f24-8b2a-de372ebf38c8","file_size":1697920},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.5.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.5.0.png","version_number":"1.5.0","dependencies":["Lakatrazz-Fusion-1.4.1"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.5.0/","downloads":2233,"date_created":"2023-06-02T04:57:57.906577+00:00","website_url":"","is_active":true,"uuid4":"8a4c4800-9950-406f-9bd9-284811424e2a","file_size":250823},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.4.1","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.4.1.png","version_number":"1.4.1","dependencies":["Lakatrazz-Fusion-1.4.1"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.4.1/","downloads":979,"date_created":"2023-05-25T19:37:32.352244+00:00","website_url":"","is_active":true,"uuid4":"2f580ac9-92cb-428d-a5fa-9249c7eb70a5","file_size":241429},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.4.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.4.0.png","version_number":"1.4.0","dependencies":["Lakatrazz-Fusion-1.3.2"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.4.0/","downloads":1037,"date_created":"2023-05-14T23:55:40.353631+00:00","website_url":"","is_active":true,"uuid4":"bde5a2b6-851e-4998-9a88-221c4f0a0c2d","file_size":241124},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.3.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.3.0.png","version_number":"1.3.0","dependencies":["Lakatrazz-Fusion-1.3.2"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.3.0/","downloads":956,"date_created":"2023-05-06T04:15:12.338276+00:00","website_url":"","is_active":true,"uuid4":"c90b68ef-57f1-498a-b4a6-265434b358ea","file_size":28513},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.2.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.2.0.png","version_number":"1.2.0","dependencies":["Lakatrazz-Fusion-1.3.2"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.2.0/","downloads":431,"date_created":"2023-05-03T01:55:08.786785+00:00","website_url":"","is_active":true,"uuid4":"7d055521-199a-4e87-a5e9-c52af7c4d8ad","file_size":25889},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.1.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.1.0.png","version_number":"1.1.0","dependencies":["Lakatrazz-Fusion-1.3.2"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.1.0/","downloads":282,"date_created":"2023-05-02T01:36:23.609727+00:00","website_url":"","is_active":true,"uuid4":"e95773ff-aacc-4eec-9ad9-afef681d4744","file_size":25813},{"name":"ModioModNetworker","full_name":"notnotnotswipez-ModioModNetworker-1.0.0","description":"Mod.io subscription integration. (Auto Downloader, Auto Updater, Fusion Lobby Mod Sharing)","icon":"https://gcdn.thunderstore.io/live/repository/icons/notnotnotswipez-ModioModNetworker-1.0.0.png","version_number":"1.0.0","dependencies":["Lakatrazz-Fusion-1.3.2"],"download_url":"https://thunderstore.io/package/download/notnotnotswipez/ModioModNetworker/1.0.0/","downloads":530,"date_created":"2023-04-30T06:58:01.395901+00:00","website_url":"","is_active":true,"uuid4":"be3d418c-a0d6-4452-8e27-54fd24a3e8d9","file_size":22696}]},{"name":"FireworkHitmarkers","full_name":"TheGlonker-FireworkHitmarkers","owner":"TheGlonker","package_url":"https://thunderstore.io/c/bonelab/p/TheGlonker/FireworkHitmarkers/","donation_link":null,"date_created":"2026-01-04T19:38:08.357814+00:00","date_updated":"2026-01-04T19:38:12.396731+00:00","uuid4":"ec8ffe24-9ecd-4e0c-b3c0-4a4a7b48cf66","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Code Mods"],"versions":[{"name":"FireworkHitmarkers","full_name":"TheGlonker-FireworkHitmarkers-1.0.0","description":"Firework Hitmarkers (VERY RUSHED!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/TheGlonker-FireworkHitmarkers-1.0.0.png","version_number":"1.0.0","dependencies":["LavaGang-MelonLoader-0.7.1","NotEnoughPhotons-Hitmarkers-2.10.1","bonelib-BoneLib-3.2.0","TrevTV-AudioImportLib-1.3.0"],"download_url":"https://thunderstore.io/package/download/TheGlonker/FireworkHitmarkers/1.0.0/","downloads":308,"date_created":"2026-01-04T19:38:11.924129+00:00","website_url":"https://www.youtube.com/channel/UChmrPxgY_-GILp6MM76yw1w/","is_active":true,"uuid4":"30c9ff6c-7be2-4a63-892c-18756816649e","file_size":533362}]}]`);
const CATEGORY_MAP$1 = {
  "Code Mods": "Frameworks",
  "Cosmetics": "Cosmetic",
  "Cosmetic": "Cosmetic",
  "Items": "Items",
  "Weapons": "Weapons",
  "Maps": "Content",
  "Audio": "Audio",
  "Libraries": "Libraries",
  "Tools": "Tools",
  "Gameplay": "Gameplay",
  "Graphics": "Graphics",
  "Performance": "Performance",
  "UI": "UI",
  "Multiplayer": "Multiplayer",
  "Server-side": "Server-side",
  "Client-side": "Client-side"
};
function mapThunderstoreCategories$1(tsCategories) {
  if (!tsCategories || tsCategories.length === 0) {
    return ["Misc"];
  }
  const mapped = tsCategories.map((cat) => CATEGORY_MAP$1[cat] || "Misc");
  return [...new Set(mapped)];
}
function transformThunderstorePackageToMod$1(pkg) {
  const latestVersion = pkg.versions[0];
  const totalDownloads = pkg.versions.reduce((sum, v) => sum + v.downloads, 0);
  const versions = pkg.versions.map((v) => ({
    version_number: v.version_number,
    datetime_created: v.date_created,
    download_count: v.downloads,
    download_url: v.download_url,
    install_url: v.download_url
    // Can be enhanced later with ror2mm:// style links
  }));
  const readmeHtml = `
    <h1>${pkg.name}</h1>
    <p>${latestVersion?.description || "No description available."}</p>
    <h2>Links</h2>
    <ul>
      <li><a href="${pkg.package_url}" target="_blank">View on Thunderstore</a></li>
      ${latestVersion?.website_url ? `<li><a href="${latestVersion.website_url}" target="_blank">Project Website</a></li>` : ""}
    </ul>
    <h2>Stats</h2>
    <ul>
      <li>Rating: ${pkg.rating_score}</li>
      <li>Total Downloads: ${totalDownloads.toLocaleString()}</li>
      <li>Last Updated: ${new Date(pkg.date_updated).toLocaleDateString()}</li>
    </ul>
  `.trim();
  return {
    id: pkg.uuid4,
    gameId: "bonelab",
    kind: "mod",
    name: pkg.name,
    author: pkg.owner,
    description: latestVersion?.description || "",
    version: latestVersion?.version_number || "0.0.0",
    downloads: totalDownloads,
    iconUrl: latestVersion?.icon || "",
    isInstalled: Math.random() > 0.5,
    isEnabled: Math.random() > 0.5,
    lastUpdated: pkg.date_updated,
    dependencies: latestVersion?.dependencies || [],
    categories: mapThunderstoreCategories$1(pkg.categories),
    readmeHtml,
    versions
  };
}
const BONELAB_MODS = sampleModsJson.map(
  transformThunderstorePackageToMod$1
);
const h3vrModsJson = /* @__PURE__ */ JSON.parse(`[{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Guns_of_the_Cold_War/","donation_link":null,"date_created":"2022-03-06T01:20:15.225088+00:00","date_updated":"2025-11-30T19:01:34.941694+00:00","uuid4":"252b5b70-ad2b-4be5-8e4d-d9f814cbe2fe","rating_score":10,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.5","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.5.png","version_number":"1.3.5","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","Volks-VAHAN_Redux-1.0.0","Volks-SWModel49Bodyguard-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.1.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-2.1.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.1.0","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.3.0","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.1.0","JerryAr-RPG26-1.0.3","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0","NovaProot-NorincoCQ-1.0.0","Volks-BullpupG3Rifle-1.0.0","ultrasnail-Armalite_AR15_Prototype-1.1.1","ultrasnail-La_France_M16K-1.0.0","ultrasnail-AR15_Accessory_pack-1.0.0","fsce-Ashes_Weaver_QwikPoint-1.0.0","Volks-ANPVS4-1.0.0","superpug-nydar_model_47-2.0.2","Volks-M16Bipods-1.0.0","Volks-AttachableGrips-1.0.0","ultrasnail-HK53-1.0.0","WickedBadger-FN_KSP58B-1.0.1","WickedBadger-L1A1_SLR-1.0.1","Iqsbasiczz-Erma_Style_Lugers-1.0.1","Volks-Sterling30CalPrototype-1.0.0","Volks-ColtKingCobra-1.0.1","Muzzle-Savage_99_Rifles-1.0.0","Volks-BerettaM12S-1.0.0","Volks-F1SMG_Aus-1.0.0","JerryAr-BS1_UnderbarrelGL-1.0.1","Billiam_J_McGoonigan-Chinese_Arisaka-1.0.0","Billiam_J_McGoonigan-Tommy_Tokarev-1.0.0","Volks-RugerBlackhawk44Magnum-1.0.0","Volks-RugerModel44-1.0.0","Volks-RugerM77Rifle-1.0.0","Volks-SWModel61-1.0.0","Volks-MarlinModel995-1.0.0","Volks-ColtKingCobraTarget22LR-1.0.0","Volks-BrowningBuckMarkFieldPistol-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.3.5/","downloads":1130,"date_created":"2025-11-30T19:01:34.574836+00:00","website_url":"","is_active":true,"uuid4":"44afa89c-cb0e-4d8b-99bf-75d188881b46","file_size":69304},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.4","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.4.png","version_number":"1.3.4","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","Volks-VAHAN_Redux-1.0.0","Volks-SWModel49Bodyguard-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.1.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-2.1.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.1.0","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.3.0","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.1.0","JerryAr-RPG26-1.0.3","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0","NovaProot-NorincoCQ-1.0.0","Volks-BullpupG3Rifle-1.0.0","ultrasnail-Armalite_AR15_Prototype-1.1.1","ultrasnail-La_France_M16K-1.0.0","ultrasnail-AR15_Accessory_pack-1.0.0","fsce-Ashes_Weaver_QwikPoint-1.0.0","Volks-ANPVS4-1.0.0","superpug-nydar_model_47-2.0.2","Volks-M16Bipods-1.0.0","Volks-AttachableGrips-1.0.0","ultrasnail-HK53-1.0.0","WickedBadger-FN_KSP58B-1.0.1","WickedBadger-L1A1_SLR-1.0.1","Iqsbasiczz-Erma_Style_Lugers-1.0.1","Volks-Sterling30CalPrototype-1.0.0","Volks-ColtKingCobra-1.0.1","Muzzle-Savage_99_Rifles-1.0.0","Volks-BerettaM12S-1.0.0","Volks-F1SMG_Aus-1.0.0","JerryAr-BS1_UnderbarrelGL-1.0.1","Billiam_J_McGoonigan-Chinese_Arisaka-1.0.0","Billiam_J_McGoonigan-Tommy_Tokarev-1.0.0","Volks-RugerBlackhawk44Magnum-1.0.0","Volks-RugerModel44-1.0.0","Volks-RugerM77Rifle-1.0.0","Volks-SWModel61-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.3.4/","downloads":760,"date_created":"2025-11-03T00:30:02.699677+00:00","website_url":"","is_active":true,"uuid4":"0c57cf91-be80-4145-89ce-07dfa9e18d6f","file_size":69225},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.3","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.3.png","version_number":"1.3.3","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","Volks-VAHAN_Redux-1.0.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-2.1.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.1.0","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.3.0","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.1.0","JerryAr-RPG26-1.0.2","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0","NovaProot-NorincoCQ-1.0.0","Volks-BullpupG3Rifle-1.0.0","ultrasnail-Armalite_AR15_Prototype-1.1.1","ultrasnail-La_France_M16K-1.0.0","ultrasnail-AR15_Accessory_pack-1.0.0","fsce-Ashes_Weaver_QwikPoint-1.0.0","Volks-ANPVS4-1.0.0","superpug-nydar_model_47-2.0.2","Volks-M16Bipods-1.0.0","Volks-AttachableGrips-1.0.0","ultrasnail-HK53-1.0.0","WickedBadger-FN_KSP58B-1.0.1","WickedBadger-L1A1_SLR-1.0.1","Iqsbasiczz-Erma_Style_Lugers-1.0.1","Volks-Sterling30CalPrototype-1.0.0","Volks-ColtKingCobra-1.0.1","Muzzle-Savage_99_Rifles-1.0.0","Volks-BerettaM12S-1.0.0","Volks-F1SMG_Aus-1.0.0","JerryAr-BS1_UnderbarrelGL-1.0.0","Billiam_J_McGoonigan-Chinese_Arisaka-1.0.0","Billiam_J_McGoonigan-Tommy_Tokarev-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.3.3/","downloads":1219,"date_created":"2025-09-06T19:25:42.724508+00:00","website_url":"","is_active":true,"uuid4":"37fc97b0-8398-40cc-9301-ce638b138ca2","file_size":69131},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.2","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.2.png","version_number":"1.3.2","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","Volks-VAHAN_Redux-1.0.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-2.1.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.3.0","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.1.0","JerryAr-RPG26-1.0.2","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0","NovaProot-NorincoCQ-1.0.0","Volks-BullpupG3Rifle-1.0.0","ultrasnail-Armalite_AR15_Prototype-1.1.1","ultrasnail-La_France_M16K-1.0.0","ultrasnail-AR15_Accessory_pack-1.0.0","fsce-Ashes_Weaver_QwikPoint-1.0.0","Volks-ANPVS4-1.0.0","superpug-nydar_model_47-2.0.2","Volks-M16Bipods-1.0.0","Volks-AttachableGrips-1.0.0","ultrasnail-HK53-1.0.0","WickedBadger-FN_KSP58B-1.0.1","WickedBadger-L1A1_SLR-1.0.1","Iqsbasiczz-Erma_Style_Lugers-1.0.1","Volks-Sterling30CalPrototype-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.3.2/","downloads":941,"date_created":"2025-08-02T12:16:04.970162+00:00","website_url":"","is_active":true,"uuid4":"09e1a584-bbbc-42e0-bc24-d7577bee3acd","file_size":68999},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.1","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.3.1.png","version_number":"1.3.1","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-2.1.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.1.1","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-ModulColtACR-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.1.0","JerryAr-RPG26-1.0.2","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0","NovaProot-NorincoCQ-1.0.0","Volks-BullpupG3Rifle-1.0.0","ultrasnail-Armalite_AR15_Prototype-1.1.1","ultrasnail-La_France_M16K-1.0.0","ultrasnail-AR15_Accessory_pack-1.0.0","fsce-Ashes_Weaver_QwikPoint-1.0.0","Volks-ANPVS4-1.0.0","superpug-nydar_model_47-2.0.2","Volks-M16Bipods-1.0.0","Volks-AttachableGrips-1.0.0","ultrasnail-HK53-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.3.1/","downloads":971,"date_created":"2025-07-05T15:03:29.429441+00:00","website_url":"","is_active":true,"uuid4":"32693464-e05c-4f80-a1dd-49144245e7ac","file_size":68749},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.9","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.9.png","version_number":"1.2.9","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.3.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-2.1.1","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","OSPO-Berreta_M70-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","OSPO-Zastava_M70-1.0.1","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.1","Volks-FRF1_FRF2-1.0.0","NovaProot-SidewinderSMG-1.0.0","Volks-TKB0145-1.0.0","Volks-ModulColtACR-1.0.0","Volks-BrowningBLR-1.0.0","ultrasnail-HK33-1.0.0","JerryAr-RPG26-1.0.2","MommyMercy-Modul_HK_SL7-0.1.0","JerryAr-M202_Flash-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.9/","downloads":980,"date_created":"2025-06-04T22:39:51.772840+00:00","website_url":"","is_active":true,"uuid4":"eda64a0d-cdeb-4a3c-9bbe-148fb082de90","file_size":67971},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.8","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.8.png","version_number":"1.2.8","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.3.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.3.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-1.8.3","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","OSPO-Berreta_M70-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","OSPO-Zastava_M70-1.0.1","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0","ShermanJumbo-Masterkey-1.0.0","Volks-SawedRPD-1.0.0","Volks-AAIQSPR_Revolver-1.0.0","Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","Billiam_J_McGoonigan-Snake_Charmer-1.0.0","Volks-RP46_LMG-1.0.0","Volks-Type56Suppressed-1.0.0","Volks-Mark4Mod0-1.0.0","Volks-FRF1_FRF2-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.8/","downloads":1184,"date_created":"2025-05-04T18:54:12.715575+00:00","website_url":"","is_active":true,"uuid4":"7f1a9b83-977c-453d-bc3f-e3006d5e5c29","file_size":67804},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.7","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.7.png","version_number":"1.2.7","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.2.5","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.2.1","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-1.8.3","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","OSPO-Berreta_M70-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","OSPO-Zastava_M70-1.0.1","JerryAr-NSV-1.2.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0","ultrasnail-M14K-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.7/","downloads":1166,"date_created":"2025-04-03T23:08:35.018081+00:00","website_url":"","is_active":true,"uuid4":"c4f0268b-b544-42e9-b97d-39379e5a6757","file_size":67580},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.6","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.6.png","version_number":"1.2.6","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.2.3","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.0.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-1.8.3","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","OSPO-Berreta_M70-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","OSPO-Zastava_M70-1.0.1","JerryAr-NSV-1.0.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0","Volks-SterlingMk4SMG-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.6/","downloads":1150,"date_created":"2025-03-01T23:52:17.264908+00:00","website_url":"","is_active":true,"uuid4":"c3db960f-2573-476b-af4f-22614675c0b8","file_size":67529},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.5","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.5.png","version_number":"1.2.5","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","Volks-MR73RevolverSet-1.0.0","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.2","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.0.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.3","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0","Volksterism-Type67ChicomGrenade-1.0.0","Volks-DM51Grenades-1.0.0","NovaProot-AutoOrdnance_M1911A1-1.0.0","Volks-Remington1187-1.0.0","JerryAr-PKM_2-1.8.3","Volks-RKG3AntiTank-1.0.0","Volks-V40MiniGrenade-1.0.0","Volks-CZ50Pistol-1.0.0","OSPO-Berreta_M70-1.0.0","Billiam_J_McGoonigan-MAT49-1.0.3","Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","Volks-BrowningHiPowerMk3-1.0.0","Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","Volks-VZ25SMG-1.0.0","Volks-Pancerovka27ALauncher-1.0.0","Okkim-Terminator_AMT_Hardballer-1.0.0","OSPO-Zastava_M70-1.0.1","JerryAr-NSV-1.0.0","Volks-SWM76SMG-1.0.0","Volks-Type86sBullpupRifle-1.0.0","Billiam_J_McGoonigan-GunsOfTheWarlords-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.5/","downloads":1345,"date_created":"2025-01-26T00:04:33.197591+00:00","website_url":"","is_active":true,"uuid4":"f800e825-77d2-49b9-a19b-47a3ea217555","file_size":67495},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.4","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.4.png","version_number":"1.2.4","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.1","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.0.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.1","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1","Volks-CetmeLRifle-1.0.0","Volks-RPOShmel-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.4/","downloads":2395,"date_created":"2024-11-29T20:47:29.029227+00:00","website_url":"","is_active":true,"uuid4":"98270082-b5c8-4342-a69a-f1ef6c3cc7c8","file_size":66970},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.3","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.3.png","version_number":"1.2.3","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.6","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.0","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.0.0","ShermanJumbo-TP82-1.0.0","Volksterism-HawkMM1Launcher-1.0.0","Volksterism-MossbergBullpupShotgun-1.0.1","Volksterism-DM34Launcher-1.0.1","NovaProot-Remington870-1.1.0","ultrasnail-NDR-1.0.0","ultrasnail-280_FN_FAL-1.0.0","Volks-ModulWieger940Series-1.0.1","Volksterism-ModulType56Rifle-1.2.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.3/","downloads":1416,"date_created":"2024-11-02T19:48:13.713467+00:00","website_url":"","is_active":true,"uuid4":"6fa8564e-e1e3-4f54-a5fd-6d7c5aad6b33","file_size":66925},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.2","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.2.png","version_number":"1.2.2","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.5","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.1","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0","thewnbot-Model_733_Commando-1.0.0","ultrasnail-AC556-1.0.0","sirpotatos-Vz68_Skorpion-1.0.0","NovaProot-MinebeaP9-1.0.0","NovaProot-Type3AK-1.0.0","ultrasnail-CAR_15-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.2/","downloads":2094,"date_created":"2024-09-01T20:07:39.288870+00:00","website_url":"","is_active":true,"uuid4":"3881e662-1a48-4864-838d-8a737d0ab27e","file_size":66683},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.1","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.1.png","version_number":"1.2.1","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.5","Billiam_J_McGoonigan-BAR_Variants-1.0.2","NovaProot-Type1AK-1.0.0","Volksterism-HowaType64-1.0.0","Volksterism-AR70-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.1/","downloads":1662,"date_created":"2024-07-29T22:59:16.521125+00:00","website_url":"","is_active":true,"uuid4":"6678e0df-994b-4f44-8383-41b1c4176706","file_size":66520},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.0","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.2.0.png","version_number":"1.2.0","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","Billiam_J_McGoonigan-BAR_Variants-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1","Volksterism-C58-1.1.0","JerryAr-More_RPG7_Rockets-1.0.0","ultrasnail-C633-1.0.2","JerryAr-AKS74n-1.1.1","Not_Wolfie-FN_CAL-3.0.5"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.2.0/","downloads":1791,"date_created":"2024-06-15T15:54:44.012000+00:00","website_url":"","is_active":true,"uuid4":"1a5e8e32-72a0-42ff-8730-01eea85a3c27","file_size":66440},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.9","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.9.png","version_number":"1.1.9","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","Billiam_J_McGoonigan-BAR_Variants-1.0.0","sirpotatos-CZ75_Auto-3.0.1","Billiam_J_McGoonigan-Type_63-1.0.1","Billiam_J_McGoonigan-Type_79_SMG-1.0.0","Billiam_J_McGoonigan-Type73-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.9/","downloads":2671,"date_created":"2024-04-03T22:15:41.534308+00:00","website_url":"","is_active":true,"uuid4":"054acaad-8c96-4efc-b40e-b5a60bf80b2f","file_size":66155},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.8","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.8.png","version_number":"1.1.8","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM_2-1.5.1","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.2","MommyMercy-MR73-1.0.2","Billiam_J_McGoonigan-M79_Obrez-1.0.1","Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","Billiam_J_McGoonigan-L42A1-1.0.1","Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","Billiam_J_McGoonigan-BAR_Variants-1.0.0","sirpotatos-CZ75_Auto-3.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.8/","downloads":2942,"date_created":"2024-01-07T20:19:25.190744+00:00","website_url":"","is_active":true,"uuid4":"544b2c82-7482-4112-aa06-2347c4d25725","file_size":66120},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.7","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.7.png","version_number":"1.1.7","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM_2-1.4.3","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Billiam_J_McGoonigan-Ithaca_M37-1.1.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.1.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.7/","downloads":3136,"date_created":"2023-10-24T23:24:46.140870+00:00","website_url":"","is_active":true,"uuid4":"6591e5a8-b5c4-4ad3-a72b-02e5661c30ad","file_size":66041},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.6","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.6.png","version_number":"1.1.6","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM_2-1.2.2","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.4","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.1","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.1","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1","Andrew_FTW-RPG_76_Komar-1.0.0","Shault-PM63-1.2.0","Pykkle-Izhmash_18_MH-1.0.1","Billiam_J_McGoonigan-Ithaca_M37-1.1.0","Pykkle-Beretta_87-1.0.0","Billiam_J_McGoonigan-Bren_Variants-1.0.0","Shault-Daewoo_K_Series-1.0.0","JerryAr-9k111-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.6/","downloads":2010,"date_created":"2023-09-02T15:52:48.530252+00:00","website_url":"","is_active":true,"uuid4":"b76be008-9671-48fb-b4fd-4c6d8a0fd645","file_size":66042},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.5","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.5.png","version_number":"1.1.5","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM_2-1.2.2","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.3","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.0","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.0","JerryAr-MG3-1.0.1","JerryAr-Type81_1-1.0.0","Vohnyshche-TOZ66-1.0.1","Vohnyshche-TOZ34-1.0.1","Vohnyshche-SIG_Sauer_P220-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.5/","downloads":3098,"date_created":"2023-05-23T21:08:56.555382+00:00","website_url":"","is_active":true,"uuid4":"c540442f-02df-4a24-b7a3-78b4cc142dbd","file_size":65795},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.4","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.4.png","version_number":"1.1.4","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM_2-1.2.2","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.1.3","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.0","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.1.0","JerryAr-MG3-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.4/","downloads":2359,"date_created":"2023-04-09T22:22:29.615584+00:00","website_url":"","is_active":true,"uuid4":"9ea52b25-a811-477d-b665-36fb1e42760c","file_size":65699},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.3","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.3.png","version_number":"1.1.3","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Muzzle-Zastava_M76-1.0.0","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.1.0","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0","JerryAr-9K34_Igla_Manpad-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.3/","downloads":2250,"date_created":"2023-03-01T23:46:09.186178+00:00","website_url":"","is_active":true,"uuid4":"16542f5a-c23c-4b5a-b734-12bcaeb28fab","file_size":65700},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.2","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.2.png","version_number":"1.1.2","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Muzzle-Zastava_M76-1.0.0","Andrew_FTW-Beretta_84fs_Chettah-1.0.0","JerryAr-SPG9-1.0.0","devyndamonster-M82-1.0.0","devyndamonster-TKB_022PM_No2-1.0.0","Not_Wolfie-FN_CAL-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.2/","downloads":2314,"date_created":"2023-01-14T15:11:54.526620+00:00","website_url":"","is_active":true,"uuid4":"cc20feec-c4db-430a-9cf6-48483003a2fd","file_size":65670},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.1","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.1.png","version_number":"1.1.1","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.1","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Muzzle-Zastava_M76-1.0.0","Andrew_FTW-Beretta_84fs_Chettah-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.1/","downloads":2841,"date_created":"2022-11-17T02:01:24.236235+00:00","website_url":"","is_active":true,"uuid4":"33f564e9-3870-4509-9623-6a98b6710824","file_size":65617},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.0","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.1.0.png","version_number":"1.1.0","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.0","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5","Muzzle-Zastava_M76-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.1.0/","downloads":1747,"date_created":"2022-10-21T19:35:00.213773+00:00","website_url":"","is_active":true,"uuid4":"b4e6d43b-d049-4c62-9441-c25249e0da4d","file_size":65577},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.9","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.9.png","version_number":"1.0.9","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.1.0","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0","Muzzle-SIG_P210_Pistols-1.0.0","Andrew_FTW-FTW_Arms_M82A2-1.0.0","Muzzle-SW_M52_and_M952_Pistols-1.0.0","TheBigWhimp-Calico_M950-1.1.5"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.9/","downloads":1809,"date_created":"2022-09-21T22:39:03.129481+00:00","website_url":"","is_active":true,"uuid4":"a0468191-27a4-4bd5-b4d6-c6403a9515fa","file_size":65546},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.8","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.8.png","version_number":"1.0.8","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.0.2","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.4","Prime_Vr-Street_Sweeper-1.0.1","Okkim-Howa_Type_89-1.0.1","Muzzle-Detonics_Combat_Master-1.0.0","Muzzle-SW_Model_25_Revolver-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.8/","downloads":1551,"date_created":"2022-09-05T00:34:10.607342+00:00","website_url":"","is_active":true,"uuid4":"83375903-061e-4f56-9c50-b0f575436a3a","file_size":65430},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.7","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.7.png","version_number":"1.0.7","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.0.2","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.1","Prime_Vr-Street_Sweeper-1.0.0","Okkim-Howa_Type_89-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.7/","downloads":1501,"date_created":"2022-08-19T00:01:04.775786+00:00","website_url":"","is_active":true,"uuid4":"253b31bd-245d-4d38-8f97-cadff77e3bbd","file_size":65345},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.6","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.6.png","version_number":"1.0.6","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.0.2","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0","0cto-SWModel13-1.0.0","Prime_Vr-700_Nitro_Express-1.0.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.6/","downloads":1500,"date_created":"2022-08-06T19:45:12.958676+00:00","website_url":"","is_active":true,"uuid4":"11f4b7be-bfb7-49b5-9046-1533f733c2ea","file_size":65270},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.5","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.5.png","version_number":"1.0.5","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.1.1","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.0.2","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0","Tyconson67-Danuvia_M53_K1-1.1.0","Capt_Tony-series70_9mm-1.0.0","Capt_Tony-Delta_Elite-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.5/","downloads":1688,"date_created":"2022-07-19T13:06:56.358428+00:00","website_url":"","is_active":true,"uuid4":"4bb284b1-9809-44fe-95fa-97fd01901afa","file_size":65189},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.4","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.4.png","version_number":"1.0.4","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.0.0","devyndamonster-Vahan-1.1.0","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.2","Muzzle-CETME_Ameli_Machine_Gun-1.0.0","Pykkle-B76_Series-1.0.2","devyndamonster-APS-1.0.0","JerryAr-RedArrow73-1.0.0","Capt_Tony-SW_224-1.0.0","devyndamonster-RG_019-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.4/","downloads":1685,"date_created":"2022-06-26T19:19:44.432910+00:00","website_url":"","is_active":true,"uuid4":"6b706ebb-a9a8-4605-aab3-1d3de0f48de5","file_size":65092},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.3","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.3.png","version_number":"1.0.3","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.2","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.0.0","devyndamonster-Vahan-1.0.1","Capt_Tony-SW_M49-1.0.0","devyndamonster-BV_025-1.0.0","devyndamonster-MGD_PM9-1.0.0","devyndamonster-Carl_Gustaf_M45-1.0.0","Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","JerryAr-AGS17-1.1.1","JerryAr-BGM71-1.0.1","cityrobo-HK_VP70-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.3/","downloads":2385,"date_created":"2022-05-13T15:53:36.999326+00:00","website_url":"","is_active":true,"uuid4":"1da4bd80-e4ee-46d1-9102-766913867926","file_size":64956},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.2","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.2.png","version_number":"1.0.2","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0","cityrobo-HK_P7-1.0.1","cityrobo-HK_NBW-1.0.0","devyndamonster-vz_52-1.0.0","devyndamonster-PSM-1.0.0","devyndamonster-Vahan-1.0.1","Capt_Tony-SW_M49-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.2/","downloads":1863,"date_created":"2022-04-14T22:17:57.453505+00:00","website_url":"","is_active":true,"uuid4":"ef0ac76a-275b-4729-8ad6-660dac3a1a60","file_size":64792},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.1","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.1.png","version_number":"1.0.1","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8","Muzzle-Gyrojet_Pistol-1.0.0","Kapitan_Greythorn-TOZ_81-1.0.0","Muzzle-Muzzles_Automags-1.0.0","Bistard-Type85MicrosoundSMG-1.2.0","devyndamonster-SA_81_Krasa-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.1/","downloads":1778,"date_created":"2022-03-19T23:46:38.779327+00:00","website_url":"","is_active":true,"uuid4":"1cf390d3-7312-4cda-8fb2-43a662f481ab","file_size":64665},{"name":"Guns_of_the_Cold_War","full_name":"Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.0","description":"A mod compilation of Guns from the Cold War","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Guns_of_the_Cold_War-1.0.0.png","version_number":"1.0.0","dependencies":["Potatoes-Potatoes_Pistols-10.0.1","Potatoes-Potatoes_Rifles-9.2.0","Potatoes-Potatoes_SMGs-9.1.1","Potatoes-Potatoes_Machine_Guns-9.1.0","cityrobo-WhitneyWolverine-1.0.0","Meat_banono-Meats_ASP-1.0.3","Andrew_FTW-FTW_Arms_Bren_10-1.0.1","sirpotatos-CZ75_Auto-2.0.0","Muzzle-Glock_17_Gen_2-1.0.0","superpug-PBPISTOL-1.0.0","superpug-sw659-1.0.0","JerryAr-Type59-1.0.0","nayr31-IZh27-1.0.1","Andrew_FTW-FTW_Arms_KS_23-1.0.0","devyndamonster-RG_063-1.1.0","devyndamonster-TKB_486-1.1.0","devyndamonster-AD46-1.1.0","devyndamonster-Afanasyevs_Rifle-1.1.0","devyndamonster-AG_042-1.1.0","Muzzle-IMI_Galil-2.0.0","devyndamonster-Konstantinov_SA_1-1.0.0","devyndamonster-TKB_0136-1.1.0","cityrobo-TKB_059-1.0.2","Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","Andrew_FTW-FTW_Arms_LMG11-1.1.1","JerryAr-PKM-1.1.8"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Guns_of_the_Cold_War/1.0.0/","downloads":1190,"date_created":"2022-03-06T01:20:15.386770+00:00","website_url":"","is_active":true,"uuid4":"147bdbba-98c4-4912-9491-60864a0c3c33","file_size":64503}]},{"name":"HK_437","full_name":"WickedBadger-HK_437","owner":"WickedBadger","package_url":"https://thunderstore.io/c/h3vr/p/WickedBadger/HK_437/","donation_link":"https://ko-fi.com/wickedbadger","date_created":"2026-01-11T19:09:23.593031+00:00","date_updated":"2026-01-14T11:55:50.472723+00:00","uuid4":"f5259bbc-aa97-4120-b6a0-7e6dd35b45c0","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HK_437","full_name":"WickedBadger-HK_437-1.0.2","description":".300 Blackout has never felt so good. Part of Modmas 2025","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-HK_437-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/HK_437/1.0.2/","downloads":799,"date_created":"2026-01-14T11:55:48.081618+00:00","website_url":"","is_active":true,"uuid4":"c1fe02e1-c63b-4d6c-856a-1b5a2df14d83","file_size":114908502},{"name":"HK_437","full_name":"WickedBadger-HK_437-1.0.1","description":".300 Blackout has never felt so good. Part of Modmas 2025","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-HK_437-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.12.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/HK_437/1.0.1/","downloads":539,"date_created":"2026-01-11T19:29:33.045393+00:00","website_url":"","is_active":true,"uuid4":"1b727c1a-a0cc-4a7a-aa66-a1c3f36117d3","file_size":114893292},{"name":"HK_437","full_name":"WickedBadger-HK_437-1.0.0","description":".300 Blackout has never felt so good. Part of Modmas 2025","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-HK_437-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/HK_437/1.0.0/","downloads":49,"date_created":"2026-01-11T19:09:27.166434+00:00","website_url":"","is_active":true,"uuid4":"647eb07c-52aa-4631-8785-ea79221f5c0c","file_size":114893085}]},{"name":"SR_Franks","full_name":"Packer-SR_Franks","owner":"Packer","package_url":"https://thunderstore.io/c/h3vr/p/Packer/SR_Franks/","donation_link":null,"date_created":"2025-11-30T17:52:40.215745+00:00","date_updated":"2025-11-30T17:52:43.543612+00:00","uuid4":"60f9891f-eef1-4174-8e22-e3c52a65689c","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Characters"],"versions":[{"name":"SR_Franks","full_name":"Packer-SR_Franks-1.0.0","description":"WW2 Franks for Supply Raid","icon":"https://gcdn.thunderstore.io/live/repository/icons/Packer-SR_Franks-1.0.0.png","version_number":"1.0.0","dependencies":["Packer-SupplyRaid-1.3.0"],"download_url":"https://thunderstore.io/package/download/Packer/SR_Franks/1.0.0/","downloads":700,"date_created":"2025-11-30T17:52:43.156701+00:00","website_url":"https://ko-fi.com/packerb","is_active":true,"uuid4":"a5890e50-1c08-46a3-8dba-de7e756fa966","file_size":193174}]},{"name":"r2modman","full_name":"ebkr-r2modman","owner":"ebkr","package_url":"https://thunderstore.io/c/h3vr/p/ebkr/r2modman/","donation_link":"https://www.mcsuk.org/make-a-donation/","date_created":"2019-06-05T15:09:31.571563+00:00","date_updated":"2025-11-22T12:34:03.972449+00:00","uuid4":"f21c391c-0bc5-431d-a233-95323b95e01b","rating_score":1235,"is_pinned":true,"is_deprecated":false,"has_nsfw_content":false,"categories":[],"versions":[{"name":"r2modman","full_name":"ebkr-r2modman-3.2.11","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.11.png","version_number":"3.2.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.11/","downloads":376229,"date_created":"2025-11-22T12:33:58.943650+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"dd45d18f-877a-45a5-a9a4-9dbd6a267f56","file_size":287350696},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.10","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.10.png","version_number":"3.2.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.10/","downloads":60720,"date_created":"2025-11-12T16:00:21.863302+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6e861179-b377-451b-8979-dd0a79fb2fbd","file_size":287115682},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.9","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.9.png","version_number":"3.2.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.9/","downloads":138897,"date_created":"2025-10-19T16:53:01.522847+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bb45f36b-f629-4c86-9498-34161006e94f","file_size":296842471},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.8","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.8.png","version_number":"3.2.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.8/","downloads":121453,"date_created":"2025-09-26T13:06:39.196866+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fad26a65-72ef-44a6-a95d-20636fa79c66","file_size":296567523},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.7","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.7.png","version_number":"3.2.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.7/","downloads":11810,"date_created":"2025-09-23T14:20:54.348322+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c7667895-0fda-453a-a207-a1ad38282267","file_size":296563545},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.6","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.6.png","version_number":"3.2.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.6/","downloads":20117,"date_created":"2025-09-19T15:50:18.168579+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6f966be8-e251-4db2-a3d1-f95e243d70b4","file_size":291256215},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.5","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.5.png","version_number":"3.2.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.5/","downloads":928,"date_created":"2025-09-19T12:50:39.944189+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cdef324d-035e-402d-99ca-f60528b70d8c","file_size":291256058},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.4","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.4.png","version_number":"3.2.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.4/","downloads":543,"date_created":"2025-09-19T10:38:48.141922+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3b488cb9-7fc1-44bf-99bd-93cc1954481b","file_size":291254131},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.3","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.3.png","version_number":"3.2.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.3/","downloads":244505,"date_created":"2025-08-04T07:52:17.294419+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3879d2a3-4dc8-480c-8829-26dddcd76e3c","file_size":255452916},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.2","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.2.png","version_number":"3.2.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.2/","downloads":36855,"date_created":"2025-07-28T13:46:39.635732+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"abf5fc69-6d8a-4053-a592-a37635aeadc5","file_size":255309477},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.1","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.1.png","version_number":"3.2.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.1/","downloads":211947,"date_created":"2025-06-26T07:59:40.412997+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0b829dd2-4e65-4461-a17a-b7b3a0c830ba","file_size":254994183},{"name":"r2modman","full_name":"ebkr-r2modman-3.2.0","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.2.0.png","version_number":"3.2.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.2.0/","downloads":215023,"date_created":"2025-05-18T17:33:43.029426+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fd53cb5f-4448-4503-890f-a86d0e42dabf","file_size":252941837},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.58","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.58.png","version_number":"3.1.58","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.58/","downloads":240533,"date_created":"2025-04-17T19:45:04.048092+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fa03bc7e-33d8-4406-ae24-be507122da30","file_size":252539929},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.57","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.57.png","version_number":"3.1.57","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.57/","downloads":391868,"date_created":"2025-03-10T19:23:06.585609+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3ca900e1-d920-4afe-8cba-dd2ba070e90f","file_size":250695216},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.56","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.56.png","version_number":"3.1.56","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.56/","downloads":66244,"date_created":"2025-02-26T18:31:40.214524+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"e92e5c90-56f8-4360-9c15-17a8a426c401","file_size":250054587},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.55","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.55.png","version_number":"3.1.55","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.55/","downloads":483457,"date_created":"2024-12-10T22:39:58.350433+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4da72c7d-0c2d-40c0-a5fd-20693641060f","file_size":249804671},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.54","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.54.png","version_number":"3.1.54","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.54/","downloads":134630,"date_created":"2024-11-16T17:44:20.210556+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"05b94202-3ce9-4428-b6ad-f2dff1272037","file_size":249301001},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.53","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.53.png","version_number":"3.1.53","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.53/","downloads":16273,"date_created":"2024-11-13T22:28:23.418406+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0165783e-6cb0-4370-9ff1-87574d784259","file_size":249300530},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.52","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.52.png","version_number":"3.1.52","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.52/","downloads":48345,"date_created":"2024-11-04T19:05:06.051386+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"264e92ab-60f3-4df3-9cc7-79ddccd15d00","file_size":249158064},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.51","description":"A simple and easy to use mod manager for many games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.51.png","version_number":"3.1.51","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.51/","downloads":80119,"date_created":"2024-10-21T20:31:16.730326+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"52c2356b-4945-426e-958b-cbb0f578b57a","file_size":206719223},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.50","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.50_1JSysFW.png","version_number":"3.1.50","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.50/","downloads":184135,"date_created":"2024-09-14T11:04:52.878145+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5c475758-0850-4f64-b205-dc3b0356031a","file_size":205245933},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.49","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.49.png","version_number":"3.1.49","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.49/","downloads":502543,"date_created":"2024-06-18T18:25:08.373381+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"daed4043-f83c-4177-9d96-af5051f98a21","file_size":203351266},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.48","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.48.png","version_number":"3.1.48","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.48/","downloads":476565,"date_created":"2024-04-06T11:26:19.181731+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"fb82d798-7ad6-49b4-acc4-0343d4606afa","file_size":201573108},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.47","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.47.png","version_number":"3.1.47","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.47/","downloads":426465,"date_created":"2024-02-15T21:35:13.517238+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2accf607-9a07-41a4-a72c-268ec1c98afe","file_size":201082192},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.46","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.46.png","version_number":"3.1.46","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.46/","downloads":576969,"date_created":"2024-01-14T22:30:18.014155+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"da5d829a-9672-4f43-9ca0-0ac946cb6a58","file_size":199795193},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.45","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.45.png","version_number":"3.1.45","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.45/","downloads":1425337,"date_created":"2023-11-24T17:45:34.982794+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"25b7b6f3-6804-4d3a-8b94-9c31f99d678a","file_size":199387810},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.44","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.44.png","version_number":"3.1.44","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.44/","downloads":186187,"date_created":"2023-10-01T22:03:58.031195+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0ac93cdf-dac8-4bb1-8e7e-2f33023f4492","file_size":198809707},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.43","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.43.png","version_number":"3.1.43","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.43/","downloads":119185,"date_created":"2023-08-22T20:32:53.759077+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"085a4ded-f59a-4bbb-b1f7-0aa5edf11075","file_size":198587541},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.42","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.42.png","version_number":"3.1.42","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.42/","downloads":264237,"date_created":"2023-05-26T16:16:34.396998+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"efc56670-2f06-4ff4-bb85-a2dd0b5a4d41","file_size":197180625},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.41","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.41.png","version_number":"3.1.41","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.41/","downloads":109229,"date_created":"2023-04-15T22:14:49.850876+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"e4626a4e-d211-4e01-b520-d3d0d14a678c","file_size":196779372},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.40","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.40.png","version_number":"3.1.40","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.40/","downloads":43839,"date_created":"2023-04-01T21:51:47.327008+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4a7bc9ef-fea4-4073-9f90-ad8753c8d092","file_size":196770408},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.39","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.39.png","version_number":"3.1.39","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.39/","downloads":95686,"date_created":"2023-03-03T23:53:41.546486+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b8ec9537-c61d-4c61-bd86-b0d0d1b36c5e","file_size":196509260},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.38","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.38.png","version_number":"3.1.38","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.38/","downloads":14220,"date_created":"2023-02-26T20:57:45.065115+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c33e29b4-0cdb-4ec5-ae3d-05eec6f0d030","file_size":196144109},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.37","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.37.png","version_number":"3.1.37","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.37/","downloads":18786,"date_created":"2023-02-20T17:39:44.486182+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b2fc7bd0-8c13-453f-9862-def571e848ab","file_size":195334783},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.36","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.36.png","version_number":"3.1.36","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.36/","downloads":78228,"date_created":"2023-01-27T21:03:34.924308+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4126ca3e-56ae-4cf9-9a81-f41487f6c549","file_size":195097752},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.35","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.35.png","version_number":"3.1.35","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.35/","downloads":54387,"date_created":"2023-01-07T19:24:26.829809+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8258dc9f-90b9-4f57-9d1d-b26b2177533c","file_size":195051581},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.34","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.34.png","version_number":"3.1.34","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.34/","downloads":90649,"date_created":"2022-11-28T18:44:53.435253+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1fecd87a-5b79-475c-ad8b-d6d031195323","file_size":195044531},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.33","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.33.png","version_number":"3.1.33","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.33/","downloads":21503,"date_created":"2022-11-19T18:38:05.397261+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9de94141-3fda-4e70-8f35-b1ccadeed20a","file_size":195043337},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.32","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.32.png","version_number":"3.1.32","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.32/","downloads":113995,"date_created":"2022-08-29T13:56:41.160962+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f4acf4ba-bccc-40ad-84dd-4f00c38aabfe","file_size":194791512},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.31","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.31.png","version_number":"3.1.31","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.31/","downloads":79316,"date_created":"2022-07-03T21:41:22.525428+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7cd3c96d-6077-4b6f-a287-e589b2216a9d","file_size":206966569},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.29","description":"A simple and easy to use mod manager for several games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.29.png","version_number":"3.1.29","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.29/","downloads":24584,"date_created":"2022-06-18T14:44:40.441264+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9bf02e23-3f79-4c41-a0a5-7ea6175080fe","file_size":193504102},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.28","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.28.png","version_number":"3.1.28","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.28/","downloads":68838,"date_created":"2022-05-07T17:49:51.800253+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3d38b6d2-d0f2-4bd9-a923-b7e933e9d62b","file_size":193464136},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.27","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.27.png","version_number":"3.1.27","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.27/","downloads":124997,"date_created":"2022-02-18T21:19:12.171802+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a4a37e90-eb98-4380-8340-c86e97fda2b3","file_size":192900000},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.26","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.26.png","version_number":"3.1.26","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.26/","downloads":3377,"date_created":"2022-02-18T21:04:12.121436+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6bc475e4-be6e-4c8d-9294-c81c13a1044c","file_size":192899789},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.25","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.25.png","version_number":"3.1.25","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.25/","downloads":145066,"date_created":"2021-11-24T21:27:52.161403+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"27b058fb-b9e2-435a-8f09-85ca5f6a265b","file_size":141989592},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.24","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.24.png","version_number":"3.1.24","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.24/","downloads":27075,"date_created":"2021-11-05T17:58:46.564940+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b76cd8af-a41c-4eb1-aeea-3aa6a0136cf9","file_size":141846352},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.23","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.23.png","version_number":"3.1.23","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.23/","downloads":4483,"date_created":"2021-11-04T21:33:56.132925+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6823e272-5cc8-4e0e-b072-87a920d47656","file_size":141845325},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.22","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.22.png","version_number":"3.1.22","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.22/","downloads":5411,"date_created":"2021-11-03T07:56:49.015663+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c788483f-f45f-48ee-a75a-8c8df2bcf1ed","file_size":141707711},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.21","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.21.png","version_number":"3.1.21","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.21/","downloads":5742,"date_created":"2021-11-01T18:50:59.634082+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"010aafb2-8d71-4ad5-83aa-6c5edb8f3819","file_size":141704558},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.20","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.20.png","version_number":"3.1.20","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.20/","downloads":40734,"date_created":"2021-10-01T19:58:22.922910+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a9597530-7d20-458b-9b23-f46f90ef534b","file_size":141672201},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.19","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.19.png","version_number":"3.1.19","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.19/","downloads":58499,"date_created":"2021-08-21T12:04:42.976125+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3ce6cb4a-4d52-4f60-b15e-e1cf81d15fc9","file_size":141431944},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.18","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.18.png","version_number":"3.1.18","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.18/","downloads":3624,"date_created":"2021-08-21T10:18:02.353937+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c7e42327-a0bd-40d1-ba56-cddc5fcd1958","file_size":141432030},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.17","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.17.png","version_number":"3.1.17","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.17/","downloads":83225,"date_created":"2021-07-01T19:49:57.272642+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5557a39c-7b89-4dc0-9d6a-c91beb62d7dd","file_size":141027100},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.16","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.16.png","version_number":"3.1.16","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.16/","downloads":23936,"date_created":"2021-06-16T13:47:37.250819+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ce56db96-3017-403f-8dfe-fe60a9871dbf","file_size":140721045},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.15","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.15.png","version_number":"3.1.15","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.15/","downloads":17843,"date_created":"2021-06-05T08:48:09.493728+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cb37c95a-80af-47fa-a716-4e904d9d0fb4","file_size":140557597},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.14","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.14.png","version_number":"3.1.14","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.14/","downloads":39466,"date_created":"2021-05-11T23:00:41.936347+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"774ee629-d199-4586-8d44-68b4dde9b9d9","file_size":140416573},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.13","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.13.png","version_number":"3.1.13","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.13/","downloads":14688,"date_created":"2021-05-04T20:57:28.308621+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"0b1c945f-72e1-48b6-a0ba-a7870ce7b0e8","file_size":140210352},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.12","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.12.png","version_number":"3.1.12","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.12/","downloads":16401,"date_created":"2021-04-27T20:41:57.956109+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"938fc7f9-7472-45dd-a973-77a64f671ff4","file_size":140208926},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.11","description":"A simple and easy to use mod manager for several Unity games using Thunderstore","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.11.png","version_number":"3.1.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.11/","downloads":8025,"date_created":"2021-04-25T17:29:12.936395+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"437bda28-c81d-4467-b471-899cc0ef7628","file_size":140210416},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.10","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.10.png","version_number":"3.1.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.10/","downloads":44557,"date_created":"2021-04-05T11:25:42.845926+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bcdfed58-9ea5-4328-b385-d8972a174fd9","file_size":139037805},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.9","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.9.png","version_number":"3.1.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.9/","downloads":97176,"date_created":"2021-03-06T01:47:51.126103+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9661b257-a500-48a4-8674-99b27b3b8a75","file_size":138769707},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.8","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program, Valheim and GTFO","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.8.png","version_number":"3.1.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.8/","downloads":6954,"date_created":"2021-03-05T01:05:53.155707+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3471e06d-460e-46e4-9f53-e298ed262ed3","file_size":138770094},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.7","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.7.png","version_number":"3.1.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.7/","downloads":20191,"date_created":"2021-02-27T00:16:58.129002+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ace681e0-70a5-4ca7-b5c4-896cd306bbd8","file_size":138770349},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.6","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.6.png","version_number":"3.1.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.6/","downloads":11478,"date_created":"2021-02-23T23:21:28.504369+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8d74f7d5-c9d7-4a8b-a9b1-d5bf0ffb6ae0","file_size":138770617},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.5","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.5.png","version_number":"3.1.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.5/","downloads":17731,"date_created":"2021-02-16T02:42:39.660146+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"58e51ed3-ab07-4916-aa94-1437c039ee7a","file_size":138768953},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.4","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.4.png","version_number":"3.1.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.4/","downloads":3978,"date_created":"2021-02-16T00:59:54.156292+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c3fa7414-6f4a-4a10-a2b3-10c22e821f20","file_size":138768295},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.3","description":"A simple and easy to use mod manager for Risk of Rain 2, Dyson Sphere Program and Valheim","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.3.png","version_number":"3.1.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.3/","downloads":4019,"date_created":"2021-02-15T21:15:25.010105+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"d822e87d-1cb5-430d-a853-366dc551f814","file_size":138769637},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.1.png","version_number":"3.1.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.1/","downloads":17857,"date_created":"2021-02-02T09:49:27.558948+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5cc9c434-ffd3-489b-a8f9-e0128a98e097","file_size":138793373},{"name":"r2modman","full_name":"ebkr-r2modman-3.1.0","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.1.0.png","version_number":"3.1.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.1.0/","downloads":15742,"date_created":"2021-01-24T15:12:55.028434+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"61a0d304-61e4-40e6-9ad6-11a112204de9","file_size":138791851},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.36","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.36.png","version_number":"3.0.36","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.36/","downloads":66326,"date_created":"2020-11-03T22:07:15.233505+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1abefb9e-1353-4b5f-ad96-e40d6ed5228e","file_size":53237788},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.35","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.35.png","version_number":"3.0.35","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.35/","downloads":5346,"date_created":"2020-11-01T13:00:46.209298+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2249534a-8068-4c3d-95dc-765c2086775f","file_size":53208052},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.34","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.34.png","version_number":"3.0.34","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.34/","downloads":6170,"date_created":"2020-10-28T16:03:12.802670+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"bd5f3ead-854d-4359-a0bf-7611671ec878","file_size":53210022},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.33","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.33.png","version_number":"3.0.33","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.33/","downloads":14016,"date_created":"2020-10-10T10:55:25.597028+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"28c6e3e3-2516-4636-a2e9-bb9aed37f11b","file_size":53196580},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.32","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.32.png","version_number":"3.0.32","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.32/","downloads":6759,"date_created":"2020-10-07T22:06:05.165560+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c5ed04f4-734f-4ef8-98b7-f02afc1b5699","file_size":53203796},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.31","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.31.png","version_number":"3.0.31","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.31/","downloads":21255,"date_created":"2020-09-19T19:21:01.854032+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8fe86420-dab9-4b97-8aef-c0701d362875","file_size":53191625},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.30","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.30.png","version_number":"3.0.30","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.30/","downloads":8509,"date_created":"2020-09-16T23:35:59.163280+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7039df24-9780-4b2a-bb68-b49fe5900462","file_size":53235837},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.29","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.29.png","version_number":"3.0.29","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.29/","downloads":16709,"date_created":"2020-09-09T12:09:16.440621+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2e14a0f2-0eab-47ba-9ccd-afa8e64eb4d5","file_size":52899999},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.28","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.28.png","version_number":"3.0.28","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.28/","downloads":17581,"date_created":"2020-09-02T15:27:09.290875+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"282bb8b3-94f4-4ecc-a83e-24e396901df0","file_size":52900568},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.27","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.27.png","version_number":"3.0.27","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.27/","downloads":9100,"date_created":"2020-08-31T09:35:43.375268+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"051bb42f-bc30-4e5d-a230-d73621be048c","file_size":52898826},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.26","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.26.png","version_number":"3.0.26","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.26/","downloads":30519,"date_created":"2020-08-22T13:44:02.822746+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"250a4434-3ebd-4cf6-9e75-8a25628ee455","file_size":52898637},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.25","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.25.png","version_number":"3.0.25","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.25/","downloads":4326,"date_created":"2020-08-22T11:17:32.662235+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"8452d436-02dd-4af3-a8c7-27ea26de529d","file_size":52899542},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.24","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.24.png","version_number":"3.0.24","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.24/","downloads":26571,"date_created":"2020-07-26T10:56:47.223818+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"c9e8bb9e-fea7-442f-8764-6a72d00b6807","file_size":52889331},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.23","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.23.png","version_number":"3.0.23","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.23/","downloads":3898,"date_created":"2020-07-26T10:49:12.980491+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"1eceeacc-131a-477d-a95b-04b06946a58c","file_size":52887807},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.22","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.22.png","version_number":"3.0.22","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.22/","downloads":8567,"date_created":"2020-06-28T00:32:00.892236+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"7810259f-28e8-4cad-9c65-b2644bba9336","file_size":45977362},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.21","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.21.png","version_number":"3.0.21","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.21/","downloads":4491,"date_created":"2020-06-25T20:07:59.326660+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"9ab3e881-3e2f-47e0-b7ef-81c09f9418d3","file_size":45976229},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.20","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.20.png","version_number":"3.0.20","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.20/","downloads":7334,"date_created":"2020-06-01T17:51:41.040774+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"142bd181-95b3-431a-9eb7-020dae4311c4","file_size":45972997},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.19","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.19.png","version_number":"3.0.19","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.19/","downloads":6843,"date_created":"2020-05-19T19:51:46.755064+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"06341f41-8272-4507-b1ef-e05afc645b55","file_size":45971086},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.18","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.18.png","version_number":"3.0.18","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.18/","downloads":4613,"date_created":"2020-05-17T18:38:46.989461+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f72dbb6a-8bf8-4c84-aa9d-ec16feceb37d","file_size":45972431},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.17","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.17.png","version_number":"3.0.17","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.17/","downloads":9113,"date_created":"2020-04-28T15:47:08.327588+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"84d88b06-e5d5-48dc-bc75-f10f069d69a8","file_size":45971108},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.16","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.16.png","version_number":"3.0.16","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.16/","downloads":3878,"date_created":"2020-04-26T20:50:33.762356+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"811f56d5-bd99-4073-8055-7d00cbeaf4a1","file_size":45971017},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.15","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.15.png","version_number":"3.0.15","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.15/","downloads":5112,"date_created":"2020-04-19T19:26:24.229587+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2cbc9319-fc3a-4695-8f8b-79ca98b80238","file_size":45970732},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.14","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.14.png","version_number":"3.0.14","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.14/","downloads":5902,"date_created":"2020-04-11T20:48:55.179139+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"d3dfdfeb-666f-4358-bece-28b5a439c471","file_size":45967135},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.13","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.13.png","version_number":"3.0.13","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.13/","downloads":4640,"date_created":"2020-04-08T15:57:04.532117+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"2218ca5e-450b-4e76-b981-035f785cb13f","file_size":45966646},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.12","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.12.png","version_number":"3.0.12","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.12/","downloads":6007,"date_created":"2020-04-03T21:09:45.911160+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b6459cc2-4835-420f-902e-adb72d4b1afd","file_size":45965599},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.11","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.11.png","version_number":"3.0.11","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.11/","downloads":5107,"date_created":"2020-04-01T16:31:25.864749+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4835a095-341c-4751-bf70-fc56e9cd1586","file_size":45965597},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.10","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.10.png","version_number":"3.0.10","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.10/","downloads":5412,"date_created":"2020-03-20T18:36:04.691592+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"b7ebf430-5a70-416f-9dc4-768790b00cfd","file_size":45954540},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.9","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.9.png","version_number":"3.0.9","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.9/","downloads":5413,"date_created":"2020-03-07T22:02:18.696065+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"f76e0601-1ddc-40f5-a096-8bf0f95d2049","file_size":49835583},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.8","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.8.png","version_number":"3.0.8","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.8/","downloads":4076,"date_created":"2020-03-01T17:17:32.370347+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"ae4e7926-99f6-4682-bf32-ef8c4c04c60b","file_size":49834827},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.7","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.7.png","version_number":"3.0.7","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.7/","downloads":5545,"date_created":"2020-02-05T21:11:38.692056+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"3db7a39a-1885-4746-ae21-f02cd26ff334","file_size":49841664},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.6","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.6.png","version_number":"3.0.6","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.6/","downloads":4555,"date_created":"2020-01-29T20:44:38.572881+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"6b856917-6f31-4fa7-af8c-6eef91b35b2b","file_size":48875224},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.5","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.5.png","version_number":"3.0.5","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.5/","downloads":4278,"date_created":"2020-01-26T16:29:42.148829+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"49482233-a207-416d-9470-9a7e9593bfec","file_size":48875529},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.4","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.4.png","version_number":"3.0.4","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.4/","downloads":4543,"date_created":"2020-01-22T21:41:01.925077+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"cb11e8f5-edfc-4b53-a732-dc517f099567","file_size":48872825},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.3","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.3.png","version_number":"3.0.3","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.3/","downloads":3758,"date_created":"2020-01-21T20:50:49.148746+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"4ad9f13b-93db-4b48-88a7-ba072c187277","file_size":48872148},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.2","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.2.png","version_number":"3.0.2","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.2/","downloads":4106,"date_created":"2020-01-20T21:45:34.413078+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"a6c21e47-ff57-42be-85e3-d67c44b7090c","file_size":48873010},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.1.png","version_number":"3.0.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.1/","downloads":4082,"date_created":"2020-01-19T21:33:27.192961+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"60527d80-09bd-4700-b16c-4c816c972d62","file_size":48871570},{"name":"r2modman","full_name":"ebkr-r2modman-3.0.0","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-3.0.0.png","version_number":"3.0.0","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/3.0.0/","downloads":3774,"date_created":"2020-01-19T12:00:03.164284+00:00","website_url":"https://github.com/ebkr/r2modmanPlus","is_active":true,"uuid4":"5bb643f3-816c-4e42-972d-23df84c01174","file_size":48871582},{"name":"r2modman","full_name":"ebkr-r2modman-2.1.1","description":"A simple and easy to use mod manager for Risk of Rain 2","icon":"https://gcdn.thunderstore.io/live/repository/icons/ebkr-r2modman-2.1.1.png","version_number":"2.1.1","dependencies":[],"download_url":"https://thunderstore.io/package/download/ebkr/r2modman/2.1.1/","downloads":6292,"date_created":"2019-10-27T13:19:52.253451+00:00","website_url":"https://github.com/ebkr/r2modman","is_active":true,"uuid4":"24f82a1a-81e4-4997-ae56-30e60e007b56","file_size":61410151}]},{"name":"BepInExPack_H3VR","full_name":"BepInEx-BepInExPack_H3VR","owner":"BepInEx","package_url":"https://thunderstore.io/c/h3vr/p/BepInEx/BepInExPack_H3VR/","donation_link":null,"date_created":"2021-05-23T15:58:00.609853+00:00","date_updated":"2021-10-11T18:10:51.248947+00:00","uuid4":"3ac26cd2-fd40-43ec-9a32-4a6e89632707","rating_score":11,"is_pinned":true,"is_deprecated":false,"has_nsfw_content":false,"categories":[],"versions":[{"name":"BepInExPack_H3VR","full_name":"BepInEx-BepInExPack_H3VR-5.4.1700","description":"BepInEx pack for H3VR. Preconfigured and ready to use.","icon":"https://gcdn.thunderstore.io/live/repository/icons/BepInEx-BepInExPack_H3VR-5.4.1700.png","version_number":"5.4.1700","dependencies":[],"download_url":"https://thunderstore.io/package/download/BepInEx/BepInExPack_H3VR/5.4.1700/","downloads":266835,"date_created":"2021-10-11T18:10:51.248947+00:00","website_url":"https://github.com/BepInEx/BepInEx","is_active":true,"uuid4":"40008b3f-71d1-426e-a8a6-6b4284d7e22e","file_size":637705},{"name":"BepInExPack_H3VR","full_name":"BepInEx-BepInExPack_H3VR-5.4.1101","description":"BepInEx pack for H3VR. Preconfigured and ready to use.","icon":"https://gcdn.thunderstore.io/live/repository/icons/BepInEx-BepInExPack_H3VR-5.4.1101.png","version_number":"5.4.1101","dependencies":[],"download_url":"https://thunderstore.io/package/download/BepInEx/BepInExPack_H3VR/5.4.1101/","downloads":69819,"date_created":"2021-05-23T16:00:04.644366+00:00","website_url":"https://github.com/BepInEx/BepInEx","is_active":true,"uuid4":"907918ce-8c6f-469a-b253-c9f4bc07dc02","file_size":631949},{"name":"BepInExPack_H3VR","full_name":"BepInEx-BepInExPack_H3VR-5.4.1100","description":"BepInEx pack for H3VR. Preconfigured and ready to use.","icon":"https://gcdn.thunderstore.io/live/repository/icons/BepInEx-BepInExPack_H3VR-5.4.1100.png","version_number":"5.4.1100","dependencies":[],"download_url":"https://thunderstore.io/package/download/BepInEx/BepInExPack_H3VR/5.4.1100/","downloads":75888,"date_created":"2021-05-23T15:58:09.743503+00:00","website_url":"https://github.com/BepInEx/BepInEx","is_active":true,"uuid4":"d2fa2a01-9b99-4245-acdb-02566b4f0a17","file_size":631934}]},{"name":"HuntSilverQuarter","full_name":"BitWizrd-HuntSilverQuarter","owner":"BitWizrd","package_url":"https://thunderstore.io/c/h3vr/p/BitWizrd/HuntSilverQuarter/","donation_link":null,"date_created":"2026-01-18T09:07:06.851248+00:00","date_updated":"2026-01-18T09:07:13.509658+00:00","uuid4":"9306289c-94f8-4088-b782-2dc446c6d044","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"HuntSilverQuarter","full_name":"BitWizrd-HuntSilverQuarter-1.0.0","description":"The Quad Derringer, in the Silver Quarter legendary skin, chambered in .50 Remington from Hunt: Showdown!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntSilverQuarter-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntSilverQuarter/1.0.0/","downloads":0,"date_created":"2026-01-18T09:07:11.923285+00:00","website_url":"","is_active":true,"uuid4":"d7325e8f-69f7-406a-bc3a-d3d38aac11e3","file_size":8758700}]},{"name":"HuntQuadDerringer","full_name":"BitWizrd-HuntQuadDerringer","owner":"BitWizrd","package_url":"https://thunderstore.io/c/h3vr/p/BitWizrd/HuntQuadDerringer/","donation_link":null,"date_created":"2026-01-18T08:43:46.902034+00:00","date_updated":"2026-01-18T08:43:53.826092+00:00","uuid4":"2780d6ef-87f5-40c5-bce0-398b8655f868","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"HuntQuadDerringer","full_name":"BitWizrd-HuntQuadDerringer-1.0.0","description":"The Quad Derringer chambered in .50 Remington from Hunt: Showdown! Finally a derringer that can head shot a sosig! Custom reload controls!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntQuadDerringer-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntQuadDerringer/1.0.0/","downloads":0,"date_created":"2026-01-18T08:43:52.601870+00:00","website_url":"","is_active":true,"uuid4":"c2c25af7-16b2-4010-be20-f019cede8c73","file_size":8789420}]},{"name":"Tasque_Manager_PlayerBody","full_name":"ShermanJumbo-Tasque_Manager_PlayerBody","owner":"ShermanJumbo","package_url":"https://thunderstore.io/c/h3vr/p/ShermanJumbo/Tasque_Manager_PlayerBody/","donation_link":null,"date_created":"2026-01-14T20:51:36.140305+00:00","date_updated":"2026-01-18T06:38:51.810826+00:00","uuid4":"ce41992b-a060-419d-b6e6-0cadda55101a","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Wearables"],"versions":[{"name":"Tasque_Manager_PlayerBody","full_name":"ShermanJumbo-Tasque_Manager_PlayerBody-1.0.1","description":"Order, order! Adds Tasque Manager from Deltarune as a playerbody!","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-Tasque_Manager_PlayerBody-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","VIP-H3MP-1.7.5","cityrobo-H3VRPlayerBodySystem-1.2.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/Tasque_Manager_PlayerBody/1.0.1/","downloads":6,"date_created":"2026-01-18T06:38:51.428538+00:00","website_url":"https://ko-fi.com/shermanjumbo","is_active":true,"uuid4":"7d0c44f5-a973-4799-91f9-4d582079d2e6","file_size":1975299},{"name":"Tasque_Manager_PlayerBody","full_name":"ShermanJumbo-Tasque_Manager_PlayerBody-1.0.0","description":"Order, order! Adds Tasque Manager from Deltarune as a playerbody!","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-Tasque_Manager_PlayerBody-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","VIP-H3MP-1.7.5","cityrobo-H3VRPlayerBodySystem-1.2.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/Tasque_Manager_PlayerBody/1.0.0/","downloads":176,"date_created":"2026-01-14T20:51:39.632722+00:00","website_url":"https://ko-fi.com/shermanjumbo","is_active":true,"uuid4":"02ef50c9-48ed-48c6-a104-f53addf282dc","file_size":1972593}]},{"name":"ShermanBelt","full_name":"ShermanJumbo-ShermanBelt","owner":"ShermanJumbo","package_url":"https://thunderstore.io/c/h3vr/p/ShermanJumbo/ShermanBelt/","donation_link":null,"date_created":"2026-01-18T06:35:09.893082+00:00","date_updated":"2026-01-18T06:35:12.640879+00:00","uuid4":"3d6f84e8-a3fb-492f-acf3-cb6b482f8816","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Wearables"],"versions":[{"name":"ShermanBelt","full_name":"ShermanJumbo-ShermanBelt-1.0.0","description":"A custom quickbelt of my own design based on the almighty FTWTactical belt from ALL!","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-ShermanBelt-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.12.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/ShermanBelt/1.0.0/","downloads":8,"date_created":"2026-01-18T06:35:12.280957+00:00","website_url":"https://ko-fi.com/shermanjumbo","is_active":true,"uuid4":"be0f8d5e-a965-4014-b68d-6d358adfb025","file_size":496281}]},{"name":"Staccatto_2011XC","full_name":"Lua-Staccatto_2011XC","owner":"Lua","package_url":"https://thunderstore.io/c/h3vr/p/Lua/Staccatto_2011XC/","donation_link":null,"date_created":"2025-11-16T11:38:19.184839+00:00","date_updated":"2026-01-17T23:16:17.949606+00:00","uuid4":"18a9a8a2-c449-488a-94ce-f83c8055d38e","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Staccatto_2011XC","full_name":"Lua-Staccatto_2011XC-1.0.3","description":"Did another World War happen?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lua-Staccatto_2011XC-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0","WFIOST-H3VRUtilities-8.11.1"],"download_url":"https://thunderstore.io/package/download/Lua/Staccatto_2011XC/1.0.3/","downloads":117,"date_created":"2026-01-17T23:16:16.030507+00:00","website_url":"","is_active":true,"uuid4":"f915cfae-a94d-428f-9db0-ba49f37414d4","file_size":95516963},{"name":"Staccatto_2011XC","full_name":"Lua-Staccatto_2011XC-1.0.2","description":"Did another World War happen?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lua-Staccatto_2011XC-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0","WFIOST-H3VRUtilities-8.11.1"],"download_url":"https://thunderstore.io/package/download/Lua/Staccatto_2011XC/1.0.2/","downloads":993,"date_created":"2025-11-24T10:29:32.446642+00:00","website_url":"","is_active":true,"uuid4":"1c985e13-5827-4f7e-a632-66e7daca7914","file_size":93459295},{"name":"Staccatto_2011XC","full_name":"Lua-Staccatto_2011XC-1.0.1","description":"Did another World War happen?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lua-Staccatto_2011XC-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0","WFIOST-H3VRUtilities-8.11.1"],"download_url":"https://thunderstore.io/package/download/Lua/Staccatto_2011XC/1.0.1/","downloads":373,"date_created":"2025-11-22T05:14:00.505011+00:00","website_url":"","is_active":true,"uuid4":"7ffc326b-1483-4a76-bd1f-df27ae831997","file_size":93503779},{"name":"Staccatto_2011XC","full_name":"Lua-Staccatto_2011XC-1.0.0","description":"Did another World War happen?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Lua-Staccatto_2011XC-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0","WFIOST-H3VRUtilities-8.11.1"],"download_url":"https://thunderstore.io/package/download/Lua/Staccatto_2011XC/1.0.0/","downloads":428,"date_created":"2025-11-16T11:38:25.749919+00:00","website_url":"","is_active":true,"uuid4":"2d70bee3-5f29-4660-b3e0-45ac560074a2","file_size":95482922}]},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid","owner":"BitWizrd","package_url":"https://thunderstore.io/c/h3vr/p/BitWizrd/HuntFirstAid/","donation_link":null,"date_created":"2025-02-01T07:58:21.515644+00:00","date_updated":"2026-01-17T22:56:19.740031+00:00","uuid4":"1d9d6417-fdac-498c-bf0a-4977e132f9e8","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.7","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown! Configurable with new sounds!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.7.png","version_number":"1.0.7","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.7/","downloads":123,"date_created":"2026-01-17T22:56:17.377366+00:00","website_url":"","is_active":true,"uuid4":"fe3cf908-cee4-4cd2-8130-3216d907a7b2","file_size":50022921},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.6","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown! Configurable with new sounds!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.6.png","version_number":"1.0.6","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.6/","downloads":1356,"date_created":"2025-12-22T06:19:27.234579+00:00","website_url":"","is_active":true,"uuid4":"ac1a1c48-dcdd-4aa5-9929-7f7163bc49fe","file_size":45523336},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.5","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown! Configurable with new sounds!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.5.png","version_number":"1.0.5","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.5/","downloads":1660,"date_created":"2025-10-30T06:45:23.758366+00:00","website_url":"","is_active":true,"uuid4":"8cfee5cd-846b-4fe7-a451-eb01df373686","file_size":63467099},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.4","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown! Configurable with new sounds!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.4.png","version_number":"1.0.4","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.4/","downloads":3049,"date_created":"2025-06-08T09:08:27.035976+00:00","website_url":"","is_active":true,"uuid4":"36bcf4c1-e992-44b0-a1e6-84ca36bb501b","file_size":63467041},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.3","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown! Configurable with new sounds!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.3/","downloads":58,"date_created":"2025-06-08T07:11:47.808305+00:00","website_url":"","is_active":true,"uuid4":"79e3404e-f140-4085-a1ee-8da768a031ff","file_size":63466981},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.1","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.1/","downloads":3770,"date_created":"2025-02-04T06:45:51.468209+00:00","website_url":"","is_active":true,"uuid4":"9762d10b-4d43-43d7-977e-ee5f02ce72d8","file_size":63407699},{"name":"HuntFirstAid","full_name":"BitWizrd-HuntFirstAid-1.0.0","description":"Extremely interactive healing items balanced for H3VR gameplay from Hunt: Showdown!","icon":"https://gcdn.thunderstore.io/live/repository/icons/BitWizrd-HuntFirstAid-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/BitWizrd/HuntFirstAid/1.0.0/","downloads":258,"date_created":"2025-02-01T07:58:27.336924+00:00","website_url":"","is_active":true,"uuid4":"35a976f3-adb9-4d8c-9c44-b4638395b843","file_size":63407499}]},{"name":"Back4Blood_357Magnum","full_name":"Biddin-Back4Blood_357Magnum","owner":"Biddin","package_url":"https://thunderstore.io/c/h3vr/p/Biddin/Back4Blood_357Magnum/","donation_link":null,"date_created":"2026-01-17T20:07:27.754975+00:00","date_updated":"2026-01-17T20:19:20.309264+00:00","uuid4":"69137bc6-93ef-40d9-9bbe-6981b7792354","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Back4Blood_357Magnum","full_name":"Biddin-Back4Blood_357Magnum-1.0.1","description":"Double-action Revolver with high power. Accurate but has a slow rate of fire. (It's an R8 that opens properly.)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Biddin-Back4Blood_357Magnum-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","Not_Wolfie-Modul_Workshop_Platform-2.0.1"],"download_url":"https://thunderstore.io/package/download/Biddin/Back4Blood_357Magnum/1.0.1/","downloads":54,"date_created":"2026-01-17T20:19:18.736121+00:00","website_url":"","is_active":true,"uuid4":"434b0f28-6bb8-4d20-9142-32512b77582e","file_size":72456583},{"name":"Back4Blood_357Magnum","full_name":"Biddin-Back4Blood_357Magnum-1.0.0","description":"Double-action Revolver with high power. Accurate but has a slow rate of fire. (It's an R8 that opens properly.)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Biddin-Back4Blood_357Magnum-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","Not_Wolfie-Modul_Workshop_Platform-2.0.1"],"download_url":"https://thunderstore.io/package/download/Biddin/Back4Blood_357Magnum/1.0.0/","downloads":13,"date_created":"2026-01-17T20:07:34.262855+00:00","website_url":"","is_active":true,"uuid4":"cde15b8b-9071-4bdc-b852-a9bb27c51ded","file_size":72456651}]},{"name":"Helldivers_2_Soundtrack","full_name":"Iqsbasiczz-Helldivers_2_Soundtrack","owner":"Iqsbasiczz","package_url":"https://thunderstore.io/c/h3vr/p/Iqsbasiczz/Helldivers_2_Soundtrack/","donation_link":null,"date_created":"2026-01-17T00:33:47.969055+00:00","date_updated":"2026-01-17T00:34:03.785711+00:00","uuid4":"b0d75105-2ea1-40e5-a8a2-5b517e0ed285","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Music"],"versions":[{"name":"Helldivers_2_Soundtrack","full_name":"Iqsbasiczz-Helldivers_2_Soundtrack-1.0.0","description":"Helldivers 2 amazingly composed combat and ambience tracks!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Iqsbasiczz-Helldivers_2_Soundtrack-1.0.0.png","version_number":"1.0.0","dependencies":["Potatoes-Potatoes_TNH_BGM_Loader-4.0.0"],"download_url":"https://thunderstore.io/package/download/Iqsbasiczz/Helldivers_2_Soundtrack/1.0.0/","downloads":62,"date_created":"2026-01-17T00:34:01.093128+00:00","website_url":"","is_active":true,"uuid4":"353bc03d-4820-4b09-9f33-8ec840892886","file_size":152230583}]},{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols","owner":"Potatoes","package_url":"https://thunderstore.io/c/h3vr/p/Potatoes/Potatoes_Pistols/","donation_link":"https://ko-fi.com/potatoes1286","date_created":"2021-07-21T01:21:49.902247+00:00","date_updated":"2022-02-10T02:39:59.542245+00:00","uuid4":"8d19887d-6a2d-47d9-92a9-1aab7baedfa5","rating_score":21,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols-10.0.1","description":"Part of PCCG. Adds a whopping 29 pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Pistols-10.0.1.png","version_number":"10.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-10.0.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Pistols/10.0.1/","downloads":95451,"date_created":"2022-02-10T02:39:59.542245+00:00","website_url":"","is_active":true,"uuid4":"9984c198-e14c-4aeb-9994-e465ed50f7d9","file_size":409478859},{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols-10.0.0","description":"Part of PCCG. Adds a whopping 29 pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Pistols-10.0.0.png","version_number":"10.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-10.0.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Pistols/10.0.0/","downloads":8048,"date_created":"2022-02-04T03:12:03.023719+00:00","website_url":"","is_active":true,"uuid4":"6fdd13b5-c6cf-4f09-8885-322adf127a8d","file_size":390016148},{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols-9.1.0","description":"Part of PCCG. Adds a whopping 28 pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Pistols-9.1.0.png","version_number":"9.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-9.1.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Pistols/9.1.0/","downloads":35456,"date_created":"2021-09-30T19:42:27.626368+00:00","website_url":"","is_active":true,"uuid4":"9d281c01-7ffe-43da-b4f7-ac75c3e791c0","file_size":412168896},{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols-9.0.1","description":"Part of PCCG. Adds a whopping 28 pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Pistols-9.0.1.png","version_number":"9.0.1","dependencies":["devyndamonster-OtherLoader-0.3.3","Potatoes-Potatoes_Ammunition-9.0.101","WFIOST-H3VRUtilities-8.3.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Pistols/9.0.1/","downloads":3857,"date_created":"2021-09-12T03:55:58.053978+00:00","website_url":"","is_active":true,"uuid4":"e84046ff-11fb-4b46-9fd2-9fd4e598dcaa","file_size":323636671},{"name":"Potatoes_Pistols","full_name":"Potatoes-Potatoes_Pistols-9.0.0","description":"Part of PCCG. Adds a whopping 28 pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Pistols-9.0.0.png","version_number":"9.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.0","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Pistols/9.0.0/","downloads":5364,"date_created":"2021-07-21T01:22:11.997650+00:00","website_url":"","is_active":true,"uuid4":"4dc387f8-bf74-4824-aecd-5e11130babb1","file_size":323805835}]},{"name":"Potatoes_Rifles","full_name":"Potatoes-Potatoes_Rifles","owner":"Potatoes","package_url":"https://thunderstore.io/c/h3vr/p/Potatoes/Potatoes_Rifles/","donation_link":"https://ko-fi.com/potatoes1286","date_created":"2021-08-26T19:02:59.956477+00:00","date_updated":"2022-02-19T04:15:01.003782+00:00","uuid4":"078f7483-ea67-4757-8617-a90e87221d52","rating_score":14,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Potatoes_Rifles","full_name":"Potatoes-Potatoes_Rifles-9.2.0","description":"Part of PCCG. Adds a whopping 11 rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Rifles-9.2.0.png","version_number":"9.2.0","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-9.1.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Rifles/9.2.0/","downloads":73438,"date_created":"2022-02-19T04:15:01.003782+00:00","website_url":"https://github.com/potatoes1286/pccgchangelog/blob/main/PotatoesRiflesChangelog.md","is_active":true,"uuid4":"efad95b7-fba6-4544-a5b0-c26d158cc46f","file_size":186871633},{"name":"Potatoes_Rifles","full_name":"Potatoes-Potatoes_Rifles-9.1.0","description":"Part of PCCG. Adds a whopping 11 rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Rifles-9.1.0.png","version_number":"9.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-9.1.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Rifles/9.1.0/","downloads":34483,"date_created":"2021-10-01T23:20:12.643115+00:00","website_url":"https://github.com/potatoes1286/pccgchangelog/blob/main/PotatoesRiflesChangelog.md","is_active":true,"uuid4":"bcbcd53a-7519-4fbf-9880-17b2e7f28f9d","file_size":169792265},{"name":"Potatoes_Rifles","full_name":"Potatoes-Potatoes_Rifles-9.0.1","description":"Part of PCCG. Adds a whopping 11 rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Rifles-9.0.1.png","version_number":"9.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.101","WFIOST-H3VRUtilities-8.3.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Rifles/9.0.1/","downloads":3303,"date_created":"2021-08-29T03:40:08.413459+00:00","website_url":"","is_active":true,"uuid4":"b8b9a63b-69d9-4ad5-9f92-35004910ef32","file_size":131180942},{"name":"Potatoes_Rifles","full_name":"Potatoes-Potatoes_Rifles-9.0.0","description":"Part of PCCG. Adds a whopping 11 rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_Rifles-9.0.0.png","version_number":"9.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.101","WFIOST-H3VRUtilities-8.3.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_Rifles/9.0.0/","downloads":921,"date_created":"2021-08-26T19:03:06.087331+00:00","website_url":"","is_active":true,"uuid4":"9cf31a51-6636-4a58-bed7-c2ee5f40c2e1","file_size":124066198}]},{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs","owner":"Potatoes","package_url":"https://thunderstore.io/c/h3vr/p/Potatoes/Potatoes_SMGs/","donation_link":"https://ko-fi.com/potatoes1286","date_created":"2021-07-21T18:20:09.729116+00:00","date_updated":"2021-11-02T23:53:41.963942+00:00","uuid4":"d3e12724-29c8-42ba-a53c-7e67c2c8f75a","rating_score":19,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs-9.1.1","description":"Part of PCCG. Adds a whopping 22 SMGs!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_SMGs-9.1.1.png","version_number":"9.1.1","dependencies":["devyndamonster-OtherLoader-1.1.1","Potatoes-Potatoes_Ammunition-9.1.0","WFIOST-H3VRUtilities-8.6.2"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_SMGs/9.1.1/","downloads":91542,"date_created":"2021-11-02T23:53:41.963942+00:00","website_url":"https://github.com/potatoes1286/pccgchangelog/blob/main/PotatoesSMGsChangelog.md","is_active":true,"uuid4":"75090a26-8ca7-48d1-b363-3176afd90639","file_size":285661544},{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs-9.1.0","description":"Part of PCCG. Adds a whopping 22 SMGs!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_SMGs-9.1.0.png","version_number":"9.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0","Potatoes-Potatoes_Ammunition-9.1.0","WFIOST-H3VRUtilities-8.5.0"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_SMGs/9.1.0/","downloads":29004,"date_created":"2021-10-01T23:16:35.578945+00:00","website_url":"https://github.com/potatoes1286/pccgchangelog/blob/main/PotatoesSMGsChangelog.md","is_active":true,"uuid4":"ba9042f3-8a57-4b74-9da7-3473cc1a6b6a","file_size":285664866},{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs-9.0.2","description":"Part of PCCG. Adds a whopping 22 SMGs!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_SMGs-9.0.2.png","version_number":"9.0.2","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.1","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_SMGs/9.0.2/","downloads":5601,"date_created":"2021-07-24T01:44:54.072717+00:00","website_url":"","is_active":true,"uuid4":"8e4c0e45-64f2-46b5-a9a0-48f8d1293366","file_size":217222003},{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs-9.0.1","description":"Part of PCCG. Adds a whopping 22 SMGs!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_SMGs-9.0.1.png","version_number":"9.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.1","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_SMGs/9.0.1/","downloads":393,"date_created":"2021-07-22T00:51:31.051116+00:00","website_url":"","is_active":true,"uuid4":"52340c80-3d0c-4a7c-a9d2-7ac1be9b0a6a","file_size":206598550},{"name":"Potatoes_SMGs","full_name":"Potatoes-Potatoes_SMGs-9.0.0","description":"Part of PCCG. Adds a whopping 22 SMGs!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Potatoes-Potatoes_SMGs-9.0.0.png","version_number":"9.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","Potatoes-Potatoes_Ammunition-9.0.0","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Potatoes/Potatoes_SMGs/9.0.0/","downloads":260,"date_created":"2021-07-21T18:20:30.813556+00:00","website_url":"","is_active":true,"uuid4":"e3cd9b58-0940-402e-9ea5-27942b57a283","file_size":206669998}]},{"name":"WhitneyWolverine","full_name":"cityrobo-WhitneyWolverine","owner":"cityrobo","package_url":"https://thunderstore.io/c/h3vr/p/cityrobo/WhitneyWolverine/","donation_link":"https://ko-fi.com/cityrobo","date_created":"2022-01-06T12:46:12.644567+00:00","date_updated":"2022-01-06T12:46:12.780321+00:00","uuid4":"6c0fbaa9-f483-4f47-bef6-076c7c0223a6","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"WhitneyWolverine","full_name":"cityrobo-WhitneyWolverine-1.0.0","description":"If you ever wanted to plink in style, this space-age looking gun is perfect for you!","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-WhitneyWolverine-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","cityrobo-OpenScripts-1.1.3"],"download_url":"https://thunderstore.io/package/download/cityrobo/WhitneyWolverine/1.0.0/","downloads":37273,"date_created":"2022-01-06T12:46:12.780321+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"cbc68338-9cb5-4584-9cde-bdb85a58480e","file_size":25922110}]},{"name":"FTW_Arms_Bren_10","full_name":"Andrew_FTW-FTW_Arms_Bren_10","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/FTW_Arms_Bren_10/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2021-08-05T23:30:31.664929+00:00","date_updated":"2021-09-18T04:26:10.151486+00:00","uuid4":"488d970c-f255-408b-ae90-f963c47dc4ac","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"FTW_Arms_Bren_10","full_name":"Andrew_FTW-FTW_Arms_Bren_10-1.0.1","description":"10mm masterrace","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_Bren_10-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0","cityrobo-OpenScripts-1.0.3"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_Bren_10/1.0.1/","downloads":34295,"date_created":"2021-09-18T04:26:10.151486+00:00","website_url":"","is_active":true,"uuid4":"6d4b1fc2-db6d-4a77-a967-be5a1a730465","file_size":13588338},{"name":"FTW_Arms_Bren_10","full_name":"Andrew_FTW-FTW_Arms_Bren_10-1.0.0","description":"10mm masterrace","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_Bren_10-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_Bren_10/1.0.0/","downloads":1435,"date_created":"2021-08-05T23:30:55.337769+00:00","website_url":"","is_active":true,"uuid4":"c268b2dd-9174-4d10-b723-bd8c088fbfa7","file_size":13590880}]},{"name":"Glock_17_Gen_2","full_name":"Muzzle-Glock_17_Gen_2","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Glock_17_Gen_2/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2021-08-15T17:29:20.894165+00:00","date_updated":"2021-08-15T17:29:27.151404+00:00","uuid4":"ba6b6337-97ac-41ed-abf4-e38acb6f24c9","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Glock_17_Gen_2","full_name":"Muzzle-Glock_17_Gen_2-1.0.0","description":"An oldie but a goodie! The second generation of the now massively popular Glock line of Safe Action Pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Glock_17_Gen_2-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Glock_17_Gen_2/1.0.0/","downloads":31602,"date_created":"2021-08-15T17:29:27.151404+00:00","website_url":"","is_active":true,"uuid4":"db768e39-f91f-47f8-84c6-43703cb2fa29","file_size":8195170}]},{"name":"PBPISTOL","full_name":"superpug-PBPISTOL","owner":"superpug","package_url":"https://thunderstore.io/c/h3vr/p/superpug/PBPISTOL/","donation_link":"https://ko-fi.com/superpug","date_created":"2022-01-30T16:36:42.609132+00:00","date_updated":"2022-01-30T16:36:42.746627+00:00","uuid4":"3015db28-6dea-4566-ae27-7c5ebcfb35a0","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"PBPISTOL","full_name":"superpug-PBPISTOL-1.0.0","description":"Adds the PB pistol from Escape From Tarkov to H3VR, along with some grips","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-PBPISTOL-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/superpug/PBPISTOL/1.0.0/","downloads":50528,"date_created":"2022-01-30T16:36:42.746627+00:00","website_url":"","is_active":true,"uuid4":"9f5e284f-bc0f-4a17-a70e-ade0279f8b52","file_size":15152609}]},{"name":"sw659","full_name":"superpug-sw659","owner":"superpug","package_url":"https://thunderstore.io/c/h3vr/p/superpug/sw659/","donation_link":"https://ko-fi.com/superpug","date_created":"2022-01-27T21:35:22.611526+00:00","date_updated":"2022-01-27T21:35:22.847351+00:00","uuid4":"34e7c8ad-72b8-4054-a3e6-a43ce191d757","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"sw659","full_name":"superpug-sw659-1.0.0","description":"You gonna bark all day little doggy or are you gonna bite?","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-sw659-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/superpug/sw659/1.0.0/","downloads":30006,"date_created":"2022-01-27T21:35:22.847351+00:00","website_url":"","is_active":true,"uuid4":"22c90c7e-86f6-4fd2-bebe-45a240085f02","file_size":10616470}]},{"name":"Type59","full_name":"JerryAr-Type59","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/Type59/","donation_link":null,"date_created":"2022-03-03T20:39:31.456175+00:00","date_updated":"2022-03-09T02:10:34.635521+00:00","uuid4":"9af936ab-329f-4dd3-ab98-cea2ca4f2d1a","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"Type59","full_name":"JerryAr-Type59-1.0.1","description":"All of us in one heart,with the torch of freedom,March on!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-Type59-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/Type59/1.0.1/","downloads":27186,"date_created":"2022-03-09T02:10:34.635521+00:00","website_url":"","is_active":true,"uuid4":"d8662e9e-681c-4e98-ae4a-56e8cc8803a0","file_size":23232740},{"name":"Type59","full_name":"JerryAr-Type59-1.0.0","description":"All of us in one heart,with the torch of freedom,March on!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-Type59-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/Type59/1.0.0/","downloads":21522,"date_created":"2022-03-03T20:39:31.608204+00:00","website_url":"","is_active":true,"uuid4":"3ec657f4-38ce-40b0-ae11-bcee9b410cd3","file_size":23238010}]},{"name":"IZh27","full_name":"nayr31-IZh27","owner":"nayr31","package_url":"https://thunderstore.io/c/h3vr/p/nayr31/IZh27/","donation_link":null,"date_created":"2021-06-09T02:03:36.258998+00:00","date_updated":"2021-06-14T00:14:24.279632+00:00","uuid4":"159cc44b-fd7f-43db-bc93-8506b3523a93","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"IZh27","full_name":"nayr31-IZh27-1.0.1","description":"Adds a Russian over-under shotgun","icon":"https://gcdn.thunderstore.io/live/repository/icons/nayr31-IZh27-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/nayr31/IZh27/1.0.1/","downloads":34142,"date_created":"2021-06-14T00:14:24.279632+00:00","website_url":"","is_active":true,"uuid4":"7f28480a-565d-46bb-821a-3832fa73d87a","file_size":14582312},{"name":"IZh27","full_name":"nayr31-IZh27-1.0.0","description":"Adds a Russian over-under shotgun","icon":"https://gcdn.thunderstore.io/live/repository/icons/nayr31-IZh27-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/nayr31/IZh27/1.0.0/","downloads":197,"date_created":"2021-06-09T02:03:43.641343+00:00","website_url":"","is_active":true,"uuid4":"4a55ed5e-7025-471a-aa5c-2a7f272c4a22","file_size":14577823}]},{"name":"FTW_Arms_KS_23","full_name":"Andrew_FTW-FTW_Arms_KS_23","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/FTW_Arms_KS_23/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2021-11-12T18:41:45.560032+00:00","date_updated":"2021-11-12T18:42:03.385660+00:00","uuid4":"a0f378e8-3379-4a45-9812-4d9191d082ad","rating_score":10,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo"],"versions":[{"name":"FTW_Arms_KS_23","full_name":"Andrew_FTW-FTW_Arms_KS_23-1.0.0","description":"Now with better ammo!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_KS_23-1.0.0.png","version_number":"1.0.0","dependencies":["WFIOST-H3VRUtilities-8.0.3","devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_KS_23/1.0.0/","downloads":47742,"date_created":"2021-11-12T18:42:03.385660+00:00","website_url":"","is_active":true,"uuid4":"7e716603-d609-413e-b98d-fdff4a9718f6","file_size":57050719}]},{"name":"RG_063","full_name":"devyndamonster-RG_063","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/RG_063/","donation_link":null,"date_created":"2022-01-10T09:25:57.049390+00:00","date_updated":"2022-01-29T19:18:54.188340+00:00","uuid4":"431fcf83-0d7c-4081-89a3-9e4e7c8177e0","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RG_063","full_name":"devyndamonster-RG_063-1.1.0","description":"A Soviet SMG from the 60's, designed to have a low rate of fire and high accuracy","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-RG_063-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/RG_063/1.1.0/","downloads":41916,"date_created":"2022-01-29T19:18:54.188340+00:00","website_url":"","is_active":true,"uuid4":"1989ea67-e4ec-43f5-a6b9-c2c7b9b1cf05","file_size":10609344},{"name":"RG_063","full_name":"devyndamonster-RG_063-1.0.0","description":"A Soviet SMG from the 60's, designed to have a low rate of fire and high accuracy","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-RG_063-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/RG_063/1.0.0/","downloads":1158,"date_created":"2022-01-10T09:25:57.282116+00:00","website_url":"","is_active":true,"uuid4":"e258f790-cfc4-41e8-8b71-d5fb47c0c126","file_size":10549426}]},{"name":"TKB_486","full_name":"devyndamonster-TKB_486","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/TKB_486/","donation_link":null,"date_created":"2022-01-08T20:55:28.441943+00:00","date_updated":"2022-01-29T19:17:04.324538+00:00","uuid4":"63e16990-2a87-4c59-aa68-0e3c00aaae18","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TKB_486","full_name":"devyndamonster-TKB_486-1.1.0","description":"The first ever SMG to be chambered in 9x18 Makarov!","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_486-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_486/1.1.0/","downloads":42925,"date_created":"2022-01-29T19:17:04.324538+00:00","website_url":"","is_active":true,"uuid4":"823a9953-d736-448b-a6a9-593f3145bf4a","file_size":9553614},{"name":"TKB_486","full_name":"devyndamonster-TKB_486-1.0.0","description":"The first ever SMG to be chambered in 9x18 Makarov!","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_486-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_486/1.0.0/","downloads":1217,"date_created":"2022-01-08T20:55:28.572036+00:00","website_url":"","is_active":true,"uuid4":"c1d72175-84ca-4323-8caa-32337c7ffa84","file_size":10153121}]},{"name":"AD46","full_name":"devyndamonster-AD46","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/AD46/","donation_link":null,"date_created":"2022-01-05T21:14:41.039933+00:00","date_updated":"2022-01-29T19:21:14.842149+00:00","uuid4":"0702159a-b554-4298-ad08-888edab39cf8","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"AD46","full_name":"devyndamonster-AD46-1.1.0","description":"A failed Soviet trials prototype designed by Alexandr Andreevich Dementyev in 1946. It basically fell apart during trials, but we'll ignore that part","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-AD46-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/AD46/1.1.0/","downloads":42799,"date_created":"2022-01-29T19:21:14.842149+00:00","website_url":"","is_active":true,"uuid4":"364a7067-2ab7-4b84-91d1-d413d8a7ae31","file_size":11949206},{"name":"AD46","full_name":"devyndamonster-AD46-1.0.0","description":"A failed Soviet trials prototype designed by Alexandr Andreevich Dementyev in 1946. It basically fell apart during trials, but we'll ignore that part","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-AD46-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/AD46/1.0.0/","downloads":1319,"date_created":"2022-01-05T21:14:41.333043+00:00","website_url":"","is_active":true,"uuid4":"f6a6650e-8c29-4231-912b-126a5aeaacc2","file_size":11857949}]},{"name":"Afanasyevs_Rifle","full_name":"devyndamonster-Afanasyevs_Rifle","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/Afanasyevs_Rifle/","donation_link":null,"date_created":"2022-01-10T21:07:21.546381+00:00","date_updated":"2022-01-29T19:20:50.239023+00:00","uuid4":"40e67400-7fee-4c4a-a6ce-5ffae4759eb5","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Afanasyevs_Rifle","full_name":"devyndamonster-Afanasyevs_Rifle-1.1.0","description":"A Soviet prototype bullpup designed by Nikolai Afanasyev","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-Afanasyevs_Rifle-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/Afanasyevs_Rifle/1.1.0/","downloads":43996,"date_created":"2022-01-29T19:20:50.239023+00:00","website_url":"","is_active":true,"uuid4":"c8c85d39-be5a-4c56-9779-4e91caed2f22","file_size":11030082},{"name":"Afanasyevs_Rifle","full_name":"devyndamonster-Afanasyevs_Rifle-1.0.1","description":"A Soviet prototype bullpup designed by Nikolai Afanasyev","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-Afanasyevs_Rifle-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/Afanasyevs_Rifle/1.0.1/","downloads":1131,"date_created":"2022-01-15T21:58:18.122171+00:00","website_url":"","is_active":true,"uuid4":"aae17fa6-177c-4002-b8ce-a45481481535","file_size":10946863},{"name":"Afanasyevs_Rifle","full_name":"devyndamonster-Afanasyevs_Rifle-1.0.0","description":"A Soviet prototype bullpup designed by Nikolai Afanasyev","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-Afanasyevs_Rifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/Afanasyevs_Rifle/1.0.0/","downloads":839,"date_created":"2022-01-10T21:07:21.684004+00:00","website_url":"","is_active":true,"uuid4":"6b3606f8-e6bc-4f88-8097-e83c78e90f88","file_size":10946583}]},{"name":"AG_042","full_name":"devyndamonster-AG_042","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/AG_042/","donation_link":null,"date_created":"2022-02-19T01:29:01.535303+00:00","date_updated":"2022-02-19T02:07:43.346385+00:00","uuid4":"00a78fa0-7f6d-48eb-8922-41faea5a7817","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"AG_042","full_name":"devyndamonster-AG_042-1.1.0","description":"A soviet carbine designed by Sergei Simonov in 1974. It competed against the AKS-74U in trials and failed","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-AG_042-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/AG_042/1.1.0/","downloads":41738,"date_created":"2022-02-19T02:07:43.346385+00:00","website_url":"","is_active":true,"uuid4":"4c4626e2-e785-40ea-950f-933b77e121b2","file_size":13161869},{"name":"AG_042","full_name":"devyndamonster-AG_042-1.0.0","description":"A soviet carbine designed by Sergei Simonov in 1974. It competed against the AKS-74U in trials and failed","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-AG_042-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/AG_042/1.0.0/","downloads":252,"date_created":"2022-02-19T01:29:01.718040+00:00","website_url":"","is_active":true,"uuid4":"c6d3054a-37b1-4a02-ab2b-bc5b82af5d97","file_size":10379613}]},{"name":"IMI_Galil","full_name":"Muzzle-IMI_Galil","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/IMI_Galil/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2021-08-14T23:47:04.884731+00:00","date_updated":"2021-08-14T23:47:11.272863+00:00","uuid4":"3265ffa9-01d8-40bd-b2bf-ca780801ea22","rating_score":9,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"IMI_Galil","full_name":"Muzzle-IMI_Galil-2.0.0","description":"The iconic cold war classic, the Israeli Galil, in its ARM and SAR variants!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-IMI_Galil-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Muzzle/IMI_Galil/2.0.0/","downloads":36050,"date_created":"2021-08-14T23:47:11.272863+00:00","website_url":"","is_active":true,"uuid4":"b45319ca-b0ce-4136-9d3d-0de0624c46c4","file_size":17009189}]},{"name":"Konstantinov_SA_1","full_name":"devyndamonster-Konstantinov_SA_1","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/Konstantinov_SA_1/","donation_link":null,"date_created":"2022-02-12T21:15:30.341984+00:00","date_updated":"2022-02-12T21:15:30.492712+00:00","uuid4":"3f93e8a3-b522-44e6-982f-47fb2d05ea52","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Konstantinov_SA_1","full_name":"devyndamonster-Konstantinov_SA_1-1.0.0","description":"A prototype Soviet rifle designed by Alexander Konstantinov","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-Konstantinov_SA_1-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/Konstantinov_SA_1/1.0.0/","downloads":43359,"date_created":"2022-02-12T21:15:30.492712+00:00","website_url":"","is_active":true,"uuid4":"a142204b-2ae4-4a80-abc3-c71fb8598566","file_size":10444437}]},{"name":"TKB_0136","full_name":"devyndamonster-TKB_0136","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/TKB_0136/","donation_link":null,"date_created":"2022-01-10T00:25:41.989474+00:00","date_updated":"2022-01-29T19:17:39.464726+00:00","uuid4":"8b619f3b-082b-42dd-bae4-34ba17b02f58","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TKB_0136","full_name":"devyndamonster-TKB_0136-1.1.0","description":"A Soviet prototype from the 80's, firing 5.45x39 at a screaming 2000 RPM","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_0136-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_0136/1.1.0/","downloads":43610,"date_created":"2022-01-29T19:17:39.464726+00:00","website_url":"","is_active":true,"uuid4":"05ca66a8-b98c-4d03-b473-1514433f705a","file_size":28010961},{"name":"TKB_0136","full_name":"devyndamonster-TKB_0136-1.0.2","description":"A Soviet prototype from the 80's, firing 5.45x39 at a screaming 2000 RPM","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_0136-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_0136/1.0.2/","downloads":1219,"date_created":"2022-01-16T20:52:35.005275+00:00","website_url":"","is_active":true,"uuid4":"4f6f7038-1532-4b85-85e2-5718c37231b8","file_size":27903511},{"name":"TKB_0136","full_name":"devyndamonster-TKB_0136-1.0.1","description":"A Soviet prototype from the 80's, firing 5.45x39 at a screaming 2000 RPM","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_0136-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_0136/1.0.1/","downloads":187,"date_created":"2022-01-16T20:49:50.364648+00:00","website_url":"","is_active":true,"uuid4":"77fdaa89-1afa-468a-81a3-1937191adc48","file_size":27903494},{"name":"TKB_0136","full_name":"devyndamonster-TKB_0136-1.0.0","description":"A Soviet prototype from the 80's, firing 5.45x39 at a screaming 2000 RPM","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_0136-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_0136/1.0.0/","downloads":962,"date_created":"2022-01-10T00:25:42.260780+00:00","website_url":"","is_active":true,"uuid4":"9ed84e78-29ab-41f5-8913-1fb028c4b105","file_size":12672536}]},{"name":"TKB_059","full_name":"cityrobo-TKB_059","owner":"cityrobo","package_url":"https://thunderstore.io/c/h3vr/p/cityrobo/TKB_059/","donation_link":"https://ko-fi.com/cityrobo","date_created":"2021-12-25T18:27:31.619575+00:00","date_updated":"2022-01-10T13:09:24.401972+00:00","uuid4":"8d4dac43-e533-4e92-81bc-197761733b71","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons"],"versions":[{"name":"TKB_059","full_name":"cityrobo-TKB_059-1.0.2","description":"Triple barrel bullpup AK prototype. Do I need to say more?","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-TKB_059-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-0.3.0","cityrobo-OpenScripts-1.1.3","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/cityrobo/TKB_059/1.0.2/","downloads":35885,"date_created":"2022-01-10T13:09:24.401972+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"03e773bf-868d-405a-8f82-67285c7311a1","file_size":32611884},{"name":"TKB_059","full_name":"cityrobo-TKB_059-1.0.1","description":"Triple barrel bullpup AK prototype. Do I need to say more?","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-TKB_059-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0","cityrobo-OpenScripts-1.1.3","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/cityrobo/TKB_059/1.0.1/","downloads":903,"date_created":"2022-01-03T20:26:24.927419+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"11bcf191-0581-4e0f-98c9-d9d2772810c7","file_size":32611802},{"name":"TKB_059","full_name":"cityrobo-TKB_059-1.0.0","description":"Triple barrel bullpup AK prototype. Do I need to say more?","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-TKB_059-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","cityrobo-OpenScripts-1.1.3","WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/cityrobo/TKB_059/1.0.0/","downloads":1028,"date_created":"2021-12-25T18:28:49.311808+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"ddb1d1ac-a275-498a-822c-5f62246e690d","file_size":32611779}]},{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Armalite_AR14_Sporter_Rifle/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2021-07-16T19:18:47.923402+00:00","date_updated":"2022-03-13T06:48:08.798145+00:00","uuid4":"12b932f2-69c3-427e-be39-0c60164e9100","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle-2.0.2","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Armalite_AR14_Sporter_Rifle-2.0.2.png","version_number":"2.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Armalite_AR14_Sporter_Rifle/2.0.2/","downloads":27193,"date_created":"2022-03-13T06:48:08.798145+00:00","website_url":"","is_active":true,"uuid4":"23be10c6-fbce-4474-b594-63a6f57e60a6","file_size":29030740},{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle-2.0.1","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Armalite_AR14_Sporter_Rifle-2.0.1.png","version_number":"2.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Armalite_AR14_Sporter_Rifle/2.0.1/","downloads":206,"date_created":"2022-03-13T03:37:46.493098+00:00","website_url":"","is_active":true,"uuid4":"36615772-083d-406f-9663-8eee798f3f47","file_size":29029521},{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle-2.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Armalite_AR14_Sporter_Rifle-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Armalite_AR14_Sporter_Rifle/2.0.0/","downloads":164,"date_created":"2022-03-13T03:24:42.295698+00:00","website_url":"","is_active":true,"uuid4":"f7faa946-642b-4f06-82f3-50b5c5a7b3e0","file_size":28715432},{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1","description":"An odd never-produced patent from Armalite for a Sporting Rifle","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Armalite_AR14_Sporter_Rifle-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Armalite_AR14_Sporter_Rifle/1.0.1/","downloads":22341,"date_created":"2021-07-16T19:29:04.419057+00:00","website_url":"","is_active":true,"uuid4":"d347d0f4-c73a-4dcb-8d65-cbe9b698abc3","file_size":8554277},{"name":"Armalite_AR14_Sporter_Rifle","full_name":"Muzzle-Armalite_AR14_Sporter_Rifle-1.0.0","description":"An odd never-produced patent from Armalite for a Sporting Rifle","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Armalite_AR14_Sporter_Rifle-1.0.0.png","version_number":"1.0.0","dependencies":["DeliCollective-Deli-0.4.1"],"download_url":"https://thunderstore.io/package/download/Muzzle/Armalite_AR14_Sporter_Rifle/1.0.0/","downloads":150,"date_created":"2021-07-16T19:19:05.554804+00:00","website_url":"","is_active":true,"uuid4":"7304da32-0ced-446a-aff8-047f95f2cf80","file_size":8554270}]},{"name":"FTW_Arms_LMG11","full_name":"Andrew_FTW-FTW_Arms_LMG11","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/FTW_Arms_LMG11/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2021-08-31T05:02:03.976926+00:00","date_updated":"2021-09-05T03:28:33.112558+00:00","uuid4":"5b47e992-0940-4c01-8dbf-c0f89cebd0d9","rating_score":9,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"FTW_Arms_LMG11","full_name":"Andrew_FTW-FTW_Arms_LMG11-1.1.1","description":"Kraut Space Magic, but now in a LMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_LMG11-1.1.1.png","version_number":"1.1.1","dependencies":["WFIOST-H3VRUtilities-8.0.3","cityrobo-OpenScripts-1.0.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_LMG11/1.1.1/","downloads":35152,"date_created":"2021-09-05T03:28:33.112558+00:00","website_url":"","is_active":true,"uuid4":"b7ddf5e5-e919-483f-aa1a-ad2bff83b927","file_size":16806156},{"name":"FTW_Arms_LMG11","full_name":"Andrew_FTW-FTW_Arms_LMG11-1.1.0","description":"Kraut Space Magic, but now in a LMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_LMG11-1.1.0.png","version_number":"1.1.0","dependencies":["WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_LMG11/1.1.0/","downloads":739,"date_created":"2021-08-31T20:00:52.452582+00:00","website_url":"","is_active":true,"uuid4":"e672afe1-673b-422b-b432-1c19fb8dd86a","file_size":16808751},{"name":"FTW_Arms_LMG11","full_name":"Andrew_FTW-FTW_Arms_LMG11-1.0.0","description":"Kraut Space Magic, but now in a LMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_LMG11-1.0.0.png","version_number":"1.0.0","dependencies":["WFIOST-H3VRUtilities-8.0.3"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_LMG11/1.0.0/","downloads":375,"date_created":"2021-08-31T05:02:09.217444+00:00","website_url":"","is_active":true,"uuid4":"04d2b090-770f-4f61-96c0-b2f02d173adc","file_size":16806124}]},{"name":"Gyrojet_Pistol","full_name":"Muzzle-Gyrojet_Pistol","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Gyrojet_Pistol/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-03-12T15:59:29.444571+00:00","date_updated":"2022-03-12T15:59:29.563361+00:00","uuid4":"298f507f-16e5-4a70-a0ea-1607ac1c90dc","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo"],"versions":[{"name":"Gyrojet_Pistol","full_name":"Muzzle-Gyrojet_Pistol-1.0.0","description":"An abomination unto firearm design as a whole, by request of Violet. You can blame her for this.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Gyrojet_Pistol-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.1","cityrobo-OpenScripts-1.2.8"],"download_url":"https://thunderstore.io/package/download/Muzzle/Gyrojet_Pistol/1.0.0/","downloads":35524,"date_created":"2022-03-12T15:59:29.563361+00:00","website_url":"","is_active":true,"uuid4":"4bcdc2c2-e56e-4832-a5e6-0e54adae44b4","file_size":25740223}]},{"name":"Muzzles_Automags","full_name":"Muzzle-Muzzles_Automags","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Muzzles_Automags/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-03-14T02:47:00.657914+00:00","date_updated":"2022-03-14T02:47:00.889777+00:00","uuid4":"87f27144-a89e-4c3d-8d52-23d7f328218e","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Muzzles_Automags","full_name":"Muzzle-Muzzles_Automags-1.0.0","description":"An array of classic magnum pistols in a variety of calibers!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Muzzles_Automags-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","Muzzle-45_Winchester_Magnum-1.0.0","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Muzzle/Muzzles_Automags/1.0.0/","downloads":48662,"date_created":"2022-03-14T02:47:00.889777+00:00","website_url":"","is_active":true,"uuid4":"f88e9f0f-496a-4fe2-84f2-472eac80a598","file_size":72709158}]},{"name":"Type85MicrosoundSMG","full_name":"Bistard-Type85MicrosoundSMG","owner":"Bistard","package_url":"https://thunderstore.io/c/h3vr/p/Bistard/Type85MicrosoundSMG/","donation_link":null,"date_created":"2022-03-15T01:11:41.842115+00:00","date_updated":"2022-03-16T09:48:03.215240+00:00","uuid4":"50ef75a1-7640-42ac-b504-6ec275df2473","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"Type85MicrosoundSMG","full_name":"Bistard-Type85MicrosoundSMG-1.2.0","description":"Chinese Type 85 Submachingun with an integral suppressor,my very first work.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Bistard-Type85MicrosoundSMG-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/Bistard/Type85MicrosoundSMG/1.2.0/","downloads":28565,"date_created":"2022-03-16T09:48:03.215240+00:00","website_url":"","is_active":true,"uuid4":"5bdb3828-497a-411a-aa87-4985a9479ee6","file_size":47241465},{"name":"Type85MicrosoundSMG","full_name":"Bistard-Type85MicrosoundSMG-1.1.1","description":"Chinese Type 85 Submachingun with an integral suppressor,my very first work.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Bistard-Type85MicrosoundSMG-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/Bistard/Type85MicrosoundSMG/1.1.1/","downloads":362,"date_created":"2022-03-15T07:53:10.477321+00:00","website_url":"","is_active":true,"uuid4":"c9ee5851-fcd3-4097-9be1-20e6cb3cdf71","file_size":47241572},{"name":"Type85MicrosoundSMG","full_name":"Bistard-Type85MicrosoundSMG-1.1.0","description":"Chinese Type 85 Submachingun with an integral suppressor,my very first work.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Bistard-Type85MicrosoundSMG-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/Bistard/Type85MicrosoundSMG/1.1.0/","downloads":141,"date_created":"2022-03-15T07:42:19.323586+00:00","website_url":"","is_active":true,"uuid4":"0b4f94f2-28b5-4174-9939-6ae6db30e510","file_size":47241547},{"name":"Type85MicrosoundSMG","full_name":"Bistard-Type85MicrosoundSMG-1.0.0","description":"Chinese Type 85 Submachingun with an integral suppressor,my very first work.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Bistard-Type85MicrosoundSMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/Bistard/Type85MicrosoundSMG/1.0.0/","downloads":223,"date_created":"2022-03-15T01:11:42.056073+00:00","website_url":"","is_active":true,"uuid4":"f4ab4a47-b2ef-4101-a52e-c10d4f55949f","file_size":29477696}]},{"name":"SA_81_Krasa","full_name":"devyndamonster-SA_81_Krasa","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/SA_81_Krasa/","donation_link":null,"date_created":"2022-03-18T21:20:54.800304+00:00","date_updated":"2022-03-18T21:20:54.970175+00:00","uuid4":"3ccae9c9-38f3-4d1a-b258-a375d3cba82b","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SA_81_Krasa","full_name":"devyndamonster-SA_81_Krasa-1.0.0","description":"A Czechoslovakian prototype carbine developed in 1978. It's small and shoots fast, what's not to love?","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-SA_81_Krasa-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/SA_81_Krasa/1.0.0/","downloads":31545,"date_created":"2022-03-18T21:20:54.970175+00:00","website_url":"","is_active":true,"uuid4":"a3404148-d320-4d71-baea-5f387e3682d5","file_size":27071835}]},{"name":"HK_P7","full_name":"cityrobo-HK_P7","owner":"cityrobo","package_url":"https://thunderstore.io/c/h3vr/p/cityrobo/HK_P7/","donation_link":"https://ko-fi.com/cityrobo","date_created":"2022-03-22T22:01:56.056582+00:00","date_updated":"2022-05-09T21:21:20.799019+00:00","uuid4":"7cbf7668-d171-469e-bb1d-adb43150989f","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HK_P7","full_name":"cityrobo-HK_P7-1.0.2","description":"Gas delayed German Police Pistol. Used more expensive than a new Desert Eagle.","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_P7-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_P7/1.0.2/","downloads":29348,"date_created":"2022-05-09T21:21:20.799019+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"6688f461-2b9e-4ffc-bfb7-e6cc6c3a2fa4","file_size":76683745},{"name":"HK_P7","full_name":"cityrobo-HK_P7-1.0.1","description":"Gas delayed German Police Pistol. Used more expensive than a new Desert Eagle.","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_P7-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_P7/1.0.1/","downloads":2521,"date_created":"2022-03-25T18:43:09.871848+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"e6de6bf3-2f1b-46dc-9f0a-04c3ac933331","file_size":76677886},{"name":"HK_P7","full_name":"cityrobo-HK_P7-1.0.0","description":"Gas delayed German Police Pistol. Used more expensive than a new Desert Eagle.","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_P7-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_P7/1.0.0/","downloads":618,"date_created":"2022-03-22T22:01:56.249017+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"a904faf8-1430-494a-8890-01e15bf9ce55","file_size":76677892}]},{"name":"HK_NBW","full_name":"cityrobo-HK_NBW","owner":"cityrobo","package_url":"https://thunderstore.io/c/h3vr/p/cityrobo/HK_NBW/","donation_link":"https://ko-fi.com/cityrobo","date_created":"2022-03-25T19:29:07.250645+00:00","date_updated":"2022-03-25T19:29:07.472695+00:00","uuid4":"7600970a-780b-4c1d-8251-cba919b4ac2c","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HK_NBW","full_name":"cityrobo-HK_NBW-1.0.0","description":"Prototype Pistol based on the G11 system using a shorter caseless cartridge.","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_NBW-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0","WFIOST-H3VRUtilities-8.0.3","cityrobo-OpenScripts-1.1.3"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_NBW/1.0.0/","downloads":32058,"date_created":"2022-03-25T19:29:07.472695+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"a951e0f2-1c60-4291-b173-01fd57c2d1c7","file_size":53900016}]},{"name":"vz_52","full_name":"devyndamonster-vz_52","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/vz_52/","donation_link":null,"date_created":"2022-03-27T19:38:58.595380+00:00","date_updated":"2022-03-27T19:38:58.799215+00:00","uuid4":"45bfb01c-b7b1-4dc2-a023-39dd26356a5a","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"vz_52","full_name":"devyndamonster-vz_52-1.0.0","description":"A Czech rifle developed in 1952, which originally used the 7.62x45mm cartridge","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-vz_52-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/vz_52/1.0.0/","downloads":30595,"date_created":"2022-03-27T19:38:58.799215+00:00","website_url":"","is_active":true,"uuid4":"b3f57f81-531e-4f99-af57-688e4edb0d8a","file_size":26008739}]},{"name":"PSM","full_name":"devyndamonster-PSM","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/PSM/","donation_link":null,"date_created":"2022-04-01T22:07:20.411605+00:00","date_updated":"2022-07-09T03:14:07.274728+00:00","uuid4":"01b2003c-8a0e-43ee-8a79-a1ae3a16c626","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"PSM","full_name":"devyndamonster-PSM-1.1.1","description":"A cute little Soviet pistol designed as a self-defense firearm for law enforcement and military officers. It shoots the tiny 5.45x18mm cartridge, which is pretty comparable in power to 22lr.","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-PSM-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/PSM/1.1.1/","downloads":37058,"date_created":"2022-07-09T03:14:07.274728+00:00","website_url":"","is_active":true,"uuid4":"4a629fef-6c9b-4efb-a104-7de79c60a6f4","file_size":11060080},{"name":"PSM","full_name":"devyndamonster-PSM-1.1.0","description":"A cute little Soviet pistol designed as a self-defense firearm for law enforcement and military officers. It shoots the tiny 5.45x18mm cartridge, which is pretty comparable in power to 22lr.","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-PSM-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/PSM/1.1.0/","downloads":12524,"date_created":"2022-04-17T19:01:45.550410+00:00","website_url":"","is_active":true,"uuid4":"0b0f025b-4806-4bb4-b402-d7f9d8a82010","file_size":11056911},{"name":"PSM","full_name":"devyndamonster-PSM-1.0.0","description":"A cute little Soviet pistol designed as a self-defense firearm for law enforcement and military officers. It shoots the tiny 5.45x18mm cartridge, which is pretty comparable in power to 22lr.","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-PSM-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/PSM/1.0.0/","downloads":3748,"date_created":"2022-04-01T22:07:20.656610+00:00","website_url":"","is_active":true,"uuid4":"a5c06abe-b571-42d2-993a-adcd5340c570","file_size":11054926}]},{"name":"VAHAN_Redux","full_name":"Volks-VAHAN_Redux","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/VAHAN_Redux/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-07-26T14:33:08.601246+00:00","date_updated":"2025-07-26T14:33:14.830699+00:00","uuid4":"309283eb-ddae-4af9-8875-4808cc102bef","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"VAHAN_Redux","full_name":"Volks-VAHAN_Redux-1.0.0","description":"A more updated version to Devyn's amazing VAHAN mod.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-VAHAN_Redux-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/VAHAN_Redux/1.0.0/","downloads":3975,"date_created":"2025-07-26T14:33:13.593130+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"e67eec43-1f83-4502-8081-beab47230631","file_size":25204259}]},{"name":"SWModel49Bodyguard","full_name":"Volks-SWModel49Bodyguard","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/SWModel49Bodyguard/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-09-27T19:16:46.666052+00:00","date_updated":"2025-09-27T19:16:54.428783+00:00","uuid4":"af4a24a0-da6b-4c81-98b9-bb173d1ff096","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SWModel49Bodyguard","full_name":"Volks-SWModel49Bodyguard-1.0.0","description":"S&W Bodyguard model for those coppers","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-SWModel49Bodyguard-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/SWModel49Bodyguard/1.0.0/","downloads":2740,"date_created":"2025-09-27T19:16:52.799362+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"ddb57331-2c0d-4069-b541-968c9de83c65","file_size":20157680}]},{"name":"BV_025","full_name":"devyndamonster-BV_025","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/BV_025/","donation_link":null,"date_created":"2022-04-17T19:05:33.109837+00:00","date_updated":"2022-04-17T19:05:33.402719+00:00","uuid4":"e40eabdb-0308-41aa-976d-a7c00b27b955","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BV_025","full_name":"devyndamonster-BV_025-1.0.0","description":"A Russian pocket pistol which competed against the PSM pistol in trials (and lost)","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-BV_025-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","devyndamonster-PSM-1.0.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/BV_025/1.0.0/","downloads":40009,"date_created":"2022-04-17T19:05:33.402719+00:00","website_url":"","is_active":true,"uuid4":"862e40f1-1e35-4d7c-8285-84be1ffd1b1c","file_size":26221185}]},{"name":"MGD_PM9","full_name":"devyndamonster-MGD_PM9","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/MGD_PM9/","donation_link":null,"date_created":"2022-05-02T00:54:36.132480+00:00","date_updated":"2022-05-02T00:54:36.532219+00:00","uuid4":"747ce353-a08f-429d-816c-66b1346dc2b6","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"MGD_PM9","full_name":"devyndamonster-MGD_PM9-1.0.0","description":"An unusual French open bolt SMG from the early 1950s. It uses a unique rotating bolt handle which can be locked into an open position","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-MGD_PM9-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/MGD_PM9/1.0.0/","downloads":30401,"date_created":"2022-05-02T00:54:36.532219+00:00","website_url":"","is_active":true,"uuid4":"cd24097c-2307-42ab-8c24-9a283f0ceb87","file_size":10519868}]},{"name":"Carl_Gustaf_M45","full_name":"devyndamonster-Carl_Gustaf_M45","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/Carl_Gustaf_M45/","donation_link":null,"date_created":"2022-05-07T13:37:16.506728+00:00","date_updated":"2022-05-07T13:37:16.639511+00:00","uuid4":"1d3fc39c-5ab2-4bad-a8ca-1c75f4711468","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Carl_Gustaf_M45","full_name":"devyndamonster-Carl_Gustaf_M45-1.0.0","description":"Otherwise known as the 'Swedish K', this gun was Swedens standard SMG for over 20 years after WW2.","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-Carl_Gustaf_M45-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/Carl_Gustaf_M45/1.0.0/","downloads":37286,"date_created":"2022-05-07T13:37:16.639511+00:00","website_url":"","is_active":true,"uuid4":"86bcc78f-8e26-4336-87e5-64281a09598a","file_size":17190265}]},{"name":"Ruger_Blackhawk_30_Carbine","full_name":"Muzzle-Ruger_Blackhawk_30_Carbine","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Ruger_Blackhawk_30_Carbine/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-05-06T20:39:45.927970+00:00","date_updated":"2022-05-06T20:39:46.188516+00:00","uuid4":"811ce8b4-a24f-4c96-aa55-04f3b1c2eb2f","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Ruger_Blackhawk_30_Carbine","full_name":"Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0","description":"A modern single-action revolver in .30 Carbine.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Ruger_Blackhawk_30_Carbine-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Ruger_Blackhawk_30_Carbine/1.0.0/","downloads":29136,"date_created":"2022-05-06T20:39:46.188516+00:00","website_url":"","is_active":true,"uuid4":"8b7427a5-9106-4a11-a2a3-b3f04be342cb","file_size":13725349}]},{"name":"AGS17","full_name":"JerryAr-AGS17","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/AGS17/","donation_link":null,"date_created":"2022-05-06T17:10:59.354466+00:00","date_updated":"2024-02-02T06:39:52.348797+00:00","uuid4":"3f010ba6-5be0-42ed-97c2-ef2de1f9f59a","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"AGS17","full_name":"JerryAr-AGS17-1.2.0","description":"*Tomp*","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AGS17-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.7.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AGS17/1.2.0/","downloads":18895,"date_created":"2024-02-02T06:39:51.606939+00:00","website_url":"","is_active":true,"uuid4":"2ee2ac9e-20d2-4cd7-b4d7-7f143d8b6e9d","file_size":25235505},{"name":"AGS17","full_name":"JerryAr-AGS17-1.1.1","description":"Russian Machine Grenade Launcher","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AGS17-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AGS17/1.1.1/","downloads":24140,"date_created":"2022-05-08T06:24:55.937440+00:00","website_url":"","is_active":true,"uuid4":"42e9256f-c917-4e89-b249-d74f7fb406bc","file_size":24817017},{"name":"AGS17","full_name":"JerryAr-AGS17-1.1.0","description":"Russian Machine Grenade Launcher","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AGS17-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AGS17/1.1.0/","downloads":400,"date_created":"2022-05-07T17:17:00.220350+00:00","website_url":"","is_active":true,"uuid4":"534af305-b996-4b8c-b07b-963133e2983f","file_size":18716650},{"name":"AGS17","full_name":"JerryAr-AGS17-1.0.1","description":"Russian Machine Grenade Launcher","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AGS17-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AGS17/1.0.1/","downloads":334,"date_created":"2022-05-07T06:25:36.125841+00:00","website_url":"","is_active":true,"uuid4":"8c40bba9-c779-4693-84ec-a70e44a67181","file_size":18615934},{"name":"AGS17","full_name":"JerryAr-AGS17-1.0.0","description":"Russian Machine Grenade Launcher","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AGS17-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AGS17/1.0.0/","downloads":407,"date_created":"2022-05-06T17:10:59.489479+00:00","website_url":"","is_active":true,"uuid4":"1609178f-8367-4870-ae76-44e0c6b5f1ae","file_size":18619343}]},{"name":"BGM71","full_name":"JerryAr-BGM71","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/BGM71/","donation_link":null,"date_created":"2022-05-06T11:23:23.655375+00:00","date_updated":"2023-08-26T21:30:02.209357+00:00","uuid4":"af7d5602-b8ae-4794-90ee-14b233b23011","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"BGM71","full_name":"JerryAr-BGM71-1.1.4","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.1.4.png","version_number":"1.1.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.1.4/","downloads":22974,"date_created":"2023-08-26T21:30:00.156455+00:00","website_url":"","is_active":true,"uuid4":"1548ef54-8345-4f2a-b7b9-99e6f60cf34c","file_size":48557094},{"name":"BGM71","full_name":"JerryAr-BGM71-1.1.3","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.1.3.png","version_number":"1.1.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.1.3/","downloads":6117,"date_created":"2023-04-08T12:15:16.482816+00:00","website_url":"","is_active":true,"uuid4":"9bfac4b5-54b1-4391-95d9-769c97a0e2c5","file_size":53334180},{"name":"BGM71","full_name":"JerryAr-BGM71-1.1.2","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.1.2.png","version_number":"1.1.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.1.2/","downloads":238,"date_created":"2023-04-08T07:40:51.050748+00:00","website_url":"","is_active":true,"uuid4":"8ba03d19-939e-4aa4-a34a-5afadcef4ddd","file_size":53328559},{"name":"BGM71","full_name":"JerryAr-BGM71-1.1.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.1.0/","downloads":802,"date_created":"2023-04-06T11:37:45.438718+00:00","website_url":"","is_active":true,"uuid4":"7cc5371d-b7fc-4c66-b2a6-5c3afcf3ff26","file_size":40260284},{"name":"BGM71","full_name":"JerryAr-BGM71-1.0.1","description":"As known as 'TOW' missile.","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.0.1/","downloads":11163,"date_created":"2022-05-07T06:26:45.741470+00:00","website_url":"","is_active":true,"uuid4":"59a46fcf-eae8-40e1-b276-b84e208eb626","file_size":17461289},{"name":"BGM71","full_name":"JerryAr-BGM71-1.0.0","description":"As known as 'TOW' missile.","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BGM71-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.1.14","WFIOST-H3VRUtilities-8.9.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/BGM71/1.0.0/","downloads":466,"date_created":"2022-05-06T11:23:23.824105+00:00","website_url":"","is_active":true,"uuid4":"cb428a51-90a4-45a5-9494-6a75c2a2c91d","file_size":17461247}]},{"name":"HK_VP70","full_name":"cityrobo-HK_VP70","owner":"cityrobo","package_url":"https://thunderstore.io/c/h3vr/p/cityrobo/HK_VP70/","donation_link":"https://ko-fi.com/cityrobo","date_created":"2022-05-09T21:21:47.891422+00:00","date_updated":"2023-04-28T21:54:08.784214+00:00","uuid4":"d6288c91-7808-49ca-93c9-ca9da819ffed","rating_score":7,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HK_VP70","full_name":"cityrobo-HK_VP70-1.0.3","description":"The first ever polymer-framed handgun, predating the Glock 17 by 12 years. Complete with three round burst enabling holster stock!","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_VP70-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_VP70/1.0.3/","downloads":22341,"date_created":"2023-04-28T21:54:06.364638+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"c1109c5e-92d1-4e06-8401-a5788eeecd40","file_size":38623747},{"name":"HK_VP70","full_name":"cityrobo-HK_VP70-1.0.2","description":"The first ever polymer-framed handgun, predating the Glock 17 by 12 years. Complete with three round burst enabling holster stock!","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_VP70-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_VP70/1.0.2/","downloads":21199,"date_created":"2022-05-18T17:40:58.668765+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"6fa0888b-756f-4696-804f-3fe39d8d00ba","file_size":38508642},{"name":"HK_VP70","full_name":"cityrobo-HK_VP70-1.0.1","description":"The first ever polymer-framed handgun, predating the Glock 17 by 12 years. Complete with three round burst enabling holster stock!","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_VP70-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_VP70/1.0.1/","downloads":259,"date_created":"2022-05-18T17:34:40.613024+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"1fee050a-6112-4215-8b8b-5298b433d9a1","file_size":38508480},{"name":"HK_VP70","full_name":"cityrobo-HK_VP70-1.0.0","description":"The first ever polymer-framed handgun, predating the Glock 17 by 12 years. Complete with three round burst enabling holster stock!","icon":"https://gcdn.thunderstore.io/live/repository/icons/cityrobo-HK_VP70-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/cityrobo/HK_VP70/1.0.0/","downloads":2271,"date_created":"2022-05-09T21:21:48.032699+00:00","website_url":"https://github.com/cityrobo/H3VR_Mods","is_active":true,"uuid4":"18af83d9-25c9-47ba-868f-91248c4538b1","file_size":38507687}]},{"name":"CETME_Ameli_Machine_Gun","full_name":"Muzzle-CETME_Ameli_Machine_Gun","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/CETME_Ameli_Machine_Gun/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-05-17T18:02:01.151476+00:00","date_updated":"2022-05-17T18:02:01.401568+00:00","uuid4":"c8f23ef8-bf58-40cc-b178-1459df33701a","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"CETME_Ameli_Machine_Gun","full_name":"Muzzle-CETME_Ameli_Machine_Gun-1.0.0","description":"A Spanish machine gun in 5.56x45mm NATO!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-CETME_Ameli_Machine_Gun-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2"],"download_url":"https://thunderstore.io/package/download/Muzzle/CETME_Ameli_Machine_Gun/1.0.0/","downloads":34588,"date_created":"2022-05-17T18:02:01.401568+00:00","website_url":"","is_active":true,"uuid4":"56daefa6-a898-46ef-9cbb-1d53a488eab2","file_size":92447107}]},{"name":"B76_Series","full_name":"Pykkle-B76_Series","owner":"Pykkle","package_url":"https://thunderstore.io/c/h3vr/p/Pykkle/B76_Series/","donation_link":"https://ko-fi.com/pykkle","date_created":"2022-05-17T07:25:18.248615+00:00","date_updated":"2022-09-16T00:33:06.047457+00:00","uuid4":"fda9b785-ded4-4b08-a54f-4b364f73a43d","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"B76_Series","full_name":"Pykkle-B76_Series-1.1.0","description":"Pistola Perfezione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-B76_Series-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.2.3","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Pykkle/B76_Series/1.1.0/","downloads":24278,"date_created":"2022-09-16T00:33:03.508306+00:00","website_url":"","is_active":true,"uuid4":"6ec2b8f1-8cf3-4f3d-aed0-d0aead73a62a","file_size":21201755},{"name":"B76_Series","full_name":"Pykkle-B76_Series-1.0.3","description":"Pistola Perfezione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-B76_Series-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.2.3","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Pykkle/B76_Series/1.0.3/","downloads":4232,"date_created":"2022-06-19T15:00:10.854504+00:00","website_url":"","is_active":true,"uuid4":"771b9ee1-540a-41a4-91d2-3a60d2362c08","file_size":21190466},{"name":"B76_Series","full_name":"Pykkle-B76_Series-1.0.2","description":"Pistola Perfezione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-B76_Series-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.2.3","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Pykkle/B76_Series/1.0.2/","downloads":3665,"date_created":"2022-05-19T20:30:47.329412+00:00","website_url":"","is_active":true,"uuid4":"2e8cf816-6cf0-4d1f-940a-712e92c11083","file_size":21190422},{"name":"B76_Series","full_name":"Pykkle-B76_Series-1.0.1","description":"Pistola Perfezione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-B76_Series-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.2.3","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Pykkle/B76_Series/1.0.1/","downloads":414,"date_created":"2022-05-18T04:23:28.787419+00:00","website_url":"","is_active":true,"uuid4":"17feb3dc-b18c-4bfc-b7ca-a099e0832de3","file_size":21190411},{"name":"B76_Series","full_name":"Pykkle-B76_Series-1.0.0","description":"Pistola Perfezione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-B76_Series-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0","cityrobo-OpenScripts-1.2.3","WFIOST-H3VRUtilities-8.9.1"],"download_url":"https://thunderstore.io/package/download/Pykkle/B76_Series/1.0.0/","downloads":407,"date_created":"2022-05-17T07:25:18.476937+00:00","website_url":"","is_active":true,"uuid4":"fc6c5140-f4b9-4ad8-b16f-d1ddbe358156","file_size":21190402}]},{"name":"APS","full_name":"devyndamonster-APS","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/APS/","donation_link":null,"date_created":"2022-05-21T00:48:44.560931+00:00","date_updated":"2022-05-21T00:48:44.738378+00:00","uuid4":"bcdc2123-c876-4598-8131-60fc5ef0a8af","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"APS","full_name":"devyndamonster-APS-1.0.0","description":"Are you a frogman in need of underwater firepower? Look no further than the APS! It's an underwater rifle which fires spikes for projectiles","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-APS-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/APS/1.0.0/","downloads":50150,"date_created":"2022-05-21T00:48:44.738378+00:00","website_url":"","is_active":true,"uuid4":"170983fd-c326-41a4-8369-dceff96214aa","file_size":36921792}]},{"name":"RedArrow73","full_name":"JerryAr-RedArrow73","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/RedArrow73/","donation_link":null,"date_created":"2022-05-26T05:39:22.993963+00:00","date_updated":"2022-05-26T05:39:23.128263+00:00","uuid4":"07b817f3-4320-497a-a253-e1023fd6ac01","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"RedArrow73","full_name":"JerryAr-RedArrow73-1.0.0","description":"Chinese version of AT-3,but improved","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-RedArrow73-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/RedArrow73/1.0.0/","downloads":27639,"date_created":"2022-05-26T05:39:23.128263+00:00","website_url":"","is_active":true,"uuid4":"2b853698-4f79-4615-a3d8-c0717132c697","file_size":13910966}]},{"name":"SW_224","full_name":"Capt_Tony-SW_224","owner":"Capt_Tony","package_url":"https://thunderstore.io/c/h3vr/p/Capt_Tony/SW_224/","donation_link":null,"date_created":"2022-06-15T22:16:55.743443+00:00","date_updated":"2022-06-15T22:16:55.884423+00:00","uuid4":"2c6f929d-2b01-4717-a946-4c84ee72eb8c","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SW_224","full_name":"Capt_Tony-SW_224-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Capt_Tony-SW_224-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Capt_Tony/SW_224/1.0.0/","downloads":27853,"date_created":"2022-06-15T22:16:55.884423+00:00","website_url":"","is_active":true,"uuid4":"d50a4279-540a-4f2f-b403-b8b55a498f34","file_size":11036684}]},{"name":"RG_019","full_name":"devyndamonster-RG_019","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/RG_019/","donation_link":null,"date_created":"2022-05-28T19:35:06.909701+00:00","date_updated":"2022-05-28T19:35:07.066901+00:00","uuid4":"5892d2f1-441e-4b1e-b5d5-6746a74e01f2","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RG_019","full_name":"devyndamonster-RG_019-1.0.0","description":"A Russian nailgun brought to you by the gun designer Pyotr Serdyukov. It was intended for use by military divers to attach underwater explosives to ships.","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-RG_019-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/RG_019/1.0.0/","downloads":38673,"date_created":"2022-05-28T19:35:07.066901+00:00","website_url":"","is_active":true,"uuid4":"cd902740-043b-4f88-a398-4aa912481268","file_size":20028097}]},{"name":"Danuvia_M53_K1","full_name":"Tyconson67-Danuvia_M53_K1","owner":"Tyconson67","package_url":"https://thunderstore.io/c/h3vr/p/Tyconson67/Danuvia_M53_K1/","donation_link":"https://ko-fi.com/sugarysugarcube","date_created":"2022-07-02T11:50:30.350401+00:00","date_updated":"2022-07-03T02:09:16.655562+00:00","uuid4":"2025ebe9-8cc5-4482-9f1b-92cb10028d2e","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Danuvia_M53_K1","full_name":"Tyconson67-Danuvia_M53_K1-1.1.0","description":"A Hungarian indigenous design that found its way onto the Libyan Black Market in 2016.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Tyconson67-Danuvia_M53_K1-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.5"],"download_url":"https://thunderstore.io/package/download/Tyconson67/Danuvia_M53_K1/1.1.0/","downloads":25571,"date_created":"2022-07-03T02:09:16.655562+00:00","website_url":"","is_active":true,"uuid4":"8597b670-6cc8-48c0-95a4-cda628960f70","file_size":5561941},{"name":"Danuvia_M53_K1","full_name":"Tyconson67-Danuvia_M53_K1-1.0.0","description":"A Hungarian indigenous design that found its way onto the Libyan Black Market in 2016.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Tyconson67-Danuvia_M53_K1-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.5"],"download_url":"https://thunderstore.io/package/download/Tyconson67/Danuvia_M53_K1/1.0.0/","downloads":273,"date_created":"2022-07-02T11:50:30.605038+00:00","website_url":"","is_active":true,"uuid4":"496791e4-fbbf-429f-bf66-f3624bb113b1","file_size":5564470}]},{"name":"series70_9mm","full_name":"Capt_Tony-series70_9mm","owner":"Capt_Tony","package_url":"https://thunderstore.io/c/h3vr/p/Capt_Tony/series70_9mm/","donation_link":null,"date_created":"2022-07-17T03:41:16.334247+00:00","date_updated":"2022-07-17T03:41:16.505377+00:00","uuid4":"2e6a66df-9157-4ef5-bc01-2d698056863b","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"series70_9mm","full_name":"Capt_Tony-series70_9mm-1.0.0","description":"Classic 9mm 1911","icon":"https://gcdn.thunderstore.io/live/repository/icons/Capt_Tony-series70_9mm-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Capt_Tony/series70_9mm/1.0.0/","downloads":28536,"date_created":"2022-07-17T03:41:16.505377+00:00","website_url":"","is_active":true,"uuid4":"50d3c0ff-41d4-43e6-b07a-1735a112a332","file_size":9446819}]},{"name":"Delta_Elite","full_name":"Capt_Tony-Delta_Elite","owner":"Capt_Tony","package_url":"https://thunderstore.io/c/h3vr/p/Capt_Tony/Delta_Elite/","donation_link":null,"date_created":"2022-07-19T00:54:19.534208+00:00","date_updated":"2022-07-19T00:54:19.695864+00:00","uuid4":"3a54f12b-e592-4cc3-8ca1-d1bc5b2eae43","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Delta_Elite","full_name":"Capt_Tony-Delta_Elite-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Capt_Tony-Delta_Elite-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Capt_Tony/Delta_Elite/1.0.0/","downloads":28734,"date_created":"2022-07-19T00:54:19.695864+00:00","website_url":"","is_active":true,"uuid4":"523106b6-3e11-4f9b-af72-ac6787186682","file_size":7867134}]},{"name":"SWModel13","full_name":"0cto-SWModel13","owner":"0cto","package_url":"https://thunderstore.io/c/h3vr/p/0cto/SWModel13/","donation_link":null,"date_created":"2022-07-23T00:36:44.951621+00:00","date_updated":"2022-07-23T00:36:45.148612+00:00","uuid4":"d51260f5-d57a-4ed0-a28e-e9ccda2655bb","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SWModel13","full_name":"0cto-SWModel13-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/0cto-SWModel13-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/0cto/SWModel13/1.0.0/","downloads":26456,"date_created":"2022-07-23T00:36:45.148612+00:00","website_url":"","is_active":true,"uuid4":"ca9180f9-977e-4385-8484-587bd5fe0ed1","file_size":23473803}]},{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express","owner":"Prime_Vr","package_url":"https://thunderstore.io/c/h3vr/p/Prime_Vr/700_Nitro_Express/","donation_link":"https://www.paypal.com/donate/?business=6SHLJW3UX3GXL&no_recurring=0&item_name=Consider+buying+me+a+coffee+if+i+made+something+that+you+appreciated+in+any+way+shape+or+form%21+%E2%9D%A4%EF%B8%8F&currency_code=BRL","date_created":"2022-07-30T21:57:17.017542+00:00","date_updated":"2022-08-28T21:32:26.148220+00:00","uuid4":"b84a8caa-2ca6-4a2e-98f7-c52014aab4c4","rating_score":7,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express-1.0.4","description":".700 Nitro Express for Giant Sausage Hunting. Now with Sawn-Off Variant.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-700_Nitro_Express-1.0.4.png","version_number":"1.0.4","dependencies":["devyndamonster-OtherLoader-1.3.0","Prime_Vr-Prime_Ammunitions-1.0.1"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/700_Nitro_Express/1.0.4/","downloads":27554,"date_created":"2022-08-28T21:32:25.820531+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"edda2ace-95bd-463a-89c5-7b658445e96e","file_size":15800686},{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express-1.0.3","description":".700 Nitro Express for Giant Sausage Hunting. Now with Sawn-Off Variant.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-700_Nitro_Express-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","Prime_Vr-Prime_Ammunitions-1.0.0"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/700_Nitro_Express/1.0.3/","downloads":1000,"date_created":"2022-08-25T12:41:08.969712+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"88ffe3b1-4b48-453d-880c-2d51f31323aa","file_size":15800645},{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express-1.0.2","description":".700 Nitro Express for Giant Sausage Hunting. Now with Sawn-Off Variant.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-700_Nitro_Express-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/700_Nitro_Express/1.0.2/","downloads":2172,"date_created":"2022-08-08T15:46:38.212646+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"8a3b5f97-d3b8-47c4-87bf-b8f7236e2e35","file_size":16012985},{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express-1.0.1","description":".700 Nitro Express for Giant Sausage Hunting","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-700_Nitro_Express-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/700_Nitro_Express/1.0.1/","downloads":2027,"date_created":"2022-07-30T23:32:47.088244+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"7e3c89dc-0740-49f3-bec0-9e7346b23cc1","file_size":15710679},{"name":"700_Nitro_Express","full_name":"Prime_Vr-700_Nitro_Express-1.0.0","description":".700 Nitro Express for Giant Sausage Hunting","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-700_Nitro_Express-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/700_Nitro_Express/1.0.0/","downloads":181,"date_created":"2022-07-30T21:57:17.212427+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"30b077c5-1538-4f34-b2e4-4d079a498acb","file_size":15710767}]},{"name":"Street_Sweeper","full_name":"Prime_Vr-Street_Sweeper","owner":"Prime_Vr","package_url":"https://thunderstore.io/c/h3vr/p/Prime_Vr/Street_Sweeper/","donation_link":"https://www.paypal.com/donate/?business=6SHLJW3UX3GXL&no_recurring=0&item_name=Consider+buying+me+a+coffee+if+i+made+something+that+you+appreciated+in+any+way+shape+or+form%21+%E2%9D%A4%EF%B8%8F&currency_code=BRL","date_created":"2022-08-12T03:32:10.458445+00:00","date_updated":"2022-08-29T23:37:55.044296+00:00","uuid4":"5da64ff5-66be-4f94-84ab-71292b91f90b","rating_score":11,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"Street_Sweeper","full_name":"Prime_Vr-Street_Sweeper-1.0.1","description":"Needing to do some clean-up? Look no further! The Street Sweeper has arrived. Now includes the Lady's Home Compaion!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-Street_Sweeper-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","Prime_Vr-PrimeScripts-1.2.3"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/Street_Sweeper/1.0.1/","downloads":27883,"date_created":"2022-08-29T23:37:54.409229+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"9a0099ca-0540-4623-9979-181633be3e8e","file_size":56852222},{"name":"Street_Sweeper","full_name":"Prime_Vr-Street_Sweeper-1.0.0","description":"Needing to do some clean-up? Look no further! The Street Sweeper has arrived.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Prime_Vr-Street_Sweeper-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","Prime_Vr-PrimeScripts-1.1.7"],"download_url":"https://thunderstore.io/package/download/Prime_Vr/Street_Sweeper/1.0.0/","downloads":2414,"date_created":"2022-08-12T03:32:10.585473+00:00","website_url":"https://www.youtube.com/channel/UCcLk0mYygnu5bNfjvqRce5Q","is_active":true,"uuid4":"c80bdc57-88b2-4f08-9345-f6e9e9e56dd4","file_size":56491021}]},{"name":"Howa_Type_89","full_name":"Okkim-Howa_Type_89","owner":"Okkim","package_url":"https://thunderstore.io/c/h3vr/p/Okkim/Howa_Type_89/","donation_link":"https://ko-fi.com/okkim","date_created":"2022-08-11T15:37:04.351015+00:00","date_updated":"2022-08-11T15:48:49.619144+00:00","uuid4":"ac543d27-60f4-4548-900b-3ef80bf0d7e2","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Ammo"],"versions":[{"name":"Howa_Type_89","full_name":"Okkim-Howa_Type_89-1.0.1","description":"The Japanese service rifle, complete with bayonet and rifle grenade.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Okkim-Howa_Type_89-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts-1.3.1","WFIOST-H3VRUtilities-8.9.3"],"download_url":"https://thunderstore.io/package/download/Okkim/Howa_Type_89/1.0.1/","downloads":29858,"date_created":"2022-08-11T15:48:48.765000+00:00","website_url":"","is_active":true,"uuid4":"a544c877-8091-44d4-99c7-ff35106c21c1","file_size":72298573},{"name":"Howa_Type_89","full_name":"Okkim-Howa_Type_89-1.0.0","description":"The Japanese service rifle, complete with bayonet and rifle grenade.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Okkim-Howa_Type_89-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts-1.3.1"],"download_url":"https://thunderstore.io/package/download/Okkim/Howa_Type_89/1.0.0/","downloads":200,"date_created":"2022-08-11T15:37:04.500495+00:00","website_url":"","is_active":true,"uuid4":"e2dcc1c5-d900-4d1e-9c5e-b40855a6802b","file_size":72298529}]},{"name":"Detonics_Combat_Master","full_name":"Muzzle-Detonics_Combat_Master","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Detonics_Combat_Master/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-08-31T07:57:26.903748+00:00","date_updated":"2022-08-31T07:57:27.460881+00:00","uuid4":"70b90bad-c454-4930-8afc-a3ed4789d4b7","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Detonics_Combat_Master","full_name":"Muzzle-Detonics_Combat_Master-1.0.0","description":"A handy, compact .45 from Detonics!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Detonics_Combat_Master-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Detonics_Combat_Master/1.0.0/","downloads":28053,"date_created":"2022-08-31T07:57:27.126078+00:00","website_url":"","is_active":true,"uuid4":"182cbe69-5385-4bc2-b8e4-10225c351726","file_size":17471541}]},{"name":"SW_Model_25_Revolver","full_name":"Muzzle-SW_Model_25_Revolver","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/SW_Model_25_Revolver/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-08-28T04:48:35.863819+00:00","date_updated":"2022-08-28T04:48:36.731570+00:00","uuid4":"6e723e53-1a28-4b9b-ba83-9514080d0b3a","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SW_Model_25_Revolver","full_name":"Muzzle-SW_Model_25_Revolver-1.0.0","description":"A large frame revolver in .45 Long Colt from Smith and Wesson!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-SW_Model_25_Revolver-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/SW_Model_25_Revolver/1.0.0/","downloads":26796,"date_created":"2022-08-28T04:48:36.210775+00:00","website_url":"","is_active":true,"uuid4":"f24a59c3-b649-4784-8c8e-af8e7e8547d5","file_size":25033029}]},{"name":"SIG_P210_Pistols","full_name":"Muzzle-SIG_P210_Pistols","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/SIG_P210_Pistols/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-09-21T15:07:28.798142+00:00","date_updated":"2022-09-21T15:07:38.783681+00:00","uuid4":"afef116c-72a6-45de-80e0-386ea0e967a4","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SIG_P210_Pistols","full_name":"Muzzle-SIG_P210_Pistols-1.0.0","description":"A classic revived! Get your hands on the modernized SIG P210 line of pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-SIG_P210_Pistols-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/SIG_P210_Pistols/1.0.0/","downloads":23996,"date_created":"2022-09-21T15:07:30.061176+00:00","website_url":"","is_active":true,"uuid4":"562b54d7-c5dd-491b-9af5-f85029d8c5b0","file_size":362384184}]},{"name":"FTW_Arms_M82A2","full_name":"Andrew_FTW-FTW_Arms_M82A2","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/FTW_Arms_M82A2/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2022-09-20T04:07:33.664097+00:00","date_updated":"2023-05-02T04:13:33.892874+00:00","uuid4":"640d1d34-a8d6-48d3-bcd7-3f1733c0619b","rating_score":11,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo"],"versions":[{"name":"FTW_Arms_M82A2","full_name":"Andrew_FTW-FTW_Arms_M82A2-1.0.2","description":"See that helecopter over there? Wanna see it disappear?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_M82A2-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2","cityrobo-OpenScripts-1.3.0","Andrew_FTW-FTW_Arms_AFCL-2.21.0","Andrew_FTW-FTW_Arms_Exotic_50BMG-1.0.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_M82A2/1.0.2/","downloads":24062,"date_created":"2023-05-02T04:13:32.638224+00:00","website_url":"","is_active":true,"uuid4":"09281857-b93c-44bf-ac0a-47033ed3f9d6","file_size":38227734},{"name":"FTW_Arms_M82A2","full_name":"Andrew_FTW-FTW_Arms_M82A2-1.0.1","description":"See that helecopter over there? Wanna see it disappear?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_M82A2-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2","cityrobo-OpenScripts-1.3.0","Andrew_FTW-FTW_Arms_AFCL-2.21.0","Andrew_FTW-FTW_Arms_Exotic_50BMG-1.0.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_M82A2/1.0.1/","downloads":18541,"date_created":"2022-11-13T19:11:47.720373+00:00","website_url":"","is_active":true,"uuid4":"6ed0d82d-e527-475f-bbb2-522fa140410c","file_size":38229101},{"name":"FTW_Arms_M82A2","full_name":"Andrew_FTW-FTW_Arms_M82A2-1.0.0","description":"See that helecopter over there? Wanna see it disappear?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-FTW_Arms_M82A2-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2","cityrobo-OpenScripts-1.3.0","Andrew_FTW-FTW_Arms_AFCL-2.21.0","Andrew_FTW-FTW_Arms_Exotic_50BMG-1.0.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/FTW_Arms_M82A2/1.0.0/","downloads":3828,"date_created":"2022-09-20T04:07:34.137716+00:00","website_url":"","is_active":true,"uuid4":"536054ba-73a3-4eab-ae73-fc188bd0aac8","file_size":29161821}]},{"name":"SW_M52_and_M952_Pistols","full_name":"Muzzle-SW_M52_and_M952_Pistols","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/SW_M52_and_M952_Pistols/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-09-21T17:07:01.219709+00:00","date_updated":"2022-09-21T17:07:09.007099+00:00","uuid4":"7e4c87a4-19c1-4a3c-8f38-bdd70fda0e36","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SW_M52_and_M952_Pistols","full_name":"Muzzle-SW_M52_and_M952_Pistols-1.0.0","description":"A pair of unique S&W Semi-Automatic Pistols!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-SW_M52_and_M952_Pistols-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","Muzzle-38_Special_Wadcutter-1.0.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/SW_M52_and_M952_Pistols/1.0.0/","downloads":35482,"date_created":"2022-09-21T17:07:01.916886+00:00","website_url":"","is_active":true,"uuid4":"989635a7-6587-434c-9629-82a380a85d4b","file_size":260298468}]},{"name":"Calico_M950","full_name":"TheBigWhimp-Calico_M950","owner":"TheBigWhimp","package_url":"https://thunderstore.io/c/h3vr/p/TheBigWhimp/Calico_M950/","donation_link":null,"date_created":"2022-09-16T12:42:49.843122+00:00","date_updated":"2022-09-16T12:55:24.683037+00:00","uuid4":"c38c6a5a-48a9-48a2-9e56-751b1c04feb2","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Mods"],"versions":[{"name":"Calico_M950","full_name":"TheBigWhimp-Calico_M950-1.1.5","description":"A Calico M950","icon":"https://gcdn.thunderstore.io/live/repository/icons/TheBigWhimp-Calico_M950-1.1.5.png","version_number":"1.1.5","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/TheBigWhimp/Calico_M950/1.1.5/","downloads":26913,"date_created":"2022-09-16T12:55:23.816001+00:00","website_url":"","is_active":true,"uuid4":"6c433a98-315c-4dc6-9908-dadefc8112d1","file_size":7182908},{"name":"Calico_M950","full_name":"TheBigWhimp-Calico_M950-1.1.4","description":"A Calico M950","icon":"https://gcdn.thunderstore.io/live/repository/icons/TheBigWhimp-Calico_M950-1.1.4.png","version_number":"1.1.4","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/TheBigWhimp/Calico_M950/1.1.4/","downloads":131,"date_created":"2022-09-16T12:42:50.434527+00:00","website_url":"","is_active":true,"uuid4":"9c8939e8-d260-4d80-8dde-9919aeafdef7","file_size":7074552}]},{"name":"Beretta_84fs_Chettah","full_name":"Andrew_FTW-Beretta_84fs_Chettah","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/Beretta_84fs_Chettah/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2022-11-17T01:19:43.504803+00:00","date_updated":"2022-11-17T18:34:33.972772+00:00","uuid4":"ade705eb-4ede-481b-9b0a-7bfe0124ce1f","rating_score":9,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Beretta_84fs_Chettah","full_name":"Andrew_FTW-Beretta_84fs_Chettah-1.1.0","description":"A compact and reliable .380 ACP pistol.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-Beretta_84fs_Chettah-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2","cityrobo-OpenScripts2-2.0.0","Andrew_FTW-FTW_Arms_AFCL-2.26.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/Beretta_84fs_Chettah/1.1.0/","downloads":22470,"date_created":"2022-11-17T18:34:31.975135+00:00","website_url":"","is_active":true,"uuid4":"c110d15e-71aa-47b4-b391-162c69108d30","file_size":62867819},{"name":"Beretta_84fs_Chettah","full_name":"Andrew_FTW-Beretta_84fs_Chettah-1.0.0","description":"A compact and reliable .380 ACP pistol.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-Beretta_84fs_Chettah-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.2","cityrobo-OpenScripts2-2.0.0","Andrew_FTW-FTW_Arms_AFCL-2.26.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/Beretta_84fs_Chettah/1.0.0/","downloads":15129,"date_created":"2022-11-17T01:19:43.984523+00:00","website_url":"","is_active":true,"uuid4":"64c2eb98-57df-46d1-a2fb-10653f5867a6","file_size":19249442}]},{"name":"SPG9","full_name":"JerryAr-SPG9","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/SPG9/","donation_link":null,"date_created":"2022-12-22T18:53:30.221067+00:00","date_updated":"2023-08-26T21:29:25.337801+00:00","uuid4":"ab417dda-acf4-4f7a-a3d2-95b57f4b0e87","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"SPG9","full_name":"JerryAr-SPG9-1.1.1","description":"Bam!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-SPG9-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/SPG9/1.1.1/","downloads":23151,"date_created":"2023-08-26T21:29:24.157657+00:00","website_url":"","is_active":true,"uuid4":"3c898bf1-43fa-4352-8f50-36f9e28c1064","file_size":9446534},{"name":"SPG9","full_name":"JerryAr-SPG9-1.1.0","description":"Bam!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-SPG9-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","Andrew_FTW-FTW_Arms_AFCL-2.31.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/SPG9/1.1.0/","downloads":6769,"date_created":"2023-03-01T18:05:39.367124+00:00","website_url":"","is_active":true,"uuid4":"1fc17f2d-3960-47b3-a4cc-20ace612ec84","file_size":9291403},{"name":"SPG9","full_name":"JerryAr-SPG9-1.0.0","description":"Bam!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-SPG9-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/SPG9/1.0.0/","downloads":3274,"date_created":"2022-12-22T18:53:30.681722+00:00","website_url":"","is_active":true,"uuid4":"66492abf-bfa8-45e3-aa4d-0eee915566d7","file_size":9222657}]},{"name":"M82","full_name":"devyndamonster-M82","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/M82/","donation_link":null,"date_created":"2023-01-07T16:32:06.420643+00:00","date_updated":"2023-01-07T16:32:08.366161+00:00","uuid4":"8369dcc6-390c-44c3-9c3f-f41d0c377d8b","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"M82","full_name":"devyndamonster-M82-1.0.0","description":"The M82 is a bullupped RK 62, with some unfortunate ergonomic downsides. It was rejected by the Finish military, with it's most notable downside being that the rear sight would often hit the shooters face","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-M82-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/M82/1.0.0/","downloads":26191,"date_created":"2023-01-07T16:32:06.745229+00:00","website_url":"","is_active":true,"uuid4":"4fc32177-cba8-47fe-a029-1adf1679b76b","file_size":40659816}]},{"name":"TKB_022PM_No2","full_name":"devyndamonster-TKB_022PM_No2","owner":"devyndamonster","package_url":"https://thunderstore.io/c/h3vr/p/devyndamonster/TKB_022PM_No2/","donation_link":null,"date_created":"2023-01-11T14:00:01.754227+00:00","date_updated":"2023-01-11T14:00:03.878595+00:00","uuid4":"5555d681-953b-47a2-99a4-7d480a7691a0","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TKB_022PM_No2","full_name":"devyndamonster-TKB_022PM_No2-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/devyndamonster-TKB_022PM_No2-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/devyndamonster/TKB_022PM_No2/1.0.0/","downloads":25148,"date_created":"2023-01-11T14:00:02.409112+00:00","website_url":"","is_active":true,"uuid4":"b8ce2d5e-aa12-4394-8afd-d780ce234727","file_size":15429478}]},{"name":"9K34_Igla_Manpad","full_name":"JerryAr-9K34_Igla_Manpad","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/9K34_Igla_Manpad/","donation_link":null,"date_created":"2023-02-04T17:11:05.874746+00:00","date_updated":"2023-07-11T17:27:58.760130+00:00","uuid4":"ff99a070-a126-444d-aa45-d7976463df55","rating_score":9,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"9K34_Igla_Manpad","full_name":"JerryAr-9K34_Igla_Manpad-1.1.1","description":"Watch out!! Manpad! Manpad!!!!!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9K34_Igla_Manpad-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/9K34_Igla_Manpad/1.1.1/","downloads":21273,"date_created":"2023-07-11T17:27:57.631932+00:00","website_url":"","is_active":true,"uuid4":"0ab8ac6f-c7c0-4a36-a007-bb0661a5eddd","file_size":31276898},{"name":"9K34_Igla_Manpad","full_name":"JerryAr-9K34_Igla_Manpad-1.1.0","description":"Watch out!! Manpad! Manpad!!!!!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9K34_Igla_Manpad-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/9K34_Igla_Manpad/1.1.0/","downloads":6087,"date_created":"2023-03-13T11:43:49.884028+00:00","website_url":"","is_active":true,"uuid4":"ce0d4e75-045b-47fe-a899-3efd4ce09a97","file_size":31432572},{"name":"9K34_Igla_Manpad","full_name":"JerryAr-9K34_Igla_Manpad-1.0.1","description":"Watch out!! Manpad! Manpad!!!!!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9K34_Igla_Manpad-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/9K34_Igla_Manpad/1.0.1/","downloads":2353,"date_created":"2023-02-04T18:06:18.633107+00:00","website_url":"","is_active":true,"uuid4":"688ffd92-64d6-41bf-bd7c-173789b663f5","file_size":21118033},{"name":"9K34_Igla_Manpad","full_name":"JerryAr-9K34_Igla_Manpad-1.0.0","description":"Watch out!! Manpad! Manpad!!!!!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9K34_Igla_Manpad-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/9K34_Igla_Manpad/1.0.0/","downloads":140,"date_created":"2023-02-04T17:11:06.177256+00:00","website_url":"","is_active":true,"uuid4":"ce6de951-cec4-4330-806c-c3791baa5c8f","file_size":21516209}]},{"name":"MG3","full_name":"JerryAr-MG3","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/MG3/","donation_link":null,"date_created":"2023-04-03T11:17:15.409936+00:00","date_updated":"2024-06-26T16:05:03.424196+00:00","uuid4":"9635d1a7-3b95-408a-82d6-019a2bbf3c78","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"MG3","full_name":"JerryAr-MG3-1.1.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-MG3-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/MG3/1.1.0/","downloads":18234,"date_created":"2024-06-26T16:05:00.852177+00:00","website_url":"","is_active":true,"uuid4":"ce38bb07-8ffa-47c4-99d4-673b239c8432","file_size":78268401},{"name":"MG3","full_name":"JerryAr-MG3-1.0.2","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-MG3-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/MG3/1.0.2/","downloads":2437,"date_created":"2024-06-09T18:43:17.125969+00:00","website_url":"","is_active":true,"uuid4":"ad8d16f5-97d6-4acb-900e-edc229d572e9","file_size":25139127},{"name":"MG3","full_name":"JerryAr-MG3-1.0.1","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-MG3-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/MG3/1.0.1/","downloads":19900,"date_created":"2023-04-06T12:33:04.986113+00:00","website_url":"","is_active":true,"uuid4":"5844449a-bb51-464d-9094-93a61cf2360b","file_size":25121254},{"name":"MG3","full_name":"JerryAr-MG3-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-MG3-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/MG3/1.0.0/","downloads":894,"date_created":"2023-04-03T11:17:15.933084+00:00","website_url":"","is_active":true,"uuid4":"d5636029-a71c-42bb-8091-18aac2308b34","file_size":23173762}]},{"name":"Type81_1","full_name":"JerryAr-Type81_1","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/Type81_1/","donation_link":null,"date_created":"2023-04-23T17:35:49.282526+00:00","date_updated":"2023-04-23T17:35:51.966159+00:00","uuid4":"3e4a5e76-a7d2-469e-911a-7ca58bf2d283","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"Type81_1","full_name":"JerryAr-Type81_1-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-Type81_1-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/Type81_1/1.0.0/","downloads":21365,"date_created":"2023-04-23T17:35:49.819971+00:00","website_url":"","is_active":true,"uuid4":"e851fb47-fa88-40e8-9a47-56fcd45f3309","file_size":15488321}]},{"name":"TOZ66","full_name":"Vohnyshche-TOZ66","owner":"Vohnyshche","package_url":"https://thunderstore.io/c/h3vr/p/Vohnyshche/TOZ66/","donation_link":null,"date_created":"2023-05-12T05:05:48.527040+00:00","date_updated":"2023-05-14T03:42:18.359140+00:00","uuid4":"5ff008a0-9d28-47a0-ae10-091cd26e907c","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TOZ66","full_name":"Vohnyshche-TOZ66-1.0.1","description":"Rookie's best friend","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-TOZ66-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/TOZ66/1.0.1/","downloads":25105,"date_created":"2023-05-14T03:42:16.760031+00:00","website_url":"","is_active":true,"uuid4":"8cf78e03-3243-4765-9b6f-82126e7c49b6","file_size":17571491},{"name":"TOZ66","full_name":"Vohnyshche-TOZ66-1.0.0","description":"Rookie's best friend!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-TOZ66-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/TOZ66/1.0.0/","downloads":475,"date_created":"2023-05-12T05:05:49.113011+00:00","website_url":"","is_active":true,"uuid4":"f51101fe-e23a-473e-829a-61f97e4f4ead","file_size":18041134}]},{"name":"TOZ34","full_name":"Vohnyshche-TOZ34","owner":"Vohnyshche","package_url":"https://thunderstore.io/c/h3vr/p/Vohnyshche/TOZ34/","donation_link":null,"date_created":"2023-05-12T04:54:22.163761+00:00","date_updated":"2023-05-14T03:40:08.797934+00:00","uuid4":"48535d87-67ff-42ba-ad54-3733c8de2e95","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TOZ34","full_name":"Vohnyshche-TOZ34-1.0.1","description":"The classic Soviet over-under","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-TOZ34-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/TOZ34/1.0.1/","downloads":27327,"date_created":"2023-05-14T03:40:07.247840+00:00","website_url":"","is_active":true,"uuid4":"a4ca18fa-f70d-4ebf-976c-106c39d980ff","file_size":31807157},{"name":"TOZ34","full_name":"Vohnyshche-TOZ34-1.0.0","description":"The classic Soviet over-under!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-TOZ34-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/TOZ34/1.0.0/","downloads":519,"date_created":"2023-05-12T04:54:22.726625+00:00","website_url":"","is_active":true,"uuid4":"787efc53-49d4-43dc-960c-9dd9ae9bf4c8","file_size":33044538}]},{"name":"SIG_Sauer_P220","full_name":"Vohnyshche-SIG_Sauer_P220","owner":"Vohnyshche","package_url":"https://thunderstore.io/c/h3vr/p/Vohnyshche/SIG_Sauer_P220/","donation_link":null,"date_created":"2023-05-12T04:34:49.913095+00:00","date_updated":"2023-05-14T01:09:47.679037+00:00","uuid4":"17c2a307-4bcd-4040-a8e6-04dde535d30d","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SIG_Sauer_P220","full_name":"Vohnyshche-SIG_Sauer_P220-1.0.1","description":"A Swiss/German .45!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-SIG_Sauer_P220-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/SIG_Sauer_P220/1.0.1/","downloads":23460,"date_created":"2023-05-14T01:09:45.711968+00:00","website_url":"","is_active":true,"uuid4":"ef9ca83d-d72d-4395-8d66-d9acba164d04","file_size":34010308},{"name":"SIG_Sauer_P220","full_name":"Vohnyshche-SIG_Sauer_P220-1.0.0","description":"A Swiss/German .45!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Vohnyshche-SIG_Sauer_P220-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Vohnyshche/SIG_Sauer_P220/1.0.0/","downloads":523,"date_created":"2023-05-12T04:34:51.086075+00:00","website_url":"","is_active":true,"uuid4":"c881e20a-33a5-4e94-b250-c51a2ced3b8e","file_size":34063985}]},{"name":"RPG_76_Komar","full_name":"Andrew_FTW-RPG_76_Komar","owner":"Andrew_FTW","package_url":"https://thunderstore.io/c/h3vr/p/Andrew_FTW/RPG_76_Komar/","donation_link":"https://ko-fi.com/andrewftw","date_created":"2023-06-02T20:43:29.514546+00:00","date_updated":"2023-06-02T20:43:31.314413+00:00","uuid4":"eb6a9b62-3dc3-4759-b2a4-e62e254bfb0d","rating_score":7,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RPG_76_Komar","full_name":"Andrew_FTW-RPG_76_Komar-1.0.0","description":"The Polish single use anti-tank weapon being used in Ukraine","icon":"https://gcdn.thunderstore.io/live/repository/icons/Andrew_FTW-RPG_76_Komar-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.0.0","Andrew_FTW-FTW_Arms_AFCL-2.26.0"],"download_url":"https://thunderstore.io/package/download/Andrew_FTW/RPG_76_Komar/1.0.0/","downloads":21570,"date_created":"2023-06-02T20:43:29.864610+00:00","website_url":"","is_active":true,"uuid4":"40449599-3aa9-4887-934e-b16ec09b14a6","file_size":16460471}]},{"name":"PM63","full_name":"Shault-PM63","owner":"Shault","package_url":"https://thunderstore.io/c/h3vr/p/Shault/PM63/","donation_link":null,"date_created":"2023-07-30T19:36:53.244260+00:00","date_updated":"2023-08-06T15:27:16.376679+00:00","uuid4":"1847f029-aa04-4452-9f67-f141a076ada0","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"PM63","full_name":"Shault-PM63-1.2.0","description":"Polish 9×18mm submachine gun.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Shault-PM63-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Shault/PM63/1.2.0/","downloads":19613,"date_created":"2023-08-06T15:27:15.335490+00:00","website_url":"","is_active":true,"uuid4":"40896e46-abe0-47af-821d-bda4c3097eca","file_size":12419239},{"name":"PM63","full_name":"Shault-PM63-1.1.0","description":"Polish 9×18mm submachine gun.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Shault-PM63-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Shault/PM63/1.1.0/","downloads":1465,"date_created":"2023-08-01T08:19:45.089822+00:00","website_url":"","is_active":true,"uuid4":"ad6df34b-609f-416c-98a2-1c5238531703","file_size":12440624},{"name":"PM63","full_name":"Shault-PM63-1.0.0","description":"Polish 9×18mm submachine gun.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Shault-PM63-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Shault/PM63/1.0.0/","downloads":1147,"date_created":"2023-07-30T19:36:53.574957+00:00","website_url":"","is_active":true,"uuid4":"790d5e82-cd38-4ca0-8198-51b951b52e35","file_size":12448027}]},{"name":"Beretta_87","full_name":"Pykkle-Beretta_87","owner":"Pykkle","package_url":"https://thunderstore.io/c/h3vr/p/Pykkle/Beretta_87/","donation_link":"https://ko-fi.com/pykkle","date_created":"2023-08-01T22:57:00.618918+00:00","date_updated":"2023-08-01T22:57:06.939309+00:00","uuid4":"989ecc55-9435-4705-bfb2-8fb78bee66b3","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Beretta_87","full_name":"Pykkle-Beretta_87-1.0.0","description":"Pistola Precisione","icon":"https://gcdn.thunderstore.io/live/repository/icons/Pykkle-Beretta_87-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Pykkle/Beretta_87/1.0.0/","downloads":18835,"date_created":"2023-08-01T22:57:01.121980+00:00","website_url":"","is_active":true,"uuid4":"da156908-828f-448a-8c06-7599b6061c1b","file_size":29796051}]},{"name":"Bren_Variants","full_name":"Billiam_J_McGoonigan-Bren_Variants","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Bren_Variants/","donation_link":null,"date_created":"2023-08-18T13:48:09.642054+00:00","date_updated":"2023-08-18T13:48:11.077655+00:00","uuid4":"71e3d517-8ae2-4312-85ed-34f5df1add77","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Bren_Variants","full_name":"Billiam_J_McGoonigan-Bren_Variants-1.0.0","description":"Variants of the Bren LMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Bren_Variants-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Bren_Variants/1.0.0/","downloads":26459,"date_created":"2023-08-18T13:48:09.961878+00:00","website_url":"","is_active":true,"uuid4":"983aeeaa-d6bf-40d7-b808-449967bd0185","file_size":31610212}]},{"name":"Daewoo_K_Series","full_name":"Shault-Daewoo_K_Series","owner":"Shault","package_url":"https://thunderstore.io/c/h3vr/p/Shault/Daewoo_K_Series/","donation_link":null,"date_created":"2023-08-27T13:15:04.305166+00:00","date_updated":"2023-08-27T13:15:05.578510+00:00","uuid4":"0050657a-18b9-427c-b653-7f9eeb58b42e","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Daewoo_K_Series","full_name":"Shault-Daewoo_K_Series-1.0.0","description":"Daewoo Industries K1A & K7","icon":"https://gcdn.thunderstore.io/live/repository/icons/Shault-Daewoo_K_Series-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Shault/Daewoo_K_Series/1.0.0/","downloads":27123,"date_created":"2023-08-27T13:15:04.637157+00:00","website_url":"","is_active":true,"uuid4":"a1103f23-2629-4095-a08c-716b09663431","file_size":23799218}]},{"name":"9k111","full_name":"JerryAr-9k111","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/9k111/","donation_link":null,"date_created":"2023-08-27T16:37:32.478669+00:00","date_updated":"2024-11-20T13:41:36.368113+00:00","uuid4":"8b204e43-47bc-499c-883b-bc4ca97f7be4","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"9k111","full_name":"JerryAr-9k111-1.2.0","description":"Fagot","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9k111-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/9k111/1.2.0/","downloads":11913,"date_created":"2024-11-20T13:41:34.726548+00:00","website_url":"","is_active":true,"uuid4":"6cd82d31-19b8-45a6-b5a4-6b61b4b85c05","file_size":81880404},{"name":"9k111","full_name":"JerryAr-9k111-1.1.2","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9k111-1.1.2.png","version_number":"1.1.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/9k111/1.1.2/","downloads":11958,"date_created":"2023-12-02T08:54:44.421388+00:00","website_url":"","is_active":true,"uuid4":"67eb875a-473b-460a-97fc-3bca7e6bcc1a","file_size":81532498},{"name":"9k111","full_name":"JerryAr-9k111-1.1.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9k111-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/9k111/1.1.0/","downloads":4904,"date_created":"2023-09-12T17:44:42.778136+00:00","website_url":"","is_active":true,"uuid4":"0a079129-6c3a-478a-9d98-2c349dd57631","file_size":81500729},{"name":"9k111","full_name":"JerryAr-9k111-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-9k111-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/9k111/1.0.0/","downloads":2999,"date_created":"2023-08-27T16:37:32.839886+00:00","website_url":"","is_active":true,"uuid4":"5d9b2e91-61ed-4016-8b49-08eb016b9c77","file_size":80732994}]},{"name":"MR73RevolverSet","full_name":"Volks-MR73RevolverSet","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/MR73RevolverSet/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-12-13T13:27:06.398118+00:00","date_updated":"2024-12-13T13:27:13.132200+00:00","uuid4":"3f69b87e-13f8-424a-b14a-4c40c97d02ea","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"MR73RevolverSet","full_name":"Volks-MR73RevolverSet-1.0.0","description":"French's very own premier SWAT Sniper-revolver!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-MR73RevolverSet-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0"],"download_url":"https://thunderstore.io/package/download/Volks/MR73RevolverSet/1.0.0/","downloads":8763,"date_created":"2024-12-13T13:27:11.591395+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"7e031051-e3c7-43e7-9b89-62ce58c24788","file_size":46807357}]},{"name":"M79_Obrez","full_name":"Billiam_J_McGoonigan-M79_Obrez","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/M79_Obrez/","donation_link":null,"date_created":"2024-01-01T01:11:28.952393+00:00","date_updated":"2024-01-01T14:17:07.724473+00:00","uuid4":"4cdb9cf4-6adc-4f42-9977-2657aaa6e2a7","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"M79_Obrez","full_name":"Billiam_J_McGoonigan-M79_Obrez-1.0.1","description":"Bloop!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-M79_Obrez-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/M79_Obrez/1.0.1/","downloads":17993,"date_created":"2024-01-01T14:17:06.997617+00:00","website_url":"","is_active":true,"uuid4":"a05f698f-bb97-4a4d-8671-11da488b9986","file_size":12061113},{"name":"M79_Obrez","full_name":"Billiam_J_McGoonigan-M79_Obrez-1.0.0","description":"Bloop!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-M79_Obrez-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/M79_Obrez/1.0.0/","downloads":438,"date_created":"2024-01-01T01:11:31.895841+00:00","website_url":"","is_active":true,"uuid4":"7b5f00cc-9997-44fb-a50f-996d8c09a602","file_size":12054771}]},{"name":"LiberatorShotgun","full_name":"Billiam_J_McGoonigan-LiberatorShotgun","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/LiberatorShotgun/","donation_link":null,"date_created":"2024-01-01T01:10:43.000648+00:00","date_updated":"2024-01-06T01:13:55.050737+00:00","uuid4":"d045e8ae-4a11-4ff0-9211-8ad1142c6eb5","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"LiberatorShotgun","full_name":"Billiam_J_McGoonigan-LiberatorShotgun-1.0.2","description":"Four barrels of fun!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-LiberatorShotgun-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/LiberatorShotgun/1.0.2/","downloads":19241,"date_created":"2024-01-06T01:13:54.175029+00:00","website_url":"","is_active":true,"uuid4":"84296fb1-6a9c-4c5b-b4fd-b6b6078c9ee5","file_size":13129133},{"name":"LiberatorShotgun","full_name":"Billiam_J_McGoonigan-LiberatorShotgun-1.0.1","description":"Four barrels of fun!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-LiberatorShotgun-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/LiberatorShotgun/1.0.1/","downloads":1088,"date_created":"2024-01-01T14:16:33.246309+00:00","website_url":"","is_active":true,"uuid4":"6d3914ce-89ac-430e-bdee-d8d01511eda5","file_size":13129048},{"name":"LiberatorShotgun","full_name":"Billiam_J_McGoonigan-LiberatorShotgun-1.0.0","description":"Four barrels of fun!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-LiberatorShotgun-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/LiberatorShotgun/1.0.0/","downloads":551,"date_created":"2024-01-01T01:10:48.161274+00:00","website_url":"","is_active":true,"uuid4":"19ad16d6-9f4d-4bc4-a6d5-ad55bccc4177","file_size":13129046}]},{"name":"L42A1","full_name":"Billiam_J_McGoonigan-L42A1","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/L42A1/","donation_link":null,"date_created":"2024-01-01T01:05:20.405480+00:00","date_updated":"2025-01-08T23:32:47.836726+00:00","uuid4":"d17070d8-db7b-4d87-aa58-68654dc60d3f","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"L42A1","full_name":"Billiam_J_McGoonigan-L42A1-1.0.2","description":"Cold War Sniper variant of the Lee Enfield","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-L42A1-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.6.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/L42A1/1.0.2/","downloads":9822,"date_created":"2025-01-08T23:32:46.596595+00:00","website_url":"","is_active":true,"uuid4":"2f926952-50a1-4a88-be73-528fbcd038cf","file_size":21991938},{"name":"L42A1","full_name":"Billiam_J_McGoonigan-L42A1-1.0.1","description":"Cold War Sniper variant of the Lee Enfield","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-L42A1-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.6.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/L42A1/1.0.1/","downloads":10897,"date_created":"2024-01-01T14:16:05.027610+00:00","website_url":"","is_active":true,"uuid4":"4b5d8b6a-e866-4e67-b2f1-5130d5e3b0ac","file_size":21701399},{"name":"L42A1","full_name":"Billiam_J_McGoonigan-L42A1-1.0.0","description":"Cold War Sniper variant of the Lee Enfield","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-L42A1-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.6.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/L42A1/1.0.0/","downloads":439,"date_created":"2024-01-01T01:05:23.345759+00:00","website_url":"","is_active":true,"uuid4":"c8f0d4b0-9119-4ace-8e39-81b9b1dd7019","file_size":21701395}]},{"name":"Type_80_Pistol","full_name":"Billiam_J_McGoonigan-Type_80_Pistol","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Type_80_Pistol/","donation_link":null,"date_created":"2024-01-06T13:27:50.564086+00:00","date_updated":"2024-01-06T13:27:53.309573+00:00","uuid4":"6a99f0b7-8cb0-4101-9ab3-245ccd834358","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type_80_Pistol","full_name":"Billiam_J_McGoonigan-Type_80_Pistol-1.0.0","description":"Chinese Cold War machine pistol","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type_80_Pistol-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type_80_Pistol/1.0.0/","downloads":18195,"date_created":"2024-01-06T13:27:52.252793+00:00","website_url":"","is_active":true,"uuid4":"95aebcbe-9554-455d-9ad5-d1d4258f045c","file_size":27206777}]},{"name":"CZ75_Auto","full_name":"sirpotatos-CZ75_Auto","owner":"sirpotatos","package_url":"https://thunderstore.io/c/h3vr/p/sirpotatos/CZ75_Auto/","donation_link":"https://ko-fi.com/sirpotatos70616","date_created":"2022-02-22T05:05:57.742891+00:00","date_updated":"2024-01-07T18:59:34.061572+00:00","uuid4":"c1f579b9-6da0-4622-9e32-46c9e2f67b03","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"CZ75_Auto","full_name":"sirpotatos-CZ75_Auto-3.0.1","description":"CZ 75 Auto, Czech Machine Pistol","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-CZ75_Auto-3.0.1.png","version_number":"3.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.7.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/CZ75_Auto/3.0.1/","downloads":27908,"date_created":"2024-01-07T18:59:32.735776+00:00","website_url":"","is_active":true,"uuid4":"77cf290e-b78d-42a7-8a43-5a26a1a258f8","file_size":14810305},{"name":"CZ75_Auto","full_name":"sirpotatos-CZ75_Auto-3.0.0","description":"CZ 75 Auto, Czech Machine Pistol","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-CZ75_Auto-3.0.0.png","version_number":"3.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.7.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/CZ75_Auto/3.0.0/","downloads":7978,"date_created":"2024-01-07T02:51:13.258256+00:00","website_url":"","is_active":true,"uuid4":"d0e710bd-0a7f-4ae1-a839-75d4e3bb4224","file_size":14983057},{"name":"CZ75_Auto","full_name":"sirpotatos-CZ75_Auto-2.0.0","description":"The CZ75 Auto Magazine from R6 Siege. The magazine can be attached to a rail and used as a foregrip!","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-CZ75_Auto-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.1.5","WFIOST-H3VRUtilities-8.9.1","cityrobo-OpenScripts-1.2.3"],"download_url":"https://thunderstore.io/package/download/sirpotatos/CZ75_Auto/2.0.0/","downloads":32649,"date_created":"2022-02-22T05:05:57.873584+00:00","website_url":"","is_active":true,"uuid4":"c6271057-6e04-489e-9b20-76e2cab6bab8","file_size":4011170},{"name":"CZ75_Auto","full_name":"sirpotatos-CZ75_Auto-1.0.0","description":"CZ 75 Auto, Czech Machine Pistol","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-CZ75_Auto-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.7.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/CZ75_Auto/1.0.0/","downloads":359,"date_created":"2024-01-07T02:42:52.980967+00:00","website_url":"","is_active":true,"uuid4":"142f5ada-b843-4116-b753-761640421709","file_size":14983001}]},{"name":"Type_63","full_name":"Billiam_J_McGoonigan-Type_63","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Type_63/","donation_link":null,"date_created":"2024-02-19T16:57:48.055223+00:00","date_updated":"2024-02-24T15:16:43.564844+00:00","uuid4":"2614ee27-f3c8-41c3-b114-42c7f5044c8f","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type_63","full_name":"Billiam_J_McGoonigan-Type_63-1.0.1","description":"Full-Auto Chinese SKS","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type_63-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type_63/1.0.1/","downloads":15115,"date_created":"2024-02-24T15:16:42.526061+00:00","website_url":"","is_active":true,"uuid4":"3382465e-b6d9-41b1-9f75-59876b432009","file_size":35757816},{"name":"Type_63","full_name":"Billiam_J_McGoonigan-Type_63-1.0.0","description":"Full-Auto Chinese SKS","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type_63-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type_63/1.0.0/","downloads":502,"date_created":"2024-02-19T16:57:50.762492+00:00","website_url":"","is_active":true,"uuid4":"c95a1987-15a1-4293-913b-1dfb2d6fde49","file_size":35757747}]},{"name":"Type_79_SMG","full_name":"Billiam_J_McGoonigan-Type_79_SMG","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Type_79_SMG/","donation_link":null,"date_created":"2024-02-19T16:58:35.168339+00:00","date_updated":"2024-02-19T16:58:39.215405+00:00","uuid4":"3e3d9a43-9de3-4af9-a141-97108555dd5d","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type_79_SMG","full_name":"Billiam_J_McGoonigan-Type_79_SMG-1.0.0","description":"I guess 7.62 Tokarev isn't obsolete","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type_79_SMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type_79_SMG/1.0.0/","downloads":14765,"date_created":"2024-02-19T16:58:38.029866+00:00","website_url":"","is_active":true,"uuid4":"da442515-9653-4c79-a334-fc8fdc94927b","file_size":29825067}]},{"name":"Type73","full_name":"Billiam_J_McGoonigan-Type73","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Type73/","donation_link":null,"date_created":"2024-04-02T00:48:20.608314+00:00","date_updated":"2024-04-03T00:45:53.087906+00:00","uuid4":"6ae53936-f67c-419c-b314-21e9ff6adc18","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type73","full_name":"Billiam_J_McGoonigan-Type73-1.0.1","description":"The forgotten lovechild of the Bren and PKM","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type73-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type73/1.0.1/","downloads":13924,"date_created":"2024-04-03T00:45:51.571489+00:00","website_url":"","is_active":true,"uuid4":"733f07c7-ed23-4466-85f4-6b8612729fc2","file_size":59290049},{"name":"Type73","full_name":"Billiam_J_McGoonigan-Type73-1.0.0","description":"The forgotten lovechild of the Bren and PKM","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Type73-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","Muzzle-Lancaster_Howdah_Pistol-1.0.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Type73/1.0.0/","downloads":310,"date_created":"2024-04-02T00:48:25.245298+00:00","website_url":"","is_active":true,"uuid4":"19f5dda9-43df-48e2-bc64-fa440f6413f3","file_size":59290060}]},{"name":"C58","full_name":"Volksterism-C58","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/C58/","donation_link":null,"date_created":"2024-05-17T22:33:56.293818+00:00","date_updated":"2024-05-21T15:34:49.707049+00:00","uuid4":"2f702fb7-0adb-42af-9658-fb40ae39bcd7","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"C58","full_name":"Volksterism-C58-1.2.0","description":"Cetme 58 Rifle. Si.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-C58-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/C58/1.2.0/","downloads":11651,"date_created":"2024-05-21T15:34:48.096852+00:00","website_url":"","is_active":true,"uuid4":"045b2f81-6b0d-4ddd-9b91-ae323151ddf5","file_size":35951068},{"name":"C58","full_name":"Volksterism-C58-1.1.0","description":"Cetme 58 Rifle. Si.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-C58-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/C58/1.1.0/","downloads":5278,"date_created":"2024-05-18T20:40:36.299200+00:00","website_url":"","is_active":true,"uuid4":"2aaf85da-69f1-4649-915b-9da4a194bcf7","file_size":26411471},{"name":"C58","full_name":"Volksterism-C58-1.0.0","description":"Cetme 58 Rifle. Si.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-C58-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/C58/1.0.0/","downloads":297,"date_created":"2024-05-17T22:34:00.605196+00:00","website_url":"","is_active":true,"uuid4":"bac39a19-6bbd-4274-8858-17ce0beb703f","file_size":27696768}]},{"name":"More_RPG7_Rockets","full_name":"JerryAr-More_RPG7_Rockets","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/More_RPG7_Rockets/","donation_link":null,"date_created":"2024-05-17T15:18:05.587884+00:00","date_updated":"2025-11-01T09:37:23.511672+00:00","uuid4":"135c7aa4-3bf0-429b-b73d-f168e81acca8","rating_score":7,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo","Mods"],"versions":[{"name":"More_RPG7_Rockets","full_name":"JerryAr-More_RPG7_Rockets-1.1.0","description":"105","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-More_RPG7_Rockets-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/More_RPG7_Rockets/1.1.0/","downloads":4626,"date_created":"2025-11-01T09:37:22.161563+00:00","website_url":"","is_active":true,"uuid4":"de1f9ef3-abce-4211-b28a-65c488ed9601","file_size":22665925},{"name":"More_RPG7_Rockets","full_name":"JerryAr-More_RPG7_Rockets-1.0.0","description":"105","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-More_RPG7_Rockets-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/More_RPG7_Rockets/1.0.0/","downloads":16770,"date_created":"2024-05-17T15:18:09.874893+00:00","website_url":"","is_active":true,"uuid4":"ddd0747a-53b8-45be-af77-20775db1a274","file_size":16455291}]},{"name":"C633","full_name":"ultrasnail-C633","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/C633/","donation_link":null,"date_created":"2024-06-02T17:48:38.576344+00:00","date_updated":"2024-11-30T15:28:20.206430+00:00","uuid4":"86421622-273e-4f3c-8d23-5abf63c26aa8","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"C633","full_name":"ultrasnail-C633-1.2.1","description":"The colt C633, commisioned by the department of energy colt to protect nuclear facilities","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-C633-1.2.1.png","version_number":"1.2.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/C633/1.2.1/","downloads":13333,"date_created":"2024-11-30T15:28:18.542764+00:00","website_url":"","is_active":true,"uuid4":"b9226409-560e-460f-9118-01a1c3125962","file_size":59523886},{"name":"C633","full_name":"ultrasnail-C633-1.2.0","description":"The colt C633, commisioned by the department of energy colt to protect nuclear facilities","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-C633-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/C633/1.2.0/","downloads":54,"date_created":"2024-11-30T15:18:29.462093+00:00","website_url":"","is_active":true,"uuid4":"1a93a714-95a9-4890-8891-82fd188bdb21","file_size":119112694},{"name":"C633","full_name":"ultrasnail-C633-1.0.2","description":"The colt C633 DOE, commisioned by the department of energy colt to protect nuclear facilities","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-C633-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/C633/1.0.2/","downloads":6932,"date_created":"2024-06-05T13:54:34.852159+00:00","website_url":"","is_active":true,"uuid4":"068de68d-3183-4856-81e8-3f03a72ad3c6","file_size":19108958},{"name":"C633","full_name":"ultrasnail-C633-1.0.1","description":"The colt C633 aka the department of energy colt, used to protect nuclear facilities","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-C633-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/C633/1.0.1/","downloads":353,"date_created":"2024-06-02T18:15:57.819341+00:00","website_url":"","is_active":true,"uuid4":"6bd2cdc8-24ec-4c61-a84d-328c0becefac","file_size":19130877},{"name":"C633","full_name":"ultrasnail-C633-1.0.0","description":"The colt C633 aka the department of energy colt, used to protect nuclear facilities","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-C633-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/C633/1.0.0/","downloads":144,"date_created":"2024-06-02T17:48:45.821608+00:00","website_url":"","is_active":true,"uuid4":"fadbf246-7cb8-4f71-8569-601bb3a6fd26","file_size":19131298}]},{"name":"AKS74n","full_name":"JerryAr-AKS74n","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/AKS74n/","donation_link":null,"date_created":"2024-06-03T21:14:48.337368+00:00","date_updated":"2025-12-28T13:49:39.113791+00:00","uuid4":"80500535-fa23-404a-bb58-a1aa07759d9a","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.5","description":"Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.5.png","version_number":"1.3.5","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.5/","downloads":2006,"date_created":"2025-12-28T13:49:37.431524+00:00","website_url":"","is_active":true,"uuid4":"b374e2a9-ddfa-4135-bb4c-24b1858e8659","file_size":68231535},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.4","description":"Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.4.png","version_number":"1.3.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.4/","downloads":5525,"date_created":"2025-08-24T13:48:24.380239+00:00","website_url":"","is_active":true,"uuid4":"ab94e4fb-5fe4-4fe8-b3ed-159a683b7e7b","file_size":60060387},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.3","description":"Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.3.png","version_number":"1.3.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.3/","downloads":455,"date_created":"2025-08-23T10:47:48.541701+00:00","website_url":"","is_active":true,"uuid4":"d59026d7-0f20-4c4d-ad87-4d3f051e8537","file_size":60059479},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.2","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.2.png","version_number":"1.3.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.2/","downloads":1500,"date_created":"2025-08-11T13:05:05.537464+00:00","website_url":"","is_active":true,"uuid4":"071733cd-b7ec-40a0-9b86-929e931264dc","file_size":60050821},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.1","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.1.png","version_number":"1.3.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.1/","downloads":6129,"date_created":"2025-04-07T14:22:33.343344+00:00","website_url":"","is_active":true,"uuid4":"43068773-aa14-46be-861a-efbee03563cb","file_size":60045878},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.3.0","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.3.0.png","version_number":"1.3.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.3.0/","downloads":533,"date_created":"2025-04-06T13:07:01.706378+00:00","website_url":"","is_active":true,"uuid4":"74603844-68f5-43ce-be45-5fb28949c539","file_size":60011477},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.6","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.6.png","version_number":"1.2.6","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.6/","downloads":562,"date_created":"2025-04-05T12:20:01.971237+00:00","website_url":"","is_active":true,"uuid4":"603fec06-ff71-4bc8-9022-8378e0fc7d97","file_size":60042719},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.5","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.5.png","version_number":"1.2.5","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.5/","downloads":1242,"date_created":"2025-03-29T17:11:28.421232+00:00","website_url":"","is_active":true,"uuid4":"3b47b629-d798-43f8-aa98-19ea5fc0d90a","file_size":60042114},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.4","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.4.png","version_number":"1.2.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.4/","downloads":42,"date_created":"2025-03-29T16:36:38.688934+00:00","website_url":"","is_active":true,"uuid4":"b0ed1b13-7315-4aff-a82a-6136e445d54a","file_size":60041580},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.3","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.3.png","version_number":"1.2.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.3/","downloads":3584,"date_created":"2025-01-26T04:38:51.178568+00:00","website_url":"","is_active":true,"uuid4":"897baea4-a53b-4bca-8f2c-56c5367bd398","file_size":60039755},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.2","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.2.png","version_number":"1.2.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.2/","downloads":2371,"date_created":"2025-01-01T16:05:57.995509+00:00","website_url":"","is_active":true,"uuid4":"a9776ce6-2d65-4e6d-9a44-d0a7e3091233","file_size":60039707},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.1","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.1.png","version_number":"1.2.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.1/","downloads":210,"date_created":"2025-01-01T08:06:54.302639+00:00","website_url":"","is_active":true,"uuid4":"01410540-ae84-4ae4-b6b9-346429e13ac9","file_size":59435774},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.2.0","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.2.0/","downloads":416,"date_created":"2024-12-31T17:12:21.932651+00:00","website_url":"","is_active":true,"uuid4":"ae10322b-184f-4f6c-a31e-272837783790","file_size":68571944},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.1.3","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.1.3.png","version_number":"1.1.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.1.3/","downloads":5860,"date_created":"2024-06-06T04:48:14.877766+00:00","website_url":"","is_active":true,"uuid4":"c1725c97-94bd-4ac3-a370-8b6b97d83b1d","file_size":116968685},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.1.2","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.1.2.png","version_number":"1.1.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.1.2/","downloads":322,"date_created":"2024-06-05T11:58:28.745969+00:00","website_url":"","is_active":true,"uuid4":"ffd9be52-fc80-471b-9a25-aebc8be304e5","file_size":116967635},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.1.1","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.1.1/","downloads":5230,"date_created":"2024-06-04T13:43:22.149057+00:00","website_url":"","is_active":true,"uuid4":"ce141b6a-4398-4211-8bc6-e5ee6488737c","file_size":116965931},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.1.0","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.1.0/","downloads":289,"date_created":"2024-06-04T01:09:58.266168+00:00","website_url":"","is_active":true,"uuid4":"fc590b37-d87e-46f4-8842-f63dfe8968be","file_size":96363611},{"name":"AKS74n","full_name":"JerryAr-AKS74n-1.0.0","description":"HighPoly this time!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-AKS74n-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/AKS74n/1.0.0/","downloads":217,"date_created":"2024-06-03T21:14:53.502662+00:00","website_url":"","is_active":true,"uuid4":"64d033a6-74d7-425e-af56-b3754747b35a","file_size":44144383}]},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL","owner":"Not_Wolfie","package_url":"https://thunderstore.io/c/h3vr/p/Not_Wolfie/FN_CAL/","donation_link":"https://ko-fi.com/woofwoof4723","date_created":"2023-01-12T03:39:13.589236+00:00","date_updated":"2024-10-22T02:42:09.800589+00:00","uuid4":"ba490168-a39d-4799-a5aa-1c7efee8cb87","rating_score":9,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons"],"versions":[{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.6","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.6.png","version_number":"3.0.6","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.6/","downloads":15809,"date_created":"2024-10-22T02:42:07.724213+00:00","website_url":"","is_active":true,"uuid4":"7ab3b33a-c5c1-4706-b1d8-c09fae11312f","file_size":93174326},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.5","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.5.png","version_number":"3.0.5","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.5/","downloads":16136,"date_created":"2023-09-19T07:14:04.924110+00:00","website_url":"","is_active":true,"uuid4":"bf04f198-0f6c-40d2-9f20-51e760622ff3","file_size":93178691},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.4","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.4.png","version_number":"3.0.4","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.4/","downloads":3814,"date_created":"2023-08-19T12:18:26.771688+00:00","website_url":"","is_active":true,"uuid4":"25a1d891-d617-454a-bd6a-052afca8021f","file_size":93178570},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.3","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.3.png","version_number":"3.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.3/","downloads":2366,"date_created":"2023-08-05T11:06:14.299574+00:00","website_url":"","is_active":true,"uuid4":"b5228827-6220-4f4e-9c08-1409f7db852d","file_size":93178429},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.2","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.2.png","version_number":"3.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.2/","downloads":2763,"date_created":"2023-07-20T11:54:21.593763+00:00","website_url":"","is_active":true,"uuid4":"b6fe291e-6433-4b84-9467-bedf2dd0f97c","file_size":93178432},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.1","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.1.png","version_number":"3.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.1/","downloads":1782,"date_created":"2023-07-14T10:36:32.510999+00:00","website_url":"","is_active":true,"uuid4":"3b7093a3-82eb-4f1a-9e17-130c40c9b645","file_size":93194089},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-3.0.0","description":"FN's Failed Assault Rifle! (Modul-Workshop Compatible!)","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-3.0.0.png","version_number":"3.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0","Not_Wolfie-Modul_Workshop_Platform-1.3.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/3.0.0/","downloads":1949,"date_created":"2023-07-06T13:33:12.808120+00:00","website_url":"","is_active":true,"uuid4":"5062a84b-777f-44a1-9436-b74176b2ab3a","file_size":93192370},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-2.0.0","description":"FN's Failed Assault Rifle, now in H3!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.1.0","WFIOST-H3VRUtilities-8.0.0","Not_Wolfie-Rail_Appear_Tool-1.0.0"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/2.0.0/","downloads":619,"date_created":"2023-07-05T11:07:45.920005+00:00","website_url":"","is_active":true,"uuid4":"2064631b-f4c9-4d97-8434-a3aeaa712456","file_size":45404250},{"name":"FN_CAL","full_name":"Not_Wolfie-FN_CAL-1.0.0","description":"FN's Failed Assault Rifle, now in H3!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Not_Wolfie-FN_CAL-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0","WFIOST-H3VRUtilities-8.0.0","cityrobo-OpenScripts-1.3.2"],"download_url":"https://thunderstore.io/package/download/Not_Wolfie/FN_CAL/1.0.0/","downloads":13765,"date_created":"2023-01-12T03:39:14.014375+00:00","website_url":"","is_active":true,"uuid4":"f9704734-8dfb-46d8-a55e-19a4d28784a9","file_size":14458131}]},{"name":"BAR_Variants","full_name":"Billiam_J_McGoonigan-BAR_Variants","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/BAR_Variants/","donation_link":null,"date_created":"2024-01-06T13:23:36.432682+00:00","date_updated":"2024-07-19T16:39:13.220716+00:00","uuid4":"f4aefe8c-5218-415c-a723-2b3d7e98eeae","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BAR_Variants","full_name":"Billiam_J_McGoonigan-BAR_Variants-1.0.2","description":"Foreign variants of the BAR","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-BAR_Variants-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/BAR_Variants/1.0.2/","downloads":19224,"date_created":"2024-07-19T16:39:08.729089+00:00","website_url":"","is_active":true,"uuid4":"69d05106-28cd-42f6-a1d4-82164a658d39","file_size":60946837},{"name":"BAR_Variants","full_name":"Billiam_J_McGoonigan-BAR_Variants-1.0.1","description":"Foreign variants of the BAR","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-BAR_Variants-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/BAR_Variants/1.0.1/","downloads":1761,"date_created":"2024-07-04T23:43:45.651269+00:00","website_url":"","is_active":true,"uuid4":"50175691-f744-4403-b9f2-a2eafc513455","file_size":61015907},{"name":"BAR_Variants","full_name":"Billiam_J_McGoonigan-BAR_Variants-1.0.0","description":"Foreign variants of the BAR","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-BAR_Variants-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/BAR_Variants/1.0.0/","downloads":10176,"date_created":"2024-01-06T13:23:38.501493+00:00","website_url":"","is_active":true,"uuid4":"b1b1fa8d-c59e-424b-bb2b-21c507d23a0b","file_size":46502141}]},{"name":"Type1AK","full_name":"NovaProot-Type1AK","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/Type1AK/","donation_link":null,"date_created":"2024-07-23T22:11:56.470053+00:00","date_updated":"2024-08-14T18:34:22.206151+00:00","uuid4":"24b56849-09d0-4653-8484-a18eab7b8176","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"Type1AK","full_name":"NovaProot-Type1AK-1.0.1","description":"The classic AK variant, requested by Kris.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-Type1AK-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/Type1AK/1.0.1/","downloads":14748,"date_created":"2024-08-14T18:34:19.846534+00:00","website_url":"","is_active":true,"uuid4":"fa3235c7-9f1c-4fe7-b041-3ae8376e9b98","file_size":28472364},{"name":"Type1AK","full_name":"NovaProot-Type1AK-1.0.0","description":"The classic AK variant, requested by Kris.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-Type1AK-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/Type1AK/1.0.0/","downloads":1892,"date_created":"2024-07-23T22:12:01.789931+00:00","website_url":"","is_active":true,"uuid4":"14f9a64c-264a-43f7-b508-411603850588","file_size":28472354}]},{"name":"HowaType64","full_name":"Volksterism-HowaType64","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/HowaType64/","donation_link":null,"date_created":"2024-07-23T16:23:41.784130+00:00","date_updated":"2024-07-23T16:23:47.919040+00:00","uuid4":"b31a022b-0296-4e33-b842-78d5faa8c0ff","rating_score":3,"is_pinned":false,"is_deprecated":true,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HowaType64","full_name":"Volksterism-HowaType64-1.0.0","description":"Gates!!!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-HowaType64-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/HowaType64/1.0.0/","downloads":12968,"date_created":"2024-07-23T16:23:45.938960+00:00","website_url":"","is_active":true,"uuid4":"388b3585-5a21-40a4-a3fa-ecc4e3480d2a","file_size":8226624}]},{"name":"AR70","full_name":"Volksterism-AR70","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/AR70/","donation_link":null,"date_created":"2024-07-23T16:21:42.446609+00:00","date_updated":"2024-07-23T16:22:51.114953+00:00","uuid4":"89d506a5-23ea-41bf-a3da-73e539583a62","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"AR70","full_name":"Volksterism-AR70-1.0.0","description":"Bambino","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-AR70-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/AR70/1.0.0/","downloads":12303,"date_created":"2024-07-23T16:22:49.234381+00:00","website_url":"","is_active":true,"uuid4":"e9abb55b-4b82-4da5-b61d-a390c67c7839","file_size":46050804}]},{"name":"AC556","full_name":"ultrasnail-AC556","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/AC556/","donation_link":null,"date_created":"2024-08-01T19:10:56.225107+00:00","date_updated":"2024-08-01T19:11:02.820342+00:00","uuid4":"da15168d-7aa7-4d0a-bac3-115d48cde6de","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"AC556","full_name":"ultrasnail-AC556-1.0.0","description":"The select fire variation of th mini-14, Includes three different configurations","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-AC556-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/AC556/1.0.0/","downloads":12854,"date_created":"2024-08-01T19:11:01.395255+00:00","website_url":"","is_active":true,"uuid4":"b526ccfc-e1e7-4f7b-a3a5-f4a4ca7c8dd8","file_size":16325783}]},{"name":"Vz68_Skorpion","full_name":"sirpotatos-Vz68_Skorpion","owner":"sirpotatos","package_url":"https://thunderstore.io/c/h3vr/p/sirpotatos/Vz68_Skorpion/","donation_link":"https://ko-fi.com/sirpotatos70616","date_created":"2024-08-09T22:47:38.622235+00:00","date_updated":"2024-12-02T06:28:50.276727+00:00","uuid4":"33a25012-22e4-418c-b387-327651993a55","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons"],"versions":[{"name":"Vz68_Skorpion","full_name":"sirpotatos-Vz68_Skorpion-1.0.2","description":"Vz 68 Skorpion in 9x19mm with extra stocks, suppressor, and hidden rails.","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-Vz68_Skorpion-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/Vz68_Skorpion/1.0.2/","downloads":10360,"date_created":"2024-12-02T06:28:49.047610+00:00","website_url":"","is_active":true,"uuid4":"358614a5-a1c9-4beb-9bf7-36e9d3cb4aa9","file_size":42666737},{"name":"Vz68_Skorpion","full_name":"sirpotatos-Vz68_Skorpion-1.0.1","description":"Vz 68 Skorpion in 9x19mm with extra stocks, suppressor, and hidden rails.","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-Vz68_Skorpion-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/Vz68_Skorpion/1.0.1/","downloads":2130,"date_created":"2024-11-27T23:31:18.194372+00:00","website_url":"","is_active":true,"uuid4":"bb66b76e-4e94-45a2-adf3-0e13acf636b0","file_size":42766536},{"name":"Vz68_Skorpion","full_name":"sirpotatos-Vz68_Skorpion-1.0.0","description":"Vz 68 Skorpion in 9x19mm with extra stocks, suppressor, and hidden rails.","icon":"https://gcdn.thunderstore.io/live/repository/icons/sirpotatos-Vz68_Skorpion-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/sirpotatos/Vz68_Skorpion/1.0.0/","downloads":3783,"date_created":"2024-08-09T22:47:44.069905+00:00","website_url":"","is_active":true,"uuid4":"c1f38d36-c8ac-4dfa-95c6-8d32523c0a58","file_size":42674010}]},{"name":"MinebeaP9","full_name":"NovaProot-MinebeaP9","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/MinebeaP9/","donation_link":null,"date_created":"2024-08-14T13:18:18.317635+00:00","date_updated":"2024-08-14T13:18:27.833622+00:00","uuid4":"c35da251-3001-47a6-abf2-c235f38f4690","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"MinebeaP9","full_name":"NovaProot-MinebeaP9-1.0.0","description":"A Japanese clone of the Sig Sauer P220 chambered in 9x19mm.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-MinebeaP9-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/MinebeaP9/1.0.0/","downloads":11570,"date_created":"2024-08-14T13:18:26.001295+00:00","website_url":"","is_active":true,"uuid4":"e6fe453b-2a2a-42c5-bfad-4329bd912572","file_size":16380858}]},{"name":"Type3AK","full_name":"NovaProot-Type3AK","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/Type3AK/","donation_link":null,"date_created":"2024-08-18T21:34:23.302582+00:00","date_updated":"2024-08-18T21:34:28.636391+00:00","uuid4":"e3c8d101-7b41-4984-a6ed-3603b5e19f2e","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"Type3AK","full_name":"NovaProot-Type3AK-1.0.0","description":"The late model of the AK47, requested by Jack Foxtrot.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-Type3AK-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/Type3AK/1.0.0/","downloads":14301,"date_created":"2024-08-18T21:34:27.526779+00:00","website_url":"","is_active":true,"uuid4":"1d47fdc0-cd6e-4c31-976a-54252e9f8f29","file_size":9780766}]},{"name":"CAR_15","full_name":"ultrasnail-CAR_15","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/CAR_15/","donation_link":null,"date_created":"2024-09-01T01:02:54.923360+00:00","date_updated":"2025-06-20T17:41:59.270506+00:00","uuid4":"08be32ba-c237-4720-8599-a9e6bdfd9bdd","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"CAR_15","full_name":"ultrasnail-CAR_15-2.1.0","description":"A collection of CAR-15's, includes the XM177E2, M733, C607, C653, etc","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-2.1.0.png","version_number":"2.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","ultrasnail-AR15_Accessory_pack-1.0.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/2.1.0/","downloads":8286,"date_created":"2025-06-20T17:41:55.475168+00:00","website_url":"","is_active":true,"uuid4":"41a37fae-307b-4748-91dd-a313bbf83269","file_size":301397138},{"name":"CAR_15","full_name":"ultrasnail-CAR_15-2.0.0","description":"A collection of CAR-15's, includes the XM177E2, M733, C607, C653, etc","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/2.0.0/","downloads":2859,"date_created":"2025-06-05T18:56:24.007732+00:00","website_url":"","is_active":true,"uuid4":"3f24ec8d-f902-41d1-9bde-0a6bb9bd8fbd","file_size":358249036},{"name":"CAR_15","full_name":"ultrasnail-CAR_15-1.3.0","description":"A collection of CAR-15's, includes the XM177E2, M733, C607, C653, etc","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-1.3.0.png","version_number":"1.3.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/1.3.0/","downloads":4925,"date_created":"2025-04-10T14:50:22.014958+00:00","website_url":"","is_active":true,"uuid4":"3af8a1e7-00b6-46b1-971f-a1eaaf01d691","file_size":157247510},{"name":"CAR_15","full_name":"ultrasnail-CAR_15-1.2.1","description":"A collection of CAR-15's, includes the XM177E2, C653, C651, C608 and C605","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-1.2.1.png","version_number":"1.2.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/1.2.1/","downloads":2454,"date_created":"2025-03-14T16:10:29.340660+00:00","website_url":"","is_active":true,"uuid4":"67dee65f-ceff-4fba-9837-86303567aee3","file_size":101997906},{"name":"CAR_15","full_name":"ultrasnail-CAR_15-1.2.0","description":"A collection of CAR-15's, includes the XM177E2, C653, C651 and C608","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/1.2.0/","downloads":1158,"date_created":"2025-03-06T19:49:07.968652+00:00","website_url":"","is_active":true,"uuid4":"2973e2a7-0e79-420b-bb08-e80de2422489","file_size":83713941},{"name":"CAR_15","full_name":"ultrasnail-CAR_15-1.0.0","description":"A collection of CAR-15's, includes the XM177E2 and C653","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-CAR_15-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/CAR_15/1.0.0/","downloads":7043,"date_created":"2024-09-01T01:03:00.571207+00:00","website_url":"","is_active":true,"uuid4":"c794f414-7b75-41fb-b228-587ca843e0f7","file_size":57395931}]},{"name":"TP82","full_name":"ShermanJumbo-TP82","owner":"ShermanJumbo","package_url":"https://thunderstore.io/c/h3vr/p/ShermanJumbo/TP82/","donation_link":null,"date_created":"2024-09-05T01:58:11.805518+00:00","date_updated":"2024-09-05T01:58:17.636193+00:00","uuid4":"36bd6c7b-eda5-47a2-b9b6-d61c3f86e3c6","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo"],"versions":[{"name":"TP82","full_name":"ShermanJumbo-TP82-1.0.0","description":"A Soviet cosmonaut survival gun packing two small-bore shotgun barrels and a 5.45x39mm rifle barrel.","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-TP82-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/TP82/1.0.0/","downloads":11767,"date_created":"2024-09-05T01:58:16.480114+00:00","website_url":"","is_active":true,"uuid4":"32423080-88ef-4684-b8ea-9177c57273f5","file_size":10381683}]},{"name":"HawkMM1Launcher","full_name":"Volksterism-HawkMM1Launcher","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/HawkMM1Launcher/","donation_link":null,"date_created":"2024-09-07T17:26:04.551776+00:00","date_updated":"2024-09-07T17:26:11.467366+00:00","uuid4":"5992fd1e-1e19-4dda-9e03-eb495cb8c66d","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"HawkMM1Launcher","full_name":"Volksterism-HawkMM1Launcher-1.0.0","description":"You want a Milkor but bigger?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-HawkMM1Launcher-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/HawkMM1Launcher/1.0.0/","downloads":13057,"date_created":"2024-09-07T17:26:09.883438+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"87b2f577-f353-4ffb-ab31-7bfb4797585b","file_size":23385727}]},{"name":"MossbergBullpupShotgun","full_name":"Volksterism-MossbergBullpupShotgun","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/MossbergBullpupShotgun/","donation_link":null,"date_created":"2024-09-12T14:57:31.413240+00:00","date_updated":"2024-09-12T15:05:26.649553+00:00","uuid4":"8a83015d-05c8-4925-9162-a8e8d7889cc8","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"MossbergBullpupShotgun","full_name":"Volksterism-MossbergBullpupShotgun-1.0.1","description":"The 80s called, they want their shotgun back.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-MossbergBullpupShotgun-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/MossbergBullpupShotgun/1.0.1/","downloads":12272,"date_created":"2024-09-12T15:05:25.200040+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"1025bccc-4f15-4ac6-b8e7-4d427122de41","file_size":19789545},{"name":"MossbergBullpupShotgun","full_name":"Volksterism-MossbergBullpupShotgun-1.0.0","description":"The 80s called, they want their shotgun back.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-MossbergBullpupShotgun-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/MossbergBullpupShotgun/1.0.0/","downloads":63,"date_created":"2024-09-12T14:57:36.637487+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"7bb12d4f-cdd4-4498-b350-f57543aeb1cc","file_size":19789494}]},{"name":"DM34Launcher","full_name":"Volksterism-DM34Launcher","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/DM34Launcher/","donation_link":null,"date_created":"2024-09-14T17:33:24.962120+00:00","date_updated":"2024-12-17T11:27:55.170648+00:00","uuid4":"43483f2e-6370-411d-ad5c-0da04dce16ac","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"DM34Launcher","full_name":"Volksterism-DM34Launcher-1.0.3","description":"Another West German classic","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-DM34Launcher-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/DM34Launcher/1.0.3/","downloads":9994,"date_created":"2024-12-17T11:27:54.125340+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"da8cba1c-22d0-4aff-b349-cb769a0a633a","file_size":10192505},{"name":"DM34Launcher","full_name":"Volksterism-DM34Launcher-1.0.2","description":"Another West German classic","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-DM34Launcher-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/DM34Launcher/1.0.2/","downloads":2360,"date_created":"2024-09-20T13:41:06.323155+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"540d20db-9a56-4bc5-a630-d1872390015f","file_size":10010278},{"name":"DM34Launcher","full_name":"Volksterism-DM34Launcher-1.0.1","description":"Another West German classic","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-DM34Launcher-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/DM34Launcher/1.0.1/","downloads":2238,"date_created":"2024-09-18T07:17:00.904768+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"bb84269b-57e4-49b7-ac4e-59e5344df9f8","file_size":10010240},{"name":"DM34Launcher","full_name":"Volksterism-DM34Launcher-1.0.0","description":"Another West German classic","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-DM34Launcher-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/DM34Launcher/1.0.0/","downloads":604,"date_created":"2024-09-14T17:33:30.360752+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"e62d3d73-3794-4a47-bebf-ff49e698a418","file_size":10009876}]},{"name":"Remington870","full_name":"NovaProot-Remington870","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/Remington870/","donation_link":null,"date_created":"2024-09-22T20:36:21.841940+00:00","date_updated":"2024-09-23T19:30:42.594444+00:00","uuid4":"bfccfc64-1b7d-41b3-a4b5-53d7099963e3","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"Remington870","full_name":"NovaProot-Remington870-1.1.0","description":"The classic shotgun in a sleek modern format.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-Remington870-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/Remington870/1.1.0/","downloads":11026,"date_created":"2024-09-23T19:30:41.080605+00:00","website_url":"","is_active":true,"uuid4":"7e0096cf-03a3-4069-89e7-8bc67c60dab0","file_size":13757582},{"name":"Remington870","full_name":"NovaProot-Remington870-1.0.0","description":"The classic shotgun in a sleek modern format.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-Remington870-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/Remington870/1.0.0/","downloads":193,"date_created":"2024-09-22T20:36:27.213812+00:00","website_url":"","is_active":true,"uuid4":"f64c8da3-d472-4da2-93a9-e6cd0fd6c5f1","file_size":13871384}]},{"name":"NDR","full_name":"ultrasnail-NDR","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/NDR/","donation_link":null,"date_created":"2024-09-27T18:53:18.828456+00:00","date_updated":"2024-09-27T18:53:25.827399+00:00","uuid4":"a03a2088-5f8e-482c-8300-2991cf205610","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"NDR","full_name":"ultrasnail-NDR-1.0.0","description":"the NDR a west german prototype rifle chambered for 7.62x39","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-NDR-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/NDR/1.0.0/","downloads":12170,"date_created":"2024-09-27T18:53:24.160223+00:00","website_url":"","is_active":true,"uuid4":"b230d774-df62-40ac-ad3e-39f26bda8184","file_size":29226374}]},{"name":"280_FN_FAL","full_name":"ultrasnail-280_FN_FAL","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/280_FN_FAL/","donation_link":null,"date_created":"2024-09-27T18:52:30.093812+00:00","date_updated":"2024-09-27T18:52:38.026952+00:00","uuid4":"23b0bb8d-495d-4a37-9b73-d74d6f0f1994","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"280_FN_FAL","full_name":"ultrasnail-280_FN_FAL-1.0.0","description":"An early prototype version of the FNFAL chambered for .280 British","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-280_FN_FAL-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/280_FN_FAL/1.0.0/","downloads":11120,"date_created":"2024-09-27T18:52:36.256708+00:00","website_url":"","is_active":true,"uuid4":"d87bed87-e176-4444-a716-3268f7a2632d","file_size":33667976}]},{"name":"ModulWieger940Series","full_name":"Volks-ModulWieger940Series","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/ModulWieger940Series/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-10-21T18:28:02.760426+00:00","date_updated":"2025-08-15T20:51:47.816301+00:00","uuid4":"e39a601a-47fc-41f4-9678-458525f9a360","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"ModulWieger940Series","full_name":"Volks-ModulWieger940Series-1.1.0","description":"The East German almost-AK74 version in 5.56mm Nato AND Modul.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ModulWieger940Series-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volks/ModulWieger940Series/1.1.0/","downloads":5369,"date_created":"2025-08-15T20:51:43.426869+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"1d8b1c34-6e86-436d-9201-1533fa61ec57","file_size":254117704},{"name":"ModulWieger940Series","full_name":"Volks-ModulWieger940Series-1.0.1","description":"The East German almost-AK74 version in 5.56mm Nato AND Modul.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ModulWieger940Series-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volks/ModulWieger940Series/1.0.1/","downloads":11214,"date_created":"2024-10-23T10:24:38.439692+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"9a5b9b1a-6d0e-4812-a8be-af14e511aa06","file_size":254302247},{"name":"ModulWieger940Series","full_name":"Volks-ModulWieger940Series-1.0.0","description":"The East German almost-AK74 version in 5.56mm Nato AND Modul.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ModulWieger940Series-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volks/ModulWieger940Series/1.0.0/","downloads":349,"date_created":"2024-10-21T18:28:15.030288+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"c29f0e51-f4aa-4a5b-9684-327398ac90db","file_size":254297734}]},{"name":"ModulType56Rifle","full_name":"Volksterism-ModulType56Rifle","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/ModulType56Rifle/","donation_link":null,"date_created":"2024-09-01T01:28:16.826362+00:00","date_updated":"2024-10-21T09:06:24.195558+00:00","uuid4":"436c7ee3-1265-4256-a04d-6fc9eab27b2e","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"ModulType56Rifle","full_name":"Volksterism-ModulType56Rifle-1.2.1","description":"Modul version of Black Ops Cold War Type 56 Assault Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-ModulType56Rifle-1.2.1.png","version_number":"1.2.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/ModulType56Rifle/1.2.1/","downloads":13596,"date_created":"2024-10-21T09:06:21.675542+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"d464bdfb-547d-4e4d-84c2-7644807e9a44","file_size":112577227},{"name":"ModulType56Rifle","full_name":"Volksterism-ModulType56Rifle-1.2.0","description":"Modul version of Black Ops Cold War Type 56 Assault Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-ModulType56Rifle-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/ModulType56Rifle/1.2.0/","downloads":1322,"date_created":"2024-09-07T08:05:37.705889+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"5a6047b0-758e-48a6-a879-bac7f9860794","file_size":112577148},{"name":"ModulType56Rifle","full_name":"Volksterism-ModulType56Rifle-1.1.0","description":"Modul version of Black Ops Cold War Type 56 Assault Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-ModulType56Rifle-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/ModulType56Rifle/1.1.0/","downloads":594,"date_created":"2024-09-02T16:54:31.641946+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"56793335-3274-4752-92e8-1c8537c232b7","file_size":109777967},{"name":"ModulType56Rifle","full_name":"Volksterism-ModulType56Rifle-1.0.0","description":"Modul version of Black Ops Cold War Type 56 Assault Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-ModulType56Rifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/ModulType56Rifle/1.0.0/","downloads":712,"date_created":"2024-09-01T01:28:23.613564+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"61177014-093d-43d1-bea9-3298cc462769","file_size":103580651}]},{"name":"CetmeLRifle","full_name":"Volks-CetmeLRifle","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/CetmeLRifle/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-11-22T16:55:30.109039+00:00","date_updated":"2024-11-22T16:55:37.084249+00:00","uuid4":"8afe88fd-5af9-44c0-b08e-23dc7991023f","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"CetmeLRifle","full_name":"Volks-CetmeLRifle-1.0.0","description":"The Spanish returns with a rifle of their own, in 5.56!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-CetmeLRifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0"],"download_url":"https://thunderstore.io/package/download/Volks/CetmeLRifle/1.0.0/","downloads":9950,"date_created":"2024-11-22T16:55:35.398817+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"fa5b4024-77dd-4362-a3a0-74fa7dbf03b0","file_size":49792577}]},{"name":"RPOShmel","full_name":"Volks-RPOShmel","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RPOShmel/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-11-26T07:40:36.931221+00:00","date_updated":"2024-11-26T07:40:42.635692+00:00","uuid4":"39411f96-317d-4a14-ae45-48ab4cff2ded","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RPOShmel","full_name":"Volks-RPOShmel-1.0.0","description":"A disposable war crime dispenser.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RPOShmel-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.0"],"download_url":"https://thunderstore.io/package/download/Volks/RPOShmel/1.0.0/","downloads":11285,"date_created":"2024-11-26T07:40:41.258642+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"6ffcc65e-77f1-4b3d-9462-f32466acb9b7","file_size":32542562}]},{"name":"Type67ChicomGrenade","full_name":"Volksterism-Type67ChicomGrenade","owner":"Volksterism","package_url":"https://thunderstore.io/c/h3vr/p/Volksterism/Type67ChicomGrenade/","donation_link":null,"date_created":"2024-09-20T13:36:16.109047+00:00","date_updated":"2024-09-20T13:36:22.099399+00:00","uuid4":"9bc9f07c-5a3d-40cf-a2e0-96a485365496","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type67ChicomGrenade","full_name":"Volksterism-Type67ChicomGrenade-1.0.0","description":"The trees are speaking again","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volksterism-Type67ChicomGrenade-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volksterism/Type67ChicomGrenade/1.0.0/","downloads":9073,"date_created":"2024-09-20T13:36:21.143469+00:00","website_url":"https://ko-fi.com/volksterism","is_active":true,"uuid4":"cc3cb632-cbc6-4339-828c-c4b60dde16f4","file_size":6967587}]},{"name":"DM51Grenades","full_name":"Volks-DM51Grenades","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/DM51Grenades/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-10-14T16:30:32.246817+00:00","date_updated":"2024-10-14T16:30:39.074699+00:00","uuid4":"72a52918-d381-4d3c-9750-a88c45548531","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"DM51Grenades","full_name":"Volks-DM51Grenades-1.0.0","description":"A pair of West German hand grenades","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-DM51Grenades-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volks/DM51Grenades/1.0.0/","downloads":9678,"date_created":"2024-10-14T16:30:37.762960+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"0e4b43b2-f600-4878-9227-5210e07c3152","file_size":9352699}]},{"name":"AutoOrdnance_M1911A1","full_name":"NovaProot-AutoOrdnance_M1911A1","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/AutoOrdnance_M1911A1/","donation_link":null,"date_created":"2024-12-09T21:43:58.709544+00:00","date_updated":"2024-12-09T21:44:04.233517+00:00","uuid4":"77e8ffde-46b1-4b56-a981-4baa7dde2d23","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"AutoOrdnance_M1911A1","full_name":"NovaProot-AutoOrdnance_M1911A1-1.0.0","description":"English, motherfucker! Do you speak it?!","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-AutoOrdnance_M1911A1-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/AutoOrdnance_M1911A1/1.0.0/","downloads":10948,"date_created":"2024-12-09T21:44:02.941549+00:00","website_url":"","is_active":true,"uuid4":"d430a24e-8984-48b1-b9cd-9b688e1fd84b","file_size":14698669}]},{"name":"Remington1187","full_name":"Volks-Remington1187","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Remington1187/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-12-20T09:39:29.793013+00:00","date_updated":"2024-12-20T09:39:36.570547+00:00","uuid4":"236306db-e778-4c45-9306-63bf0e2dae0e","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Remington1187","full_name":"Volks-Remington1187-1.0.0","description":"Does not come with the haircut","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Remington1187-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Volks/Remington1187/1.0.0/","downloads":10915,"date_created":"2024-12-20T09:39:34.926250+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"d63af24b-6a3d-4390-8b19-1f5624485d9d","file_size":47434813}]},{"name":"PKM_2","full_name":"JerryAr-PKM_2","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/PKM_2/","donation_link":null,"date_created":"2022-10-22T09:41:44.017482+00:00","date_updated":"2025-07-14T13:33:07.543548+00:00","uuid4":"753bc38b-b4dd-4654-a3db-5d71bd2627fd","rating_score":24,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods","Wearables"],"versions":[{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.4.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.4.1.png","version_number":"2.4.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.4.1/","downloads":9602,"date_created":"2025-07-14T13:33:03.001868+00:00","website_url":"","is_active":true,"uuid4":"c4196994-541b-4840-b58e-595a52df1a62","file_size":315591436},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.4.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.4.0.png","version_number":"2.4.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.4.0/","downloads":1083,"date_created":"2025-07-11T17:07:55.720131+00:00","website_url":"","is_active":true,"uuid4":"6b049a44-6d94-4e34-aa87-d43b2ba1bbd9","file_size":315543866},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.3.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.3.0.png","version_number":"2.3.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.3.0/","downloads":968,"date_created":"2025-07-09T16:51:32.809132+00:00","website_url":"","is_active":true,"uuid4":"39d2832a-935b-4178-89c3-ce99174b9e04","file_size":315563577},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.1.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.1.1.png","version_number":"2.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.1.1/","downloads":4440,"date_created":"2025-05-29T01:50:09.247792+00:00","website_url":"","is_active":true,"uuid4":"3a0c6ac9-45e2-4da5-bb8a-8eb337c69c2a","file_size":315787207},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.1.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.1.0.png","version_number":"2.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.1.0/","downloads":254,"date_created":"2025-05-28T19:33:49.158105+00:00","website_url":"","is_active":true,"uuid4":"4b69a0fc-6806-4d9c-995e-febc68785796","file_size":296298157},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.5","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.5.png","version_number":"2.0.5","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.5/","downloads":2063,"date_created":"2025-05-19T11:27:48.428513+00:00","website_url":"","is_active":true,"uuid4":"b95c7017-ea55-44be-9caa-560f09d52614","file_size":280542315},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.4","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.4.png","version_number":"2.0.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.4/","downloads":1764,"date_created":"2025-05-12T16:58:36.692448+00:00","website_url":"","is_active":true,"uuid4":"57400ed0-de6f-426c-a204-bb02b0861ec8","file_size":276871355},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.3","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.3.png","version_number":"2.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.3/","downloads":645,"date_created":"2025-05-11T15:26:08.207442+00:00","website_url":"","is_active":true,"uuid4":"ff734872-12f4-4e09-b764-69b359e41f26","file_size":276859462},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.2.png","version_number":"2.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.2/","downloads":238,"date_created":"2025-05-11T10:05:51.116202+00:00","website_url":"","is_active":true,"uuid4":"ce329727-2795-4bd6-a05b-7bcfb2fc89d3","file_size":276860938},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.1.png","version_number":"2.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.1/","downloads":127,"date_created":"2025-05-11T06:17:54.342147+00:00","website_url":"","is_active":true,"uuid4":"df5c0d7d-467e-4be5-83e6-c8c63c8e64b8","file_size":276860087},{"name":"PKM_2","full_name":"JerryAr-PKM_2-2.0.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/2.0.0/","downloads":62,"date_created":"2025-05-11T05:36:20.757047+00:00","website_url":"","is_active":true,"uuid4":"b0978d06-9b02-474d-a9f0-3b54b05cd771","file_size":276860037},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.9.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.9.0.png","version_number":"1.9.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.9.0/","downloads":376,"date_created":"2025-05-10T21:08:46.368690+00:00","website_url":"","is_active":true,"uuid4":"a308b58b-ae81-46bb-a712-5a1d5d6705bc","file_size":158637980},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.8.3","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.8.3.png","version_number":"1.8.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.8.3/","downloads":9345,"date_created":"2024-12-18T19:12:46.573019+00:00","website_url":"","is_active":true,"uuid4":"8f8341ae-3a42-4f3a-ae8f-62a0171dd52f","file_size":153936855},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.8.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.8.2.png","version_number":"1.8.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.8.2/","downloads":3295,"date_created":"2024-11-24T06:50:25.786364+00:00","website_url":"","is_active":true,"uuid4":"eadcd84e-3c9a-4a4b-b060-879759307f19","file_size":153947826},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.8.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.8.1.png","version_number":"1.8.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.8.1/","downloads":2009,"date_created":"2024-11-15T14:16:14.741117+00:00","website_url":"","is_active":true,"uuid4":"7db38c55-2ea9-48f6-b761-aa88ee0a01d7","file_size":153947219},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.8.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.8.0.png","version_number":"1.8.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.8.0/","downloads":597,"date_created":"2024-11-14T14:31:30.096547+00:00","website_url":"","is_active":true,"uuid4":"31f6daf0-945c-442b-9175-1a03e875ac57","file_size":153946412},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.7.3","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.7.3.png","version_number":"1.7.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.7.3/","downloads":3916,"date_created":"2024-10-25T15:48:47.868659+00:00","website_url":"","is_active":true,"uuid4":"e1c77f66-56a6-4f4f-88d0-7787b1096b19","file_size":153909951},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.7.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.7.2.png","version_number":"1.7.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.7.2/","downloads":1814,"date_created":"2024-10-19T05:10:02.020245+00:00","website_url":"","is_active":true,"uuid4":"b4bab3be-61c6-4f17-80ad-0dbea137135d","file_size":153909733},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.7.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.7.1.png","version_number":"1.7.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.7.1/","downloads":4317,"date_created":"2024-09-03T12:41:56.228131+00:00","website_url":"","is_active":true,"uuid4":"1d0ecf36-68d7-4293-84a8-7355c837881a","file_size":153908195},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.7.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.7.0.png","version_number":"1.7.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.7.0/","downloads":1342,"date_created":"2024-09-01T11:54:02.808453+00:00","website_url":"","is_active":true,"uuid4":"a1de3e86-e464-4ff2-9ca2-be191ae80850","file_size":154024470},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.9","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.9.png","version_number":"1.6.9","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.9/","downloads":5212,"date_created":"2024-06-26T14:37:06.436719+00:00","website_url":"","is_active":true,"uuid4":"c0e78d34-da5d-462e-b93a-284a236f46d9","file_size":138769854},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.8","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.8.png","version_number":"1.6.8","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.8/","downloads":2664,"date_created":"2024-06-07T17:04:11.867687+00:00","website_url":"","is_active":true,"uuid4":"4245eece-5efc-4f18-849a-296e962f363e","file_size":138654730},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.7","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.7.png","version_number":"1.6.7","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.7/","downloads":7463,"date_created":"2024-03-20T11:00:17.338568+00:00","website_url":"","is_active":true,"uuid4":"befa9c0a-508f-4192-80a6-bf2ae804c8bd","file_size":138645845},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.6","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.6.png","version_number":"1.6.6","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.6/","downloads":2396,"date_created":"2024-03-09T21:18:05.370004+00:00","website_url":"","is_active":true,"uuid4":"94e65d91-e82c-450b-bf6b-40a2832b3336","file_size":121503918},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.5","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.5.png","version_number":"1.6.5","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.5/","downloads":489,"date_created":"2024-03-09T16:02:47.538367+00:00","website_url":"","is_active":true,"uuid4":"c7ec2d36-333a-4695-9516-20c5643400d8","file_size":110798806},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.4","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.4.png","version_number":"1.6.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.4/","downloads":2307,"date_created":"2024-03-01T16:20:58.205346+00:00","website_url":"","is_active":true,"uuid4":"3e5069d7-7930-4132-9062-e39b6641ba22","file_size":107618353},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.3","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.3.png","version_number":"1.6.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.3/","downloads":992,"date_created":"2024-02-29T04:34:19.738215+00:00","website_url":"","is_active":true,"uuid4":"11568556-2c97-43df-9237-e6f0a25f1322","file_size":107618606},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.2.png","version_number":"1.6.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.2/","downloads":1781,"date_created":"2024-02-25T02:06:55.070289+00:00","website_url":"","is_active":true,"uuid4":"ab46a1a3-c7cc-41b7-8e9a-4080d555d0d9","file_size":107620145},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.1.png","version_number":"1.6.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.1/","downloads":3027,"date_created":"2024-02-14T08:42:39.912150+00:00","website_url":"","is_active":true,"uuid4":"5bf177eb-0da5-4f69-8b5e-650b7916fb8a","file_size":107644827},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.6.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.6.0.png","version_number":"1.6.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.6.0/","downloads":800,"date_created":"2024-02-13T14:20:37.580077+00:00","website_url":"","is_active":true,"uuid4":"a89a7b45-c03f-4f71-a2f8-da8be94b8ca4","file_size":107626622},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.5.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.5.1.png","version_number":"1.5.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.5.1/","downloads":9404,"date_created":"2023-11-05T08:48:15.485356+00:00","website_url":"","is_active":true,"uuid4":"aace1f5f-24d7-4446-ba80-90c68b8fb278","file_size":107504836},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.5.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.5.0.png","version_number":"1.5.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.5.0/","downloads":2531,"date_created":"2023-10-29T10:12:19.582905+00:00","website_url":"","is_active":true,"uuid4":"814e9a67-bd78-42fb-966b-3995f924bbe4","file_size":107381570},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.4.3","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.4.3.png","version_number":"1.4.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.4.3/","downloads":8051,"date_created":"2023-09-29T22:20:44.475101+00:00","website_url":"","is_active":true,"uuid4":"e9f357a2-4d40-4b1f-af9d-d7e8c420a56e","file_size":101219838},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.4.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.4.2.png","version_number":"1.4.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.4.2/","downloads":962,"date_created":"2023-09-29T07:17:46.020573+00:00","website_url":"","is_active":true,"uuid4":"791a39a5-0a43-43cc-b092-a69467420c5f","file_size":101219575},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.4.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.4.1.png","version_number":"1.4.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.4.1/","downloads":1741,"date_created":"2023-09-23T17:35:11.543419+00:00","website_url":"","is_active":true,"uuid4":"1f1bbaed-4c88-4434-a13e-cf8f2c3dafbb","file_size":101163922},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.4.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.4.0.png","version_number":"1.4.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.4.0/","downloads":2620,"date_created":"2023-09-13T09:46:05.241936+00:00","website_url":"","is_active":true,"uuid4":"9ad17bf3-3b4a-43b7-9ebb-22c13bdb85c0","file_size":100711969},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.3.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.3.1.png","version_number":"1.3.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.3.1/","downloads":4925,"date_created":"2023-07-17T17:36:59.527526+00:00","website_url":"","is_active":true,"uuid4":"a1dd2d20-3269-4b36-af23-d44eb248ff62","file_size":100386779},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.3.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.3.0.png","version_number":"1.3.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.3.0/","downloads":152,"date_created":"2023-07-17T16:46:07.619694+00:00","website_url":"","is_active":true,"uuid4":"55d121b2-6013-42ed-a520-9fd933d799f5","file_size":100386703},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.2.4","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.2.4.png","version_number":"1.2.4","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.2.4/","downloads":3121,"date_created":"2023-07-11T17:37:09.025017+00:00","website_url":"","is_active":true,"uuid4":"83838f75-f2c5-46ad-bbcb-ab292aa4f0f8","file_size":100185298},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.2.2","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.2.2.png","version_number":"1.2.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.2.2/","downloads":8687,"date_created":"2023-03-26T10:24:09.595979+00:00","website_url":"","is_active":true,"uuid4":"ed54130e-cef0-4644-a961-11309cb17cc7","file_size":96863147},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.2.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.2.1.png","version_number":"1.2.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.2.1/","downloads":620,"date_created":"2023-03-25T14:49:54.058510+00:00","website_url":"","is_active":true,"uuid4":"9e55d9af-27c4-46d4-b128-fab3649cf448","file_size":96870887},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.2.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.2.0/","downloads":1288,"date_created":"2023-03-19T19:50:30.219244+00:00","website_url":"","is_active":true,"uuid4":"95254153-7d0d-4aa0-b9fd-e0a9da3a42f7","file_size":96822609},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.1.1","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.1.1/","downloads":1120,"date_created":"2023-03-16T10:18:35.290633+00:00","website_url":"","is_active":true,"uuid4":"b9d5cb68-037a-4491-9ab4-46245c47cfb1","file_size":79062461},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.1.0","description":"Ya da da da da da da","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.1.0/","downloads":168,"date_created":"2023-03-16T07:33:49.745201+00:00","website_url":"","is_active":true,"uuid4":"21748d96-c81d-46ad-9a93-d3895ac5049f","file_size":78311852},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.0.2","description":"Belts Belts Belts","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.3","cityrobo-OpenScripts2-2.0.0","cityrobo-OpenScripts-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.0.2/","downloads":2792,"date_created":"2022-10-23T08:00:09.539594+00:00","website_url":"","is_active":true,"uuid4":"bd861d3d-df59-4eaa-a4c3-de3b9a380dc5","file_size":26100672},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.0.1","description":"Belts Belts Belts","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.3","cityrobo-OpenScripts2-2.0.0","cityrobo-OpenScripts-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.0.1/","downloads":333,"date_created":"2022-10-22T19:44:37.724163+00:00","website_url":"","is_active":true,"uuid4":"6c6cb00a-a1ac-48ac-941c-3b662410349c","file_size":24267241},{"name":"PKM_2","full_name":"JerryAr-PKM_2-1.0.0","description":"Belts Belts Belts","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-PKM_2-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.9.3","cityrobo-OpenScripts2-2.0.0","cityrobo-OpenScripts-1.3.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/PKM_2/1.0.0/","downloads":308,"date_created":"2022-10-22T09:41:44.526993+00:00","website_url":"","is_active":true,"uuid4":"e9a1bb13-a952-4668-a7e2-5c0f30f8ae2d","file_size":13857522}]},{"name":"RKG3AntiTank","full_name":"Volks-RKG3AntiTank","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RKG3AntiTank/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-12-23T16:16:17.056499+00:00","date_updated":"2024-12-23T16:16:20.903006+00:00","uuid4":"aab6dfff-4532-4144-bf6f-1df8d149432c","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RKG3AntiTank","full_name":"Volks-RKG3AntiTank-1.0.0","description":"A modern Russian anti-tank grenade","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RKG3AntiTank-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volks/RKG3AntiTank/1.0.0/","downloads":9788,"date_created":"2024-12-23T16:16:20.446676+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"e7e5df46-fd7a-48b9-9924-757f381a4911","file_size":2115405}]},{"name":"V40MiniGrenade","full_name":"Volks-V40MiniGrenade","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/V40MiniGrenade/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-12-28T16:06:27.861114+00:00","date_updated":"2024-12-28T16:06:32.423299+00:00","uuid4":"2e9a8f2d-7431-4dd6-9cd5-72f610607c6c","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"V40MiniGrenade","full_name":"Volks-V40MiniGrenade-1.0.0","description":"A golf ball sized grenade!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-V40MiniGrenade-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volks/V40MiniGrenade/1.0.0/","downloads":8607,"date_created":"2024-12-28T16:06:31.859425+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"a07262f2-7f86-4b4b-8897-5cfde0b160a7","file_size":5063634}]},{"name":"CZ50Pistol","full_name":"Volks-CZ50Pistol","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/CZ50Pistol/","donation_link":"https://ko-fi.com/volksie","date_created":"2024-12-29T16:55:14.893534+00:00","date_updated":"2024-12-29T16:55:20.278491+00:00","uuid4":"ec148802-48e2-43f3-a62a-4c0f21f8501b","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"CZ50Pistol","full_name":"Volks-CZ50Pistol-1.0.0","description":"Another old Czech classic! In .32 ACP!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-CZ50Pistol-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Volks/CZ50Pistol/1.0.0/","downloads":8185,"date_created":"2024-12-29T16:55:19.050976+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"91e58770-0d51-4b6e-b502-ab708731b32c","file_size":17134076}]},{"name":"MAT49","full_name":"Billiam_J_McGoonigan-MAT49","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/MAT49/","donation_link":null,"date_created":"2025-01-02T01:53:05.034928+00:00","date_updated":"2025-01-19T20:10:43.226124+00:00","uuid4":"06ae4b78-4c76-46fc-8f71-a838ac965722","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"MAT49","full_name":"Billiam_J_McGoonigan-MAT49-1.0.3","description":"France finally gets a halfway decent SMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-MAT49-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/MAT49/1.0.3/","downloads":8675,"date_created":"2025-01-19T20:10:42.119827+00:00","website_url":"","is_active":true,"uuid4":"014422df-e995-4b6f-b2c6-3a4802c68e1e","file_size":12870339},{"name":"MAT49","full_name":"Billiam_J_McGoonigan-MAT49-1.0.2","description":"France finally gets a halfway decent SMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-MAT49-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/MAT49/1.0.2/","downloads":560,"date_created":"2025-01-12T19:50:01.506540+00:00","website_url":"","is_active":true,"uuid4":"3b880fe4-a69d-4b76-b3f5-0190788848ce","file_size":12869803},{"name":"MAT49","full_name":"Billiam_J_McGoonigan-MAT49-1.0.1","description":"France finally gets a halfway decent SMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-MAT49-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/MAT49/1.0.1/","downloads":633,"date_created":"2025-01-02T19:27:10.585514+00:00","website_url":"","is_active":true,"uuid4":"06647781-d235-4dfe-95ad-a4febc017d1e","file_size":12869735},{"name":"MAT49","full_name":"Billiam_J_McGoonigan-MAT49-1.0.0","description":"France finally gets a halfway decent SMG","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-MAT49-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/MAT49/1.0.0/","downloads":192,"date_created":"2025-01-02T01:53:08.922889+00:00","website_url":"","is_active":true,"uuid4":"9669f371-0385-44ee-82a7-ffd55ae7fb54","file_size":12873389}]},{"name":"PSS_Silent_Pistol","full_name":"Billiam_J_McGoonigan-PSS_Silent_Pistol","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/PSS_Silent_Pistol/","donation_link":null,"date_created":"2025-01-02T23:46:10.877480+00:00","date_updated":"2025-01-02T23:46:15.558388+00:00","uuid4":"8db8b33a-52f7-4d7e-8150-81a09b96f1d1","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"PSS_Silent_Pistol","full_name":"Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0","description":"Pocket-sized spy power!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-PSS_Silent_Pistol-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/PSS_Silent_Pistol/1.0.0/","downloads":10141,"date_created":"2025-01-02T23:46:14.643693+00:00","website_url":"","is_active":true,"uuid4":"fc62b885-a1b0-4993-8e78-712cf081fffa","file_size":9653741}]},{"name":"BrowningHiPowerMk3","full_name":"Volks-BrowningHiPowerMk3","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/BrowningHiPowerMk3/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-01-11T17:37:21.438946+00:00","date_updated":"2025-01-11T17:37:27.929098+00:00","uuid4":"7e13fa80-1fde-4388-a5e2-5260adcb0356","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BrowningHiPowerMk3","full_name":"Volks-BrowningHiPowerMk3-1.0.0","description":"A slightly more modernized version of the venerable Hi Power Mk2!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-BrowningHiPowerMk3-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Volks/BrowningHiPowerMk3/1.0.0/","downloads":8604,"date_created":"2025-01-11T17:37:26.424941+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"bdf7aa08-05ee-4814-bff7-4b82a2ce4233","file_size":21178337}]},{"name":"NRS2_ScoutFiringKnife","full_name":"Billiam_J_McGoonigan-NRS2_ScoutFiringKnife","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/NRS2_ScoutFiringKnife/","donation_link":null,"date_created":"2025-01-18T12:31:28.303358+00:00","date_updated":"2025-01-18T12:31:34.268353+00:00","uuid4":"d37534ab-7951-4d7b-a898-6ff9dd8c9f74","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"NRS2_ScoutFiringKnife","full_name":"Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0","description":"Soviet Ballistic Survival Knife","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-NRS2_ScoutFiringKnife-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/NRS2_ScoutFiringKnife/1.0.0/","downloads":9765,"date_created":"2025-01-18T12:31:33.134514+00:00","website_url":"","is_active":true,"uuid4":"f7c59295-cd8e-4efe-84cc-736f62e3dbd3","file_size":12118643}]},{"name":"VZ25SMG","full_name":"Volks-VZ25SMG","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/VZ25SMG/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-01-18T13:49:22.803522+00:00","date_updated":"2025-01-18T13:49:28.210386+00:00","uuid4":"b63ca8f9-13d0-442e-bfb9-4220abb21daa","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"VZ25SMG","full_name":"Volks-VZ25SMG-1.0.0","description":"An almost forgotten Czech submachinegun","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-VZ25SMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volks/VZ25SMG/1.0.0/","downloads":9546,"date_created":"2025-01-18T13:49:27.160861+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"92b973ad-1187-4223-9b13-98b75d22392a","file_size":22304211}]},{"name":"Pancerovka27ALauncher","full_name":"Volks-Pancerovka27ALauncher","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Pancerovka27ALauncher/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-01-18T13:53:37.063567+00:00","date_updated":"2025-01-18T13:53:42.348220+00:00","uuid4":"8960de83-be86-4b44-b955-215ac5345dac","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Pancerovka27ALauncher","full_name":"Volks-Pancerovka27ALauncher-1.0.0","description":"A short lived Czech rocket launcher!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Pancerovka27ALauncher-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.10.0"],"download_url":"https://thunderstore.io/package/download/Volks/Pancerovka27ALauncher/1.0.0/","downloads":9540,"date_created":"2025-01-18T13:53:41.134613+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"5ea9183d-178c-40b7-b44b-5b640daaadb3","file_size":20013390}]},{"name":"Terminator_AMT_Hardballer","full_name":"Okkim-Terminator_AMT_Hardballer","owner":"Okkim","package_url":"https://thunderstore.io/c/h3vr/p/Okkim/Terminator_AMT_Hardballer/","donation_link":"https://ko-fi.com/okkim","date_created":"2025-01-18T15:03:55.701629+00:00","date_updated":"2025-01-18T15:04:02.037797+00:00","uuid4":"327fee5e-32b9-4036-992d-f6793a37d5ea","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons"],"versions":[{"name":"Terminator_AMT_Hardballer","full_name":"Okkim-Terminator_AMT_Hardballer-1.0.0","description":"\\".45 longslide, with laser sighting...\\"","icon":"https://gcdn.thunderstore.io/live/repository/icons/Okkim-Terminator_AMT_Hardballer-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.0.0","WFIOST-H3VRUtilities-8.10.0","Okkim-Bag_Of_Scripts-1.9.0"],"download_url":"https://thunderstore.io/package/download/Okkim/Terminator_AMT_Hardballer/1.0.0/","downloads":12932,"date_created":"2025-01-18T15:04:00.982790+00:00","website_url":"","is_active":true,"uuid4":"d72ab71a-e0f4-4173-a9bf-6f4179015484","file_size":12493241}]},{"name":"NSV","full_name":"JerryAr-NSV","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/NSV/","donation_link":null,"date_created":"2025-01-19T00:13:26.493542+00:00","date_updated":"2025-03-16T18:02:40.140634+00:00","uuid4":"cc3ca053-6dc9-4720-bf9c-24ae5ee378df","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"NSV","full_name":"JerryAr-NSV-1.2.0","description":"12.7x108","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-NSV-1.2.0.png","version_number":"1.2.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/NSV/1.2.0/","downloads":11355,"date_created":"2025-03-16T18:02:38.432035+00:00","website_url":"","is_active":true,"uuid4":"c8be7b8a-daad-4b28-a8a7-8378509fcf72","file_size":61407306},{"name":"NSV","full_name":"JerryAr-NSV-1.1.0","description":"12.7x108","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-NSV-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/NSV/1.1.0/","downloads":513,"date_created":"2025-03-15T15:36:05.838811+00:00","website_url":"","is_active":true,"uuid4":"b19f34b0-74f0-434c-980e-20a93180575d","file_size":49763792},{"name":"NSV","full_name":"JerryAr-NSV-1.0.0","description":"12.7x108","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-NSV-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.0.2"],"download_url":"https://thunderstore.io/package/download/JerryAr/NSV/1.0.0/","downloads":3764,"date_created":"2025-01-19T00:13:31.175323+00:00","website_url":"","is_active":true,"uuid4":"b29f9af6-8aee-4ffd-becd-7bafb0e5a0a2","file_size":49576581}]},{"name":"SWM76SMG","full_name":"Volks-SWM76SMG","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/SWM76SMG/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-01-21T03:08:34.424579+00:00","date_updated":"2025-01-21T03:08:39.942678+00:00","uuid4":"fd812a58-174f-4cae-bf55-5261a52cc89f","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SWM76SMG","full_name":"Volks-SWM76SMG-1.0.0","description":"When you want the Swedish K but they won't give you and gotta make your own","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-SWM76SMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Volks/SWM76SMG/1.0.0/","downloads":9811,"date_created":"2025-01-21T03:08:38.707637+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"b96c2ab3-fc21-4ed5-b5d4-aaf83c6e1302","file_size":27343052}]},{"name":"Type86sBullpupRifle","full_name":"Volks-Type86sBullpupRifle","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Type86sBullpupRifle/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-01-22T17:19:31.979654+00:00","date_updated":"2025-01-22T17:19:41.090960+00:00","uuid4":"ed329986-3930-4114-9c62-8a007027d847","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type86sBullpupRifle","full_name":"Volks-Type86sBullpupRifle-1.0.0","description":"China's very own AK but in a compact bullpup action! No 30 rounders please!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Type86sBullpupRifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/Volks/Type86sBullpupRifle/1.0.0/","downloads":10404,"date_created":"2025-01-22T17:19:38.840068+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"f1cb6a39-a25c-4cfe-9fed-0deb338db903","file_size":39660314}]},{"name":"SterlingMk4SMG","full_name":"Volks-SterlingMk4SMG","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/SterlingMk4SMG/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-02-02T15:02:48.611968+00:00","date_updated":"2025-02-02T15:02:56.629970+00:00","uuid4":"5f2677bb-6783-403a-ad71-87f6973a205d","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SterlingMk4SMG","full_name":"Volks-SterlingMk4SMG-1.0.0","description":"Britain actually made a proper submachine gun for once that's not some tools!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-SterlingMk4SMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.2"],"download_url":"https://thunderstore.io/package/download/Volks/SterlingMk4SMG/1.0.0/","downloads":8747,"date_created":"2025-02-02T15:02:54.906809+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"09e39342-f4ca-4c06-8fa7-bfe7f3fe5401","file_size":12689658}]},{"name":"M14K","full_name":"ultrasnail-M14K","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/M14K/","donation_link":null,"date_created":"2025-03-06T18:41:36.548158+00:00","date_updated":"2025-03-06T18:41:42.853994+00:00","uuid4":"d5bc3905-fa66-4abb-afe7-87e90b1bda45","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"M14K","full_name":"ultrasnail-M14K-1.0.0","description":"The M14K an improved and shortend version of the M14 rifle","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-M14K-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/M14K/1.0.0/","downloads":8547,"date_created":"2025-03-06T18:41:41.424099+00:00","website_url":"","is_active":true,"uuid4":"cd76cdc8-cb50-4804-aa1d-7ed6dc2992c6","file_size":19720412}]},{"name":"Masterkey","full_name":"ShermanJumbo-Masterkey","owner":"ShermanJumbo","package_url":"https://thunderstore.io/c/h3vr/p/ShermanJumbo/Masterkey/","donation_link":null,"date_created":"2025-04-06T18:15:08.441600+00:00","date_updated":"2025-04-14T21:34:47.118079+00:00","uuid4":"948dcf59-9202-4ef4-8e49-6841f1982fd8","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons"],"versions":[{"name":"Masterkey","full_name":"ShermanJumbo-Masterkey-1.1.0","description":"An attachable pump-action shotgun for AR-15-pattern rifles with an M203 mount. Also includes M203-to-Picatinny and Picatinny-to-M203 adapters!","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-Masterkey-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/Masterkey/1.1.0/","downloads":11495,"date_created":"2025-04-14T21:34:45.551243+00:00","website_url":"https://ko-fi.com/shermanjumbo","is_active":true,"uuid4":"faa7dd07-f526-452f-a2c7-a438d861f234","file_size":41029951},{"name":"Masterkey","full_name":"ShermanJumbo-Masterkey-1.0.0","description":"An attachable pump-action shotgun for AR-15-pattern rifles with an M203 mount. Also includes an M203-to-Picatinny adapter!","icon":"https://gcdn.thunderstore.io/live/repository/icons/ShermanJumbo-Masterkey-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ShermanJumbo/Masterkey/1.0.0/","downloads":736,"date_created":"2025-04-06T18:15:13.357640+00:00","website_url":"https://ko-fi.com/shermanjumbo","is_active":true,"uuid4":"26d85566-4962-4f89-aa87-6380116bed97","file_size":28478759}]},{"name":"SawedRPD","full_name":"Volks-SawedRPD","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/SawedRPD/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-07T10:50:01.676627+00:00","date_updated":"2025-04-07T10:50:07.646965+00:00","uuid4":"e55447c1-dc6e-4241-bd7b-29db76c51c5e","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SawedRPD","full_name":"Volks-SawedRPD-1.0.0","description":"Blue jeans and shortened RPD walked into a jungle...","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-SawedRPD-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/SawedRPD/1.0.0/","downloads":8088,"date_created":"2025-04-07T10:50:06.496271+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"ac3a9ce2-c5b8-486e-8282-2cf86ca8502d","file_size":14953009}]},{"name":"AAIQSPR_Revolver","full_name":"Volks-AAIQSPR_Revolver","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/AAIQSPR_Revolver/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-25T18:39:37.006581+00:00","date_updated":"2025-04-25T18:39:44.345862+00:00","uuid4":"3e0e6f87-dfad-4f64-9fb8-d1a3466e7ff1","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"AAIQSPR_Revolver","full_name":"Volks-AAIQSPR_Revolver-1.0.0","description":"Tunnel rats' secret weapon","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-AAIQSPR_Revolver-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/AAIQSPR_Revolver/1.0.0/","downloads":8159,"date_created":"2025-04-25T18:39:42.528570+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"646d697e-64a6-4d9c-a5da-2afbb29a1691","file_size":49985625}]},{"name":"Winchester_Model_88","full_name":"Billiam_J_McGoonigan-Winchester_Model_88","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Winchester_Model_88/","donation_link":null,"date_created":"2025-04-26T17:51:33.559547+00:00","date_updated":"2025-04-27T20:09:33.219328+00:00","uuid4":"66692f53-9bcd-4812-953b-8e9e72676e76","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Winchester_Model_88","full_name":"Billiam_J_McGoonigan-Winchester_Model_88-1.0.1","description":"Classic powstwar lever action goodness!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Winchester_Model_88-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Winchester_Model_88/1.0.1/","downloads":7997,"date_created":"2025-04-27T20:09:32.228654+00:00","website_url":"","is_active":true,"uuid4":"4bcf3ccb-8ac8-4ae4-9b0d-6b7d05af7035","file_size":11254918},{"name":"Winchester_Model_88","full_name":"Billiam_J_McGoonigan-Winchester_Model_88-1.0.0","description":"Classic powstwar lever action goodness!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Winchester_Model_88-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Winchester_Model_88/1.0.0/","downloads":189,"date_created":"2025-04-26T17:51:38.442200+00:00","website_url":"","is_active":true,"uuid4":"715ec42c-8a3a-496f-8c2a-f269f9c26790","file_size":11253590}]},{"name":"Snake_Charmer","full_name":"Billiam_J_McGoonigan-Snake_Charmer","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Snake_Charmer/","donation_link":null,"date_created":"2025-04-26T17:50:56.670943+00:00","date_updated":"2025-04-26T17:51:03.234120+00:00","uuid4":"9504b9fc-140e-4c81-a5d3-89e3b0df49ab","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Snake_Charmer","full_name":"Billiam_J_McGoonigan-Snake_Charmer-1.0.0","description":"No, its not a euphamism.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Snake_Charmer-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Snake_Charmer/1.0.0/","downloads":7900,"date_created":"2025-04-26T17:51:01.231075+00:00","website_url":"","is_active":true,"uuid4":"3b047426-6d59-48a2-8c05-2ccf249f375a","file_size":9630883}]},{"name":"RP46_LMG","full_name":"Volks-RP46_LMG","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RP46_LMG/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-28T15:40:53.183760+00:00","date_updated":"2025-04-28T15:41:00.759814+00:00","uuid4":"94ec348c-adcb-4724-ae3e-6cd7c61c6865","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RP46_LMG","full_name":"Volks-RP46_LMG-1.0.0","description":"An upgraded DP28!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RP46_LMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/RP46_LMG/1.0.0/","downloads":8182,"date_created":"2025-04-28T15:40:59.024513+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"aa75c4f9-5b16-4119-9896-1d3a05fcd884","file_size":39353078}]},{"name":"Type56Suppressed","full_name":"Volks-Type56Suppressed","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Type56Suppressed/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-29T12:27:27.464147+00:00","date_updated":"2025-04-29T12:27:34.990901+00:00","uuid4":"cec6c829-bbc1-4ff6-a9fe-fca090b71671","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Type56Suppressed","full_name":"Volks-Type56Suppressed-1.0.0","description":"When you want deniable plausability in an AK form...","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Type56Suppressed-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/Type56Suppressed/1.0.0/","downloads":8525,"date_created":"2025-04-29T12:27:33.370192+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"b2c34727-46c0-489a-bb16-f946e5396dff","file_size":28355567}]},{"name":"Mark4Mod0","full_name":"Volks-Mark4Mod0","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Mark4Mod0/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-29T12:26:38.703567+00:00","date_updated":"2025-05-10T13:38:56.541258+00:00","uuid4":"13f4d18b-c9c5-4f0b-8998-b9ebb13818fa","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Mark4Mod0","full_name":"Volks-Mark4Mod0-1.0.1","description":"When SOG needs silence","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Mark4Mod0-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/Mark4Mod0/1.0.1/","downloads":9189,"date_created":"2025-05-10T13:38:54.915999+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"eb790f49-d59d-4619-8ddf-51cfd1c48835","file_size":49233222},{"name":"Mark4Mod0","full_name":"Volks-Mark4Mod0-1.0.0","description":"When SOG needs silence","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Mark4Mod0-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/Mark4Mod0/1.0.0/","downloads":1325,"date_created":"2025-04-29T12:26:44.201820+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"ef83a03a-c973-450c-9fa7-d29e4e4ea565","file_size":49157261}]},{"name":"FRF1_FRF2","full_name":"Volks-FRF1_FRF2","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/FRF1_FRF2/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-05-04T18:11:31.559001+00:00","date_updated":"2025-05-04T18:11:39.621799+00:00","uuid4":"66fb271e-5038-45b8-92d6-a21965a612cc","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"FRF1_FRF2","full_name":"Volks-FRF1_FRF2-1.0.0","description":"FR F1 and FR F2 sniper rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-FRF1_FRF2-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/FRF1_FRF2/1.0.0/","downloads":6927,"date_created":"2025-05-04T18:11:37.722745+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"24c797f8-98ff-4d46-8d93-720352c10016","file_size":50854411}]},{"name":"SidewinderSMG","full_name":"NovaProot-SidewinderSMG","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/SidewinderSMG/","donation_link":null,"date_created":"2025-05-04T19:59:44.583568+00:00","date_updated":"2025-05-04T19:59:52.331880+00:00","uuid4":"fe941424-86c6-473c-a038-4dfeb9641adf","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"SidewinderSMG","full_name":"NovaProot-SidewinderSMG-1.0.0","description":"You spin me right round baby right round","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-SidewinderSMG-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/SidewinderSMG/1.0.0/","downloads":7664,"date_created":"2025-05-04T19:59:51.072198+00:00","website_url":"","is_active":true,"uuid4":"ecd78810-babd-4b8c-a2bf-dace72422bf9","file_size":9640010}]},{"name":"TKB0145","full_name":"Volks-TKB0145","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/TKB0145/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-05-14T05:38:11.539069+00:00","date_updated":"2025-05-14T05:38:18.109315+00:00","uuid4":"da77840f-9eaf-4dcc-b5ab-8c69815c5b9d","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"TKB0145","full_name":"Volks-TKB0145-1.0.0","description":"An unknown bullpup sniper rifle from the Soviet archives... in 12.7mm","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-TKB0145-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3","Meat_banono-Meats_ASh12-1.0.5"],"download_url":"https://thunderstore.io/package/download/Volks/TKB0145/1.0.0/","downloads":7693,"date_created":"2025-05-14T05:38:16.567575+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"62b2e792-8866-4b1b-8d5d-e2e2b533a294","file_size":34002926}]},{"name":"BrowningBLR","full_name":"Volks-BrowningBLR","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/BrowningBLR/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-05-19T06:31:46.658005+00:00","date_updated":"2025-05-19T06:31:53.656938+00:00","uuid4":"49bdc22d-1e92-4bf8-b6eb-b29dd417fe2f","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BrowningBLR","full_name":"Volks-BrowningBLR-1.0.0","description":"Browning's Mag fed lever action rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-BrowningBLR-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/BrowningBLR/1.0.0/","downloads":7731,"date_created":"2025-05-19T06:31:52.145604+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"20cb23e0-55c2-40f9-afb4-87b358179d65","file_size":30395612}]},{"name":"HK33","full_name":"ultrasnail-HK33","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/HK33/","donation_link":null,"date_created":"2025-05-23T04:19:00.603842+00:00","date_updated":"2025-07-02T12:17:58.194441+00:00","uuid4":"b065c739-9ed7-4bbb-b7b5-84a92fdd8343","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"HK33","full_name":"ultrasnail-HK33-1.1.0","description":"The HK33 hk's roller delayed assault rifle chambered for 556","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-HK33-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1","ultrasnail-HK33_Magazines-1.0.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/HK33/1.1.0/","downloads":6842,"date_created":"2025-07-02T12:17:56.007448+00:00","website_url":"","is_active":true,"uuid4":"68a74c29-3484-482c-afd1-a7198a3d2425","file_size":105520643},{"name":"HK33","full_name":"ultrasnail-HK33-1.0.2","description":"The HK33 hk's roller delayed assault rifle chambered for 556","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-HK33-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1","ultrasnail-HK33_Magazines-1.0.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/HK33/1.0.2/","downloads":1643,"date_created":"2025-06-20T17:17:46.290983+00:00","website_url":"","is_active":true,"uuid4":"56ac265d-d1d2-4bbf-8cc1-adecd33227b5","file_size":50531420},{"name":"HK33","full_name":"ultrasnail-HK33-1.0.1","description":"The HK33 hk's roller delayed assualt rifle chambered for 556","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-HK33-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/ultrasnail/HK33/1.0.1/","downloads":2057,"date_created":"2025-06-05T19:14:21.999721+00:00","website_url":"","is_active":true,"uuid4":"edda3a4c-37ca-4e96-b596-a7441fe3df26","file_size":51767573},{"name":"HK33","full_name":"ultrasnail-HK33-1.0.0","description":"The HK33 hk's roller delayed assualt rifle chambered for 556","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-HK33-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1"],"download_url":"https://thunderstore.io/package/download/ultrasnail/HK33/1.0.0/","downloads":1411,"date_created":"2025-05-23T04:19:05.977833+00:00","website_url":"","is_active":true,"uuid4":"44897095-e661-4720-a423-d5fbc30edf95","file_size":62867423}]},{"name":"RPG26","full_name":"JerryAr-RPG26","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/RPG26/","donation_link":null,"date_created":"2025-05-29T01:51:02.523605+00:00","date_updated":"2025-11-01T09:46:53.751984+00:00","uuid4":"35388073-7e8e-4320-9ef2-faae7845ac2b","rating_score":6,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Ammo","Mods"],"versions":[{"name":"RPG26","full_name":"JerryAr-RPG26-1.0.3","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-RPG26-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/RPG26/1.0.3/","downloads":4084,"date_created":"2025-11-01T09:46:51.864783+00:00","website_url":"","is_active":true,"uuid4":"b7f9bea2-81e8-4f46-bf94-f7c7288fdf5e","file_size":69954718},{"name":"RPG26","full_name":"JerryAr-RPG26-1.0.2","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-RPG26-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/RPG26/1.0.2/","downloads":6538,"date_created":"2025-05-30T17:32:07.007580+00:00","website_url":"","is_active":true,"uuid4":"8842a13f-5c6e-491e-8e3e-2c0c754d49be","file_size":69950759},{"name":"RPG26","full_name":"JerryAr-RPG26-1.0.1","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-RPG26-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/RPG26/1.0.1/","downloads":121,"date_created":"2025-05-30T13:35:56.980957+00:00","website_url":"","is_active":true,"uuid4":"27681c8f-7cbe-4034-b34e-107a9e915bbd","file_size":69951741},{"name":"RPG26","full_name":"JerryAr-RPG26-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-RPG26-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.1.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/RPG26/1.0.0/","downloads":419,"date_created":"2025-05-29T01:51:09.594088+00:00","website_url":"","is_active":true,"uuid4":"8f2a0388-85ec-4c7b-bacc-2369c281b441","file_size":95912970}]},{"name":"Modul_HK_SL7","full_name":"MommyMercy-Modul_HK_SL7","owner":"MommyMercy","package_url":"https://thunderstore.io/c/h3vr/p/MommyMercy/Modul_HK_SL7/","donation_link":"https://ko-fi.com/dannydebes","date_created":"2025-06-02T01:27:44.550775+00:00","date_updated":"2025-06-02T01:27:53.577845+00:00","uuid4":"4f3cf32b-cc3d-4f53-88da-92a431945fb5","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Modul_HK_SL7","full_name":"MommyMercy-Modul_HK_SL7-0.1.0","description":"An attempt at bringing roller delayed excellence to the civilian market!","icon":"https://gcdn.thunderstore.io/live/repository/icons/MommyMercy-Modul_HK_SL7-0.1.0.png","version_number":"0.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-ModularWorkshop-1.0.0","Meat_banono-Meats_ModulAR2_BufferStocks-1.0.2","Meat_banono-Meats_ModulAR2_Grips-1.0.2"],"download_url":"https://thunderstore.io/package/download/MommyMercy/Modul_HK_SL7/0.1.0/","downloads":6824,"date_created":"2025-06-02T01:27:51.695798+00:00","website_url":"","is_active":true,"uuid4":"5906c5d9-20d9-418d-bb55-47f0de03296a","file_size":94246250}]},{"name":"M202_Flash","full_name":"JerryAr-M202_Flash","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/M202_Flash/","donation_link":null,"date_created":"2025-06-02T10:49:53.992471+00:00","date_updated":"2025-06-02T10:50:02.065977+00:00","uuid4":"8a974d3c-3ff8-4674-be24-ff6aa3a055a1","rating_score":8,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"M202_Flash","full_name":"JerryAr-M202_Flash-1.0.0","description":"","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-M202_Flash-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.6.1","WFIOST-H3VRUtilities-8.11.1"],"download_url":"https://thunderstore.io/package/download/JerryAr/M202_Flash/1.0.0/","downloads":8558,"date_created":"2025-06-02T10:50:00.295267+00:00","website_url":"","is_active":true,"uuid4":"980081b4-78f8-4b4d-8ac3-4a6769308db9","file_size":48371026}]},{"name":"NorincoCQ","full_name":"NovaProot-NorincoCQ","owner":"NovaProot","package_url":"https://thunderstore.io/c/h3vr/p/NovaProot/NorincoCQ/","donation_link":null,"date_created":"2025-06-10T01:53:34.021823+00:00","date_updated":"2025-06-10T01:53:39.416644+00:00","uuid4":"31923023-5f4a-4009-a29f-6032b0c38292","rating_score":0,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"NorincoCQ","full_name":"NovaProot-NorincoCQ-1.0.0","description":"An unlicensed Chinese clone of the M16 used since the 1980s.","icon":"https://gcdn.thunderstore.io/live/repository/icons/NovaProot-NorincoCQ-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/NovaProot/NorincoCQ/1.0.0/","downloads":5943,"date_created":"2025-06-10T01:53:38.027474+00:00","website_url":"","is_active":true,"uuid4":"65affeef-2def-46a0-950f-2c75bde7781c","file_size":8805972}]},{"name":"BullpupG3Rifle","full_name":"Volks-BullpupG3Rifle","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/BullpupG3Rifle/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-06-14T14:12:18.635345+00:00","date_updated":"2025-06-14T14:12:24.488927+00:00","uuid4":"fcc25c23-ca48-42f3-8e7a-a240767c0ddd","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BullpupG3Rifle","full_name":"Volks-BullpupG3Rifle-1.0.0","description":"G3 in bullpup format","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-BullpupG3Rifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/BullpupG3Rifle/1.0.0/","downloads":4979,"date_created":"2025-06-14T14:12:23.225249+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"2026de16-99dc-4bb8-81f9-c18b86b9fa93","file_size":27554469}]},{"name":"Armalite_AR15_Prototype","full_name":"ultrasnail-Armalite_AR15_Prototype","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/Armalite_AR15_Prototype/","donation_link":null,"date_created":"2024-07-18T19:04:12.475385+00:00","date_updated":"2025-06-21T18:37:55.075683+00:00","uuid4":"ce1e51b7-65fe-4b81-9411-48a34c4247c4","rating_score":5,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"Armalite_AR15_Prototype","full_name":"ultrasnail-Armalite_AR15_Prototype-1.1.1","description":"A version of the AR-15 prototype by Armalite","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-Armalite_AR15_Prototype-1.1.1.png","version_number":"1.1.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/Armalite_AR15_Prototype/1.1.1/","downloads":6958,"date_created":"2025-06-21T18:37:53.673651+00:00","website_url":"","is_active":true,"uuid4":"609400d4-d3d3-45c8-9e93-452c000da739","file_size":54477110},{"name":"Armalite_AR15_Prototype","full_name":"ultrasnail-Armalite_AR15_Prototype-1.1.0","description":"A version of the AR-15 prototype by Armalite","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-Armalite_AR15_Prototype-1.1.0.png","version_number":"1.1.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/Armalite_AR15_Prototype/1.1.0/","downloads":290,"date_created":"2025-06-20T17:21:04.425647+00:00","website_url":"","is_active":true,"uuid4":"c7decaab-ca82-45d9-b820-6d2a038dfe65","file_size":54477398},{"name":"Armalite_AR15_Prototype","full_name":"ultrasnail-Armalite_AR15_Prototype-1.0.1","description":"A version of the Armalite AR-15 prototype","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-Armalite_AR15_Prototype-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/Armalite_AR15_Prototype/1.0.1/","downloads":2216,"date_created":"2024-07-18T19:14:19.377019+00:00","website_url":"","is_active":true,"uuid4":"d8956ac7-6df2-4221-95f6-3d028f8bd0e8","file_size":37618987},{"name":"Armalite_AR15_Prototype","full_name":"ultrasnail-Armalite_AR15_Prototype-1.0.0","description":"A version of the Armalite AR-15 prototype","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-Armalite_AR15_Prototype-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/Armalite_AR15_Prototype/1.0.0/","downloads":138,"date_created":"2024-07-18T19:04:19.017672+00:00","website_url":"","is_active":true,"uuid4":"cf8e8a4f-fd55-4141-8205-9a0cdea7f5ea","file_size":37619211}]},{"name":"La_France_M16K","full_name":"ultrasnail-La_France_M16K","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/La_France_M16K/","donation_link":null,"date_created":"2025-06-20T17:44:32.764304+00:00","date_updated":"2025-06-20T17:44:39.068504+00:00","uuid4":"e3ae70e3-a135-4aab-a05d-f61fb50ed3fa","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"La_France_M16K","full_name":"ultrasnail-La_France_M16K-1.0.0","description":"the La France M16K a compact ar15","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-La_France_M16K-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","ultrasnail-AR15_Accessory_pack-1.0.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/La_France_M16K/1.0.0/","downloads":5955,"date_created":"2025-06-20T17:44:37.665128+00:00","website_url":"","is_active":true,"uuid4":"2f9c6567-4716-466f-ae3a-5d858cd5ed8b","file_size":48895205}]},{"name":"AR15_Accessory_pack","full_name":"ultrasnail-AR15_Accessory_pack","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/AR15_Accessory_pack/","donation_link":null,"date_created":"2025-06-20T17:24:26.644611+00:00","date_updated":"2025-06-20T17:24:32.859951+00:00","uuid4":"00bcafd4-cd62-4260-95a7-6bb039cc40c1","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Mods"],"versions":[{"name":"AR15_Accessory_pack","full_name":"ultrasnail-AR15_Accessory_pack-1.0.0","description":"A collection of AR15 accessories and attachments","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-AR15_Accessory_pack-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/ultrasnail/AR15_Accessory_pack/1.0.0/","downloads":11080,"date_created":"2025-06-20T17:24:31.679600+00:00","website_url":"","is_active":true,"uuid4":"d202deb3-ad63-4d87-9e09-830803f37af9","file_size":46267323}]},{"name":"Ashes_Weaver_QwikPoint","full_name":"fsce-Ashes_Weaver_QwikPoint","owner":"fsce","package_url":"https://thunderstore.io/c/h3vr/p/fsce/Ashes_Weaver_QwikPoint/","donation_link":"https://ko-fi.com/fsce1","date_created":"2022-03-22T19:25:32.315582+00:00","date_updated":"2022-03-22T19:25:32.464143+00:00","uuid4":"b89af023-c351-430d-acb5-8a55dd9cc2ad","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":[],"versions":[{"name":"Ashes_Weaver_QwikPoint","full_name":"fsce-Ashes_Weaver_QwikPoint-1.0.0","description":"Experience Reflex history in VR! Weaver's Qwik-Point comes into H3!","icon":"https://gcdn.thunderstore.io/live/repository/icons/fsce-Ashes_Weaver_QwikPoint-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.2.0"],"download_url":"https://thunderstore.io/package/download/fsce/Ashes_Weaver_QwikPoint/1.0.0/","downloads":11196,"date_created":"2022-03-22T19:25:32.464143+00:00","website_url":"","is_active":true,"uuid4":"31d27d20-0dc2-4c4d-b6ec-af35da48394f","file_size":12428823}]},{"name":"ANPVS4","full_name":"Volks-ANPVS4","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/ANPVS4/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-05-30T12:44:32.973412+00:00","date_updated":"2025-05-30T12:44:38.757948+00:00","uuid4":"34bf4d18-3ebf-4200-bf85-55ff9867ee10","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items"],"versions":[{"name":"ANPVS4","full_name":"Volks-ANPVS4-1.0.0","description":"Classic NV sights!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ANPVS4-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volks/ANPVS4/1.0.0/","downloads":7122,"date_created":"2025-05-30T12:44:37.547878+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"2e6895e0-5c67-4637-813e-3dda15c572e6","file_size":17055831}]},{"name":"nydar_model_47","full_name":"superpug-nydar_model_47","owner":"superpug","package_url":"https://thunderstore.io/c/h3vr/p/superpug/nydar_model_47/","donation_link":"https://ko-fi.com/superpug","date_created":"2021-09-20T18:15:38.465966+00:00","date_updated":"2022-02-19T16:54:36.024111+00:00","uuid4":"2785f7b7-953f-48db-a4e6-05abefd3fd0b","rating_score":7,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"nydar_model_47","full_name":"superpug-nydar_model_47-2.0.2","description":"adds the nydar model 47 reflex sight to h3vr","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-nydar_model_47-2.0.2.png","version_number":"2.0.2","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/superpug/nydar_model_47/2.0.2/","downloads":8559,"date_created":"2022-02-19T16:54:36.024111+00:00","website_url":"","is_active":true,"uuid4":"afee1d5e-f5af-402c-9673-5dafe4e2c1da","file_size":2299446},{"name":"nydar_model_47","full_name":"superpug-nydar_model_47-2.0.1","description":"adds the nydar model 47 reflex sight to h3vr","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-nydar_model_47-2.0.1.png","version_number":"2.0.1","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/superpug/nydar_model_47/2.0.1/","downloads":1186,"date_created":"2022-01-03T10:55:38.554885+00:00","website_url":"","is_active":true,"uuid4":"22df5130-41b3-4421-82cf-53731c66a250","file_size":2299612},{"name":"nydar_model_47","full_name":"superpug-nydar_model_47-2.0.0","description":"adds the nydar model 47 reflex sight to h3vr","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-nydar_model_47-2.0.0.png","version_number":"2.0.0","dependencies":["devyndamonster-OtherLoader-1.0.0"],"download_url":"https://thunderstore.io/package/download/superpug/nydar_model_47/2.0.0/","downloads":177,"date_created":"2022-01-03T10:53:43.474511+00:00","website_url":"","is_active":true,"uuid4":"059a8c3b-704e-43dd-94a5-91fe956c58e1","file_size":2299615},{"name":"nydar_model_47","full_name":"superpug-nydar_model_47-1.0.1","description":"adds the nydar model h4 reflex sight to h3vr","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-nydar_model_47-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/superpug/nydar_model_47/1.0.1/","downloads":1263,"date_created":"2021-11-14T17:37:06.129300+00:00","website_url":"","is_active":true,"uuid4":"223a00a1-5829-41ce-bdfe-8c8e96498514","file_size":915879},{"name":"nydar_model_47","full_name":"superpug-nydar_model_47-1.0.0","description":"adds the nydar model h4 reflex sight to h3vr","icon":"https://gcdn.thunderstore.io/live/repository/icons/superpug-nydar_model_47-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-0.3.0"],"download_url":"https://thunderstore.io/package/download/superpug/nydar_model_47/1.0.0/","downloads":1257,"date_created":"2021-09-20T18:16:23.324183+00:00","website_url":"","is_active":true,"uuid4":"aec71bae-6eb7-41fe-9db0-02d555b63744","file_size":915540}]},{"name":"M16Bipods","full_name":"Volks-M16Bipods","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/M16Bipods/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-04-15T13:40:48.024274+00:00","date_updated":"2025-04-15T13:40:53.955041+00:00","uuid4":"64c0c69c-8af1-4264-8c60-22819be8eb94","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items"],"versions":[{"name":"M16Bipods","full_name":"Volks-M16Bipods-1.0.0","description":"Pair of bipods used on the M16s Rifle.","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-M16Bipods-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Volks/M16Bipods/1.0.0/","downloads":9534,"date_created":"2025-04-15T13:40:52.615039+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"81b0572d-cd3e-4767-8ede-98b04136cb03","file_size":12248209}]},{"name":"AttachableGrips","full_name":"Volks-AttachableGrips","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/AttachableGrips/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-05-04T18:10:32.789968+00:00","date_updated":"2025-05-04T18:10:39.674848+00:00","uuid4":"704413df-7f1d-415f-adee-b073eb0fbbf5","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items"],"versions":[{"name":"AttachableGrips","full_name":"Volks-AttachableGrips-1.0.0","description":"Don't you wish your foregrips were SOG like me?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-AttachableGrips-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/AttachableGrips/1.0.0/","downloads":8960,"date_created":"2025-05-04T18:10:38.190361+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"fff1b221-1530-488e-b790-92a7d24effcb","file_size":12272072}]},{"name":"HK53","full_name":"ultrasnail-HK53","owner":"ultrasnail","package_url":"https://thunderstore.io/c/h3vr/p/ultrasnail/HK53/","donation_link":null,"date_created":"2025-07-02T12:23:27.448995+00:00","date_updated":"2025-07-02T12:23:33.270266+00:00","uuid4":"21f8a798-ebd5-474f-bd57-ab7f299b1817","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons","Mods"],"versions":[{"name":"HK53","full_name":"ultrasnail-HK53-1.0.0","description":"The HK53 the younger brother of the HK33","icon":"https://gcdn.thunderstore.io/live/repository/icons/ultrasnail-HK53-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.1","ultrasnail-HK33_Magazines-1.0.0"],"download_url":"https://thunderstore.io/package/download/ultrasnail/HK53/1.0.0/","downloads":6257,"date_created":"2025-07-02T12:23:31.852317+00:00","website_url":"","is_active":true,"uuid4":"4b14e651-62d4-49ea-b80d-300b21f66415","file_size":36997746}]},{"name":"FN_KSP58B","full_name":"WickedBadger-FN_KSP58B","owner":"WickedBadger","package_url":"https://thunderstore.io/c/h3vr/p/WickedBadger/FN_KSP58B/","donation_link":"https://ko-fi.com/wickedbadger","date_created":"2025-07-06T14:48:57.326930+00:00","date_updated":"2025-07-06T18:10:06.243461+00:00","uuid4":"5cc5cf34-9bdc-4e78-8b94-f51ba449d2d7","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"FN_KSP58B","full_name":"WickedBadger-FN_KSP58B-1.0.1","description":"An FN MAG for the Swedes","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-FN_KSP58B-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/FN_KSP58B/1.0.1/","downloads":4933,"date_created":"2025-07-06T18:10:03.532098+00:00","website_url":"","is_active":true,"uuid4":"cffcbfde-3240-46a5-bc84-4ab4edb02d24","file_size":57112754},{"name":"FN_KSP58B","full_name":"WickedBadger-FN_KSP58B-1.0.0","description":"An FN MAG for the Swedes","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-FN_KSP58B-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/FN_KSP58B/1.0.0/","downloads":87,"date_created":"2025-07-06T14:49:03.293660+00:00","website_url":"","is_active":true,"uuid4":"c0c61fe3-0ab8-41e5-8088-0410a12a8098","file_size":57103069}]},{"name":"L1A1_SLR","full_name":"WickedBadger-L1A1_SLR","owner":"WickedBadger","package_url":"https://thunderstore.io/c/h3vr/p/WickedBadger/L1A1_SLR/","donation_link":"https://ko-fi.com/wickedbadger","date_created":"2025-07-06T04:00:41.058538+00:00","date_updated":"2026-01-14T23:17:25.086219+00:00","uuid4":"c304fd73-39a3-484c-8400-bff070fff358","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"L1A1_SLR","full_name":"WickedBadger-L1A1_SLR-1.0.3","description":"Australia's FAL but not really","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-L1A1_SLR-1.0.3.png","version_number":"1.0.3","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/L1A1_SLR/1.0.3/","downloads":421,"date_created":"2026-01-14T23:17:23.491790+00:00","website_url":"","is_active":true,"uuid4":"3bb6b299-13c4-412a-bd3d-b330190cbeb4","file_size":72950141},{"name":"L1A1_SLR","full_name":"WickedBadger-L1A1_SLR-1.0.2","description":"Australia's FAL but not really","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-L1A1_SLR-1.0.2.png","version_number":"1.0.2","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/L1A1_SLR/1.0.2/","downloads":644,"date_created":"2026-01-07T08:32:21.016381+00:00","website_url":"","is_active":true,"uuid4":"1b36f319-62b7-4ee2-b091-71ea19d1be6c","file_size":72949735},{"name":"L1A1_SLR","full_name":"WickedBadger-L1A1_SLR-1.0.1","description":"Australia's FAL but not really","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-L1A1_SLR-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/L1A1_SLR/1.0.1/","downloads":4622,"date_created":"2025-07-06T18:46:53.525174+00:00","website_url":"","is_active":true,"uuid4":"25a4760a-88e1-40e1-980f-4aad9e87291c","file_size":72569345},{"name":"L1A1_SLR","full_name":"WickedBadger-L1A1_SLR-1.0.0","description":"Great Britain's FAL but not really","icon":"https://gcdn.thunderstore.io/live/repository/icons/WickedBadger-L1A1_SLR-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/WickedBadger/L1A1_SLR/1.0.0/","downloads":148,"date_created":"2025-07-06T04:00:47.036810+00:00","website_url":"","is_active":true,"uuid4":"6b560d32-b021-4118-ba85-cf03dea284bf","file_size":71064473}]},{"name":"Erma_Style_Lugers","full_name":"Iqsbasiczz-Erma_Style_Lugers","owner":"Iqsbasiczz","package_url":"https://thunderstore.io/c/h3vr/p/Iqsbasiczz/Erma_Style_Lugers/","donation_link":null,"date_created":"2025-07-28T23:13:28.338326+00:00","date_updated":"2025-07-30T20:42:24.396610+00:00","uuid4":"9db064cb-e918-4554-b26e-820ea21b06e2","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Erma_Style_Lugers","full_name":"Iqsbasiczz-Erma_Style_Lugers-1.0.1","description":"Little pack of repro lugers made in funny calibres","icon":"https://gcdn.thunderstore.io/live/repository/icons/Iqsbasiczz-Erma_Style_Lugers-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Iqsbasiczz/Erma_Style_Lugers/1.0.1/","downloads":3884,"date_created":"2025-07-30T20:42:23.256811+00:00","website_url":"https://ko-fi.com/sharkperson","is_active":true,"uuid4":"99de0f84-c69e-4059-bb8f-47a370dcdd86","file_size":15909105},{"name":"Erma_Style_Lugers","full_name":"Iqsbasiczz-Erma_Style_Lugers-1.0.0","description":"Little pack of repro lugers made in funny calibres","icon":"https://gcdn.thunderstore.io/live/repository/icons/Iqsbasiczz-Erma_Style_Lugers-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Iqsbasiczz/Erma_Style_Lugers/1.0.0/","downloads":139,"date_created":"2025-07-28T23:13:32.744523+00:00","website_url":"https://ko-fi.com/sharkperson","is_active":true,"uuid4":"479efa9e-1178-4d45-bbae-809905196f32","file_size":13695703}]},{"name":"Sterling30CalPrototype","full_name":"Volks-Sterling30CalPrototype","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/Sterling30CalPrototype/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-07-30T13:03:26.995043+00:00","date_updated":"2025-07-30T13:03:34.138807+00:00","uuid4":"a11b343c-ff90-47be-a513-b64cbedcbd20","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Sterling30CalPrototype","full_name":"Volks-Sterling30CalPrototype-1.0.0","description":"When the .30 Cal needs another partner","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-Sterling30CalPrototype-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.2"],"download_url":"https://thunderstore.io/package/download/Volks/Sterling30CalPrototype/1.0.0/","downloads":5020,"date_created":"2025-07-30T13:03:32.637909+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"4af572bb-4f5f-4945-be99-37e4f0236b28","file_size":28898926}]},{"name":"ColtKingCobra","full_name":"Volks-ColtKingCobra","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/ColtKingCobra/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-08-15T20:44:34.859397+00:00","date_updated":"2025-08-30T18:06:31.431126+00:00","uuid4":"ff1af740-b87e-4692-a619-74cc7510950a","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"ColtKingCobra","full_name":"Volks-ColtKingCobra-1.0.1","description":"Colt's snakey revolver in .357 Magnum!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ColtKingCobra-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/ColtKingCobra/1.0.1/","downloads":4383,"date_created":"2025-08-30T18:06:29.752090+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"c02f9ed2-364e-4e7b-bf33-72b529886311","file_size":14059749},{"name":"ColtKingCobra","full_name":"Volks-ColtKingCobra-1.0.0","description":"Colt's snakey revolver in .357 Magnum!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ColtKingCobra-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/ColtKingCobra/1.0.0/","downloads":861,"date_created":"2025-08-15T20:44:40.927613+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"303ab268-ecad-446f-8459-e0d3d2e70301","file_size":14058448}]},{"name":"Savage_99_Rifles","full_name":"Muzzle-Savage_99_Rifles","owner":"Muzzle","package_url":"https://thunderstore.io/c/h3vr/p/Muzzle/Savage_99_Rifles/","donation_link":"https://ko-fi.com/muzzleflash","date_created":"2022-07-12T13:25:23.887258+00:00","date_updated":"2022-07-12T13:25:24.131126+00:00","uuid4":"6a056468-9673-4277-9329-560bbae92f91","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Savage_99_Rifles","full_name":"Muzzle-Savage_99_Rifles-1.0.0","description":"A pair of Savage model 99 series lever-action rifles!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Muzzle-Savage_99_Rifles-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Muzzle/Savage_99_Rifles/1.0.0/","downloads":25215,"date_created":"2022-07-12T13:25:24.131126+00:00","website_url":"","is_active":true,"uuid4":"22a14c37-06c8-4474-ab60-7fb4df31faa5","file_size":101985403}]},{"name":"BerettaM12S","full_name":"Volks-BerettaM12S","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/BerettaM12S/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-08-21T20:21:57.937112+00:00","date_updated":"2025-08-21T20:22:05.434457+00:00","uuid4":"707fd37e-fa2a-4e43-b910-7424b1a2af39","rating_score":4,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BerettaM12S","full_name":"Volks-BerettaM12S-1.0.0","description":"Cold War Italian Submachine Gun!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-BerettaM12S-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/BerettaM12S/1.0.0/","downloads":3698,"date_created":"2025-08-21T20:22:03.599761+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"c532b19c-a39e-4d17-a301-f7d7476e8639","file_size":17972442}]},{"name":"F1SMG_Aus","full_name":"Volks-F1SMG_Aus","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/F1SMG_Aus/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-08-21T20:23:51.412939+00:00","date_updated":"2025-08-21T20:23:59.319620+00:00","uuid4":"9b5b14a1-3f9f-433d-aead-3cc7d066aea7","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"F1SMG_Aus","full_name":"Volks-F1SMG_Aus-1.0.0","description":"Another gun from the land down under","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-F1SMG_Aus-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3","Okkim-Bag_Of_Scripts-1.11.0"],"download_url":"https://thunderstore.io/package/download/Volks/F1SMG_Aus/1.0.0/","downloads":3252,"date_created":"2025-08-21T20:23:57.402985+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"801d3a9c-8a50-4b28-abb1-ccddb733cb06","file_size":19728539}]},{"name":"BS1_UnderbarrelGL","full_name":"JerryAr-BS1_UnderbarrelGL","owner":"JerryAr","package_url":"https://thunderstore.io/c/h3vr/p/JerryAr/BS1_UnderbarrelGL/","donation_link":null,"date_created":"2025-08-23T14:55:09.416190+00:00","date_updated":"2025-10-28T20:23:21.064347+00:00","uuid4":"075be99d-fb97-4041-a342-b60466fedede","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Items","Weapons","Mods"],"versions":[{"name":"BS1_UnderbarrelGL","full_name":"JerryAr-BS1_UnderbarrelGL-1.0.1","description":"Only Fits in AKS74U!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BS1_UnderbarrelGL-1.0.1.png","version_number":"1.0.1","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/BS1_UnderbarrelGL/1.0.1/","downloads":4269,"date_created":"2025-10-28T20:23:19.914858+00:00","website_url":"","is_active":true,"uuid4":"67802668-7173-40b1-8cf7-f9b83b04c7fa","file_size":12840255},{"name":"BS1_UnderbarrelGL","full_name":"JerryAr-BS1_UnderbarrelGL-1.0.0","description":"Only Fits in AKS74U!","icon":"https://gcdn.thunderstore.io/live/repository/icons/JerryAr-BS1_UnderbarrelGL-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","WFIOST-H3VRUtilities-8.11.0","cityrobo-OpenScripts2-2.8.0"],"download_url":"https://thunderstore.io/package/download/JerryAr/BS1_UnderbarrelGL/1.0.0/","downloads":3236,"date_created":"2025-08-23T14:55:15.464992+00:00","website_url":"","is_active":true,"uuid4":"35226731-a654-4e2e-8163-1dcfc35995ce","file_size":12655930}]},{"name":"Chinese_Arisaka","full_name":"Billiam_J_McGoonigan-Chinese_Arisaka","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Chinese_Arisaka/","donation_link":null,"date_created":"2025-08-21T21:26:32.080869+00:00","date_updated":"2025-08-21T21:26:40.733870+00:00","uuid4":"95178468-1f94-4f5f-b320-f20536c7776a","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Chinese_Arisaka","full_name":"Billiam_J_McGoonigan-Chinese_Arisaka-1.0.0","description":"When you have a lot of Arisaka, and a lot of SKS ammo...","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Chinese_Arisaka-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Chinese_Arisaka/1.0.0/","downloads":2822,"date_created":"2025-08-21T21:26:39.139493+00:00","website_url":"","is_active":true,"uuid4":"83718bb4-fb32-4609-8aa9-f5cdb98ec4d7","file_size":21634273}]},{"name":"Tommy_Tokarev","full_name":"Billiam_J_McGoonigan-Tommy_Tokarev","owner":"Billiam_J_McGoonigan","package_url":"https://thunderstore.io/c/h3vr/p/Billiam_J_McGoonigan/Tommy_Tokarev/","donation_link":null,"date_created":"2025-08-21T21:29:58.983278+00:00","date_updated":"2025-08-21T21:30:07.372293+00:00","uuid4":"d13be0d4-ba1b-4e7d-9060-862aaab263ef","rating_score":1,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"Tommy_Tokarev","full_name":"Billiam_J_McGoonigan-Tommy_Tokarev-1.0.0","description":"A Thompson that shoots 7.62 Tokarev? But Why?","icon":"https://gcdn.thunderstore.io/live/repository/icons/Billiam_J_McGoonigan-Tommy_Tokarev-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0"],"download_url":"https://thunderstore.io/package/download/Billiam_J_McGoonigan/Tommy_Tokarev/1.0.0/","downloads":4274,"date_created":"2025-08-21T21:30:05.716999+00:00","website_url":"","is_active":true,"uuid4":"b22e2745-3b03-4a11-9dc0-66bc1c9ccfb6","file_size":9964084}]},{"name":"RugerBlackhawk44Magnum","full_name":"Volks-RugerBlackhawk44Magnum","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RugerBlackhawk44Magnum/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-09-07T18:58:52.338641+00:00","date_updated":"2025-09-07T18:59:00.668585+00:00","uuid4":"8117e9b2-c020-4e47-97f7-1b28cd52ff5a","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RugerBlackhawk44Magnum","full_name":"Volks-RugerBlackhawk44Magnum-1.0.0","description":"Ruger Blackhawk in .44 Magnum!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RugerBlackhawk44Magnum-1.0.0_0r1UR3t.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/RugerBlackhawk44Magnum/1.0.0/","downloads":2980,"date_created":"2025-09-07T18:58:58.929598+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"b6314142-5dbd-4de6-95ee-a3d26639da4a","file_size":9523962}]},{"name":"RugerModel44","full_name":"Volks-RugerModel44","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RugerModel44/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-09-07T18:59:44.100278+00:00","date_updated":"2025-09-07T18:59:52.806875+00:00","uuid4":"7032be2e-e969-4703-a595-b5bcdbbc22f6","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RugerModel44","full_name":"Volks-RugerModel44-1.0.0","description":"Classic Ruger ranch rifle in .44 Magnum!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RugerModel44-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/RugerModel44/1.0.0/","downloads":3157,"date_created":"2025-09-07T18:59:50.943531+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"b448d5bb-fd7d-4bd1-a307-656afcc0411a","file_size":41030164}]},{"name":"RugerM77Rifle","full_name":"Volks-RugerM77Rifle","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/RugerM77Rifle/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-09-07T18:52:29.780200+00:00","date_updated":"2025-09-07T18:52:38.601329+00:00","uuid4":"6d8888cc-88c5-4fca-9c27-68a095f5186b","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"RugerM77Rifle","full_name":"Volks-RugerM77Rifle-1.0.0","description":"Ruger M77 bolt action rifle for all your hunting goodness!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-RugerM77Rifle-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/RugerM77Rifle/1.0.0/","downloads":3341,"date_created":"2025-09-07T18:52:36.543582+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"3f37c97a-3469-43b2-87a0-342aa7b12125","file_size":61341900}]},{"name":"SWModel61","full_name":"Volks-SWModel61","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/SWModel61/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-09-27T19:15:22.551422+00:00","date_updated":"2025-09-27T19:15:30.611367+00:00","uuid4":"a42daa71-e279-4527-9572-4a55426f96f6","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"SWModel61","full_name":"Volks-SWModel61-1.0.0","description":"A small little pocket pistol, plinker and paperweight","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-SWModel61-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/SWModel61/1.0.0/","downloads":2666,"date_created":"2025-09-27T19:15:29.006346+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"92a68b5b-38e2-40b5-abf4-911ea92ebbb0","file_size":19382473}]},{"name":"MarlinModel995","full_name":"Volks-MarlinModel995","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/MarlinModel995/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-11-09T13:44:30.708061+00:00","date_updated":"2025-11-09T13:44:36.021304+00:00","uuid4":"3ba69ef4-4e71-42fb-a57b-3580b9d081cb","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"MarlinModel995","full_name":"Volks-MarlinModel995-1.0.0","description":"Marlin's .22LR Plinker/Small Hunting Rifle!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-MarlinModel995-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.12.0"],"download_url":"https://thunderstore.io/package/download/Volks/MarlinModel995/1.0.0/","downloads":2120,"date_created":"2025-11-09T13:44:34.709664+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"579af19a-53ab-4333-9732-c120fe0f0444","file_size":12647995}]},{"name":"ColtKingCobraTarget22LR","full_name":"Volks-ColtKingCobraTarget22LR","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/ColtKingCobraTarget22LR/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-11-09T13:54:09.086513+00:00","date_updated":"2025-11-09T13:54:14.699420+00:00","uuid4":"a9a9a074-8a16-4de4-844b-5e72e090979d","rating_score":2,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"ColtKingCobraTarget22LR","full_name":"Volks-ColtKingCobraTarget22LR-1.0.0","description":"A variant of the King Cobra but in .22LR!","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-ColtKingCobraTarget22LR-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/ColtKingCobraTarget22LR/1.0.0/","downloads":2007,"date_created":"2025-11-09T13:54:13.438808+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"5d439a48-a398-49bc-bba9-324d7ce4913a","file_size":28221608}]},{"name":"BrowningBuckMarkFieldPistol","full_name":"Volks-BrowningBuckMarkFieldPistol","owner":"Volks","package_url":"https://thunderstore.io/c/h3vr/p/Volks/BrowningBuckMarkFieldPistol/","donation_link":"https://ko-fi.com/volksie","date_created":"2025-11-09T13:43:37.634522+00:00","date_updated":"2025-11-09T13:43:44.935446+00:00","uuid4":"7f637d28-ad17-40d1-84dc-3e562a50a7b7","rating_score":3,"is_pinned":false,"is_deprecated":false,"has_nsfw_content":false,"categories":["Weapons"],"versions":[{"name":"BrowningBuckMarkFieldPistol","full_name":"Volks-BrowningBuckMarkFieldPistol-1.0.0","description":"Browning's very own Ruger style target pistol in .22LR","icon":"https://gcdn.thunderstore.io/live/repository/icons/Volks-BrowningBuckMarkFieldPistol-1.0.0.png","version_number":"1.0.0","dependencies":["devyndamonster-OtherLoader-1.3.0","cityrobo-OpenScripts2-2.11.3"],"download_url":"https://thunderstore.io/package/download/Volks/BrowningBuckMarkFieldPistol/1.0.0/","downloads":1980,"date_created":"2025-11-09T13:43:42.649334+00:00","website_url":"https://ko-fi.com/volksie","is_active":true,"uuid4":"0b46b21b-72d3-4bc3-98fd-956c51dd1140","file_size":15607168}]}]`);
const CATEGORY_MAP = {
  "Code Mods": "Frameworks",
  "Cosmetics": "Cosmetic",
  "Cosmetic": "Cosmetic",
  "Items": "Items",
  "Weapons": "Weapons",
  "Maps": "Content",
  "Audio": "Audio",
  "Libraries": "Libraries",
  "Tools": "Tools",
  "Gameplay": "Gameplay",
  "Graphics": "Graphics",
  "Performance": "Performance",
  "UI": "UI",
  "Multiplayer": "Multiplayer",
  "Server-side": "Server-side",
  "Client-side": "Client-side"
};
function mapThunderstoreCategories(tsCategories) {
  if (!tsCategories || tsCategories.length === 0) {
    return ["Misc"];
  }
  const mapped = tsCategories.map((cat) => CATEGORY_MAP[cat] || "Misc");
  return [...new Set(mapped)];
}
function transformThunderstorePackageToMod(pkg) {
  const latestVersion = pkg.versions[0];
  const totalDownloads = pkg.versions.reduce((sum, v) => sum + v.downloads, 0);
  const versions = pkg.versions.map((v) => ({
    version_number: v.version_number,
    datetime_created: v.date_created,
    download_count: v.downloads,
    download_url: v.download_url,
    install_url: v.download_url
  }));
  const readmeHtml = `
    <h1>${pkg.name}</h1>
    <p>${latestVersion?.description || "No description available."}</p>
    <h2>Links</h2>
    <ul>
      <li><a href="${pkg.package_url}" target="_blank">View on Thunderstore</a></li>
      ${latestVersion?.website_url ? `<li><a href="${latestVersion.website_url}" target="_blank">Project Website</a></li>` : ""}
    </ul>
    <h2>Stats</h2>
    <ul>
      <li>Rating: ${pkg.rating_score}</li>
      <li>Total Downloads: ${totalDownloads.toLocaleString()}</li>
      <li>Last Updated: ${new Date(pkg.date_updated).toLocaleDateString()}</li>
    </ul>
  `.trim();
  return {
    id: pkg.uuid4,
    gameId: "h3vr",
    kind: "mod",
    name: pkg.name,
    author: pkg.owner,
    description: latestVersion?.description || "",
    version: latestVersion?.version_number || "0.0.0",
    downloads: totalDownloads,
    iconUrl: latestVersion?.icon || "",
    isInstalled: false,
    isEnabled: false,
    lastUpdated: pkg.date_updated,
    dependencies: latestVersion?.dependencies || [],
    categories: mapThunderstoreCategories(pkg.categories),
    readmeHtml,
    versions
  };
}
const H3VR_MODS = h3vrModsJson.map(
  transformThunderstorePackageToMod
);
const generateMods = (gameId, count, kind = "mod") => {
  const modNames = [
    "BepInEx",
    "R2API",
    "TooManyFriends",
    "BiggerLobby",
    "SkillsPlusPlus",
    "ItemStats",
    "FastScrap",
    "MoreCompany",
    "LateCompany",
    "ShipLoot",
    "ReservedItemSlot",
    "FlashlightToggle",
    "LethalExpansion",
    "Diversity",
    "TerminalApi",
    "HookGenPatcher",
    "CustomSounds",
    "MoreItems",
    "BetterStamina"
  ];
  const modpackNames = [
    "Essential Pack",
    "Performance Bundle",
    "QoL Collection",
    "Graphics Overhaul",
    "Multiplayer Pack",
    "Content Expansion",
    "Balanced Gameplay",
    "Survival Plus"
  ];
  const names = kind === "modpack" ? modpackNames : modNames;
  const authors = [
    "bbepis",
    "tristanmcpherson",
    "RiskofThunder",
    "mistername",
    "XoXFaby",
    "Evaisa",
    "anormaltwig",
    "notnotnotswipez"
  ];
  const pickCategories = (min, max) => {
    const count2 = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...MOD_CATEGORIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count2);
  };
  const sampleReadmeHtml = `<h1>FusionNetworking+</h1>
<h3>A mod which adds more network layers to Fusion! (Currently adds RiptideNetworking)</h3>
<h1>How to Use the Mod</h1>
<p>When logging into a network layer in Fusion, cycle to the desired layer.</p>
<h1>Currently Added Network Layers (Only one for now):</h1>
<h2>Riptide</h2>
<p>Using <a href="https://github.com/RiptideNetworking/Riptide">Riptide Networking</a>, a lightweight, server authoritative P2P networking library, this network layer can be used without any external programs like Steam/FusionHelper, allowing the Quest to connect to other players fully standalone!</p>
<h3>There ARE some caveats, however:</h3>
<ul>
<li>Of course, users on the Riptide layer CANNOT play with users on the Steam layer.</li>
<li>Due to the nature of P2P, public lobbies are NOT included with the Riptide layer.</li>
<li>In order for one to host a Riptide lobby, they must open a port in some way to outside players. (unless the two are on the same network/WIFI)</li>
<li>Relating to that, in order to let others join the host, the host must share a "server code," which is their IP Address encoded into a string of letters. Do NOT share this code willy nilly, unless you are using a VPN of some kind or are comfortable sharing your IP.</li>
</ul>
<h3>Riptide Layer Additions:</h3>
<ul>
<li>Ping display to Fusion UI, which shows the quality of your connection.</li>
<li>Server codes are automatically copied to your clipboard when refreshed, due to their length.</li>
</ul>`;
  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : "");
    const author = authors[i % authors.length];
    const currentVersion = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`;
    const versionCount = Math.floor(Math.random() * 3) + 3;
    const versions = Array.from({ length: versionCount }, (_2, vIndex) => {
      const major = Math.max(1, parseInt(currentVersion.split(".")[0]) - Math.floor(vIndex / 3));
      const minor = vIndex === 0 ? parseInt(currentVersion.split(".")[1]) : Math.floor(Math.random() * 10);
      const patch = vIndex === 0 ? parseInt(currentVersion.split(".")[2]) : Math.floor(Math.random() * 100);
      const versionNumber = vIndex === 0 ? currentVersion : `${major}.${minor}.${patch}`;
      const daysAgo = vIndex * (Math.floor(Math.random() * 30) + 10);
      const datetime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1e3).toISOString();
      const baseDownloads = Math.floor(Math.random() * 1e6) + 1e4;
      const downloadMultiplier = vIndex === 0 ? 1 : Math.max(0.1, 1 - vIndex * 0.2);
      const downloads = Math.floor(baseDownloads * downloadMultiplier);
      return {
        version_number: versionNumber,
        datetime_created: datetime,
        download_count: downloads,
        download_url: `https://thunderstore.io/package/download/${author}/${name}/${versionNumber}/`,
        install_url: `ror2mm://v1/install/thunderstore.io/${author}/${name}/${versionNumber}/`
      };
    });
    return {
      id: `${gameId}-${kind}-${i}`,
      gameId,
      kind,
      name,
      author,
      description: kind === "modpack" ? `A curated collection of mods that work together to enhance your ${gameId} experience.` : `A comprehensive mod that enhances the ${gameId} experience with additional features and quality of life improvements.`,
      version: currentVersion,
      downloads: versions[0].download_count,
      iconUrl: `https://via.placeholder.com/256x256/${["ef4444", "f59e0b", "10b981", "3b82f6", "8b5cf6", "ec4899"][i % 6]}/ffffff?text=${names[i % names.length].substring(0, 2)}`,
      isInstalled: Math.random() > 0.5,
      isEnabled: Math.random() > 0.3,
      lastUpdated: versions[0].datetime_created,
      dependencies: i === 0 ? [] : i === 1 ? ["BepInEx"] : ["BepInEx", "R2API"],
      categories: pickCategories(1, 3),
      readmeHtml: sampleReadmeHtml.replace("FusionNetworking+", name),
      versions
    };
  });
};
const MODS = [
  ...BONELAB_MODS,
  ...H3VR_MODS,
  ...generateMods("ror2", 100, "mod"),
  ...generateMods("ror2", 20, "modpack"),
  ...generateMods("valheim", 65, "mod"),
  ...generateMods("valheim", 15, "modpack"),
  ...generateMods("lethal-company", 80, "mod"),
  ...generateMods("lethal-company", 20, "modpack"),
  ...generateMods("dyson-sphere", 40, "mod"),
  ...generateMods("dyson-sphere", 10, "modpack")
];
function Separator({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Separator$1,
    {
      "data-slot": "separator",
      orientation,
      className: cn$1(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      ),
      ...props
    }
  );
}
function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn$1("animate-pulse rounded-md bg-muted", className),
      ...props
    }
  );
}
const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object;
let {
  apply,
  construct
} = typeof Reflect !== "undefined" && Reflect;
if (!freeze) {
  freeze = function freeze2(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal2(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply2(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    return func.apply(thisArg, args);
  };
}
if (!construct) {
  construct = function construct2(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function(thisArg) {
    if (thisArg instanceof RegExp) {
      thisArg.lastIndex = 0;
    }
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    return apply(func, thisArg, args);
  };
}
function unconstruct(Func) {
  return function() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return construct(Func, args);
  };
}
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === "string") {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === "object" && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === "function") {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}
const html$1 = freeze(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]);
const svg$1 = freeze(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]);
const svgFilters = freeze(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]);
const svgDisallowed = freeze(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]);
const mathMl$1 = freeze(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]);
const mathMlDisallowed = freeze(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]);
const text = freeze(["#text"]);
const html = freeze(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]);
const svg = freeze(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]);
const mathMl = freeze(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]);
const xml = freeze(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]);
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm);
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm);
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
const ARIA_ATTR = seal(/^aria-[\-\w]+$/);
const IS_ALLOWED_URI = seal(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
var EXPRESSIONS = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR,
  ATTR_WHITESPACE,
  CUSTOM_ELEMENT,
  DATA_ATTR,
  DOCTYPE_NAME,
  ERB_EXPR,
  IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR,
  TMPLIT_EXPR
});
const NODE_TYPE = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
};
const getGlobal = function getGlobal2() {
  return typeof window === "undefined" ? null : window;
};
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") {
    return null;
  }
  let suffix = null;
  const ATTR_NAME = "data-tt-policy-suffix";
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = "dompurify" + (suffix ? "#" + suffix : "");
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html2) {
        return html2;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    console.warn("TrustedTypes policy " + policyName + " could not be created.");
    return null;
  }
};
const _createHooksMap = function _createHooksMap2() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
  const DOMPurify = (root) => createDOMPurify(root);
  DOMPurify.version = "3.3.1";
  DOMPurify.removed = [];
  if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document: document2
  } = window2;
  const originalDocument = document2;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window2.NamedNodeMap || window2.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window2;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
  const remove = lookupGetter(ElementPrototype, "remove");
  const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
  const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
  const getParentNode = lookupGetter(ElementPrototype, "parentNode");
  if (typeof HTMLTemplateElement === "function") {
    const template = document2.createElement("template");
    if (template.content && template.content.ownerDocument) {
      document2 = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = "";
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document2;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: MUSTACHE_EXPR2,
    ERB_EXPR: ERB_EXPR2,
    TMPLIT_EXPR: TMPLIT_EXPR2,
    DATA_ATTR: DATA_ATTR2,
    ARIA_ATTR: ARIA_ATTR2,
    IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA2,
    ATTR_WHITESPACE: ATTR_WHITESPACE2,
    CUSTOM_ELEMENT: CUSTOM_ELEMENT2
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  let FORBID_TAGS = null;
  let FORBID_ATTR = null;
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  let ALLOW_ARIA_ATTR = true;
  let ALLOW_DATA_ATTR = true;
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  let SAFE_FOR_TEMPLATES = false;
  let SAFE_FOR_XML = true;
  let WHOLE_DOCUMENT = false;
  let SET_CONFIG = false;
  let FORCE_BODY = false;
  let RETURN_DOM = false;
  let RETURN_DOM_FRAGMENT = false;
  let RETURN_TRUSTED_TYPE = false;
  let SANITIZE_DOM = true;
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
  let KEEP_CONTENT = true;
  let IN_PLACE = false;
  let USE_PROFILES = {};
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ["audio", "video", "img", "source", "image", "track"]);
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]);
  const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ["mi", "mo", "mn", "ms", "mtext"]);
  let HTML_INTEGRATION_POINTS = addToSet({}, ["annotation-xml"]);
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ["title", "style", "font", "a", "script"]);
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
  const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
  let transformCaseFunc = null;
  let CONFIG = null;
  const formElement = document2.createElement("form");
  const isRegexOrFunction = function isRegexOrFunction2(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  const _parseConfig = function _parseConfig2() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    if (!cfg || typeof cfg !== "object") {
      cfg = {};
    }
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
    ALLOWED_TAGS = objectHasOwnProperty(cfg, "ALLOWED_TAGS") ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, "ALLOWED_ATTR") ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, "ALLOWED_NAMESPACES") ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, "ADD_URI_SAFE_ATTR") ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, "ADD_DATA_URI_TAGS") ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, "FORBID_CONTENTS") ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, "FORBID_TAGS") ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : clone({});
    FORBID_ATTR = objectHasOwnProperty(cfg, "FORBID_ATTR") ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : clone({});
    USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
    RETURN_DOM = cfg.RETURN_DOM || false;
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
    FORCE_BODY = cfg.FORCE_BODY || false;
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
    IN_PLACE = cfg.IN_PLACE || false;
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === "boolean") {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    if (cfg.ADD_TAGS) {
      if (typeof cfg.ADD_TAGS === "function") {
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      } else {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (cfg.ADD_ATTR) {
      if (typeof cfg.ADD_ATTR === "function") {
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      } else {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    if (cfg.ADD_FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }
    if (KEEP_CONTENT) {
      ALLOWED_TAGS["#text"] = true;
    }
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ["html", "head", "body"]);
    }
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ["tbody"]);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      emptyHTML = trustedTypesPolicy.createHTML("");
    } else {
      if (trustedTypesPolicy === void 0) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      if (trustedTypesPolicy !== null && typeof emptyHTML === "string") {
        emptyHTML = trustedTypesPolicy.createHTML("");
      }
    }
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  const _checkValidNamespace = function _checkValidNamespace2(element) {
    let parent = getParentNode(element);
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: "template"
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === "svg";
      }
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === "math";
      }
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
      }
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    return false;
  };
  const _forceRemove = function _forceRemove2(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  const _removeAttribute = function _removeAttribute2(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    if (name === "is") {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {
        }
      } else {
        try {
          element.setAttribute(name, "");
        } catch (_) {
        }
      }
    }
  };
  const _initDocument = function _initDocument2(dirty) {
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = "<remove></remove>" + dirty;
    } else {
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) {
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {
      }
    }
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, "template", null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  const _createNodeIterator = function _createNodeIterator2(root) {
    return createNodeIterator.call(
      root.ownerDocument || root,
      root,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION,
      null
    );
  };
  const _isClobbered = function _isClobbered2(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function");
  };
  const _isNode = function _isNode2(value) {
    return typeof Node === "function" && value instanceof Node;
  };
  function _executeHooks(hooks2, currentNode, data) {
    arrayForEach(hooks2, (hook) => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  const _sanitizeElements = function _sanitizeElements2(currentNode) {
    let content = null;
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    const tagName = transformCaseFunc(currentNode.nodeName);
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w!]/g, currentNode.innerHTML) && regExpTest(/<[/\w!]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    if (!(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName])) {
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
        content = stringReplace(content, expr, " ");
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
    if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) {
      return false;
    }
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR2, lcName)) ;
    else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR2, lcName)) ;
    else if (EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag)) ;
    else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
        // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName, lcTag)) || // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))
      ) ;
      else {
        return false;
      }
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ;
    else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE2, ""))) ;
    else if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) ;
    else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA2, stringReplace(value, ATTR_WHITESPACE2, ""))) ;
    else if (value) {
      return false;
    } else ;
    return true;
  };
  const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
    return tagName !== "annotation-xml" && stringMatch(tagName, CUSTOM_ELEMENT2);
  };
  const _sanitizeAttributes = function _sanitizeAttributes2(currentNode) {
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: "",
      attrValue: "",
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: void 0
    };
    let l = attributes.length;
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === "value" ? initValue : stringTrim(initValue);
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = void 0;
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name")) {
        _removeAttribute(name, currentNode);
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title|textarea)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (lcName === "attributename" && stringMatch(value, "href")) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
          value = stringReplace(value, expr, " ");
        });
      }
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function") {
        if (namespaceURI) ;
        else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case "TrustedHTML": {
              value = trustedTypesPolicy.createHTML(value);
              break;
            }
            case "TrustedScriptURL": {
              value = trustedTypesPolicy.createScriptURL(value);
              break;
            }
          }
        }
      }
      if (value !== initValue) {
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {
          _removeAttribute(name, currentNode);
        }
      }
    }
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  const _sanitizeShadowDOM = function _sanitizeShadowDOM2(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      _sanitizeElements(shadowNode);
      _sanitizeAttributes(shadowNode);
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM2(shadowNode.content);
      }
    }
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  DOMPurify.sanitize = function(dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = "<!-->";
    }
    if (typeof dirty !== "string" && !_isNode(dirty)) {
      if (typeof dirty.toString === "function") {
        dirty = dirty.toString();
        if (typeof dirty !== "string") {
          throw typeErrorCreate("dirty is not a string, aborting");
        }
      } else {
        throw typeErrorCreate("toString is not a function");
      }
    }
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    DOMPurify.removed = [];
    if (typeof dirty === "string") {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
        }
      }
    } else if (dirty instanceof Node) {
      body = _initDocument("<!---->");
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") {
        body = importedNode;
      } else if (importedNode.nodeName === "HTML") {
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf("<") === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      body = _initDocument(dirty);
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
      }
    }
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    while (currentNode = nodeIterator.nextNode()) {
      _sanitizeElements(currentNode);
      _sanitizeAttributes(currentNode);
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    if (IN_PLACE) {
      return dirty;
    }
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
    }
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR2, ERB_EXPR2, TMPLIT_EXPR2], (expr) => {
        serializedHTML = stringReplace(serializedHTML, expr, " ");
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function(tag, attr, value) {
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== "function") {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function(entryPoint, hookFunction) {
    if (hookFunction !== void 0) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function(entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function() {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();
function HtmlReadme({ html: html2, onOpenLink }) {
  const containerRef = reactExports.useRef(null);
  const sanitizedHtml = reactExports.useMemo(() => {
    const config = {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "hr",
        "strong",
        "em",
        "u",
        "s",
        "blockquote",
        "ul",
        "ol",
        "li",
        "code",
        "pre",
        "a",
        "img"
      ],
      ALLOWED_ATTR: [
        "href",
        "title",
        "src",
        "alt",
        "width",
        "height"
      ]
    };
    purify.addHook("afterSanitizeAttributes", (node) => {
      const anchor = document.createElement("a");
      if (node.hasAttribute("href")) {
        anchor.href = node.getAttribute("href") || "";
        if (anchor.protocol && anchor.protocol !== "https:" && anchor.protocol !== "http:") {
          node.removeAttribute("href");
        } else if (anchor.protocol === "http:") {
          node.removeAttribute("href");
        } else if (anchor.protocol === "https:") {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }
      if (node.hasAttribute("src")) {
        anchor.href = node.getAttribute("src") || "";
        if (anchor.protocol && anchor.protocol !== "https:") {
          node.remove();
        } else if (anchor.protocol === "https:") {
          node.setAttribute("loading", "lazy");
          node.setAttribute("decoding", "async");
          node.setAttribute("referrerpolicy", "no-referrer");
        }
      }
    });
    const sanitized = purify.sanitize(html2, config);
    purify.removeAllHooks();
    return sanitized;
  }, [html2]);
  reactExports.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = (e) => {
      const target = e.target;
      const anchor = target.closest("a");
      if (anchor && anchor.hasAttribute("href")) {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (!href) return;
        try {
          const url = new URL(href, window.location.href);
          if (url.protocol === "https:") {
            if (onOpenLink) {
              onOpenLink(url.href);
            } else {
              window.open(url.href, "_blank", "noopener,noreferrer");
            }
          }
        } catch {
          console.warn("Invalid URL in readme:", href);
        }
      }
    };
    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [onOpenLink]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: containerRef,
      className: "readme prose-sm",
      dangerouslySetInnerHTML: { __html: sanitizedHtml }
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-slot": "table-container", className: "relative w-full overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "table",
    {
      "data-slot": "table",
      className: cn$1("w-full caption-bottom text-sm", className),
      ...props
    }
  ) });
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn$1("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn$1("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn$1("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn$1("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0", className),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn$1("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className),
      ...props
    }
  );
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
function resolveDependencyToMod(gameId, parsed, mods) {
  if (!parsed.isValid) {
    return null;
  }
  const match = mods.find(
    (m) => m.gameId === gameId && m.author === parsed.owner && m.name === parsed.name
  );
  return match || null;
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
function analyzeDependency({
  depString,
  gameId,
  mods,
  installedVersions,
  enforceVersions
}) {
  const parsed = parseDependencyString(depString);
  const resolvedMod = resolveDependencyToMod(gameId, parsed, mods);
  const installedVersion = resolvedMod ? installedVersions[resolvedMod.id] : void 0;
  const status = computeDependencyStatus({
    parsed,
    resolvedMod: resolvedMod || null,
    installedVersion,
    enforceVersions
  });
  return {
    raw: depString,
    parsed,
    resolvedMod: resolvedMod || void 0,
    status,
    installedVersion,
    requiredVersion: parsed.requiredVersion
  };
}
function analyzeModDependencies({
  mod,
  mods,
  installedVersions,
  enforceVersions
}) {
  return mod.dependencies.map(
    (dep) => analyzeDependency({
      depString: dep,
      gameId: mod.gameId,
      mods,
      installedVersions,
      enforceVersions
    })
  );
}
function DependencyModDialog({ mod, open, onOpenChange }) {
  if (!mod) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "sr-only", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mod.name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ModInspectorContent, { mod }) })
  ] }) });
}
let CheckboxRootDataAttributes = /* @__PURE__ */ (function(CheckboxRootDataAttributes2) {
  CheckboxRootDataAttributes2["checked"] = "data-checked";
  CheckboxRootDataAttributes2["unchecked"] = "data-unchecked";
  CheckboxRootDataAttributes2["indeterminate"] = "data-indeterminate";
  CheckboxRootDataAttributes2["disabled"] = "data-disabled";
  CheckboxRootDataAttributes2["readonly"] = "data-readonly";
  CheckboxRootDataAttributes2["required"] = "data-required";
  CheckboxRootDataAttributes2["valid"] = "data-valid";
  CheckboxRootDataAttributes2["invalid"] = "data-invalid";
  CheckboxRootDataAttributes2["touched"] = "data-touched";
  CheckboxRootDataAttributes2["dirty"] = "data-dirty";
  CheckboxRootDataAttributes2["filled"] = "data-filled";
  CheckboxRootDataAttributes2["focused"] = "data-focused";
  return CheckboxRootDataAttributes2;
})({});
function useStateAttributesMapping(state) {
  return reactExports.useMemo(() => ({
    checked(value) {
      if (state.indeterminate) {
        return {};
      }
      if (value) {
        return {
          [CheckboxRootDataAttributes.checked]: ""
        };
      }
      return {
        [CheckboxRootDataAttributes.unchecked]: ""
      };
    },
    ...fieldValidityMapping
  }), [state.indeterminate]);
}
const CheckboxRootContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useCheckboxRootContext() {
  const context = reactExports.useContext(CheckboxRootContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(14));
  }
  return context;
}
const PARENT_CHECKBOX = "data-parent";
const CheckboxRoot = /* @__PURE__ */ reactExports.forwardRef(function CheckboxRoot2(componentProps, forwardedRef) {
  const {
    checked: checkedProp,
    className,
    defaultChecked = false,
    disabled: disabledProp = false,
    id: idProp,
    indeterminate = false,
    inputRef: inputRefProp,
    name: nameProp,
    onCheckedChange: onCheckedChangeProp,
    parent = false,
    readOnly = false,
    render,
    required = false,
    uncheckedValue,
    value: valueProp,
    nativeButton = false,
    ...elementProps
  } = componentProps;
  const {
    clearErrors
  } = useFormContext();
  const {
    disabled: rootDisabled,
    name: fieldName,
    setDirty,
    setFilled,
    setFocused,
    setTouched,
    state: fieldState,
    validationMode,
    validityData,
    shouldValidateOnChange,
    validation: localValidation
  } = useFieldRootContext();
  const fieldItemContext = useFieldItemContext();
  const {
    labelId,
    controlId,
    setControlId,
    getDescriptionProps
  } = useLabelableContext();
  const groupContext = useCheckboxGroupContext();
  const parentContext = groupContext?.parent;
  const isGroupedWithParent = parentContext && groupContext.allValues;
  const disabled = rootDisabled || fieldItemContext.disabled || groupContext?.disabled || disabledProp;
  const name = fieldName ?? nameProp;
  const value = valueProp ?? name;
  const id = useBaseUiId();
  const parentId = useBaseUiId();
  let inputId = controlId;
  if (isGroupedWithParent) {
    inputId = parent ? parentId : `${parentContext.id}-${value}`;
  } else if (idProp) {
    inputId = idProp;
  }
  let groupProps = {};
  if (isGroupedWithParent) {
    if (parent) {
      groupProps = groupContext.parent.getParentProps();
    } else if (value) {
      groupProps = groupContext.parent.getChildProps(value);
    }
  }
  const onCheckedChange = useStableCallback(onCheckedChangeProp);
  const {
    checked: groupChecked = checkedProp,
    indeterminate: groupIndeterminate = indeterminate,
    onCheckedChange: groupOnChange,
    ...otherGroupProps
  } = groupProps;
  const groupValue = groupContext?.value;
  const setGroupValue = groupContext?.setValue;
  const defaultGroupValue = groupContext?.defaultValue;
  const controlRef = reactExports.useRef(null);
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const validation = groupContext?.validation ?? localValidation;
  const [checked, setCheckedState] = useControlled({
    controlled: value && groupValue && !parent ? groupValue.includes(value) : groupChecked,
    default: value && defaultGroupValue && !parent ? defaultGroupValue.includes(value) : defaultChecked,
    name: "Checkbox",
    state: "checked"
  });
  useIsoLayoutEffect(() => {
    if (setControlId === NOOP) {
      return void 0;
    }
    setControlId(inputId);
    return () => {
      setControlId(void 0);
    };
  }, [inputId, groupContext, setControlId, parent]);
  useField({
    enabled: !groupContext,
    id,
    commit: validation.commit,
    value: checked,
    controlRef,
    name,
    getValue: () => checked
  });
  const inputRef = reactExports.useRef(null);
  const mergedInputRef = useMergedRefs(inputRefProp, inputRef, validation.inputRef);
  useIsoLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = groupIndeterminate;
      if (checked) {
        setFilled(true);
      }
    }
  }, [checked, groupIndeterminate, setFilled]);
  useValueChanged(checked, () => {
    if (groupContext && !parent) {
      return;
    }
    clearErrors(name);
    setFilled(checked);
    setDirty(checked !== validityData.initialValue);
    if (shouldValidateOnChange()) {
      validation.commit(checked);
    } else {
      validation.commit(checked, true);
    }
  });
  const inputProps = mergeProps(
    {
      checked,
      disabled,
      // parent checkboxes unset `name` to be excluded from form submission
      name: parent ? void 0 : name,
      // Set `id` to stop Chrome warning about an unassociated input.
      // When using a native button, the `id` is applied to the button instead.
      id: nativeButton ? void 0 : inputId ?? void 0,
      required,
      ref: mergedInputRef,
      style: name ? visuallyHiddenInput : visuallyHidden,
      tabIndex: -1,
      type: "checkbox",
      "aria-hidden": true,
      onChange(event) {
        if (event.nativeEvent.defaultPrevented) {
          return;
        }
        const nextChecked = event.target.checked;
        const details = createChangeEventDetails(none, event.nativeEvent);
        groupOnChange?.(nextChecked, details);
        onCheckedChange(nextChecked, details);
        if (details.isCanceled) {
          return;
        }
        setCheckedState(nextChecked);
        if (value && groupValue && setGroupValue && !parent) {
          const nextGroupValue = nextChecked ? [...groupValue, value] : groupValue.filter((item) => item !== value);
          setGroupValue(nextGroupValue, details);
        }
      },
      onFocus() {
        controlRef.current?.focus();
      }
    },
    // React <19 sets an empty value if `undefined` is passed explicitly
    // To avoid this, we only set the value if it's defined
    valueProp !== void 0 ? {
      value: (groupContext ? checked && valueProp : valueProp) || ""
    } : EMPTY_OBJECT,
    getDescriptionProps,
    groupContext ? validation.getValidationProps : validation.getInputValidationProps
  );
  const computedChecked = isGroupedWithParent ? Boolean(groupChecked) : checked;
  const computedIndeterminate = isGroupedWithParent ? groupIndeterminate || indeterminate : indeterminate;
  reactExports.useEffect(() => {
    if (parentContext && value) {
      parentContext.disabledStatesRef.current.set(value, disabled);
    }
  }, [parentContext, disabled, value]);
  const state = reactExports.useMemo(() => ({
    ...fieldState,
    checked: computedChecked,
    disabled,
    readOnly,
    required,
    indeterminate: computedIndeterminate
  }), [fieldState, computedChecked, disabled, readOnly, required, computedIndeterminate]);
  const stateAttributesMapping = useStateAttributesMapping(state);
  const element = useRenderElement("span", componentProps, {
    state,
    ref: [buttonRef, controlRef, forwardedRef, groupContext?.registerControlRef],
    props: [{
      id: nativeButton ? inputId ?? void 0 : id,
      role: "checkbox",
      "aria-checked": groupIndeterminate ? "mixed" : checked,
      "aria-readonly": readOnly || void 0,
      "aria-required": required || void 0,
      "aria-labelledby": labelId,
      [PARENT_CHECKBOX]: parent ? "" : void 0,
      onFocus() {
        setFocused(true);
      },
      onBlur() {
        const inputEl = inputRef.current;
        if (!inputEl) {
          return;
        }
        setTouched(true);
        setFocused(false);
        if (validationMode === "onBlur") {
          validation.commit(groupContext ? groupValue : inputEl.checked);
        }
      },
      onClick(event) {
        if (readOnly || disabled) {
          return;
        }
        event.preventDefault();
        inputRef.current?.click();
      }
    }, getDescriptionProps, validation.getValidationProps, elementProps, otherGroupProps, getButtonProps],
    stateAttributesMapping
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CheckboxRootContext.Provider, {
    value: state,
    children: [element, !checked && !groupContext && name && !parent && uncheckedValue !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
      type: "hidden",
      name,
      value: uncheckedValue
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("input", {
      ...inputProps
    })]
  });
});
const CheckboxIndicator = /* @__PURE__ */ reactExports.forwardRef(function CheckboxIndicator2(componentProps, forwardedRef) {
  const {
    render,
    className,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const rootState = useCheckboxRootContext();
  const rendered = rootState.checked || rootState.indeterminate;
  const {
    transitionStatus,
    setMounted
  } = useTransitionStatus(rendered);
  const indicatorRef = reactExports.useRef(null);
  const state = reactExports.useMemo(() => ({
    ...rootState,
    transitionStatus
  }), [rootState, transitionStatus]);
  useOpenChangeComplete({
    open: rendered,
    ref: indicatorRef,
    onComplete() {
      if (!rendered) {
        setMounted(false);
      }
    }
  });
  const baseStateAttributesMapping = useStateAttributesMapping(rootState);
  const stateAttributesMapping = reactExports.useMemo(() => ({
    ...baseStateAttributesMapping,
    ...transitionStatusMapping,
    ...fieldValidityMapping
  }), [baseStateAttributesMapping]);
  const shouldRender = keepMounted || rendered;
  const element = useRenderElement("span", componentProps, {
    enabled: shouldRender,
    ref: [forwardedRef, indicatorRef],
    state,
    stateAttributesMapping,
    props: elementProps
  });
  if (!shouldRender) {
    return null;
  }
  return element;
});
function Checkbox({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxRoot,
    {
      "data-slot": "checkbox",
      className: cn$1(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border shadow-xs transition-shadow group-has-disabled/field:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-[3px] peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CheckboxIndicator,
        {
          "data-slot": "checkbox-indicator",
          className: "[&>svg]:size-3.5 grid place-content-center text-current transition-none",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Check,
            {}
          )
        }
      )
    }
  );
}
const ScrollAreaRootContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useScrollAreaRootContext() {
  const context = reactExports.useContext(ScrollAreaRootContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(53));
  }
  return context;
}
let ScrollAreaRootCssVars = /* @__PURE__ */ (function(ScrollAreaRootCssVars2) {
  ScrollAreaRootCssVars2["scrollAreaCornerHeight"] = "--scroll-area-corner-height";
  ScrollAreaRootCssVars2["scrollAreaCornerWidth"] = "--scroll-area-corner-width";
  return ScrollAreaRootCssVars2;
})({});
const SCROLL_TIMEOUT = 500;
const MIN_THUMB_SIZE = 16;
function getOffset(element, prop, axis) {
  if (!element) {
    return 0;
  }
  const styles = getComputedStyle(element);
  const propAxis = axis === "x" ? "Inline" : "Block";
  if (axis === "x" && prop === "margin") {
    return parseFloat(styles[`${prop}InlineStart`]) * 2;
  }
  return parseFloat(styles[`${prop}${propAxis}Start`]) + parseFloat(styles[`${prop}${propAxis}End`]);
}
let ScrollAreaScrollbarDataAttributes = /* @__PURE__ */ (function(ScrollAreaScrollbarDataAttributes2) {
  ScrollAreaScrollbarDataAttributes2["orientation"] = "data-orientation";
  ScrollAreaScrollbarDataAttributes2["hovering"] = "data-hovering";
  ScrollAreaScrollbarDataAttributes2["scrolling"] = "data-scrolling";
  ScrollAreaScrollbarDataAttributes2["hasOverflowX"] = "data-has-overflow-x";
  ScrollAreaScrollbarDataAttributes2["hasOverflowY"] = "data-has-overflow-y";
  ScrollAreaScrollbarDataAttributes2["overflowXStart"] = "data-overflow-x-start";
  ScrollAreaScrollbarDataAttributes2["overflowXEnd"] = "data-overflow-x-end";
  ScrollAreaScrollbarDataAttributes2["overflowYStart"] = "data-overflow-y-start";
  ScrollAreaScrollbarDataAttributes2["overflowYEnd"] = "data-overflow-y-end";
  return ScrollAreaScrollbarDataAttributes2;
})({});
let ScrollAreaRootDataAttributes = /* @__PURE__ */ (function(ScrollAreaRootDataAttributes2) {
  ScrollAreaRootDataAttributes2["hasOverflowX"] = "data-has-overflow-x";
  ScrollAreaRootDataAttributes2["hasOverflowY"] = "data-has-overflow-y";
  ScrollAreaRootDataAttributes2["overflowXStart"] = "data-overflow-x-start";
  ScrollAreaRootDataAttributes2["overflowXEnd"] = "data-overflow-x-end";
  ScrollAreaRootDataAttributes2["overflowYStart"] = "data-overflow-y-start";
  ScrollAreaRootDataAttributes2["overflowYEnd"] = "data-overflow-y-end";
  return ScrollAreaRootDataAttributes2;
})({});
const scrollAreaStateAttributesMapping = {
  hasOverflowX: (value) => value ? {
    [ScrollAreaRootDataAttributes.hasOverflowX]: ""
  } : null,
  hasOverflowY: (value) => value ? {
    [ScrollAreaRootDataAttributes.hasOverflowY]: ""
  } : null,
  overflowXStart: (value) => value ? {
    [ScrollAreaRootDataAttributes.overflowXStart]: ""
  } : null,
  overflowXEnd: (value) => value ? {
    [ScrollAreaRootDataAttributes.overflowXEnd]: ""
  } : null,
  overflowYStart: (value) => value ? {
    [ScrollAreaRootDataAttributes.overflowYStart]: ""
  } : null,
  overflowYEnd: (value) => value ? {
    [ScrollAreaRootDataAttributes.overflowYEnd]: ""
  } : null,
  cornerHidden: () => null
};
const DEFAULT_COORDS = {
  x: 0,
  y: 0
};
const DEFAULT_SIZE = {
  width: 0,
  height: 0
};
const DEFAULT_OVERFLOW_EDGES = {
  xStart: false,
  xEnd: false,
  yStart: false,
  yEnd: false
};
const DEFAULT_HIDDEN_STATE = {
  x: false,
  y: false,
  corner: false
};
const ScrollAreaRoot = /* @__PURE__ */ reactExports.forwardRef(function ScrollAreaRoot2(componentProps, forwardedRef) {
  const {
    render,
    className,
    overflowEdgeThreshold: overflowEdgeThresholdProp,
    ...elementProps
  } = componentProps;
  const overflowEdgeThreshold = normalizeOverflowEdgeThreshold(overflowEdgeThresholdProp);
  const rootId = useBaseUiId();
  const scrollYTimeout = useTimeout();
  const scrollXTimeout = useTimeout();
  const {
    nonce,
    disableStyleElements
  } = useCSPContext();
  const [hovering, setHovering] = reactExports.useState(false);
  const [scrollingX, setScrollingX] = reactExports.useState(false);
  const [scrollingY, setScrollingY] = reactExports.useState(false);
  const [touchModality, setTouchModality] = reactExports.useState(false);
  const [cornerSize, setCornerSize] = reactExports.useState(DEFAULT_SIZE);
  const [thumbSize, setThumbSize] = reactExports.useState(DEFAULT_SIZE);
  const [overflowEdges, setOverflowEdges] = reactExports.useState(DEFAULT_OVERFLOW_EDGES);
  const [hiddenState, setHiddenState] = reactExports.useState(DEFAULT_HIDDEN_STATE);
  const rootRef = reactExports.useRef(null);
  const viewportRef = reactExports.useRef(null);
  const scrollbarYRef = reactExports.useRef(null);
  const scrollbarXRef = reactExports.useRef(null);
  const thumbYRef = reactExports.useRef(null);
  const thumbXRef = reactExports.useRef(null);
  const cornerRef = reactExports.useRef(null);
  const thumbDraggingRef = reactExports.useRef(false);
  const startYRef = reactExports.useRef(0);
  const startXRef = reactExports.useRef(0);
  const startScrollTopRef = reactExports.useRef(0);
  const startScrollLeftRef = reactExports.useRef(0);
  const currentOrientationRef = reactExports.useRef("vertical");
  const scrollPositionRef = reactExports.useRef(DEFAULT_COORDS);
  const handleScroll = useStableCallback((scrollPosition) => {
    const offsetX = scrollPosition.x - scrollPositionRef.current.x;
    const offsetY = scrollPosition.y - scrollPositionRef.current.y;
    scrollPositionRef.current = scrollPosition;
    if (offsetY !== 0) {
      setScrollingY(true);
      scrollYTimeout.start(SCROLL_TIMEOUT, () => {
        setScrollingY(false);
      });
    }
    if (offsetX !== 0) {
      setScrollingX(true);
      scrollXTimeout.start(SCROLL_TIMEOUT, () => {
        setScrollingX(false);
      });
    }
  });
  const handlePointerDown = useStableCallback((event) => {
    if (event.button !== 0) {
      return;
    }
    thumbDraggingRef.current = true;
    startYRef.current = event.clientY;
    startXRef.current = event.clientX;
    currentOrientationRef.current = event.currentTarget.getAttribute(ScrollAreaScrollbarDataAttributes.orientation);
    if (viewportRef.current) {
      startScrollTopRef.current = viewportRef.current.scrollTop;
      startScrollLeftRef.current = viewportRef.current.scrollLeft;
    }
    if (thumbYRef.current && currentOrientationRef.current === "vertical") {
      thumbYRef.current.setPointerCapture(event.pointerId);
    }
    if (thumbXRef.current && currentOrientationRef.current === "horizontal") {
      thumbXRef.current.setPointerCapture(event.pointerId);
    }
  });
  const handlePointerMove = useStableCallback((event) => {
    if (!thumbDraggingRef.current) {
      return;
    }
    const deltaY = event.clientY - startYRef.current;
    const deltaX = event.clientX - startXRef.current;
    if (viewportRef.current) {
      const scrollableContentHeight = viewportRef.current.scrollHeight;
      const viewportHeight = viewportRef.current.clientHeight;
      const scrollableContentWidth = viewportRef.current.scrollWidth;
      const viewportWidth = viewportRef.current.clientWidth;
      if (thumbYRef.current && scrollbarYRef.current && currentOrientationRef.current === "vertical") {
        const scrollbarYOffset = getOffset(scrollbarYRef.current, "padding", "y");
        const thumbYOffset = getOffset(thumbYRef.current, "margin", "y");
        const thumbHeight = thumbYRef.current.offsetHeight;
        const maxThumbOffsetY = scrollbarYRef.current.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset;
        const scrollRatioY = deltaY / maxThumbOffsetY;
        viewportRef.current.scrollTop = startScrollTopRef.current + scrollRatioY * (scrollableContentHeight - viewportHeight);
        event.preventDefault();
        setScrollingY(true);
        scrollYTimeout.start(SCROLL_TIMEOUT, () => {
          setScrollingY(false);
        });
      }
      if (thumbXRef.current && scrollbarXRef.current && currentOrientationRef.current === "horizontal") {
        const scrollbarXOffset = getOffset(scrollbarXRef.current, "padding", "x");
        const thumbXOffset = getOffset(thumbXRef.current, "margin", "x");
        const thumbWidth = thumbXRef.current.offsetWidth;
        const maxThumbOffsetX = scrollbarXRef.current.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset;
        const scrollRatioX = deltaX / maxThumbOffsetX;
        viewportRef.current.scrollLeft = startScrollLeftRef.current + scrollRatioX * (scrollableContentWidth - viewportWidth);
        event.preventDefault();
        setScrollingX(true);
        scrollXTimeout.start(SCROLL_TIMEOUT, () => {
          setScrollingX(false);
        });
      }
    }
  });
  const handlePointerUp = useStableCallback((event) => {
    thumbDraggingRef.current = false;
    if (thumbYRef.current && currentOrientationRef.current === "vertical") {
      thumbYRef.current.releasePointerCapture(event.pointerId);
    }
    if (thumbXRef.current && currentOrientationRef.current === "horizontal") {
      thumbXRef.current.releasePointerCapture(event.pointerId);
    }
  });
  function handleTouchModalityChange(event) {
    setTouchModality(event.pointerType === "touch");
  }
  function handlePointerEnterOrMove(event) {
    handleTouchModalityChange(event);
    if (event.pointerType !== "touch") {
      const isTargetRootChild = contains(rootRef.current, event.target);
      setHovering(isTargetRootChild);
    }
  }
  const state = reactExports.useMemo(() => ({
    hasOverflowX: !hiddenState.x,
    hasOverflowY: !hiddenState.y,
    overflowXStart: overflowEdges.xStart,
    overflowXEnd: overflowEdges.xEnd,
    overflowYStart: overflowEdges.yStart,
    overflowYEnd: overflowEdges.yEnd,
    cornerHidden: hiddenState.corner
  }), [hiddenState.x, hiddenState.y, hiddenState.corner, overflowEdges]);
  const props = {
    role: "presentation",
    onPointerEnter: handlePointerEnterOrMove,
    onPointerMove: handlePointerEnterOrMove,
    onPointerDown: handleTouchModalityChange,
    onPointerLeave() {
      setHovering(false);
    },
    style: {
      position: "relative",
      [ScrollAreaRootCssVars.scrollAreaCornerHeight]: `${cornerSize.height}px`,
      [ScrollAreaRootCssVars.scrollAreaCornerWidth]: `${cornerSize.width}px`
    }
  };
  const element = useRenderElement("div", componentProps, {
    state,
    ref: [forwardedRef, rootRef],
    props: [props, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping
  });
  const contextValue = reactExports.useMemo(() => ({
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleScroll,
    cornerSize,
    setCornerSize,
    thumbSize,
    setThumbSize,
    touchModality,
    cornerRef,
    scrollingX,
    setScrollingX,
    scrollingY,
    setScrollingY,
    hovering,
    setHovering,
    viewportRef,
    rootRef,
    scrollbarYRef,
    scrollbarXRef,
    thumbYRef,
    thumbXRef,
    rootId,
    hiddenState,
    setHiddenState,
    overflowEdges,
    setOverflowEdges,
    viewportState: state,
    overflowEdgeThreshold
  }), [handlePointerDown, handlePointerMove, handlePointerUp, handleScroll, cornerSize, thumbSize, touchModality, scrollingX, setScrollingX, scrollingY, setScrollingY, hovering, setHovering, rootId, hiddenState, overflowEdges, state, overflowEdgeThreshold]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ScrollAreaRootContext.Provider, {
    value: contextValue,
    children: [!disableStyleElements && styleDisableScrollbar.getElement(nonce), element]
  });
});
function normalizeOverflowEdgeThreshold(threshold) {
  if (typeof threshold === "number") {
    const value = Math.max(0, threshold);
    return {
      xStart: value,
      xEnd: value,
      yStart: value,
      yEnd: value
    };
  }
  return {
    xStart: Math.max(0, threshold?.xStart || 0),
    xEnd: Math.max(0, threshold?.xEnd || 0),
    yStart: Math.max(0, threshold?.yStart || 0),
    yEnd: Math.max(0, threshold?.yEnd || 0)
  };
}
const ScrollAreaViewportContext = /* @__PURE__ */ reactExports.createContext(void 0);
function onVisible(element, callback) {
  if (typeof IntersectionObserver === "undefined") {
    return () => {
    };
  }
  const observer = new IntersectionObserver((entries2) => {
    entries2.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        callback();
        observer.disconnect();
      }
    });
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
}
let ScrollAreaViewportCssVars = /* @__PURE__ */ (function(ScrollAreaViewportCssVars2) {
  ScrollAreaViewportCssVars2["scrollAreaOverflowXStart"] = "--scroll-area-overflow-x-start";
  ScrollAreaViewportCssVars2["scrollAreaOverflowXEnd"] = "--scroll-area-overflow-x-end";
  ScrollAreaViewportCssVars2["scrollAreaOverflowYStart"] = "--scroll-area-overflow-y-start";
  ScrollAreaViewportCssVars2["scrollAreaOverflowYEnd"] = "--scroll-area-overflow-y-end";
  return ScrollAreaViewportCssVars2;
})({});
let scrollAreaOverflowVarsRegistered = false;
function removeCSSVariableInheritance() {
  if (scrollAreaOverflowVarsRegistered || // When `inherits: false`, specifying `inherit` on child elements doesn't work
  // in Safari. To let CSS features work correctly, this optimization must be skipped.
  isWebKit) {
    return;
  }
  if (typeof CSS !== "undefined" && "registerProperty" in CSS) {
    [ScrollAreaViewportCssVars.scrollAreaOverflowXStart, ScrollAreaViewportCssVars.scrollAreaOverflowXEnd, ScrollAreaViewportCssVars.scrollAreaOverflowYStart, ScrollAreaViewportCssVars.scrollAreaOverflowYEnd].forEach((name) => {
      try {
        CSS.registerProperty({
          name,
          syntax: "<length>",
          inherits: false,
          initialValue: "0px"
        });
      } catch {
      }
    });
  }
  scrollAreaOverflowVarsRegistered = true;
}
const ScrollAreaViewport = /* @__PURE__ */ reactExports.forwardRef(function ScrollAreaViewport2(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    viewportRef,
    scrollbarYRef,
    scrollbarXRef,
    thumbYRef,
    thumbXRef,
    cornerRef,
    cornerSize,
    setCornerSize,
    setThumbSize,
    rootId,
    setHiddenState,
    hiddenState,
    handleScroll,
    setHovering,
    setOverflowEdges,
    overflowEdges,
    overflowEdgeThreshold
  } = useScrollAreaRootContext();
  const direction = useDirection();
  const programmaticScrollRef = reactExports.useRef(true);
  const scrollEndTimeout = useTimeout();
  const waitForAnimationsTimeout = useTimeout();
  const computeThumbPosition = useStableCallback(() => {
    const viewportEl = viewportRef.current;
    const scrollbarYEl = scrollbarYRef.current;
    const scrollbarXEl = scrollbarXRef.current;
    const thumbYEl = thumbYRef.current;
    const thumbXEl = thumbXRef.current;
    const cornerEl = cornerRef.current;
    if (!viewportEl) {
      return;
    }
    const scrollableContentHeight = viewportEl.scrollHeight;
    const scrollableContentWidth = viewportEl.scrollWidth;
    const viewportHeight = viewportEl.clientHeight;
    const viewportWidth = viewportEl.clientWidth;
    const scrollTop = viewportEl.scrollTop;
    const scrollLeft = viewportEl.scrollLeft;
    if (scrollableContentHeight === 0 || scrollableContentWidth === 0) {
      return;
    }
    const scrollbarYHidden = viewportHeight >= scrollableContentHeight;
    const scrollbarXHidden = viewportWidth >= scrollableContentWidth;
    const ratioX = viewportWidth / scrollableContentWidth;
    const ratioY = viewportHeight / scrollableContentHeight;
    const maxScrollLeft = Math.max(0, scrollableContentWidth - viewportWidth);
    const maxScrollTop = Math.max(0, scrollableContentHeight - viewportHeight);
    let scrollLeftFromStart = 0;
    let scrollLeftFromEnd = 0;
    if (!scrollbarXHidden) {
      if (direction === "rtl") {
        scrollLeftFromStart = clamp(-scrollLeft, 0, maxScrollLeft);
      } else {
        scrollLeftFromStart = clamp(scrollLeft, 0, maxScrollLeft);
      }
      scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart;
    }
    const scrollTopFromStart = !scrollbarYHidden ? clamp(scrollTop, 0, maxScrollTop) : 0;
    const scrollTopFromEnd = !scrollbarYHidden ? maxScrollTop - scrollTopFromStart : 0;
    const nextWidth = scrollbarXHidden ? 0 : viewportWidth;
    const nextHeight = scrollbarYHidden ? 0 : viewportHeight;
    let nextCornerWidth = 0;
    let nextCornerHeight = 0;
    if (!scrollbarXHidden && !scrollbarYHidden) {
      nextCornerWidth = scrollbarYEl?.offsetWidth || 0;
      nextCornerHeight = scrollbarXEl?.offsetHeight || 0;
    }
    const cornerNotYetSized = cornerSize.width === 0 && cornerSize.height === 0;
    const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0;
    const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0;
    const scrollbarXOffset = getOffset(scrollbarXEl, "padding", "x");
    const scrollbarYOffset = getOffset(scrollbarYEl, "padding", "y");
    const thumbXOffset = getOffset(thumbXEl, "margin", "x");
    const thumbYOffset = getOffset(thumbYEl, "margin", "y");
    const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset;
    const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset;
    const maxNextWidth = scrollbarXEl ? Math.min(scrollbarXEl.offsetWidth - cornerWidthOffset, idealNextWidth) : idealNextWidth;
    const maxNextHeight = scrollbarYEl ? Math.min(scrollbarYEl.offsetHeight - cornerHeightOffset, idealNextHeight) : idealNextHeight;
    const clampedNextWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX);
    const clampedNextHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY);
    setThumbSize((prevSize) => {
      if (prevSize.height === clampedNextHeight && prevSize.width === clampedNextWidth) {
        return prevSize;
      }
      return {
        width: clampedNextWidth,
        height: clampedNextHeight
      };
    });
    if (scrollbarYEl && thumbYEl) {
      const maxThumbOffsetY = scrollbarYEl.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset;
      const scrollRangeY = scrollableContentHeight - viewportHeight;
      const scrollRatioY = scrollRangeY === 0 ? 0 : scrollTop / scrollRangeY;
      const thumbOffsetY = Math.min(maxThumbOffsetY, Math.max(0, scrollRatioY * maxThumbOffsetY));
      thumbYEl.style.transform = `translate3d(0,${thumbOffsetY}px,0)`;
    }
    if (scrollbarXEl && thumbXEl) {
      const maxThumbOffsetX = scrollbarXEl.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset;
      const scrollRangeX = scrollableContentWidth - viewportWidth;
      const scrollRatioX = scrollRangeX === 0 ? 0 : scrollLeft / scrollRangeX;
      const thumbOffsetX = direction === "rtl" ? clamp(scrollRatioX * maxThumbOffsetX, -maxThumbOffsetX, 0) : clamp(scrollRatioX * maxThumbOffsetX, 0, maxThumbOffsetX);
      thumbXEl.style.transform = `translate3d(${thumbOffsetX}px,0,0)`;
    }
    const clampedScrollLeftStart = clamp(scrollLeftFromStart, 0, maxScrollLeft);
    const clampedScrollLeftEnd = clamp(scrollLeftFromEnd, 0, maxScrollLeft);
    const clampedScrollTopStart = clamp(scrollTopFromStart, 0, maxScrollTop);
    const clampedScrollTopEnd = clamp(scrollTopFromEnd, 0, maxScrollTop);
    const overflowMetricsPx = [[ScrollAreaViewportCssVars.scrollAreaOverflowXStart, clampedScrollLeftStart], [ScrollAreaViewportCssVars.scrollAreaOverflowXEnd, clampedScrollLeftEnd], [ScrollAreaViewportCssVars.scrollAreaOverflowYStart, clampedScrollTopStart], [ScrollAreaViewportCssVars.scrollAreaOverflowYEnd, clampedScrollTopEnd]];
    for (const [cssVar, value] of overflowMetricsPx) {
      viewportEl.style.setProperty(cssVar, `${value}px`);
    }
    if (cornerEl) {
      if (scrollbarXHidden || scrollbarYHidden) {
        setCornerSize({
          width: 0,
          height: 0
        });
      } else if (!scrollbarXHidden && !scrollbarYHidden) {
        setCornerSize({
          width: nextCornerWidth,
          height: nextCornerHeight
        });
      }
    }
    setHiddenState((prevState) => {
      const cornerHidden = scrollbarYHidden || scrollbarXHidden;
      if (prevState.y === scrollbarYHidden && prevState.x === scrollbarXHidden && prevState.corner === cornerHidden) {
        return prevState;
      }
      return {
        y: scrollbarYHidden,
        x: scrollbarXHidden,
        corner: cornerHidden
      };
    });
    const nextOverflowEdges = {
      xStart: !scrollbarXHidden && clampedScrollLeftStart > overflowEdgeThreshold.xStart,
      xEnd: !scrollbarXHidden && clampedScrollLeftEnd > overflowEdgeThreshold.xEnd,
      yStart: !scrollbarYHidden && clampedScrollTopStart > overflowEdgeThreshold.yStart,
      yEnd: !scrollbarYHidden && clampedScrollTopEnd > overflowEdgeThreshold.yEnd
    };
    setOverflowEdges((prev) => {
      if (prev.xStart === nextOverflowEdges.xStart && prev.xEnd === nextOverflowEdges.xEnd && prev.yStart === nextOverflowEdges.yStart && prev.yEnd === nextOverflowEdges.yEnd) {
        return prev;
      }
      return nextOverflowEdges;
    });
  });
  useIsoLayoutEffect(() => {
    if (!viewportRef.current) {
      return void 0;
    }
    removeCSSVariableInheritance();
    let hasInitialized = false;
    return onVisible(viewportRef.current, () => {
      if (!hasInitialized) {
        hasInitialized = true;
        return;
      }
      computeThumbPosition();
    });
  }, [computeThumbPosition, viewportRef]);
  useIsoLayoutEffect(() => {
    queueMicrotask(computeThumbPosition);
  }, [computeThumbPosition, hiddenState, direction]);
  useIsoLayoutEffect(() => {
    if (viewportRef.current?.matches(":hover")) {
      setHovering(true);
    }
  }, [viewportRef, setHovering]);
  reactExports.useEffect(() => {
    const viewport = viewportRef.current;
    if (typeof ResizeObserver === "undefined" || !viewport) {
      return void 0;
    }
    let hasInitialized = false;
    const ro = new ResizeObserver(() => {
      if (!hasInitialized) {
        hasInitialized = true;
        return;
      }
      computeThumbPosition();
    });
    ro.observe(viewport);
    waitForAnimationsTimeout.start(0, () => {
      const animations = viewport.getAnimations({
        subtree: true
      });
      if (animations.length === 0) {
        return;
      }
      Promise.all(animations.map((animation) => animation.finished)).then(computeThumbPosition).catch(() => {
      });
    });
    return () => {
      ro.disconnect();
      waitForAnimationsTimeout.clear();
    };
  }, [computeThumbPosition, viewportRef, waitForAnimationsTimeout]);
  function handleUserInteraction() {
    programmaticScrollRef.current = false;
  }
  const props = {
    role: "presentation",
    ...rootId && {
      "data-id": `${rootId}-viewport`
    },
    // https://accessibilityinsights.io/info-examples/web/scrollable-region-focusable/
    ...(!hiddenState.x || !hiddenState.y) && {
      tabIndex: 0
    },
    className: styleDisableScrollbar.className,
    style: {
      overflow: "scroll"
    },
    onScroll() {
      if (!viewportRef.current) {
        return;
      }
      computeThumbPosition();
      if (!programmaticScrollRef.current) {
        handleScroll({
          x: viewportRef.current.scrollLeft,
          y: viewportRef.current.scrollTop
        });
      }
      scrollEndTimeout.start(100, () => {
        programmaticScrollRef.current = true;
      });
    },
    onWheel: handleUserInteraction,
    onTouchMove: handleUserInteraction,
    onPointerMove: handleUserInteraction,
    onPointerEnter: handleUserInteraction,
    onKeyDown: handleUserInteraction
  };
  const viewportState = reactExports.useMemo(() => ({
    hasOverflowX: !hiddenState.x,
    hasOverflowY: !hiddenState.y,
    overflowXStart: overflowEdges.xStart,
    overflowXEnd: overflowEdges.xEnd,
    overflowYStart: overflowEdges.yStart,
    overflowYEnd: overflowEdges.yEnd,
    cornerHidden: hiddenState.corner
  }), [hiddenState.x, hiddenState.y, hiddenState.corner, overflowEdges]);
  const element = useRenderElement("div", componentProps, {
    ref: [forwardedRef, viewportRef],
    state: viewportState,
    props: [props, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping
  });
  const contextValue = reactExports.useMemo(() => ({
    computeThumbPosition
  }), [computeThumbPosition]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaViewportContext.Provider, {
    value: contextValue,
    children: element
  });
});
const ScrollAreaScrollbarContext = /* @__PURE__ */ reactExports.createContext(void 0);
function useScrollAreaScrollbarContext() {
  const context = reactExports.useContext(ScrollAreaScrollbarContext);
  if (context === void 0) {
    throw new Error(formatErrorMessage(54));
  }
  return context;
}
let ScrollAreaScrollbarCssVars = /* @__PURE__ */ (function(ScrollAreaScrollbarCssVars2) {
  ScrollAreaScrollbarCssVars2["scrollAreaThumbHeight"] = "--scroll-area-thumb-height";
  ScrollAreaScrollbarCssVars2["scrollAreaThumbWidth"] = "--scroll-area-thumb-width";
  return ScrollAreaScrollbarCssVars2;
})({});
const ScrollAreaScrollbar = /* @__PURE__ */ reactExports.forwardRef(function ScrollAreaScrollbar2(componentProps, forwardedRef) {
  const {
    render,
    className,
    orientation = "vertical",
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    hovering,
    scrollingX,
    scrollingY,
    hiddenState,
    overflowEdges,
    scrollbarYRef,
    scrollbarXRef,
    viewportRef,
    thumbYRef,
    thumbXRef,
    handlePointerDown,
    handlePointerUp,
    rootId,
    thumbSize
  } = useScrollAreaRootContext();
  const state = reactExports.useMemo(() => ({
    hovering,
    scrolling: {
      horizontal: scrollingX,
      vertical: scrollingY
    }[orientation],
    orientation,
    hasOverflowX: !hiddenState.x,
    hasOverflowY: !hiddenState.y,
    overflowXStart: overflowEdges.xStart,
    overflowXEnd: overflowEdges.xEnd,
    overflowYStart: overflowEdges.yStart,
    overflowYEnd: overflowEdges.yEnd,
    cornerHidden: hiddenState.corner
  }), [hovering, scrollingX, scrollingY, orientation, hiddenState, overflowEdges]);
  const direction = useDirection();
  reactExports.useEffect(() => {
    const viewportEl = viewportRef.current;
    const scrollbarEl = orientation === "vertical" ? scrollbarYRef.current : scrollbarXRef.current;
    if (!scrollbarEl) {
      return void 0;
    }
    function handleWheel(event) {
      if (!viewportEl || !scrollbarEl || event.ctrlKey) {
        return;
      }
      event.preventDefault();
      if (orientation === "vertical") {
        if (viewportEl.scrollTop === 0 && event.deltaY < 0) {
          return;
        }
      } else if (viewportEl.scrollLeft === 0 && event.deltaX < 0) {
        return;
      }
      if (orientation === "vertical") {
        if (viewportEl.scrollTop === viewportEl.scrollHeight - viewportEl.clientHeight && event.deltaY > 0) {
          return;
        }
      } else if (viewportEl.scrollLeft === viewportEl.scrollWidth - viewportEl.clientWidth && event.deltaX > 0) {
        return;
      }
      if (orientation === "vertical") {
        viewportEl.scrollTop += event.deltaY;
      } else {
        viewportEl.scrollLeft += event.deltaX;
      }
    }
    scrollbarEl.addEventListener("wheel", handleWheel, {
      passive: false
    });
    return () => {
      scrollbarEl.removeEventListener("wheel", handleWheel);
    };
  }, [orientation, scrollbarXRef, scrollbarYRef, viewportRef]);
  const props = {
    ...rootId && {
      "data-id": `${rootId}-scrollbar`
    },
    onPointerDown(event) {
      if (event.button !== 0) {
        return;
      }
      if (event.currentTarget !== event.target) {
        return;
      }
      if (!viewportRef.current) {
        return;
      }
      if (thumbYRef.current && scrollbarYRef.current && orientation === "vertical") {
        const thumbYOffset = getOffset(thumbYRef.current, "margin", "y");
        const scrollbarYOffset = getOffset(scrollbarYRef.current, "padding", "y");
        const thumbHeight = thumbYRef.current.offsetHeight;
        const trackRectY = scrollbarYRef.current.getBoundingClientRect();
        const clickY = event.clientY - trackRectY.top - thumbHeight / 2 - scrollbarYOffset + thumbYOffset / 2;
        const scrollableContentHeight = viewportRef.current.scrollHeight;
        const viewportHeight = viewportRef.current.clientHeight;
        const maxThumbOffsetY = scrollbarYRef.current.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset;
        const scrollRatioY = clickY / maxThumbOffsetY;
        const newScrollTop = scrollRatioY * (scrollableContentHeight - viewportHeight);
        viewportRef.current.scrollTop = newScrollTop;
      }
      if (thumbXRef.current && scrollbarXRef.current && orientation === "horizontal") {
        const thumbXOffset = getOffset(thumbXRef.current, "margin", "x");
        const scrollbarXOffset = getOffset(scrollbarXRef.current, "padding", "x");
        const thumbWidth = thumbXRef.current.offsetWidth;
        const trackRectX = scrollbarXRef.current.getBoundingClientRect();
        const clickX = event.clientX - trackRectX.left - thumbWidth / 2 - scrollbarXOffset + thumbXOffset / 2;
        const scrollableContentWidth = viewportRef.current.scrollWidth;
        const viewportWidth = viewportRef.current.clientWidth;
        const maxThumbOffsetX = scrollbarXRef.current.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset;
        const scrollRatioX = clickX / maxThumbOffsetX;
        let newScrollLeft;
        if (direction === "rtl") {
          newScrollLeft = (1 - scrollRatioX) * (scrollableContentWidth - viewportWidth);
          if (viewportRef.current.scrollLeft <= 0) {
            newScrollLeft = -newScrollLeft;
          }
        } else {
          newScrollLeft = scrollRatioX * (scrollableContentWidth - viewportWidth);
        }
        viewportRef.current.scrollLeft = newScrollLeft;
      }
      handlePointerDown(event);
    },
    onPointerUp: handlePointerUp,
    style: {
      position: "absolute",
      touchAction: "none",
      WebkitUserSelect: "none",
      userSelect: "none",
      ...orientation === "vertical" && {
        top: 0,
        bottom: `var(${ScrollAreaRootCssVars.scrollAreaCornerHeight})`,
        insetInlineEnd: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbHeight]: `${thumbSize.height}px`
      },
      ...orientation === "horizontal" && {
        insetInlineStart: 0,
        insetInlineEnd: `var(${ScrollAreaRootCssVars.scrollAreaCornerWidth})`,
        bottom: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbWidth]: `${thumbSize.width}px`
      }
    }
  };
  const element = useRenderElement("div", componentProps, {
    ref: [forwardedRef, orientation === "vertical" ? scrollbarYRef : scrollbarXRef],
    state,
    props: [props, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping
  });
  const contextValue = reactExports.useMemo(() => ({
    orientation
  }), [orientation]);
  const isHidden = orientation === "vertical" ? hiddenState.y : hiddenState.x;
  const shouldRender = keepMounted || !isHidden;
  if (!shouldRender) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarContext.Provider, {
    value: contextValue,
    children: element
  });
});
const ScrollAreaThumb = /* @__PURE__ */ reactExports.forwardRef(function ScrollAreaThumb2(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    thumbYRef,
    thumbXRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    setScrollingX,
    setScrollingY
  } = useScrollAreaRootContext();
  const {
    orientation
  } = useScrollAreaScrollbarContext();
  const state = reactExports.useMemo(() => ({
    orientation
  }), [orientation]);
  const element = useRenderElement("div", componentProps, {
    ref: [forwardedRef, orientation === "vertical" ? thumbYRef : thumbXRef],
    state,
    props: [{
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp(event) {
        if (orientation === "vertical") {
          setScrollingY(false);
        }
        if (orientation === "horizontal") {
          setScrollingX(false);
        }
        handlePointerUp(event);
      },
      style: {
        ...orientation === "vertical" && {
          height: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbHeight})`
        },
        ...orientation === "horizontal" && {
          width: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbWidth})`
        }
      }
    }, elementProps]
  });
  return element;
});
const ScrollAreaCorner = /* @__PURE__ */ reactExports.forwardRef(function ScrollAreaCorner2(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    cornerRef,
    cornerSize,
    hiddenState
  } = useScrollAreaRootContext();
  const element = useRenderElement("div", componentProps, {
    ref: [forwardedRef, cornerRef],
    props: [{
      style: {
        position: "absolute",
        bottom: 0,
        insetInlineEnd: 0,
        width: cornerSize.width,
        height: cornerSize.height
      }
    }, elementProps]
  });
  if (hiddenState.corner) {
    return null;
  }
  return element;
});
function ScrollArea({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ScrollAreaRoot,
    {
      "data-slot": "scroll-area",
      className: cn$1("relative", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ScrollAreaViewport,
          {
            "data-slot": "scroll-area-viewport",
            className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            children
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaCorner, {})
      ]
    }
  );
}
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbar,
    {
      "data-slot": "scroll-area-scrollbar",
      "data-orientation": orientation,
      orientation,
      className: cn$1(
        "data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent flex touch-none p-px transition-colors select-none",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScrollAreaThumb,
        {
          "data-slot": "scroll-area-thumb",
          className: "rounded-full bg-border relative flex-1"
        }
      )
    }
  );
}
function getStatusIcon$1(status) {
  switch (status) {
    case "installed_correct":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-green-600" });
    case "installed_wrong":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-yellow-600" });
    case "not_installed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-4 text-red-600" });
    case "unresolved":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-4 text-muted-foreground" });
  }
}
function getStatusLabel$1(status) {
  switch (status) {
    case "installed_correct":
      return "Installed";
    case "installed_wrong":
      return "Wrong version";
    case "not_installed":
      return "Not installed";
    case "unresolved":
      return "Not found";
  }
}
function getStatusVariant(status) {
  switch (status) {
    case "installed_correct":
      return "secondary";
    case "installed_wrong":
      return "outline";
    case "not_installed":
      return "destructive";
    case "unresolved":
      return "outline";
  }
}
const DependencyDownloadDialog = reactExports.memo(function DependencyDownloadDialog2({ mod, requestedVersion, open, onOpenChange }) {
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame);
  const installedModsByGame = useModManagementStore((s) => s.installedModsByGame);
  const setDependencyWarnings = useModManagementStore((s) => s.setDependencyWarnings);
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions);
  const startDownload = useDownloadStore((s) => s.startDownload);
  const [selectedDepIds, setSelectedDepIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [forceRefresh, setForceRefresh] = reactExports.useState(0);
  const [viewingMod, setViewingMod] = reactExports.useState(null);
  const [showModDialog, setShowModDialog] = reactExports.useState(false);
  const depInfos = reactExports.useMemo(() => {
    if (!mod) return [];
    const installedVersions = installedVersionsByGame[mod.gameId] || {};
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions
    });
  }, [mod, installedVersionsByGame, enforceDependencyVersions, forceRefresh]);
  const selectableDeps = reactExports.useMemo(() => {
    return depInfos.filter(
      (dep) => dep.resolvedMod && (dep.status === "not_installed" || dep.status === "installed_wrong")
    ).map((dep) => dep.resolvedMod.id);
  }, [depInfos]);
  reactExports.useEffect(() => {
    if (!mod || !open) return;
    setSelectedDepIds(new Set(selectableDeps));
  }, [mod, open, selectableDeps]);
  if (!mod) {
    return null;
  }
  const handleToggleDep = (depId) => {
    const newSet = new Set(selectedDepIds);
    if (newSet.has(depId)) {
      newSet.delete(depId);
    } else {
      newSet.add(depId);
    }
    setSelectedDepIds(newSet);
  };
  const handleSelectAll = () => {
    setSelectedDepIds(new Set(selectableDeps));
  };
  const handleDeselectAll = () => {
    setSelectedDepIds(/* @__PURE__ */ new Set());
  };
  const handleRefresh = () => {
    setForceRefresh((prev) => prev + 1);
  };
  const handleViewMod = (depMod) => {
    setViewingMod(depMod);
    setShowModDialog(true);
  };
  const isAllSelected = selectableDeps.length > 0 && selectedDepIds.size === selectableDeps.length;
  const isSomeSelected = selectedDepIds.size > 0 && selectedDepIds.size < selectableDeps.length;
  const handleDownloadModOnly = () => {
    const installed = installedModsByGame[mod.gameId];
    const isTargetInstalled = installed ? installed.has(mod.id) : false;
    if (!isTargetInstalled) {
      startDownload(mod.id, mod.gameId, mod.name, requestedVersion, mod.author, mod.iconUrl);
    }
    const unresolvedDeps = depInfos.filter((dep) => dep.status === "unresolved").map((dep) => dep.parsed.fullString);
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(mod.gameId, mod.id, unresolvedDeps);
    }
    onOpenChange(false);
  };
  const handleDownloadSelected = () => {
    const installed = installedModsByGame[mod.gameId];
    const isTargetInstalled = installed ? installed.has(mod.id) : false;
    if (!isTargetInstalled) {
      startDownload(mod.id, mod.gameId, mod.name, requestedVersion, mod.author, mod.iconUrl);
    }
    selectedDepIds.forEach((depId) => {
      const depInfo = depInfos.find((d) => d.resolvedMod?.id === depId);
      if (depInfo && depInfo.resolvedMod) {
        const depMod = depInfo.resolvedMod;
        startDownload(depMod.id, depMod.gameId, depMod.name, depMod.version, depMod.author, depMod.iconUrl);
      }
    });
    const unresolvedDeps = depInfos.filter((dep) => dep.status === "unresolved").map((dep) => dep.parsed.fullString);
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(mod.gameId, mod.id, unresolvedDeps);
    }
    onOpenChange(false);
  };
  const handleCancel = () => {
    onOpenChange(false);
  };
  const targetInstalled = installedModsByGame[mod.gameId]?.has(mod.id) || false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DependencyModDialog,
      {
        mod: viewingMod,
        open: showModDialog,
        onOpenChange: setShowModDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] flex flex-col p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "px-6 pt-6 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Download Dependencies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          mod.name,
          " requires the following dependencies. Select which ones to download."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 overflow-y-auto px-6", style: { maxHeight: "calc(85vh - 180px)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold", children: "Target Mod" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-muted/30 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: true,
                disabled: true,
                className: "mt-0.5"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: mod.name }),
                targetInstalled && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3 mr-1" }),
                  "Installed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "v",
                requestedVersion,
                " by ",
                mod.author
              ] }),
              targetInstalled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Already installed, will only download selected dependencies" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
              "Dependencies (",
              depInfos.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectableDeps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: isAllSelected,
                    indeterminate: isSomeSelected,
                    onCheckedChange: (checked) => {
                      if (checked) {
                        handleSelectAll();
                      } else {
                        handleDeselectAll();
                      }
                    },
                    id: "select-all"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "select-all", className: "text-xs text-muted-foreground cursor-pointer select-none", children: "Select All" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: handleRefresh,
                  className: "h-7 px-2",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3.5" })
                }
              )
            ] })
          ] }),
          depInfos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-muted/30 p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This mod has no dependencies" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: depInfos.map((depInfo, idx) => {
            const canSelect = depInfo.resolvedMod && (depInfo.status === "not_installed" || depInfo.status === "installed_wrong");
            const isSelected = depInfo.resolvedMod && selectedDepIds.has(depInfo.resolvedMod.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-md border p-3 transition-colors ${canSelect ? "border-border bg-card hover:bg-muted/50" : "border-border bg-muted/30"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked: isSelected,
                      disabled: !canSelect,
                      onCheckedChange: () => {
                        if (canSelect && depInfo.resolvedMod) {
                          handleToggleDep(depInfo.resolvedMod.id);
                        }
                      },
                      onClick: (e) => e.stopPropagation(),
                      className: "mt-0.5"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                      getStatusIcon$1(depInfo.status),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: depInfo.resolvedMod?.name || depInfo.parsed.fullString }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: getStatusVariant(depInfo.status), className: "shrink-0", children: getStatusLabel$1(depInfo.status) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                      depInfo.parsed.version ? `Requires v${depInfo.parsed.version}` : "Any version",
                      depInfo.installedVersion && ` • Installed: v${depInfo.installedVersion}`
                    ] }),
                    depInfo.status === "unresolved" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 italic", children: "Could not find this dependency in catalog" }),
                    depInfo.status === "installed_wrong" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-yellow-600 mt-1", children: enforceDependencyVersions ? "Will update to required version" : "Version mismatch (enforcement disabled)" })
                  ] }),
                  depInfo.resolvedMod && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => handleViewMod(depInfo.resolvedMod),
                      className: "h-7 px-2 shrink-0",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5" })
                    }
                  )
                ] })
              },
              idx
            );
          }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "px-6 pb-6 pt-4 gap-2 sm:gap-0 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: handleDownloadModOnly, children: "Download mod only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleDownloadSelected, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4 mr-2" }),
          "Download selected (",
          targetInstalled ? selectedDepIds.size : selectedDepIds.size + 1,
          ")"
        ] })
      ] })
    ] }) })
  ] });
});
async function fetchReadme({ author, name }) {
  const baseUrl = "https://thunderstore.io/api/cyberstorm";
  const url = `${baseUrl}/package/${author}/${name}/latest/readme/`;
  const response = await fetch(url, {
    headers: {
      "Accept": "text/html,application/json,text/plain"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch readme: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const data = await response.json();
    return data.html;
  }
  return await response.text();
}
function useThunderstoreReadme(params) {
  return useQuery({
    queryKey: ["thunderstore", "readme", params.author, params.name],
    queryFn: () => fetchReadme(params),
    enabled: Boolean(params.author && params.name),
    staleTime: 1e3 * 60 * 30
    // 30 minutes - readmes rarely change
  });
}
function compareVersions(v1, v2) {
  if (!v1 && !v2) return 0;
  if (!v1) return -1;
  if (!v2) return 1;
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}
function isVersionGreater(v1, v2) {
  return compareVersions(v1, v2) > 0;
}
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
function getStatusIcon(status, className) {
  switch (status) {
    case "installed_correct":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-green-600" });
    case "installed_wrong":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-yellow-600" });
    case "not_installed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-4 text-red-600" });
    case "unresolved":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-4 text-muted-foreground" });
  }
}
function getStatusBadgeVariant(status) {
  switch (status) {
    case "installed_correct":
      return "secondary";
    case "installed_wrong":
      return "outline";
    case "not_installed":
      return "destructive";
    case "unresolved":
      return "outline";
  }
}
function getStatusLabel(status) {
  switch (status) {
    case "installed_correct":
      return "Installed";
    case "installed_wrong":
      return "Wrong version";
    case "not_installed":
      return "Not installed";
    case "unresolved":
      return "Not found";
  }
}
function ModInspectorContent({ mod, onBack }) {
  const startDownload = useDownloadStore((s) => s.startDownload);
  const pauseDownload = useDownloadStore((s) => s.pauseDownload);
  const resumeDownload = useDownloadStore((s) => s.resumeDownload);
  const cancelDownload = useDownloadStore((s) => s.cancelDownload);
  const toggleMod = useModManagementStore((s) => s.toggleMod);
  const uninstallMod = useModManagementStore((s) => s.uninstallMod);
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame);
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions);
  const [selectedDepMod, setSelectedDepMod] = reactExports.useState(null);
  const [showDepModDialog, setShowDepModDialog] = reactExports.useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = reactExports.useState(false);
  const [selectedVersion, setSelectedVersion] = reactExports.useState(() => {
    const installedVersion2 = installedVersionsByGame[mod.gameId]?.[mod.id];
    return installedVersion2 || mod.version;
  });
  const { data: readmeHtml, isLoading: isLoadingReadme, isError: isReadmeError, error: readmeError, refetch: refetchReadme } = useThunderstoreReadme({
    author: mod.author,
    name: mod.name
  });
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id]);
  const installedSet = useModManagementStore((s) => s.installedModsByGame[mod.gameId]);
  const enabledSet = useModManagementStore((s) => s.enabledModsByGame[mod.gameId]);
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods);
  const installed = installedSet ? installedSet.has(mod.id) : false;
  const enabled = enabledSet ? enabledSet.has(mod.id) : false;
  const isUninstalling = uninstallingSet.has(mod.id);
  const installedVersion = installedVersionsByGame[mod.gameId]?.[mod.id];
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
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  const handleDepClick = (depMod) => {
    setSelectedDepMod(depMod);
    setShowDepModDialog(true);
  };
  const handleDownloadMissingDeps = () => {
    depInfos.filter(
      (dep) => dep.resolvedMod && (dep.status === "not_installed" || dep.status === "installed_wrong")
    ).forEach((dep) => {
      if (dep.resolvedMod) {
        startDownload(
          dep.resolvedMod.id,
          dep.resolvedMod.gameId,
          dep.resolvedMod.name,
          dep.resolvedMod.version,
          dep.resolvedMod.author,
          dep.resolvedMod.iconUrl
        );
      }
    });
  };
  const handleInstall = () => {
    if (selectedVersion === installedVersion) {
      return;
    }
    const hasDepsToInstall = depInfos.some(
      (dep) => dep.resolvedMod && (dep.status === "not_installed" || dep.status === "installed_wrong")
    );
    if (hasDepsToInstall) {
      setShowDownloadDialog(true);
    } else {
      startDownload(mod.id, mod.gameId, mod.name, selectedVersion, mod.author, mod.iconUrl);
    }
  };
  const handleUninstall = () => {
    uninstallMod(mod.gameId, mod.id);
  };
  const handleToggleEnabled = () => {
    toggleMod(mod.gameId, mod.id);
  };
  const handlePause = () => {
    if (downloadTask) {
      pauseDownload(downloadTask.modId);
    }
  };
  const handleResume = () => {
    if (downloadTask) {
      resumeDownload(downloadTask.modId);
    }
  };
  const handleCancel = () => {
    if (downloadTask) {
      cancelDownload(downloadTask.modId);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DependencyModDialog,
      {
        mod: selectedDepMod,
        open: showDepModDialog,
        onOpenChange: setShowDepModDialog
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DependencyDownloadDialog,
      {
        mod,
        requestedVersion: selectedVersion,
        open: showDownloadDialog,
        onOpenChange: setShowDownloadDialog
      }
    ),
    onBack && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-b border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleBack,
          className: "mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: mod.iconUrl,
            alt: mod.name,
            className: "size-12 rounded object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-balance line-clamp-2", children: mod.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "by ",
            mod.author
          ] })
        ] })
      ] })
    ] }),
    !onBack && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: mod.iconUrl,
          alt: mod.name,
          className: "size-12 rounded object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-balance line-clamp-2", children: mod.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "by ",
          mod.author
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 border-b border-border p-4", children: [
      downloadTask && downloadTask.status === "queued" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Queued for download..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: handleCancel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] }) }),
      downloadTask && downloadTask.status === "downloading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Downloading..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: handlePause, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: handleCancel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: downloadTask.progress, className: "h-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            formatBytes(downloadTask.bytesDownloaded),
            " / ",
            formatBytes(downloadTask.bytesTotal),
            " (",
            downloadTask.progress,
            "%)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: formatSpeed(downloadTask.speedBps) })
        ] })
      ] }),
      downloadTask && downloadTask.status === "paused" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Paused" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "default", size: "sm", onClick: handleResume, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Resume" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleCancel, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cancel" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: downloadTask.progress, className: "h-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          formatBytes(downloadTask.bytesDownloaded),
          " / ",
          formatBytes(downloadTask.bytesTotal),
          " (",
          downloadTask.progress,
          "%)"
        ] })
      ] }),
      (!downloadTask || downloadTask.status === "completed" || downloadTask.status === "error") && !installed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "default", size: "lg", className: "w-full gap-2", onClick: handleInstall, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Install v",
          selectedVersion
        ] })
      ] }),
      (!downloadTask || downloadTask.status === "completed" || downloadTask.status === "error") && installed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        isVersionGreater(mod.version, installedVersion) ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "default",
            size: "lg",
            className: "w-full gap-2",
            onClick: () => setSelectedVersion(mod.version),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3 mr-1.5" }),
              "Upgrade to v",
              mod.version
            ]
          }
        ) }) : null,
        selectedVersion === installedVersion ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          !isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border border-border bg-muted/50 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Enable Mod" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Load this mod in-game" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: enabled, onCheckedChange: handleToggleEnabled })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "destructive",
              size: "lg",
              className: "w-full gap-2",
              onClick: handleUninstall,
              disabled: isUninstalling,
              children: isUninstalling ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Uninstalling..." })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Uninstall" })
              ] })
            }
          )
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border border-border bg-muted/50 p-3", children: [
      installed && installedVersion ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Installed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", children: [
              "v",
              installedVersion
            ] }),
            isVersionGreater(mod.version, installedVersion) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: "text-[10px] px-1.5 py-0", children: "Update available" }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {})
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Version" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedVersion,
            onValueChange: (value) => value && setSelectedVersion(value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-auto min-w-[100px] gap-1 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "w-[200px]", children: mod.versions.map((version) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: version.version_number, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: version.version_number }),
                version.version_number === mod.version && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1 py-0", children: "Latest" })
              ] }) }, version.version_number)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Downloads" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium tabular-nums", children: mod.downloads.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Last Updated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: new Date(mod.lastUpdated).toLocaleDateString() })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "readme", className: "flex flex-col ", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-border overflow-x-auto py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { variant: "line", className: "h-auto w-full justify-start rounded-none border-0 bg-transparent p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "readme", className: "gap-2 rounded-none border-b-2 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Readme" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "changelog", className: "gap-2 rounded-none border-b-2 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Updates" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "dependencies", className: "gap-2 rounded-none border-b-2 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Deps" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "versions", className: "gap-2 rounded-none border-b-2 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Versions" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "readme", className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        isLoadingReadme && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full mt-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3 mt-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" })
        ] }),
        isReadmeError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-5 text-destructive shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: "Failed to load readme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: readmeError?.message || "An error occurred while fetching the readme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => refetchReadme(),
                className: "gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3" }),
                  "Retry"
                ]
              }
            )
          ] })
        ] }) }),
        !isLoadingReadme && !isReadmeError && readmeHtml && /* @__PURE__ */ jsxRuntimeExports.jsx(HtmlReadme, { html: readmeHtml })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "changelog", className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: "Version History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-primary pl-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: mod.version }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(mod.lastUpdated).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Added new features and improvements" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Fixed critical bugs affecting gameplay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Performance optimizations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Updated dependencies to latest versions" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-border pl-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                mod.version.split(".").slice(0, 2).join("."),
                ".0"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(
                new Date(mod.lastUpdated).getTime() - 7 * 24 * 60 * 60 * 1e3
              ).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Initial release of major version" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Core functionality implemented" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "dependencies", className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
            "Dependencies (",
            depInfos.length,
            ")"
          ] }),
          depInfos.some((d) => d.status === "not_installed" || d.status === "installed_wrong") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: handleDownloadMissingDeps, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3 mr-1.5" }),
            "Download missing"
          ] })
        ] }),
        mod.dependencies.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-muted/50 p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This mod has no dependencies" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: depInfos.map((depInfo, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors ${depInfo.resolvedMod ? "hover:bg-muted/50 cursor-pointer" : ""}`,
            onClick: () => {
              if (depInfo.resolvedMod) {
                handleDepClick(depInfo.resolvedMod);
              }
            },
            children: [
              getStatusIcon(depInfo.status),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate", children: depInfo.resolvedMod?.name || depInfo.parsed.fullString }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: getStatusBadgeVariant(depInfo.status), className: "shrink-0", children: getStatusLabel(depInfo.status) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  depInfo.parsed.version ? `Requires v${depInfo.parsed.version}` : "Any version",
                  depInfo.installedVersion && ` • Installed: v${depInfo.installedVersion}`
                ] }),
                depInfo.status === "unresolved" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 italic", children: "Not found in catalog" })
              ] }),
              depInfo.resolvedMod && /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4 shrink-0 text-muted-foreground" })
            ]
          },
          idx
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "versions", className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: "Available Versions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-md border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Version" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Released" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right", children: "Downloads" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: mod.versions.map((version) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-medium", children: version.version_number }),
              version.version_number === mod.version && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Current" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-xs text-muted-foreground", children: new Date(version.datetime_created).toLocaleDateString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-right text-xs tabular-nums text-muted-foreground", children: version.download_count.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 text-right", children: version.version_number === installedVersion ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Installed" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-7 px-2 text-xs",
                onClick: () => {
                  setSelectedVersion(version.version_number);
                  startDownload(mod.id, mod.gameId, mod.name, version.version_number, mod.author, mod.iconUrl);
                },
                children: "Install"
              }
            ) })
          ] }, version.version_number)) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-t border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View on Thunderstore" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Report Issue" })
      ] })
    ] }) })
  ] });
}
function ModInspector() {
  const selectedModId = useAppStore((s) => s.selectedModId);
  const selectMod = useAppStore((s) => s.selectMod);
  const mod = MODS.find((m) => m.id === selectedModId);
  if (!mod) {
    return null;
  }
  const handleBack = () => {
    selectMod(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModInspectorContent, { mod, onBack: handleBack }, mod.id);
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRoot, { "data-slot": "sheet", ...props });
}
function SheetTrigger({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetPortal({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal$1, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogBackdrop,
    {
      "data-slot": "sheet-overlay",
      className: cn$1("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogPopup,
      {
        "data-slot": "sheet-content",
        "data-side": side,
        className: cn$1("bg-background data-open:animate-in data-closed:animate-out data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=top]:data-closed:slide-out-to-top-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:fade-out-0 data-open:fade-in-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=bottom]:data-open:slide-in-from-bottom-10 fixed z-50 flex flex-col bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className),
        ...props,
        children: [
          showCloseButton && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogClose$1,
            {
              "data-slot": "sheet-close",
              render: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  className: "m-2",
                  size: "icon-lg"
                }
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  X,
                  {}
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          ),
          children
        ]
      }
    )
  ] });
}
export {
  CreateProfileDialog as C,
  Download as D,
  List as L,
  ModInspector as M,
  Plus as P,
  Sheet as S,
  Tabs as T,
  TabsList as a,
  TabsTrigger as b,
  TabsContent as c,
  Dialog as d,
  DialogContent as e,
  DialogHeader as f,
  DialogTitle as g,
  DialogDescription as h,
  DialogFooter as i,
  TriangleAlert as j,
  PROFILES as k,
  SheetContent as l,
  DialogRoot as m,
  DialogClose as n,
  Toaster as o,
  isVersionGreater as p,
  analyzeModDependencies as q,
  DependencyDownloadDialog as r,
  MODS as s,
  toast as t,
  useModManagementStore as u,
  Checkbox as v,
  SheetTrigger as w,
  MOD_CATEGORIES as x
};
