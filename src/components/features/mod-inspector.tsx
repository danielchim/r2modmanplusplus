import { ArrowLeft, Download, Trash2, ExternalLink, AlertCircle, FileText, History, Network, Package, Pause, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, X, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState, useMemo } from "react"
import { useAppStore } from "@/store/app-store"
import { useDownloadStore } from "@/store/download-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModActions } from "@/hooks/use-mod-actions"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { MODS } from "@/mocks/mods"
import type { Mod } from "@/types/mod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { HtmlReadme } from "@/components/readme/html-readme"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { analyzeModDependencies, type DependencyStatus } from "@/lib/dependency-utils"
import { DependencyModDialog } from "@/components/features/dependencies/dependency-mod-dialog"
import { DependencyDownloadDialog } from "@/components/features/dependencies/dependency-download-dialog"
import { useThunderstoreReadme } from "@/lib/queries/useThunderstoreReadme"
import { useOnlinePackage, useOnlineDependenciesRecursive } from "@/lib/queries/useOnlineMods"
import { isVersionGreater, compareVersions } from "@/lib/version-utils"


function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatSpeed(bps: number): string {
  return `${formatBytes(bps)}/s`
}

type ModInspectorContentProps = {
  mod: Mod
  onBack?: () => void
}

function getStatusIcon(status: DependencyStatus, className?: string) {
  switch (status) {
    case "installed_correct":
      return <CheckCircle2 className={className || "size-4 text-green-600"} />
    case "installed_wrong":
      return <AlertTriangle className={className || "size-4 text-yellow-600"} />
    case "not_installed":
      return <XCircle className={className || "size-4 text-red-600"} />
    case "unresolved":
      return <AlertCircle className={className || "size-4 text-muted-foreground"} />
  }
}

function getStatusBadgeVariant(status: DependencyStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "installed_correct":
      return "secondary"
    case "installed_wrong":
      return "outline"
    case "not_installed":
      return "destructive"
    case "unresolved":
      return "outline"
  }
}

const DEP_STATUS_KEYS: Record<DependencyStatus, string> = {
  installed_correct: "mod_inspector_dep_status_installed",
  installed_wrong: "mod_inspector_dep_status_wrong_version",
  not_installed: "mod_inspector_dep_status_not_installed",
  unresolved: "mod_inspector_dep_status_not_found",
}

function ModInspectorSkeleton({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col">
      {/* Header with Back Button */}
      <div className="shrink-0 border-b border-border p-4">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          <span>{t("mod_inspector_back")}</span>
        </button>
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>

      {/* Primary Action Skeleton */}
      <div className="shrink-0 border-b border-border p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Metadata Skeleton */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="readme" className="flex flex-col">
        <div className="shrink-0 border-b border-border overflow-x-auto py-2">
          <TabsList variant="line" className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="readme" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <FileText className="size-4" />
              <span>{t("mod_inspector_tab_readme")}</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <History className="size-4" />
              <span>{t("mod_inspector_tab_updates")}</span>
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Network className="size-4" />
              <span>{t("mod_inspector_tab_deps")}</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Package className="size-4" />
              <span>{t("mod_inspector_tab_versions")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="readme" className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full mt-4" />
            <Skeleton className="h-4 w-2/3 mt-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </TabsContent>

        <TabsContent value="changelog" className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </TabsContent>

        <TabsContent value="versions" className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions Skeleton */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}

function SkeletonDependencyRow() {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <Skeleton className="size-4 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

function ModInspectorError({ onBack, error }: { onBack: () => void; error?: Error }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border p-4">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          <span>{t("mod_inspector_back")}</span>
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="max-w-md rounded-md border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-destructive">{t("mod_inspector_failed_to_load_package")}</p>
              <p className="text-xs text-muted-foreground">
                {error?.message || t("mod_inspector_error_fetching_package")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
                  <ArrowLeft className="size-3" />
                  {t("mod_inspector_go_back")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ModInspectorContent({ mod, onBack }: ModInspectorContentProps) {
  const { t } = useTranslation()
  const { startDownload, pauseDownload, resumeDownload, cancelDownload } = useDownloadActions()

  const toggleMod = useModManagementStore((s) => s.toggleMod)
  const { uninstallMod } = useModActions()
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const activeProfileId = useProfileStore((s) => selectedGameId ? s.activeProfileIdByGame[selectedGameId] : undefined)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setModLibraryTab = useAppStore((s) => s.setModLibraryTab)
  const selectMod = useAppStore((s) => s.selectMod)

  const [selectedDepMod, setSelectedDepMod] = useState<Mod | null>(null)
  const [showDepModDialog, setShowDepModDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  // Use lazy initialization to set installed version by default (rerender-lazy-state-init)
  const [selectedVersion, setSelectedVersion] = useState<string>(() => {
    const installedVersion = activeProfileId ? installedVersionsByProfile[activeProfileId]?.[mod.id] : undefined
    return installedVersion || mod.version
  })

  // Fetch readme from Thunderstore API
  const { data: readmeHtml, isLoading: isLoadingReadme, isError: isReadmeError, error: readmeError, refetch: refetchReadme } = useThunderstoreReadme({
    author: mod.author,
    name: mod.name,
  })

  // Subscribe to the specific task so component re-renders on changes
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id])

  // Subscribe to the Sets directly, not derived booleans
  const installedSet = useModManagementStore((s) => 
    activeProfileId ? s.installedModsByProfile[activeProfileId] : undefined
  )
  const enabledSet = useModManagementStore((s) => 
    activeProfileId ? s.enabledModsByProfile[activeProfileId] : undefined
  )
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods)

  // Derive booleans from Sets
  const installed = installedSet ? installedSet.has(mod.id) : false
  const enabled = enabledSet ? enabledSet.has(mod.id) : false
  const isUninstalling = uninstallingSet.has(mod.id)

  // Get the actually installed version (not just mod.version which is the latest)
  const installedVersion = activeProfileId ? installedVersionsByProfile[activeProfileId]?.[mod.id] : undefined

  // Extract primitive dependencies for useMemo (rerender-dependencies)
  const installedVersionsForProfile = activeProfileId ? installedVersionsByProfile[activeProfileId] : undefined

  // Derive version state for CTA (Call-to-Action) logic
  const hasKnownInstalledVersion = installed && typeof installedVersion === "string" && installedVersion.length > 0
  const isSelectedInstalled = hasKnownInstalledVersion && selectedVersion === installedVersion
  const versionCmp = hasKnownInstalledVersion ? compareVersions(selectedVersion, installedVersion) : null
  const isUpgrade = versionCmp !== null && versionCmp > 0
  const isDowngrade = versionCmp !== null && versionCmp < 0
  const canShowPrimaryCta = !downloadTask || downloadTask.status === "completed" || downloadTask.status === "error"

  // Determine CTA kind based on version state
  type CtaKind = "install" | "upgrade" | "downgrade" | "none" | "unknown-installed-version"
  const ctaKind: CtaKind = !installed
    ? "install"
    : installed && !hasKnownInstalledVersion
    ? "unknown-installed-version"
    : isSelectedInstalled
    ? "none"
    : isUpgrade
    ? "upgrade"
    : isDowngrade
    ? "downgrade"
    : "none"

  // Generate CTA label and disabled reason based on kind
  const getCtaInfo = (): { label: string; disabledReason?: string } => {
    switch (ctaKind) {
      case "install":
        return { label: t("mod_inspector_install_version", { version: selectedVersion }) }
      case "upgrade":
        return { label: t("mod_inspector_upgrade_to_version", { version: selectedVersion }) }
      case "downgrade":
        return { label: t("mod_inspector_downgrade_to_version", { version: selectedVersion }) }
      case "unknown-installed-version":
        return {
          label: t("mod_inspector_installed_version_unknown"),
          disabledReason: t("mod_inspector_installed_version_unknown_reason"),
        }
      case "none":
        return { label: "" }
    }
  }

  const ctaInfo = getCtaInfo()

  // Check if this is a Thunderstore online mod (UUID format: 36 chars with hyphens)
  const isThunderstoreMod = mod.id.length === 36 && mod.id.includes("-")
  // Use recursive online dependency resolution for Thunderstore mods in Electron
  const recursiveDepsQuery = useOnlineDependenciesRecursive({
    gameId: mod.gameId,
    dependencies: mod.dependencies,
    installedVersions: installedVersionsForProfile || {},
    enforceVersions: enforceDependencyVersions,
    enabled: isThunderstoreMod,
  })

  // Analyze dependencies (use recursive online for Thunderstore mods if available, otherwise use mock)
  const depInfos = useMemo(() => {
    // If we have recursive online dependency data, use it (convert to flat list)
    if (isThunderstoreMod && recursiveDepsQuery.isElectron && recursiveDepsQuery.data) {
      return recursiveDepsQuery.data.nodes
    }

    // Fallback to mock catalog analysis
    const installedVersions = installedVersionsForProfile || {}
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
  }, [isThunderstoreMod, recursiveDepsQuery.isElectron, recursiveDepsQuery.data, mod, installedVersionsForProfile, enforceDependencyVersions])

  // Check if we're loading dependencies for a Thunderstore mod
  const isLoadingDeps = isThunderstoreMod && recursiveDepsQuery.isElectron && recursiveDepsQuery.isLoading && !recursiveDepsQuery.data


  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  const handleAuthorClick = () => {
    setSearchQuery(`author:"${mod.author}"`)
    setModLibraryTab("online")
    selectMod(null) // Close inspector
  }

  const handleDepClick = (depMod: Mod) => {
    setSelectedDepMod(depMod)
    setShowDepModDialog(true)
  }

  const handleDownloadMissingDeps = () => {
    depInfos
      .filter(dep =>
        dep.resolvedMod &&
        (dep.status === "not_installed" || dep.status === "installed_wrong")
      )
      .forEach(dep => {
        if (dep.resolvedMod) {
          const versionData = dep.resolvedMod.versions.find(v => v.version_number === dep.resolvedMod!.version)
          const downloadUrl = versionData?.download_url || ""
          
          startDownload({
            gameId: dep.resolvedMod.gameId,
            modId: dep.resolvedMod.id,
            modName: dep.resolvedMod.name,
            modVersion: dep.resolvedMod.version,
            modAuthor: dep.resolvedMod.author,
            modIconUrl: dep.resolvedMod.iconUrl,
            downloadUrl
          })
        }
      })
  }

  const handleInstall = () => {
    // Check if the selected version is already installed
    if (selectedVersion === installedVersion) {
      // Already installed, don't download again
      return
    }

    // Check if there are any dependencies that need to be installed
    const hasDepsToInstall = depInfos.some(dep =>
      dep.resolvedMod &&
      (dep.status === "not_installed" || dep.status === "installed_wrong")
    )

    if (hasDepsToInstall) {
      // Show dialog to let user choose which dependencies to install
      setShowDownloadDialog(true)
    } else {
      // No dependencies or all are already installed correctly, download directly
      const versionData = mod.versions.find(v => v.version_number === selectedVersion)
      const downloadUrl = versionData?.download_url || ""
      
      startDownload({
        gameId: mod.gameId,
        modId: mod.id,
        modName: mod.name,
        modVersion: selectedVersion,
        modAuthor: mod.author,
        modIconUrl: mod.iconUrl,
        downloadUrl
      })
    }
  }

  const handleUninstall = () => {
    if (activeProfileId) {
      uninstallMod(activeProfileId, mod.id, { author: mod.author, name: mod.name })
    }
  }

  const handleToggleEnabled = () => {
    if (activeProfileId) {
      toggleMod(activeProfileId, mod.id)
    }
  }

  const handlePause = () => {
    if (downloadTask) {
      pauseDownload(downloadTask.downloadId)
    }
  }

  const handleResume = () => {
    if (downloadTask) {
      resumeDownload(downloadTask.downloadId)
    }
  }

  const handleCancel = () => {
    if (downloadTask) {
      cancelDownload(downloadTask.downloadId)
    }
  }

  return (
    <div className="flex flex-col">
      <DependencyModDialog
        mod={selectedDepMod}
        open={showDepModDialog}
        onOpenChange={setShowDepModDialog}
      />
      <DependencyDownloadDialog
        mod={mod}
        requestedVersion={selectedVersion}
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
      />
      {/* Header with Back Button */}
      {onBack && (
        <div className="shrink-0 border-b border-border p-4">
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" />
            <span>{t("mod_inspector_back")}</span>
          </button>
          <div className="flex items-start gap-3">
            <img
              src={mod.iconUrl}
              alt={mod.name}
              className="size-12 rounded object-cover"
            />
            <div className="flex-1">
              <h2 className="text-base font-semibold text-balance line-clamp-2">
                {mod.name}
              </h2>
              <button
                onClick={handleAuthorClick}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
              >
                {t("mod_inspector_by_author", { author: mod.author })}
              </button>
            </div>
          </div>
        </div>
      )}
      {!onBack && (
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-start gap-3">
            <img
              src={mod.iconUrl}
              alt={mod.name}
              className="size-12 rounded object-cover"
            />
            <div className="flex-1">
              <h2 className="text-base font-semibold text-balance line-clamp-2">
                {mod.name}
              </h2>
              <button
                onClick={handleAuthorClick}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
              >
                {t("mod_inspector_by_author", { author: mod.author })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action */}
      <div className="shrink-0 border-b border-border p-4">
        {downloadTask && downloadTask.status === "queued" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>{t("mod_inspector_queued_for_download")}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {downloadTask && downloadTask.status === "downloading" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-sm font-medium">{t("mod_inspector_downloading")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePause}>
                  <Pause className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <Progress value={downloadTask.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatBytes(downloadTask.bytesDownloaded)} / {formatBytes(downloadTask.bytesTotal)} ({downloadTask.progress}%)
              </span>
              <span className="tabular-nums">
                {formatSpeed(downloadTask.speedBps)}
              </span>
            </div>
          </div>
        )}

        {downloadTask && downloadTask.status === "paused" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("mod_inspector_paused")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={handleResume}>
                  <Play className="size-4" />
                  <span>{t("mod_inspector_resume")}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="size-4" />
                  <span>{t("mod_inspector_cancel")}</span>
                </Button>
              </div>
            </div>
            <Progress value={downloadTask.progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {formatBytes(downloadTask.bytesDownloaded)} / {formatBytes(downloadTask.bytesTotal)} ({downloadTask.progress}%)
            </div>
          </div>
        )}

        {/* Primary CTA: Install/Upgrade/Downgrade */}
        {canShowPrimaryCta && ctaKind !== "none" && (
          <div className="space-y-2">
            <Button
              variant="default"
              size="lg"
              className="w-full gap-2"
              onClick={handleInstall}
              disabled={ctaKind === "unknown-installed-version"}
            >
              <Download className="size-4" />
              <span>{ctaInfo.label}</span>
            </Button>
            {ctaKind === "unknown-installed-version" && ctaInfo.disabledReason && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-600/50 bg-yellow-600/10 p-3">
                <AlertCircle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {ctaInfo.disabledReason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enable toggle and Uninstall: only when selected version matches installed */}
        {canShowPrimaryCta && ctaKind === "none" && (
          <div className="space-y-3">
            {!isUninstalling && (
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium">{t("mod_inspector_enable_mod")}</p>
                  <p className="text-xs text-muted-foreground">{t("mod_inspector_enable_mod_description")}</p>
                </div>
                <Switch checked={enabled} onCheckedChange={handleToggleEnabled} />
              </div>
            )}
            <Button
              variant="destructive"
              size="lg"
              className="w-full gap-2"
              onClick={handleUninstall}
              disabled={isUninstalling}
            >
              {isUninstalling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("mod_inspector_uninstalling")}</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  <span>{t("mod_inspector_uninstall")}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
          {/* Show installed version if mod is installed */}
          {installed && installedVersion ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("mod_inspector_installed")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">v{installedVersion}</span>
                  {isVersionGreater(mod.version, installedVersion) ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {t("mod_inspector_update_available")}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <Separator />
            </>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("mod_inspector_version")}</span>

            <Select
              value={selectedVersion}
              onValueChange={(value) => value && setSelectedVersion(value)}
            >
              <SelectTrigger className="h-7 w-auto min-w-[100px] gap-1 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[200px]">
                {mod.versions.map((version) => (
                  <SelectItem key={version.version_number} value={version.version_number}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{version.version_number}</span>
                      {version.version_number === mod.version && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">{t("mod_inspector_latest")}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("mod_inspector_downloads")}</span>
            <span className="text-xs font-medium tabular-nums">
              {mod.downloads.toLocaleString()}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("mod_inspector_last_updated")}</span>
            <span className="text-xs font-medium">
              {new Date(mod.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="readme" className="flex flex-col ">
        <div className="shrink-0 border-b border-border overflow-x-auto py-2">
          <TabsList variant="line" className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="readme" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <FileText className="size-4" />
              <span>{t("mod_inspector_tab_readme")}</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <History className="size-4" />
              <span>{t("mod_inspector_tab_updates")}</span>
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Network className="size-4" />
              <span>{t("mod_inspector_tab_deps")}</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Package className="size-4" />
              <span>{t("mod_inspector_tab_versions")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="readme" className="p-4">
          <div>
            {isLoadingReadme && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full mt-4" />
                <Skeleton className="h-4 w-2/3 mt-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}

            {isReadmeError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-destructive">{t("mod_inspector_failed_to_load_readme")}</p>
                    <p className="text-xs text-muted-foreground">
                      {readmeError?.message || t("mod_inspector_error_fetching_readme")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchReadme()}
                      className="gap-2"
                    >
                      <RefreshCw className="size-3" />
                      {t("mod_inspector_retry")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isLoadingReadme && !isReadmeError && readmeHtml && (
              <HtmlReadme html={readmeHtml} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="changelog" className="p-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("mod_inspector_version_history")}</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="secondary">{mod.version}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(mod.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Added new features and improvements</li>
                  <li>• Fixed critical bugs affecting gameplay</li>
                  <li>• Performance optimizations</li>
                  <li>• Updated dependencies to latest versions</li>
                </ul>
              </div>
              <div className="border-l-2 border-border pl-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline">
                    {mod.version.split(".").slice(0, 2).join(".")}.0
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(
                      new Date(mod.lastUpdated).getTime() - 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Initial release of major version</li>
                  <li>• Core functionality implemented</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="p-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{isLoadingDeps ? t("mod_inspector_dependencies_loading") : t("mod_inspector_dependencies_count", { count: depInfos.length })}</h3>
              {!isLoadingDeps && depInfos.some(d => d.status === "not_installed" || d.status === "installed_wrong") && (
                <Button variant="secondary" size="sm" onClick={handleDownloadMissingDeps}>
                  <Download className="size-3 mr-1.5" />
                  {t("mod_inspector_download_missing")}
                </Button>
              )}
            </div>
            {mod.dependencies.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/50 p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("mod_inspector_no_dependencies")}
                </p>
              </div>
            ) : isLoadingDeps ? (
              <div className="space-y-2">
                <SkeletonDependencyRow />
                <SkeletonDependencyRow />
                <SkeletonDependencyRow />
              </div>
            ) : (
              <div className="space-y-2">
                {depInfos.map((depInfo, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors ${depInfo.resolvedMod ? "hover:bg-muted/50 cursor-pointer" : ""
                      }`}
                    onClick={() => {
                      if (depInfo.resolvedMod) {
                        handleDepClick(depInfo.resolvedMod)
                      }
                    }}
                  >
                    {getStatusIcon(depInfo.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-medium truncate">
                          {depInfo.resolvedMod?.name || depInfo.parsed.fullString}
                        </p>
                        <Badge variant={getStatusBadgeVariant(depInfo.status)} className="shrink-0">
                          {t(DEP_STATUS_KEYS[depInfo.status])}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {depInfo.parsed.version
                          ? t("mod_inspector_requires_version", { version: depInfo.parsed.version })
                          : t("mod_inspector_any_version")}
                        {depInfo.installedVersion && ` • ${t("mod_inspector_installed_version_label", { version: depInfo.installedVersion })}`}
                      </p>
                      {depInfo.status === "unresolved" && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {t("mod_inspector_not_found_in_catalog")}
                        </p>
                      )}
                    </div>
                    {depInfo.resolvedMod && (
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="p-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("mod_inspector_available_versions")}</h3>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("mod_inspector_table_version")}</TableHead>
                    <TableHead className="text-xs">{t("mod_inspector_table_released")}</TableHead>
                    <TableHead className="text-xs text-right">{t("mod_inspector_table_downloads")}</TableHead>
                    <TableHead className="text-xs text-right">{t("mod_inspector_table_action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mod.versions.map((version) => (
                    <TableRow key={version.version_number}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-medium">{version.version_number}</code>
                          {version.version_number === mod.version && (
                            <Badge variant="secondary" className="text-xs">{t("mod_inspector_current")}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {new Date(version.datetime_created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs tabular-nums text-muted-foreground">
                        {version.download_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {version.version_number === installedVersion ? (
                          <Badge variant="outline" className="text-xs">{t("mod_inspector_installed")}</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setSelectedVersion(version.version_number)
                              startDownload({
                                gameId: mod.gameId,
                                modId: mod.id,
                                modName: mod.name,
                                modVersion: version.version_number,
                                modAuthor: mod.author,
                                modIconUrl: mod.iconUrl,
                                downloadUrl: version.download_url
                              })
                            }}
                          >
                            {t("mod_inspector_install")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              const thunderstoreUrl = `https://thunderstore.io/c/${mod.gameId}/p/${mod.author}/${mod.name}/`
              if (window.electron?.openExternal) {
                window.electron.openExternal(thunderstoreUrl)
              } else {
                window.open(thunderstoreUrl, "_blank", "noopener,noreferrer")
              }
            }}
          >
            <ExternalLink className="size-4" />
            <span>{t("mod_inspector_view_on_thunderstore")}</span>
          </Button>
          {mod.websiteUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                if (window.electron?.openExternal) {
                  window.electron.openExternal(mod.websiteUrl!)
                } else {
                  window.open(mod.websiteUrl, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <ExternalLink className="size-4" />
              <span>{t("mod_inspector_report_issue")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ModInspector() {
  const { t } = useTranslation()
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const selectMod = useAppStore((s) => s.selectMod)
  
  const activeProfileId = useProfileStore((s) => selectedGameId ? s.activeProfileIdByGame[selectedGameId] : undefined)
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const { uninstallMod } = useModActions()

  // Check if this is a Thunderstore mod (UUID format: 36 chars with hyphens)
  // Use UUID-based detection, not tab-based
  const isThunderstoreMod = !!selectedModId && selectedModId.length === 36 && selectedModId.includes("-")

  // Try to fetch from Thunderstore if it's a Thunderstore mod
  const onlinePackageQuery = useOnlinePackage(
    selectedGameId || "",
    selectedModId || "",
    isThunderstoreMod
  )

  // Determine which mod to display
  let mod: Mod | null | undefined = null
  let isLoading = false

  if (isThunderstoreMod && onlinePackageQuery.isElectron) {
    // In Electron, use Thunderstore data for UUID mods (regardless of tab)
    mod = onlinePackageQuery.data
    isLoading = onlinePackageQuery.isLoading
  } else {
    // Fallback to MODS (for non-UUID mods or web mode)
    mod = MODS.find((m) => m.id === selectedModId)
  }

  const handleBack = () => {
    selectMod(null)
  }

  // Show error state for Thunderstore mods that failed to load
  if (isThunderstoreMod && onlinePackageQuery.isElectron && onlinePackageQuery.isError && !onlinePackageQuery.data) {
    return <ModInspectorError onBack={handleBack} error={onlinePackageQuery.error as unknown as Error} />
  }

  // Show skeleton while loading Thunderstore mod data
  if (isThunderstoreMod && onlinePackageQuery.isElectron && isLoading && !mod) {
    return <ModInspectorSkeleton onBack={handleBack} />
  }

  // If mod not found and selectedModId exists: show fallback for unknown installed mods
  if (!mod && selectedModId) {
    const installedVersion = activeProfileId ? installedVersionsByProfile[activeProfileId]?.[selectedModId] : undefined
    
    // Show minimal "Unknown mod" inspector
    return (
      <div className="flex flex-col">
        <div className="shrink-0 border-b border-border p-4">
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" />
            <span>{t("mod_inspector_back")}</span>
          </button>
          <div className="flex items-start gap-3">
            <div className="size-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Package className="size-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">{t("mod_inspector_unknown_mod")}</h2>
              <p className="text-xs text-muted-foreground">ID: {selectedModId}</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="shrink-0 border-b border-border p-4">
          <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
            {installedVersion && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("mod_inspector_installed_version")}</span>
                  <span className="text-xs font-medium">v{installedVersion}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("mod_inspector_mod_id")}</span>
              <code className="text-xs font-mono break-all max-w-[200px]">{selectedModId}</code>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="p-4">
          <div className="rounded-md border border-yellow-600/50 bg-yellow-600/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-600">{t("mod_inspector_metadata_unavailable")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("mod_inspector_metadata_unavailable_description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uninstall Action */}
        <div className="shrink-0 border-t border-border p-4">
          <Button
            variant="destructive"
            size="lg"
            className="w-full gap-2"
            onClick={() => {
              if (activeProfileId && selectedModId) {
                // Can't uninstall with file removal for unknown mods (no author/name)
                // Fall back to state-only uninstall
                uninstallMod(activeProfileId, selectedModId)
                selectMod(null) // Close inspector after uninstall
              }
            }}
          >
            <Trash2 className="size-4" />
            <span>{t("mod_inspector_uninstall")}</span>
          </Button>
        </div>
      </div>
    )
  }

  // Not found and no selectedModId
  if (!mod) {
    return null
  }

  return <ModInspectorContent key={mod.id} mod={mod} onBack={handleBack} />
}
