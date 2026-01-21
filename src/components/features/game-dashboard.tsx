import { useState, useEffect } from "react"
import { Plus, Upload, Download as DownloadIcon, ChevronDown, Settings, FolderOpen, FileCode, FileDown, Edit, Trash2 } from "lucide-react"

import { useAppStore } from "@/store/app-store"
import { useProfileStore, type Profile } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useSettingsStore } from "@/store/settings-store"
// import { getExeNames } from "@/lib/ecosystem" // Will be used for IPC binary verification later
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
import { toast } from "sonner"

// Stable fallback constant to avoid creating new [] in selectors
const EMPTY_PROFILES: readonly Profile[] = []

export function GameDashboard() {
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [renameProfileOpen, setRenameProfileOpen] = useState(false)
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false)
  const [uninstallAllOpen, setUninstallAllOpen] = useState(false)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const openSettingsToGame = useAppStore((s) => s.openSettingsToGame)
  
  // Early return if no game selected
  if (!selectedGameId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No game selected</p>
          <p className="text-sm text-muted-foreground">Add a game to get started</p>
        </div>
      </div>
    )
  }
  
  const activeProfileId = useProfileStore(
    (s) => s.activeProfileIdByGame[selectedGameId]
  )
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const createProfile = useProfileStore((s) => s.createProfile)
  const renameProfile = useProfileStore((s) => s.renameProfile)
  const deleteProfile = useProfileStore((s) => s.deleteProfile)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  // Avoid returning new [] in selector - return undefined and default outside
  const profilesFromStore = useProfileStore((s) => s.profilesByGame[selectedGameId])
  const profiles = profilesFromStore ?? EMPTY_PROFILES
  
  const uninstallAllMods = useModManagementStore((s) => s.uninstallAllMods)
  const deleteProfileState = useModManagementStore((s) => s.deleteProfileState)
  const installedModsByProfile = useModManagementStore((s) => s.installedModsByProfile)
  const installedModsSet = activeProfileId ? installedModsByProfile[activeProfileId] : undefined
  const installedModCount = installedModsSet?.size ?? 0
  
  // Check if game binary can be found
  const getPerGameSettings = useSettingsStore((s) => s.getPerGame)
  const installFolder = getPerGameSettings(selectedGameId).gameInstallFolder
  const profilesEnabled = installFolder?.trim().length > 0
  // const exeNames = getExeNames(selectedGameId) // Will be used for IPC binary verification later
  
  // Auto-ensure default profile when install folder becomes valid
  useEffect(() => {
    if (profilesEnabled && selectedGameId) {
      ensureDefaultProfile(selectedGameId)
    }
  }, [profilesEnabled, selectedGameId, ensureDefaultProfile])
  
  // Determine launch button state and tooltip
  let launchDisabled = true
  let launchTooltip = "Install folder not set"
  
  if (installFolder) {
    // Install folder is set, but we can't verify binary without IPC yet
    // TODO: Add IPC call to check if any of exeNames exist in installFolder
    launchDisabled = true
    launchTooltip = "Game binary was not found"
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
  
  const handleDeleteProfile = () => {
    if (!activeProfileId) return
    const result = deleteProfile(selectedGameId, activeProfileId)
    if (!result.deleted) {
      toast.error("Cannot delete default profile")
    } else {
      deleteProfileState(activeProfileId)
      toast.success("Profile deleted")
    }
    setDeleteProfileOpen(false)
  }

  const handleUninstallAll = () => {
    if (!activeProfileId) return
    uninstallAllMods(activeProfileId)
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
      <div className="flex flex-col gap-4 p-4">
        {/* Section Title */}
        <div>
          <h2 className="text-lg font-semibold text-balance">Profiles & Sync</h2>
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
                <div className="text-xs text-muted-foreground">Current Profile</div>
                <div className="mt-1 font-medium">
                  {profilesEnabled ? (currentProfile?.name ?? activeProfileId ?? "Default") : "Not available"}
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
              <DropdownMenuLabel className="px-3 py-2">All Profiles</DropdownMenuLabel>
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
                <span>Create new profile</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Actions */}
        <div className="space-y-2">
          {!profilesEnabled && (
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground text-center">
              Set install folder in Game Settings to enable profiles
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            disabled={!profilesEnabled}
          >
            <Upload className="size-4" />
            <span>Import Profile Code</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            disabled={!profilesEnabled}
          >
            <FolderOpen className="size-4" />
            <span>Import Local Mod</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setRenameProfileOpen(true)}
            disabled={!profilesEnabled}
          >
            <Edit className="size-4" />
            <span>Rename Profile</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setDeleteProfileOpen(true)}
            disabled={!profilesEnabled || activeProfileId === `${selectedGameId}-default`}
          >
            <Trash2 className="size-4" />
            <span>Delete Profile</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => setUninstallAllOpen(true)}
            disabled={installedModCount === 0}
          >
            <Trash2 className="size-4" />
            <span>Uninstall All Mods</span>
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
            <span>Export Profile</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--anchor-width)]">
            <DropdownMenuItem className="gap-2">
              <FileDown className="size-4" />
              <span>Export as File</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FileCode className="size-4" />
              <span>Export as Code</span>
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
          <span>Game Settings</span>
        </Button>

        {/* Launch Controls */}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Tooltip open={launchDisabled ? undefined : false}>
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
              >
                Start Modded
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {launchTooltip}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip open={launchDisabled ? undefined : false}>
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
              >
                Start Vanilla
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {launchTooltip}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
          <div className="size-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">
            Modded Game Ready
          </span>
        </div>
      </div>
    </>
  )
}
