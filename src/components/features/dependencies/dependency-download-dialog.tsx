import { useState, useMemo, memo } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Download, RefreshCw, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { analyzeModDependencies, type DependencyStatus } from "@/lib/dependency-utils"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useOnlineDependenciesRecursive } from "@/lib/queries/useOnlineMods"
import { MODS } from "@/mocks/mods"
import type { Mod } from "@/types/mod"
import { DependencyModDialog } from "./dependency-mod-dialog"

type DepNode = {
  key: string
  id: string
  name: string
  author: string
  version: string
  requiredVersion?: string
  status: DependencyStatus
  installedVersion?: string
  depth: number
  children: string[]
  parents: string[]
}

type DependencyDownloadDialogProps = {
  mod: Mod | null
  requestedVersion: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusIcon(status: DependencyStatus) {
  switch (status) {
    case "installed_correct":
      return <CheckCircle2 className="size-4 text-green-600" />
    case "installed_wrong":
      return <AlertTriangle className="size-4 text-yellow-600" />
    case "not_installed":
      return <XCircle className="size-4 text-red-600" />
    case "unresolved":
      return <AlertCircle className="size-4 text-muted-foreground" />
  }
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

function getStatusVariant(status: DependencyStatus): "default" | "secondary" | "destructive" | "outline" {
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

export const DependencyDownloadDialog = memo(function DependencyDownloadDialog({ mod, requestedVersion, open, onOpenChange }: DependencyDownloadDialogProps) {
  const activeProfileId = useProfileStore((s) => mod ? s.activeProfileIdByGame[mod.gameId] : undefined)
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const installedModsByProfile = useModManagementStore((s) => s.installedModsByProfile)
  const setDependencyWarnings = useModManagementStore((s) => s.setDependencyWarnings)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  const { startDownload } = useDownloadActions()
  
  // null means "auto-select everything that needs downloading"
  const [selectedDepIds, setSelectedDepIds] = useState<Set<string> | null>(null)
  const [viewingMod, setViewingMod] = useState<Mod | null>(null)
  const [showModDialog, setShowModDialog] = useState(false)
  
  // Check if this is a Thunderstore online mod (UUID format: 36 chars with hyphens)
  const isThunderstoreMod = mod ? (mod.id.length === 36 && mod.id.includes("-")) : false

  // Get installed versions for the active profile
  const installedVersionsForProfile = activeProfileId ? installedVersionsByProfile[activeProfileId] : undefined

  // Use recursive online dependency resolution for Thunderstore mods in Electron
  const recursiveDepsQuery = useOnlineDependenciesRecursive({
    gameId: mod?.gameId || "",
    dependencies: mod?.dependencies || [],
    installedVersions: installedVersionsForProfile || {},
    enforceVersions: enforceDependencyVersions,
    enabled: isThunderstoreMod && !!mod && !!activeProfileId,
  })

  const resolvedModsById = useMemo(() => {
    const map = new Map<string, Mod>()

    if (isThunderstoreMod && recursiveDepsQuery.isElectron && recursiveDepsQuery.data) {
      for (const node of recursiveDepsQuery.data.nodes) {
        if (node.resolvedMod) {
          map.set(node.resolvedMod.id, node.resolvedMod)
        }
      }
      return map
    }

    // Fallback: resolve from mock catalog
    for (const m of MODS) {
      map.set(m.id, m)
    }

    return map
  }, [isThunderstoreMod, recursiveDepsQuery.isElectron, recursiveDepsQuery.data])
  
  // Build dependency nodes grouped by depth
  const { depsByDepth, allSelectableIds, childrenByKey, isLoadingDeps } = useMemo(() => {
    if (!mod || !activeProfileId) {
      return { depsByDepth: new Map<number, DepNode[]>(), allSelectableIds: new Set<string>(), childrenByKey: {}, isLoadingDeps: false }
    }
    
    // If we're using recursive query and it's still loading, return loading state
    if (isThunderstoreMod && recursiveDepsQuery.isElectron && recursiveDepsQuery.isLoading && !recursiveDepsQuery.data) {
      return { depsByDepth: new Map<number, DepNode[]>(), allSelectableIds: new Set<string>(), childrenByKey: {}, isLoadingDeps: true }
    }
    
    // If we have recursive online dependency data, use it
    if (isThunderstoreMod && recursiveDepsQuery.isElectron && recursiveDepsQuery.data) {
      const { nodes, childrenByKey: childMap, parentsByKey: parentMap } = recursiveDepsQuery.data
      
      const byDepth = new Map<number, DepNode[]>()
      const selectableIds = new Set<string>()
      
      for (const node of nodes) {
        if (!node.resolvedMod) continue
        
        const depNode: DepNode = {
          key: node.key,
          id: node.resolvedMod.id,
          name: node.resolvedMod.name,
          author: node.resolvedMod.author,
          version: node.resolvedMod.version,
          requiredVersion: node.requiredVersion,
          status: node.status,
          installedVersion: node.installedVersion,
          depth: node.depth,
          children: childMap[node.key] || [],
          parents: parentMap[node.key] || [],
        }
        
        if (!byDepth.has(node.depth)) {
          byDepth.set(node.depth, [])
        }
        byDepth.get(node.depth)!.push(depNode)
        
        // Mark as selectable if not installed or wrong version
        if (node.status === "not_installed" || node.status === "installed_wrong") {
          selectableIds.add(node.resolvedMod.id)
        }
      }
      
      return { 
        depsByDepth: byDepth, 
        allSelectableIds: selectableIds,
        childrenByKey: childMap as Record<string, string[]>,
        isLoadingDeps: false,
      }
    }

    // Fallback to non-recursive mock catalog analysis
    const installedVersions = installedVersionsByProfile[activeProfileId] || {}
    const depInfos = analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
    
    const byDepth = new Map<number, DepNode[]>()
    const selectableIds = new Set<string>()
    
    for (const depInfo of depInfos) {
      if (!depInfo.resolvedMod) continue
      
      const depNode: DepNode = {
        key: `${depInfo.resolvedMod.author}-${depInfo.resolvedMod.name}`,
        id: depInfo.resolvedMod.id,
        name: depInfo.resolvedMod.name,
        author: depInfo.resolvedMod.author,
        version: depInfo.resolvedMod.version,
        requiredVersion: depInfo.requiredVersion,
        status: depInfo.status,
        installedVersion: depInfo.installedVersion,
        depth: 0,
        children: [],
        parents: [],
      }
      
      if (!byDepth.has(0)) {
        byDepth.set(0, [])
      }
      byDepth.get(0)!.push(depNode)
      
      if (depInfo.status === "not_installed" || depInfo.status === "installed_wrong") {
        selectableIds.add(depInfo.resolvedMod.id)
      }
    }
    
    return { 
      depsByDepth: byDepth, 
      allSelectableIds: selectableIds,
      childrenByKey: {} as Record<string, string[]>,
      isLoadingDeps: false,
    }
  }, [mod, activeProfileId, isThunderstoreMod, recursiveDepsQuery.isElectron, recursiveDepsQuery.isLoading, recursiveDepsQuery.data, installedVersionsByProfile, enforceDependencyVersions])
  
  // Flatten all deps for easier access
  const allDeps = useMemo(() => {
    const deps: DepNode[] = []
    for (const depList of depsByDepth.values()) {
      deps.push(...depList)
    }
    return deps
  }, [depsByDepth])
  
  // Get all selectable dependency IDs (not_installed or installed_wrong)
  const selectableDeps = useMemo(() => {
    return Array.from(allSelectableIds)
  }, [allSelectableIds])

  const effectiveSelectedDepIds = useMemo(() => {
    if (selectedDepIds) return selectedDepIds
    return new Set(selectableDeps)
  }, [selectedDepIds, selectableDeps])
  
  if (!mod) {
    return null
  }
  
  const handleToggleDep = (depId: string) => {
    const newSet = new Set(effectiveSelectedDepIds)
    const dep = allDeps.find(d => d.id === depId)
    if (!dep) return
    
    if (newSet.has(depId)) {
      // Try to deselect - only allow if no selected deps require it
      const blockedBy: string[] = []
      for (const parentKey of dep.parents) {
        const parentDep = allDeps.find(d => d.key === parentKey)
        if (parentDep && newSet.has(parentDep.id)) {
          blockedBy.push(parentDep.name)
        }
      }
      
      if (blockedBy.length === 0) {
        newSet.delete(depId)
      }
      // If blocked, don't deselect (could show a toast here)
    } else {
      // Select and automatically include all transitive children
      newSet.add(depId)
      
      // Recursively add all children
      const addChildren = (key: string) => {
        const children = childrenByKey[key] || []
        for (const childKey of children) {
          const childDep = allDeps.find(d => d.key === childKey)
          if (childDep && allSelectableIds.has(childDep.id) && !newSet.has(childDep.id)) {
            newSet.add(childDep.id)
            addChildren(childKey)
          }
        }
      }
      
      addChildren(dep.key)
    }
    
    setSelectedDepIds(newSet)
  }

  
  const handleSelectAll = () => {
    setSelectedDepIds(new Set(selectableDeps))
  }
  
  const handleDeselectAll = () => {
    setSelectedDepIds(new Set())
  }
  
  const handleRefresh = () => {
    recursiveDepsQuery.refetch()
  }
  
  const handleViewMod = (depMod: Mod) => {
    setViewingMod(depMod)
    setShowModDialog(true)
  }
  
  const isAllSelected = selectableDeps.length > 0 && effectiveSelectedDepIds.size === selectableDeps.length
  const isSomeSelected = effectiveSelectedDepIds.size > 0 && effectiveSelectedDepIds.size < selectableDeps.length
  
  const handleDownloadModOnly = () => {
    if (!activeProfileId) return
    
    // Only download the target mod
    const installed = installedModsByProfile[activeProfileId]
    const isTargetInstalled = installed ? installed.has(mod.id) : false
    
    if (!isTargetInstalled) {
      // Find the download URL for the requested version
      const versionData = mod.versions.find(v => v.version_number === requestedVersion)
      const downloadUrl = versionData?.download_url || mod.versions[0]?.download_url || ""
      
      startDownload({
        gameId: mod.gameId,
        modId: mod.id,
        modName: mod.name,
        modVersion: requestedVersion,
        modAuthor: mod.author,
        modIconUrl: mod.iconUrl,
        downloadUrl
      })
    }
    
    // Store unresolved dependency warnings (from the recursive query if available)
    const unresolvedDeps = allDeps
      .filter(dep => dep.status === "unresolved")
      .map(dep => `${dep.author}-${dep.name}${dep.requiredVersion ? `-${dep.requiredVersion}` : ""}`)
    
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(activeProfileId, mod.id, unresolvedDeps)
    }
    
    onOpenChange(false)
  }
  
  const handleDownloadSelected = () => {
    if (!activeProfileId) return
    
    const installed = installedModsByProfile[activeProfileId]
    const isTargetInstalled = installed ? installed.has(mod.id) : false
    
    // Download target mod if not already installed
    if (!isTargetInstalled) {
      // Find the download URL for the requested version
      const versionData = mod.versions.find(v => v.version_number === requestedVersion)
      const downloadUrl = versionData?.download_url || mod.versions[0]?.download_url || ""
      
      startDownload({
        gameId: mod.gameId,
        modId: mod.id,
        modName: mod.name,
        modVersion: requestedVersion,
        modAuthor: mod.author,
        modIconUrl: mod.iconUrl,
        downloadUrl
      })
    }
    
    // Download selected dependencies
    effectiveSelectedDepIds.forEach(depId => {
      const dep = allDeps.find(d => d.id === depId)
      if (dep) {
        // Use required version from dependency string if specified, otherwise use latest
        const versionToDownload = dep.requiredVersion || dep.version
        
        // Use resolved mod info (online) or mock (fallback)
        const depMod = resolvedModsById.get(dep.id)
        if (depMod) {
          const versionData = depMod.versions.find(v => v.version_number === versionToDownload)
          const downloadUrl = versionData?.download_url || depMod.versions[0]?.download_url || ""
          
          startDownload({
            gameId: depMod.gameId,
            modId: depMod.id,
            modName: depMod.name,
            modVersion: versionToDownload,
            modAuthor: depMod.author,
            modIconUrl: depMod.iconUrl,
            downloadUrl
          })
        }
      }
    })
    
    // Store unresolved dependency warnings
    const unresolvedDeps = allDeps
      .filter(dep => dep.status === "unresolved")
      .map(dep => `${dep.author}-${dep.name}${dep.requiredVersion ? `-${dep.requiredVersion}` : ""}`)
    
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(activeProfileId, mod.id, unresolvedDeps)
    }
    
    onOpenChange(false)
  }

  
  const handleCancel = () => {
    onOpenChange(false)
  }
  
  const targetInstalled = activeProfileId ? (installedModsByProfile[activeProfileId]?.has(mod.id) || false) : false

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      // Reset to default selection next time the dialog opens
      setSelectedDepIds(null)
      setViewingMod(null)
      setShowModDialog(false)
    }
  }
  
  return (
    <>
      <DependencyModDialog 
        mod={viewingMod} 
        open={showModDialog} 
        onOpenChange={setShowModDialog}
      />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Download Dependencies</DialogTitle>
            <DialogDescription>
              {mod.name} requires the following dependencies. Select which ones to download.
            </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto px-6" style={{ maxHeight: "calc(85vh - 180px)" }}>
          <div className="space-y-4 pb-4">
            {/* Target Mod */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Target Mod</h3>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={true} 
                    disabled 
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{mod.name}</p>
                      {targetInstalled && (
                        <Badge variant="secondary" className="shrink-0">
                          <CheckCircle2 className="size-3 mr-1" />
                          Installed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      v{requestedVersion} by {mod.author}
                    </p>
                    {targetInstalled && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Already installed, will only download selected dependencies
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Dependencies */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Dependencies ({allDeps.length})
                </h3>
                <div className="flex items-center gap-2">
                  {selectableDeps.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAll()
                          } else {
                            handleDeselectAll()
                          }
                        }}
                        id="select-all"
                      />
                      <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer select-none">
                        Select All
                      </label>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-7 px-2"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </div>
              </div>
              
              {isLoadingDeps ? (
                <div className="space-y-2">
                  <SkeletonDependencyRow />
                  <SkeletonDependencyRow />
                  <SkeletonDependencyRow />
                </div>
              ) : allDeps.length === 0 ? (
                <div className="rounded-md border border-border bg-muted/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    This mod has no dependencies
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(depsByDepth.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([depth, deps]) => (
                      <div key={depth}>
                        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {depth === 0 ? "Direct Dependencies" : `Level ${depth} (Transitive)`}
                        </h4>
                        <div className="space-y-2">
                          {deps.map((dep) => {
                            const canSelect = allSelectableIds.has(dep.id)
                            const isSelected = effectiveSelectedDepIds.has(dep.id)
                            
                            // Check if this dep is required by any selected deps (can't be deselected)
                            const requiredBy: string[] = []
                            for (const parentKey of dep.parents) {
                              const parentDep = allDeps.find(d => d.key === parentKey)
                              if (parentDep && effectiveSelectedDepIds.has(parentDep.id)) {
                                requiredBy.push(parentDep.name)
                              }
                            }
                            const isRequired = requiredBy.length > 0
                            
                            return (
                              <div
                                key={dep.id}
                                className={`rounded-md border p-3 transition-colors ${
                                  canSelect 
                                    ? "border-border bg-card hover:bg-muted/50" 
                                    : "border-border bg-muted/30"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox 
                                    checked={isSelected}
                                    disabled={!canSelect || (isSelected && isRequired)}
                                    onCheckedChange={() => {
                                      if (canSelect) {
                                        handleToggleDep(dep.id)
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {getStatusIcon(dep.status)}
                                      <p className="text-sm font-medium truncate">
                                        {dep.name}
                                      </p>
                                      <Badge variant={getStatusVariant(dep.status)} className="shrink-0">
                                        {getStatusLabel(dep.status)}
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {dep.requiredVersion 
                                        ? `Requires v${dep.requiredVersion}` 
                                        : "Any version"}
                                      {dep.installedVersion && ` • Installed: v${dep.installedVersion}`}
                                    </p>
                                    
                                    {dep.status === "unresolved" && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">
                                        Could not find this dependency in catalog
                                      </p>
                                    )}
                                    
                                    {dep.status === "installed_wrong" && (
                                      <p className="text-xs text-yellow-600 mt-1">
                                        {enforceDependencyVersions 
                                          ? "Will update to required version" 
                                          : "Version mismatch (enforcement disabled)"}
                                      </p>
                                    )}
                                    
                                    {isSelected && isRequired && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Required by: {requiredBy.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                      const depMod = resolvedModsById.get(dep.id)
                                      if (depMod) {
                                        handleViewMod(depMod)
                                      }
                                      }}
                                      className="h-7 px-2 shrink-0"
                                    >
                                    <ExternalLink className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        
        <DialogFooter className="px-6 pb-6 pt-4 gap-2 sm:gap-0 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleDownloadModOnly}>
            Download mod only
          </Button>
          <Button onClick={handleDownloadSelected}>
            <Download className="size-4 mr-2" />
            Download selected ({targetInstalled ? effectiveSelectedDepIds.size : effectiveSelectedDepIds.size + 1})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
})
