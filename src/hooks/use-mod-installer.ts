/**
 * Mod installer hook - handles the full download + install flow
 * Downloads mod, waits for completion, then installs to profile
 */
import { useCallback } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import { useDownloadStore } from "@/store/download-store"
import { useDownloadActions } from "./use-download-actions"
import { useModManagementStore } from "@/store/mod-management-store"

export function useModInstaller() {
  const { startDownload } = useDownloadActions()
  const installModMutation = trpc.profiles.installMod.useMutation()
  const uninstallModMutation = trpc.profiles.uninstallMod.useMutation()
  const markInstalled = useModManagementStore((s) => s.installMod)
  const markUninstalled = useModManagementStore((s) => s.uninstallMod)
  
  /**
   * Installs a downloaded mod to a profile
   * Requires the mod to already be downloaded (extractedPath must exist)
   */
  const installDownloadedMod = useCallback(
    async (params: {
      gameId: string
      profileId: string
      modId: string
      author: string
      name: string
      version: string
      extractedPath: string
    }) => {
      try {
        const result = await installModMutation.mutateAsync({
          gameId: params.gameId,
          profileId: params.profileId,
          modId: params.modId,
          author: params.author,
          name: params.name,
          version: params.version,
          extractedPath: params.extractedPath,
        })
        
        // Mark as installed in state only after successful file copy
        markInstalled(params.profileId, params.modId, params.version)
        
        toast.success(`${params.name} installed`, {
          description: `${result.filesCopied} files copied to profile`,
        })
        
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error(`Failed to install ${params.name}`, {
          description: message,
        })
        throw error
      }
    },
    [installModMutation, markInstalled]
  )
  
  /**
   * Uninstalls a mod from a profile
   * Removes files from profile folder
   */
  const uninstallMod = useCallback(
    async (params: {
      gameId: string
      profileId: string
      modId: string
      author: string
      name: string
    }) => {
      try {
        const result = await uninstallModMutation.mutateAsync({
          gameId: params.gameId,
          profileId: params.profileId,
          modId: params.modId,
          author: params.author,
          name: params.name,
        })
        
        // Mark as uninstalled in state only after successful file removal
        await markUninstalled(params.profileId, params.modId)
        
        toast.success(`${params.name} uninstalled`, {
          description: `${result.filesRemoved} files removed from profile`,
        })
        
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error(`Failed to uninstall ${params.name}`, {
          description: message,
        })
        throw error
      }
    },
    [uninstallModMutation, markUninstalled]
  )
  
  /**
   * Downloads a mod (does not install yet)
   * User must explicitly install after download completes
   */
  const downloadMod = useCallback(
    (params: {
      gameId: string
      modId: string
      modName: string
      modVersion: string
      modAuthor: string
      modIconUrl: string
      downloadUrl: string
    }) => {
      startDownload(params)
    },
    [startDownload]
  )
  
  /**
   * Checks if a mod can be installed (i.e., it has been downloaded)
   * Returns the extractedPath if available, or undefined if not downloaded
   */
  const getDownloadedModPath = useCallback(
    (gameId: string, modId: string, version: string): string | undefined => {
      const downloadId = `${gameId}:${modId}:${version}`
      const task = useDownloadStore.getState().getTask(downloadId)
      
      if (task?.status === "completed" && task.extractedPath) {
        return task.extractedPath
      }
      
      return undefined
    },
    []
  )
  
  return {
    downloadMod,
    installDownloadedMod,
    uninstallMod,
    getDownloadedModPath,
    isInstalling: installModMutation.isPending,
    isUninstalling: uninstallModMutation.isPending,
  }
}
