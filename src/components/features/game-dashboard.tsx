import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Upload, Download as DownloadIcon, ChevronDown, Settings, FolderOpen, FileCode, FileDown, Edit, Trash2 } from "lucide-react"

import { useAppStore } from "@/store/app-store"
import { useProfileStore, type Profile } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { trpc } from "@/lib/trpc"
import { getExeNames, getEcosystemEntry, getModloaderPackageForGame } from "@/lib/ecosystem"
import { useCatalogStatus } from "@/lib/queries/useOnlineMods"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { CreateProfileDialog } from "./create-profile-dialog"
import { RenameProfileDialog } from "./rename-profile-dialog"
import { DeleteProfileDialog } from "./delete-profile-dialog"
import { UninstallAllModsDialog } from "./uninstall-all-mods-dialog"
import { InstallBaseDependenciesDialog } from "./install-base-dependencies-dialog"
import { toast } from "sonner"

// Stable fallback constant to avoid creating new [] in selectors
const EMPTY_PROFILES: readonly Profile[] = []

export function GameDashboard() {
  const { t } = useTranslation()
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [renameProfileOpen, setRenameProfileOpen] = useState(false)
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false)
  const [uninstallAllOpen, setUninstallAllOpen] = useState(false)
  const [installDepsOpen, setInstallDepsOpen] = useState(false)
  const [depsMissing, setDepsMissing] = useState<string[]>([])
  const [isInstallingDeps, setIsInstallingDeps] = useState(false)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const openSettingsToGame = useAppStore((s) => s.openSettingsToGame)
  
  const activeProfileId = useProfileStore(
    (s) => selectedGameId ? s.activeProfileIdByGame[selectedGameId] : undefined
  )
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const createProfile = useProfileStore((s) => s.createProfile)
  const renameProfile = useProfileStore((s) => s.renameProfile)
  const deleteProfile = useProfileStore((s) => s.deleteProfile)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  // Avoid returning new [] in selector - return undefined and default outside
  const profilesFromStore = useProfileStore((s) => selectedGameId ? s.profilesByGame[selectedGameId] : undefined)
  const profiles = profilesFromStore ?? EMPTY_PROFILES
  
  const deleteProfileState = useModManagementStore((s) => s.deleteProfileState)
  const uninstallAllMods = useModManagementStore((s) => s.uninstallAllMods)
  const installedModsByProfile = useModManagementStore((s) => s.installedModsByProfile)
  const installMod = useModManagementStore((s) => s.installMod)
  
  const resetProfileMutation = trpc.profiles.resetProfile.useMutation()
  const launchMutation = trpc.launch.start.useMutation()
  const installDepsMutation = trpc.launch.installBaseDependencies.useMutation()
  const trpcUtils = trpc.useUtils()
  const installedModsSet = activeProfileId ? installedModsByProfile[activeProfileId] : undefined
  const installedModCount = installedModsSet?.size ?? 0
  
  // Check if game binary can be found
  const getPerGameSettings = useSettingsStore((s) => s.getPerGame)
  const installFolder = selectedGameId ? getPerGameSettings(selectedGameId).gameInstallFolder : ""
  const profilesEnabled = installFolder?.trim().length > 0
  const exeNames = selectedGameId ? getExeNames(selectedGameId) : []
  const ecosystem = selectedGameId ? getEcosystemEntry(selectedGameId) : null
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex || ""
  
  // Query to verify binary exists
  const binaryVerification = trpc.launch.verifyBinary.useQuery(
    {
      installFolder,
      exeNames,
    },
    {
      enabled: profilesEnabled && exeNames.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )
  
  // Poll launch status
  const launchStatus = trpc.launch.getStatus.useQuery(
    {
      gameId: selectedGameId || "",
    },
    {
      enabled: !!selectedGameId,
      refetchInterval: 1500, // Poll every 1.5 seconds
      refetchOnWindowFocus: true,
    }
  )
  
  // Poll catalog status for build progress
  const catalogStatus = useCatalogStatus(selectedGameId || "", !!selectedGameId)
  const toastIdRef = useRef<string | number | undefined>(undefined)
  
  // Show toast notification for catalog building progress
  useEffect(() => {
    if (!catalogStatus.data) return
    
    const { status, packagesIndexed, totalPackages, errorMessage } = catalogStatus.data
    
    if (status === "building") {
      // totalPackages can momentarily be 0 (metadata not initialized yet) or stale.
      // Clamp progress to [0, 100] to avoid nonsensical values like 69504%.
      const rawProgress = totalPackages > 0 ? (packagesIndexed / totalPackages) * 100 : 0
      const progress = Math.max(0, Math.min(100, Math.round(rawProgress)))
      const safeIndexed = Math.max(0, packagesIndexed)
      const safeTotal = Math.max(0, totalPackages)
      const message = `Indexing mod catalog... ${safeIndexed.toLocaleString()}/${safeTotal.toLocaleString()} (${progress}%)`
      
      if (toastIdRef.current) {
        // Update existing toast
        toast.loading(message, {
          id: toastIdRef.current,
          duration: Infinity,
        })
      } else {
        // Create new toast
        toastIdRef.current = toast.loading(message, {
          duration: Infinity,
        })
      }
    } else if (status === "ready" && toastIdRef.current) {
      // Build complete - dismiss loading toast and show success
      toast.dismiss(toastIdRef.current)
      toast.success("Mod catalog ready!", {
        duration: 3000,
      })
      toastIdRef.current = undefined
    } else if (status === "error" && toastIdRef.current) {
      // Build failed - dismiss loading toast and show error
      toast.dismiss(toastIdRef.current)
      toast.error(`Failed to index mod catalog: ${errorMessage || "Unknown error"}`, {
        duration: 5000,
      })
      toastIdRef.current = undefined
    } else if (status === "stale" && toastIdRef.current) {
      // If we transitioned away from building without completing, ensure the loading toast doesn't stick.
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = undefined
    }
  }, [catalogStatus.data])
  
  // Cleanup toast on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])
  
  // Auto-ensure default profile when install folder becomes valid
  useEffect(() => {
    if (profilesEnabled && selectedGameId) {
      ensureDefaultProfile(selectedGameId)
    }
  }, [profilesEnabled, selectedGameId, ensureDefaultProfile])
  
  // Early return if no game selected - MUST be after all hooks
  if (!selectedGameId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">{t("common_no_game_selected")}</p>
          <p className="text-sm text-muted-foreground">{t("common_add_game_to_get_started")}</p>
        </div>
      </div>
    )
  }
  
  // Determine launch button state and tooltip
  let launchDisabled = true
  let launchTooltip = t("dashboard_install_folder_not_set")
  
  const isRunning = launchStatus.data?.running ?? false
  const isLaunching = launchMutation.isPending
  
  if (installFolder) {
    if (binaryVerification.isLoading) {
      launchDisabled = true
      launchTooltip = t("dashboard_verifying_game_files")
    } else if (!binaryVerification.data?.ok) {
      launchDisabled = true
      launchTooltip = binaryVerification.data?.reason || t("dashboard_game_binary_not_found")
    } else if (isRunning) {
      launchDisabled = true
      launchTooltip = t("dashboard_game_is_running")
    } else if (isLaunching) {
      launchDisabled = true
      launchTooltip = "Launching..."
    } else {
      launchDisabled = false
      launchTooltip = ""
    }
  }
  
  const handleStartModded = async () => {
    if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return
    
    try {
      // Check if base dependencies are installed
      const depsCheck = await trpcUtils.launch.checkBaseDependencies.fetch({
        gameId: selectedGameId,
        profileId: activeProfileId,
      })
      
      if (depsCheck.needsInstall) {
        // Show install dialog
        setDepsMissing(depsCheck.missing)
        setInstallDepsOpen(true)
        return
      }
      
      // Dependencies are installed, proceed with launch
      const modloaderPackage = selectedGameId ? getModloaderPackageForGame(selectedGameId) : null
      
      const result = await launchMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        mode: "modded",
        installFolder,
        exePath: binaryVerification.data.exePath,
        launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
        packageIndexUrl,
        modloaderPackage: modloaderPackage || undefined,
      })
      
      if (result.success) {
        toast.success("Game launched", {
          description: `Started in modded mode (PID: ${result.pid})`,
        })
      } else {
        toast.error("Launch failed", {
          description: result.error,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Launch failed", {
        description: message,
      })
    }
  }
  
  const handleInstallAndLaunch = async () => {
    if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return
    
    try {
      setIsInstallingDeps(true)
      const modloaderPackage = selectedGameId ? getModloaderPackageForGame(selectedGameId) : null
      
      // Show progress toast
      const packageName = modloaderPackage 
        ? `${modloaderPackage.owner}-${modloaderPackage.name}` 
        : "BepInEx-BepInExPack"
      
      toast.info("Downloading mod loader", {
        description: `Fetching ${packageName} from Thunderstore...`,
      })
      
      // Install base dependencies
      const installResult = await installDepsMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        packageIndexUrl,
        modloaderPackage: modloaderPackage || undefined,
      })
      
      if (!installResult.success) {
        toast.error("Installation failed", {
          description: installResult.error,
        })
        setIsInstallingDeps(false)
        setInstallDepsOpen(false)
        return
      }
      
       // Register the modloader package as installed in the mod store.
       // Use UUID so metadata loads; fallback to owner-name if UUID is missing.
       const installedId = installResult.packageUuid4 || installResult.packageId
       if (installedId && installResult.version) {
         installMod(activeProfileId, installedId, installResult.version)
       }
      
      toast.success("Base dependencies installed", {
        description: `${installResult.filesInstalled || 0} components installed successfully`,
      })
      
      setIsInstallingDeps(false)
      setInstallDepsOpen(false)
      
      // Now launch the game
      toast.info("Launching game", {
        description: "Starting game in modded mode...",
      })
      
      const result = await launchMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        mode: "modded",
        installFolder,
        exePath: binaryVerification.data.exePath,
        launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
        packageIndexUrl,
        modloaderPackage: modloaderPackage || undefined,
      })
      
      if (result.success) {
        toast.success("Game launched", {
          description: `Started in modded mode (PID: ${result.pid})`,
        })
      } else {
        toast.error("Launch failed", {
          description: result.error,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Failed", {
        description: message,
      })
      setIsInstallingDeps(false)
      setInstallDepsOpen(false)
    }
  }
  
  const handleInstallOnly = async () => {
    if (!selectedGameId || !activeProfileId) return
    
    try {
      setIsInstallingDeps(true)
      const modloaderPackage = selectedGameId ? getModloaderPackageForGame(selectedGameId) : null
      
      const installResult = await installDepsMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        packageIndexUrl,
        modloaderPackage: modloaderPackage || undefined,
      })
      
      if (!installResult.success) {
        toast.error("Installation failed", {
          description: installResult.error,
        })
      } else {
         // Register the modloader package as installed in the mod store.
         // Use UUID so metadata loads; fallback to owner-name if UUID is missing.
         const installedId = installResult.packageUuid4 || installResult.packageId
         if (installedId && installResult.version) {
           installMod(activeProfileId, installedId, installResult.version)
         }
        
        toast.success("Base dependencies installed", {
          description: `${installResult.filesInstalled || 0} components installed`,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Installation failed", {
        description: message,
      })
    } finally {
      setIsInstallingDeps(false)
      setInstallDepsOpen(false)
    }
  }
  
  const handleStartVanilla = async () => {
    if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return
    
    try {
      const modloaderPackage = selectedGameId ? getModloaderPackageForGame(selectedGameId) : null
      
      const result = await launchMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        mode: "vanilla",
        installFolder,
        exePath: binaryVerification.data.exePath,
        launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
        packageIndexUrl,
        modloaderPackage: modloaderPackage || undefined,
      })
      
      if (result.success) {
        toast.success("Game launched", {
          description: `Started in vanilla mode (PID: ${result.pid})`,
        })
      } else {
        toast.error("Launch failed", {
          description: result.error,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Launch failed", {
        description: message,
      })
    }
  }

  const handleCreateProfile = (profileName: string) => {
    createProfile(selectedGameId, profileName)
    toast.success("Profile created")
  }

  const handleRenameProfile = (newName: string) => {
    if (!activeProfileId) return
    renameProfile(selectedGameId, activeProfileId, newName)
    toast.success("Profile renamed")
  }
  
  const handleDeleteProfile = async () => {
    if (!activeProfileId) return
    
    const result = deleteProfile(selectedGameId, activeProfileId)
    if (!result.deleted) {
      toast.error("Cannot delete default profile")
      setDeleteProfileOpen(false)
      return
    }
    
    try {
      // Delete profile BepInEx folder from disk
      const resetResult = await resetProfileMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
      })
      
      // Clear state
      deleteProfileState(activeProfileId)
      
      toast.success("Profile deleted", {
        description: `${resetResult.filesRemoved} files removed from disk`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Failed to delete profile files", {
        description: message,
      })
    }
    
    setDeleteProfileOpen(false)
  }

  const handleUninstallAll = async () => {
    if (!activeProfileId) return
    
    try {
      // Delete profile BepInEx folder (all installed mods)
      const result = await resetProfileMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
      })
      
      // Clear mod state for this profile (but keep the profile itself)
      uninstallAllMods(activeProfileId)
      
      toast.success("All mods uninstalled", {
        description: `${result.filesRemoved} files removed from profile`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Failed to uninstall mods", {
        description: message,
      })
    }
    
    setUninstallAllOpen(false)
  }

  const gameProfiles = profiles.map(profile => ({
    ...profile,
    modCount: installedModsByProfile[profile.id]?.size ?? 0
  }))
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId)

  return (
    <>
      <CreateProfileDialog
        open={createProfileOpen}
        onOpenChange={setCreateProfileOpen}
        onCreateProfile={handleCreateProfile}
      />
      <RenameProfileDialog
        open={renameProfileOpen}
        onOpenChange={setRenameProfileOpen}
        onRenameProfile={handleRenameProfile}
        currentName={currentProfile?.name ?? activeProfileId ?? "Default"}
      />
      <DeleteProfileDialog
        open={deleteProfileOpen}
        onOpenChange={setDeleteProfileOpen}
        profileName={currentProfile?.name ?? activeProfileId ?? "Default"}
        onConfirm={handleDeleteProfile}
        disabled={activeProfileId === `${selectedGameId}-default`}
        disabledReason="Cannot delete the default profile"
      />
      <UninstallAllModsDialog
        open={uninstallAllOpen}
        onOpenChange={setUninstallAllOpen}
        modCount={installedModCount}
        onConfirm={handleUninstallAll}
      />
      <InstallBaseDependenciesDialog
        open={installDepsOpen}
        onOpenChange={setInstallDepsOpen}
        onInstallAndLaunch={handleInstallAndLaunch}
        onInstallOnly={handleInstallOnly}
        missing={depsMissing}
        isInstalling={isInstallingDeps}
      />
      <div className="flex flex-col gap-4 p-4">
        {/* Section Title */}
        <div>
          <h2 className="text-lg font-semibold text-balance">{t("dashboard_profiles_and_sync")}</h2>
        </div>

        {/* Current Profile Display */}
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!profilesEnabled}
            render={
              <button
                type="button"
                className="w-full rounded-md border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{t("dashboard_current_profile")}</div>
                <div className="mt-1 font-medium">
                  {profilesEnabled ? (currentProfile?.name ?? activeProfileId ?? t("common_default")) : t("common_not_available")}
                </div>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--anchor-width)] rounded-xl shadow-xl py-2 ring-1 ring-border/80"
            align="start"
          >
            {/* All Profiles Section */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2">{t("common_all_profiles")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={activeProfileId ?? ""}
                onValueChange={(profileId) => setActiveProfile(selectedGameId, profileId)}
              >
                {gameProfiles.map((profile) => (
                  <DropdownMenuRadioItem
                    key={profile.id}
                    value={profile.id}
                    className="mx-1 gap-3 rounded-md px-3 py-2"
                  >
                    <span>{profile.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{profile.modCount} mods</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="mx-0 my-2" />

            {/* Create New Profile Section */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="mx-1 gap-3 rounded-md px-3 py-2"
                onClick={() => setCreateProfileOpen(true)}
              >
                <Plus className="size-5" />
                <span>{t("common_create_new_profile")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Actions */}
        <div className="space-y-2">
          {!profilesEnabled && (
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground text-center">
              {t("dashboard_set_install_folder_to_enable_profiles")}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            disabled={!profilesEnabled}
          >
            <Upload className="size-4" />
            <span>{t("dashboard_import_profile_code")}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            disabled={!profilesEnabled}
          >
            <FolderOpen className="size-4" />
            <span>{t("dashboard_import_local_mod")}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setRenameProfileOpen(true)}
            disabled={!profilesEnabled}
          >
            <Edit className="size-4" />
            <span>{t("dashboard_rename_profile")}</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setDeleteProfileOpen(true)}
            disabled={!profilesEnabled || activeProfileId === `${selectedGameId}-default`}
          >
            <Trash2 className="size-4" />
            <span>{t("dashboard_delete_profile")}</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setUninstallAllOpen(true)}
            disabled={installedModCount === 0}
          >
            <Trash2 className="size-4" />
            <span>{t("dashboard_uninstall_all_mods")}</span>
            {installedModCount > 0 && (
              <span className="ml-auto text-xs">({installedModCount})</span>
            )}
          </Button>
        </div>
        
        {/* Export Profile Dropdown - Outside space-y container to prevent layout shift */}
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!profilesEnabled}
            render={
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" />
            }
          >
            <DownloadIcon className="size-4" />
            <span>{t("dashboard_export_profile")}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--anchor-width)]">
            <DropdownMenuItem className="gap-2">
              <FileDown className="size-4" />
              <span>{t("dashboard_export_as_file")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FileCode className="size-4" />
              <span>{t("dashboard_export_as_code")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Game Settings */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={() => openSettingsToGame(selectedGameId)}
        >
          <Settings className="size-4" />
          <span>{t("dashboard_game_settings")}</span>
        </Button>

        {/* Launch Controls */}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          {launchDisabled ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-block w-full" />
                }
              >
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-full" 
                  disabled={launchDisabled}
                  onClick={handleStartModded}
                >
                  {t("dashboard_start_modded")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {launchTooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button 
              variant="default" 
              size="lg" 
              className="w-full" 
              disabled={launchDisabled}
              onClick={handleStartModded}
            >
              {t("dashboard_start_modded")}
            </Button>
          )}
          
          {launchDisabled ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-block w-full" />
                }
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full" 
                  disabled={launchDisabled}
                  onClick={handleStartVanilla}
                >
                  {t("dashboard_start_vanilla")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {launchTooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full" 
              disabled={launchDisabled}
              onClick={handleStartVanilla}
            >
              {t("dashboard_start_vanilla")}
            </Button>
          )}
        </div>

        {/* Status Indicator */}
        <div className={`flex items-center gap-2 rounded-md px-3 py-2 ${isRunning ? "bg-green-500/10" : "bg-primary/10"}`}>
          <div className={`size-2 rounded-full ${isRunning ? "bg-green-500" : "bg-primary"}`} />
          <span className={`text-xs font-medium ${isRunning ? "text-green-500" : "text-primary"}`}>
            {isRunning ? t("dashboard_running_pid", { pid: launchStatus.data?.pid ?? "" }) : t("dashboard_ready")}
          </span>
        </div>
      </div>
    </>
  )
}
