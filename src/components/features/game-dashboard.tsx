import { useState } from "react"
import { Plus, Upload, Download as DownloadIcon, ChevronDown } from "lucide-react"

import { useAppStore } from "@/store/app-store"
import { useProfileStore } from "@/store/profile-store"
import { PROFILES } from "@/mocks/profiles"
import { Button } from "@/components/ui/button"
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

export function GameDashboard() {
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const activeProfileId = useProfileStore(
    (s) => s.activeProfileIdByGame[selectedGameId]
  )
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)

  const handleCreateProfile = (profileName: string) => {
    // TODO: Implement actual profile creation logic
    console.log("Creating profile:", profileName, "for game:", selectedGameId)
  }

  const gameProfiles = PROFILES.filter((p) => p.gameId === selectedGameId)
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId)

  return (
    <>
      <CreateProfileDialog
        open={createProfileOpen}
        onOpenChange={setCreateProfileOpen}
        onCreateProfile={handleCreateProfile}
      />
      <div className="flex flex-col gap-4 p-4">
        {/* Section Title */}
        <div>
          <h2 className="text-lg font-semibold text-balance">Profiles & Sync</h2>
        </div>

        {/* Current Profile Display */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="w-full rounded-md border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Current Profile</div>
                <div className="mt-1 font-medium">{currentProfile?.name ?? activeProfileId ?? "Default"}</div>
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
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Upload className="size-4" />
            <span>Import Profile Code</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <DownloadIcon className="size-4" />
            <span>Export Profile</span>
          </Button>
        </div>

        {/* Profile List */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">All Profiles</h3>
            <Button variant="ghost" size="icon-xs" aria-label="Add profile">
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {gameProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setActiveProfile(selectedGameId, profile.id)}
                className="flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-ring data-[active=true]:bg-muted"
                data-active={profile.id === activeProfileId}
              >
                <span className="text-sm">{profile.name}</span>
                {profile.id === activeProfileId && (
                  <Plus className="size-3 rotate-45 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Launch Controls */}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Button variant="default" size="lg" className="w-full">
            Start Modded
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Start Vanilla
          </Button>
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
