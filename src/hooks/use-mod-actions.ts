/**
 * Mod actions hook - provides high-level mod operations with file system integration
 * Wraps both state management and file operations
 */
import { useCallback } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import { useModManagementActions } from "@/data"
import { useAppStore } from "@/store/app-store"

export function useModActions() {
  const uninstallModMutation = trpc.profiles.uninstallMod.useMutation()
  const { uninstallMod: markUninstalled } = useModManagementActions()
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  
  /**
   * Uninstalls a mod from a profile
   * Removes files from profile folder AND updates state
   */
  const uninstallMod = useCallback(
    async (
      profileId: string,
      modId: string,
      modMeta?: { author: string; name: string }
    ) => {
      if (!selectedGameId) {
        toast.error("No game selected")
        return
      }
      
      // If we don't have author/name, we can only update state (legacy behavior)
      if (!modMeta) {
        await markUninstalled(profileId, modId)
        return
      }
      
      try {
        const result = await uninstallModMutation.mutateAsync({
          gameId: selectedGameId,
          profileId,
          modId,
          author: modMeta.author,
          name: modMeta.name,
        })
        
        // Mark as uninstalled in state only after successful file removal
        await markUninstalled(profileId, modId)
        
        toast.success(`${modMeta.name} uninstalled`, {
          description: `${result.filesRemoved} files removed from profile`,
        })
        
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error(`Failed to uninstall ${modMeta.name}`, {
          description: message,
        })
        throw error
      }
    },
    [uninstallModMutation, markUninstalled, selectedGameId]
  )
  
  /**
   * Uninstalls all mods from a profile
   */
  const uninstallAllMods = useCallback(
    async (profileId: string, mods: Array<{ id: string; author: string; name: string }>) => {
      if (!selectedGameId) {
        toast.error("No game selected")
        return
      }
      
      let successCount = 0
      let failCount = 0
      
      for (const mod of mods) {
        try {
          await uninstallModMutation.mutateAsync({
            gameId: selectedGameId,
            profileId,
            modId: mod.id,
            author: mod.author,
            name: mod.name,
          })
          
          await markUninstalled(profileId, mod.id)
          successCount++
        } catch (error) {
          console.error(`Failed to uninstall ${mod.name}:`, error)
          failCount++
        }
      }
      
      if (successCount > 0) {
        toast.success(`Uninstalled ${successCount} mods`, {
          description: failCount > 0 ? `${failCount} failed` : undefined,
        })
      }
      
      if (failCount > 0 && successCount === 0) {
        toast.error(`Failed to uninstall ${failCount} mods`)
      }
    },
    [uninstallModMutation, markUninstalled, selectedGameId]
  )
  
  return {
    uninstallMod,
    uninstallAllMods,
    isUninstalling: uninstallModMutation.isPending,
  }
}
