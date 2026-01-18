import { useState, useMemo, memo, useEffect } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Download } from "lucide-react"
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
import { analyzeModDependencies, type DependencyStatus } from "@/lib/dependency-utils"
import { useModManagementStore } from "@/store/mod-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { useDownloadStore } from "@/store/download-store"
import { MODS } from "@/mocks/mods"
import type { Mod } from "@/types/mod"

type DependencyDownloadDialogProps = {
  mod: Mod | null
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

export const DependencyDownloadDialog = memo(function DependencyDownloadDialog({ mod, open, onOpenChange }: DependencyDownloadDialogProps) {
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame)
  const installedModsByGame = useModManagementStore((s) => s.installedModsByGame)
  const setDependencyWarnings = useModManagementStore((s) => s.setDependencyWarnings)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  const startDownload = useDownloadStore((s) => s.startDownload)
  
  const [selectedDepIds, setSelectedDepIds] = useState<Set<string>>(new Set())
  
  // Analyze dependencies when dialog opens
  const depInfos = useMemo(() => {
    if (!mod) return []
    
    const installedVersions = installedVersionsByGame[mod.gameId] || {}
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
  }, [mod, installedVersionsByGame, enforceDependencyVersions])
  
  // Initialize selected deps when dialog opens (select all that need downloading by default)
  useEffect(() => {
    if (!mod || !open) return
    
    const needsDownload = depInfos
      .filter(dep => 
        dep.resolvedMod && 
        (dep.status === "not_installed" || dep.status === "installed_wrong")
      )
      .map(dep => dep.resolvedMod!.id)
    
    setSelectedDepIds(new Set(needsDownload))
  }, [mod, open, depInfos])
  
  if (!mod) {
    return null
  }
  
  const handleToggleDep = (depId: string) => {
    const newSet = new Set(selectedDepIds)
    if (newSet.has(depId)) {
      newSet.delete(depId)
    } else {
      newSet.add(depId)
    }
    setSelectedDepIds(newSet)
  }
  
  const handleDownloadModOnly = () => {
    // Only download the target mod
    const installed = installedModsByGame[mod.gameId]
    const isTargetInstalled = installed ? installed.has(mod.id) : false
    
    if (!isTargetInstalled) {
      startDownload(mod.id, mod.gameId, mod.name, mod.version, mod.author, mod.iconUrl)
    }
    
    // Store unresolved dependency warnings
    const unresolvedDeps = depInfos
      .filter(dep => dep.status === "unresolved")
      .map(dep => dep.parsed.fullString)
    
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(mod.gameId, mod.id, unresolvedDeps)
    }
    
    onOpenChange(false)
  }
  
  const handleDownloadSelected = () => {
    const installed = installedModsByGame[mod.gameId]
    const isTargetInstalled = installed ? installed.has(mod.id) : false
    
    // Download target mod if not already installed
    if (!isTargetInstalled) {
      startDownload(mod.id, mod.gameId, mod.name, mod.version, mod.author, mod.iconUrl)
    }
    
    // Download selected dependencies
    selectedDepIds.forEach(depId => {
      const depInfo = depInfos.find(d => d.resolvedMod?.id === depId)
      if (depInfo && depInfo.resolvedMod) {
        const depMod = depInfo.resolvedMod
        startDownload(depMod.id, depMod.gameId, depMod.name, depMod.version, depMod.author, depMod.iconUrl)
      }
    })
    
    // Store unresolved dependency warnings
    const unresolvedDeps = depInfos
      .filter(dep => dep.status === "unresolved")
      .map(dep => dep.parsed.fullString)
    
    if (unresolvedDeps.length > 0) {
      setDependencyWarnings(mod.gameId, mod.id, unresolvedDeps)
    }
    
    onOpenChange(false)
  }
  
  const handleCancel = () => {
    onOpenChange(false)
  }
  
  const targetInstalled = installedModsByGame[mod.gameId]?.has(mod.id) || false
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      v{mod.version} by {mod.author}
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
              <h3 className="mb-2 text-sm font-semibold">
                Dependencies ({depInfos.length})
              </h3>
              
              {depInfos.length === 0 ? (
                <div className="rounded-md border border-border bg-muted/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    This mod has no dependencies
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {depInfos.map((depInfo, idx) => {
                    const canSelect = depInfo.resolvedMod && 
                      (depInfo.status === "not_installed" || depInfo.status === "installed_wrong")
                    const isSelected = depInfo.resolvedMod && selectedDepIds.has(depInfo.resolvedMod.id)
                    
                    return (
                      <div
                        key={idx}
                        className={`rounded-md border p-3 transition-colors ${
                          canSelect 
                            ? "border-border bg-card hover:bg-muted/50 cursor-pointer" 
                            : "border-border bg-muted/30"
                        }`}
                        onClick={() => {
                          if (canSelect && depInfo.resolvedMod) {
                            handleToggleDep(depInfo.resolvedMod.id)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={isSelected}
                            disabled={!canSelect}
                            onCheckedChange={() => {
                              if (canSelect && depInfo.resolvedMod) {
                                handleToggleDep(depInfo.resolvedMod.id)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusIcon(depInfo.status)}
                              <p className="text-sm font-medium truncate">
                                {depInfo.resolvedMod?.name || depInfo.parsed.fullString}
                              </p>
                              <Badge variant={getStatusVariant(depInfo.status)} className="shrink-0">
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
                                Could not find this dependency in catalog
                              </p>
                            )}
                            
                            {depInfo.status === "installed_wrong" && (
                              <p className="text-xs text-yellow-600 mt-1">
                                {enforceDependencyVersions 
                                  ? "Will update to required version" 
                                  : "Version mismatch (enforcement disabled)"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
            Download selected ({targetInstalled ? selectedDepIds.size : selectedDepIds.size + 1})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
