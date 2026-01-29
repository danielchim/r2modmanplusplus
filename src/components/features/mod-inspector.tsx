import { ArrowLeft, Download, Trash2, ExternalLink, AlertCircle, FileText, History, Network, Package, Pause, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, X, RefreshCw } from "lucide-react"

import { useState, useMemo } from "react"
import { useAppStore } from "@/store/app-store"
import { useDownloadStore } from "@/store/download-store"
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
import { useOnlinePackage } from "@/lib/queries/useOnlineMods"
import { isVersionGreater } from "@/lib/version-utils"

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

function getStatusLabel(status: DependencyStatus) {
  switch (status) {
    case "installed_correct":
      return "Installed"
    case "installed_wrong":
      return "Wrong version"
    case "not_installed":
      return "Not installed"
    case "unresolved":
      return "Not found"
  }
}

export function ModInspectorContent({ mod, onBack }: ModInspectorContentProps) {
  const startDownload = useDownloadStore((s) => s.startDownload)
  const pauseDownload = useDownloadStore((s) => s.pauseDownload)
  const resumeDownload = useDownloadStore((s) => s.resumeDownload)
  const cancelDownload = useDownloadStore((s) => s.cancelDownload)

  const toggleMod = useModManagementStore((s) => s.toggleMod)
  const uninstallMod = useModManagementStore((s) => s.uninstallMod)
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const activeProfileId = selectedGameId ? useProfileStore((s) => s.activeProfileIdByGame[selectedGameId]) : undefined

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

  // Analyze dependencies
  const depInfos = useMemo(() => {
    const installedVersions = installedVersionsForProfile || {}
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
  }, [mod, installedVersionsForProfile, enforceDependencyVersions])

  const handleBack = () => {
    if (onBack) {
      onBack()
    }
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
          startDownload(
            dep.resolvedMod.id,
            dep.resolvedMod.gameId,
            dep.resolvedMod.name,
            dep.resolvedMod.version,
            dep.resolvedMod.author,
            dep.resolvedMod.iconUrl
          )
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
      startDownload(mod.id, mod.gameId, mod.name, selectedVersion, mod.author, mod.iconUrl)
    }
  }

  const handleUninstall = () => {
    if (activeProfileId) {
      uninstallMod(activeProfileId, mod.id)
    }
  }

  const handleToggleEnabled = () => {
    if (activeProfileId) {
      toggleMod(activeProfileId, mod.id)
    }
  }

  const handlePause = () => {
    if (downloadTask) {
      pauseDownload(downloadTask.modId)
    }
  }

  const handleResume = () => {
    if (downloadTask) {
      resumeDownload(downloadTask.modId)
    }
  }

  const handleCancel = () => {
    if (downloadTask) {
      cancelDownload(downloadTask.modId)
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
            <span>Back</span>
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
              <p className="text-xs text-muted-foreground">by {mod.author}</p>
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
              <p className="text-xs text-muted-foreground">by {mod.author}</p>
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
                <span>Queued for download...</span>
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
                <span className="text-sm font-medium">Downloading...</span>
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
                <span className="text-sm font-medium">Paused</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={handleResume}>
                  <Play className="size-4" />
                  <span>Resume</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="size-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            </div>
            <Progress value={downloadTask.progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {formatBytes(downloadTask.bytesDownloaded)} / {formatBytes(downloadTask.bytesTotal)} ({downloadTask.progress}%)
            </div>
          </div>
        )}


        {(!downloadTask || downloadTask.status === "completed" || downloadTask.status === "error") && !installed && (
          <Button variant="default" size="lg" className="w-full gap-2" onClick={handleInstall}>
            <Download className="size-4" />
            <span>Install v{selectedVersion}</span>
          </Button>
        )}

        {(!downloadTask || downloadTask.status === "completed" || downloadTask.status === "error") && installed && (
          <div className="space-y-3">
            {isVersionGreater(mod.version, installedVersion) ? (
              <>
                <Button variant="default" size="lg" className="w-full gap-2"
                  onClick={() => setSelectedVersion(mod.version)}
                >
                  <Download className="size-3 mr-1.5" />
                  Upgrade to v{mod.version}
                </Button>
              </>
            ) : null}
            {/* Only show Enable toggle and Uninstall when selected version matches installed */}
            {selectedVersion === installedVersion ? (
              <>
                {!isUninstalling ? (
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
                    <div>
                      <p className="text-sm font-medium">Enable Mod</p>
                      <p className="text-xs text-muted-foreground">Load this mod in-game</p>
                    </div>
                    <Switch checked={enabled} onCheckedChange={handleToggleEnabled} />
                  </div>
                ) : null}
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
                      <span>Uninstalling...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      <span>Uninstall</span>
                    </>
                  )}
                </Button>
              </>
            ) : null}
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
                <span className="text-xs text-muted-foreground">Installed</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">v{installedVersion}</span>
                  {isVersionGreater(mod.version, installedVersion) ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      Update available
                    </Badge>
                  ) : null}
                </div>
              </div>

              <Separator />
            </>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Version</span>

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
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">Latest</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Downloads</span>
            <span className="text-xs font-medium tabular-nums">
              {mod.downloads.toLocaleString()}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Last Updated</span>
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
              <span>Readme</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <History className="size-4" />
              <span>Updates</span>
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Network className="size-4" />
              <span>Deps</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2 rounded-none border-b-2 px-4 py-3">
              <Package className="size-4" />
              <span>Versions</span>
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
                    <p className="text-sm font-medium text-destructive">Failed to load readme</p>
                    <p className="text-xs text-muted-foreground">
                      {readmeError?.message || "An error occurred while fetching the readme"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchReadme()}
                      className="gap-2"
                    >
                      <RefreshCw className="size-3" />
                      Retry
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
            <h3 className="mb-3 text-sm font-semibold">Version History</h3>
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
              <h3 className="text-sm font-semibold">Dependencies ({depInfos.length})</h3>
              {depInfos.some(d => d.status === "not_installed" || d.status === "installed_wrong") && (
                <Button variant="secondary" size="sm" onClick={handleDownloadMissingDeps}>
                  <Download className="size-3 mr-1.5" />
                  Download missing
                </Button>
              )}
            </div>
            {mod.dependencies.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/50 p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  This mod has no dependencies
                </p>
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
                          {getStatusLabel(depInfo.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {depInfo.parsed.version
                          ? `Requires v${depInfo.parsed.version}`
                          : "Any version"}
                        {depInfo.installedVersion && ` • Installed: v${depInfo.installedVersion}`}
                      </p>
                      {depInfo.status === "unresolved" && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Not found in catalog
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
            <h3 className="mb-3 text-sm font-semibold">Available Versions</h3>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Version</TableHead>
                    <TableHead className="text-xs">Released</TableHead>
                    <TableHead className="text-xs text-right">Downloads</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mod.versions.map((version) => (
                    <TableRow key={version.version_number}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-medium">{version.version_number}</code>
                          {version.version_number === mod.version && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
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
                          <Badge variant="outline" className="text-xs">Installed</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setSelectedVersion(version.version_number)
                              startDownload(mod.id, mod.gameId, mod.name, version.version_number, mod.author, mod.iconUrl)
                            }}
                          >
                            Install
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
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ExternalLink className="size-4" />
            <span>View on Thunderstore</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ExternalLink className="size-4" />
            <span>Report Issue</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ModInspector() {
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const tab = useAppStore((s) => s.modLibraryTab)
  const selectMod = useAppStore((s) => s.selectMod)

  // Check if this is an online mod (UUID format from Thunderstore)
  // UUIDs are 36 chars with hyphens (e.g., "550bcdc8-bd12-4711-9797-f31fa6c36c58")
  const isOnlineMod = tab === "online" && selectedModId && selectedModId.length === 36 && selectedModId.includes("-")

  // Try to fetch from Thunderstore if it's an online mod
  const onlinePackageQuery = useOnlinePackage(
    selectedGameId || "",
    selectedModId || "",
    isOnlineMod || false
  )

  // Determine which mod to display
  let mod: Mod | null | undefined = null
  let isLoading = false

  if (isOnlineMod && onlinePackageQuery.isElectron) {
    // In Electron, use Thunderstore data
    mod = onlinePackageQuery.data
    isLoading = onlinePackageQuery.isLoading
  } else {
    // Fallback to MODS (for installed tab or web mode)
    mod = MODS.find((m) => m.id === selectedModId)
  }

  const handleBack = () => {
    selectMod(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm p-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Loading package...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not found
  if (!mod) {
    return null
  }

  return <ModInspectorContent key={mod.id} mod={mod} onBack={handleBack} />
}
