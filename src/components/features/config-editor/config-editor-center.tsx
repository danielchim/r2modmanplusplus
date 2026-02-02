import { useState, lazy, Suspense, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, ChevronRight, ChevronDown, FileCode, Search, MoreVertical, FolderOpen, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseBepInExConfig, updateConfigValue, type ConfigSection, type ConfigItem } from "@/lib/config-parser"
import { logger } from "@/lib/logger"
import { trpc } from "@/lib/trpc"
import { useAppStore } from "@/store/app-store"
import { useProfileStore } from "@/store/profile-store"
import { toast } from "sonner"

// Lazy load Monaco editor
const MonacoEditor = lazy(() => import("@monaco-editor/react"))

type ConfigFile = {
  relativePath: string
  name: string
  ext: string
  mtimeMs: number
  size: number
  kind: "file"
  group: string
}

type FileFormat = "cfg" | "yaml" | "yml" | "json" | "ini" | "txt"

export function ConfigEditorCenter() {
  const { t } = useTranslation()
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const activeProfileId = useProfileStore((s) => 
    selectedGameId ? s.activeProfileIdByGame[selectedGameId] : null
  )
  
  const [selectedRelativePath, setSelectedRelativePath] = useState<string | null>(null)
  const [mode, setMode] = useState<"gui" | "raw">("gui")
  const [baselineText, setBaselineText] = useState<string>("")
  const [draftText, setDraftText] = useState<string>("")
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<ConfigFile | null>(null)

  // Log active profile context
  useEffect(() => {
    if (selectedGameId && activeProfileId) {
      logger.info(`[ConfigEditor] Active context: gameId=${selectedGameId}, profileId=${activeProfileId}`)
    } else {
      logger.warn(`[ConfigEditor] No active profile: gameId=${selectedGameId}, profileId=${activeProfileId}`)
    }
  }, [selectedGameId, activeProfileId])

  // Query config file list
  const listQuery = trpc.config.list.useQuery(
    { gameId: selectedGameId!, profileId: activeProfileId! },
    { enabled: !!selectedGameId && !!activeProfileId }
  )

  // Log file list results
  useEffect(() => {
    if (listQuery.data) {
      logger.info(`[ConfigEditor] Loaded ${listQuery.data.length} config files`)
      const groupCounts = listQuery.data.reduce((acc, file) => {
        acc[file.group] = (acc[file.group] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      logger.debug(`[ConfigEditor] Files by group:`, groupCounts)
    }
    if (listQuery.error) {
      logger.error(`[ConfigEditor] Failed to load config files:`, listQuery.error.message)
    }
  }, [listQuery.data, listQuery.error])

  // Query selected file content
  const readQuery = trpc.config.read.useQuery(
    { gameId: selectedGameId!, profileId: activeProfileId!, relativePath: selectedRelativePath! },
    { enabled: !!selectedGameId && !!activeProfileId && !!selectedRelativePath }
  )

  // Mutations
  const writeMutation = trpc.config.write.useMutation({
    onSuccess: () => {
      toast.success("File saved successfully")
      setBaselineText(draftText)
      listQuery.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to save file: ${error.message}`)
    },
  })

  const deleteMutation = trpc.config.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully")
      listQuery.refetch()
      setDeleteDialogOpen(false)
      setFileToDelete(null)
      
      // If we deleted the selected file, clear selection
      if (fileToDelete && fileToDelete.relativePath === selectedRelativePath) {
        const remainingFiles = listQuery.data?.filter(f => f.relativePath !== fileToDelete.relativePath) || []
        if (remainingFiles.length > 0) {
          setSelectedRelativePath(remainingFiles[0].relativePath)
        } else {
          setSelectedRelativePath(null)
        }
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete file: ${error.message}`)
    },
  })

  const revealMutation = trpc.config.reveal.useMutation({
    onSuccess: () => {
      toast.success("Opening folder in explorer")
    },
    onError: (error) => {
      toast.error(`Failed to open folder: ${error.message}`)
    },
  })

  const openMutation = trpc.config.open.useMutation({
    onSuccess: () => {
      toast.success("Opening file in external editor")
    },
    onError: (error) => {
      toast.error(`Failed to open file: ${error.message}`)
    },
  })

  // Auto-select first file when list loads
  if (listQuery.data && listQuery.data.length > 0 && !selectedRelativePath) {
    setSelectedRelativePath(listQuery.data[0].relativePath)
  }

  // Update baseline and draft when file content loads
  useEffect(() => {
    if (readQuery.data?.text && baselineText !== readQuery.data.text) {
      setBaselineText(readQuery.data.text)
      setDraftText(readQuery.data.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readQuery.data?.text])

  const files = listQuery.data || []
  const selectedFile = files.find(f => f.relativePath === selectedRelativePath)
  const dirty = draftText !== baselineText

  // Determine file format from extension
  const fileFormat: FileFormat | null = selectedFile
    ? (selectedFile.ext.slice(1) as FileFormat)
    : null

  // Parse config for GUI mode (only for cfg format)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const parsedConfig = useMemo(() => {
    if (fileFormat === "cfg") {
      return parseBepInExConfig(draftText)
    }
    return null
  }, [draftText, fileFormat])

  // Early return if no game or profile selected
  if (!selectedGameId || !activeProfileId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No active profile selected</p>
      </div>
    )
  }

  const handleSave = () => {
    if (!selectedRelativePath) return
    writeMutation.mutate({
      gameId: selectedGameId,
      profileId: activeProfileId,
      relativePath: selectedRelativePath,
      text: draftText,
    })
  }

  const handleRevert = () => {
    setDraftText(baselineText)
  }

  const handleItemChange = (section: ConfigSection, item: ConfigItem, newValue: string) => {
    const updated = updateConfigValue(draftText, section.name, item.key, newValue)
    setDraftText(updated)
  }

  const handleRawTextChange = (value: string | undefined) => {
    if (value !== undefined) {
      setDraftText(value)
    }
  }

  const toggleCategoryCollapse = (category: string) => {
    const newSet = new Set(collapsedSections)
    if (newSet.has(category)) {
      newSet.delete(category)
    } else {
      newSet.add(category)
    }
    setCollapsedSections(newSet)
  }

  const handleOpenInExplorer = (file: ConfigFile) => {
    logger.info(`Opening in explorer: ${file.name} (${file.relativePath})`)
    revealMutation.mutate({
      gameId: selectedGameId,
      profileId: activeProfileId,
      relativePath: file.relativePath,
    })
  }

  const handleOpenInExternalEditor = (file: ConfigFile) => {
    logger.info(`Opening in external editor: ${file.name} (${file.relativePath})`)
    openMutation.mutate({
      gameId: selectedGameId,
      profileId: activeProfileId,
      relativePath: file.relativePath,
    })
  }

  const handleDeleteFile = (file: ConfigFile) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (fileToDelete) {
      logger.info(`Deleting file: ${fileToDelete.name} (${fileToDelete.relativePath})`)
      deleteMutation.mutate({
        gameId: selectedGameId,
        profileId: activeProfileId,
        relativePath: fileToDelete.relativePath,
      })
    }
  }

  const canShowGui = fileFormat === "cfg" && parsedConfig

  // Group files by category
  const groupedFiles: Record<string, ConfigFile[]> = {}
  for (const file of files) {
    if (!groupedFiles[file.group]) {
      groupedFiles[file.group] = []
    }
    groupedFiles[file.group].push(file)
  }

  // Filter files by search
  const filteredGroupedFiles: Record<string, ConfigFile[]> = {}
  for (const [group, groupFiles] of Object.entries(groupedFiles)) {
    const filtered = groupFiles.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      filteredGroupedFiles[group] = filtered
    }
  }

  // Loading states
  if (listQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No config files found in this profile</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Left Panel: Config Files */}
      <div className="w-64 shrink-0 border-r border-border bg-muted/30 min-h-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-border p-4">
            <h2 className="text-lg font-semibold">{t("config_editor_config_files")}</h2>
          </div>

          {/* Search */}
          <div className="shrink-0 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search Configs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(filteredGroupedFiles).map(([group, groupFiles]) => (
              <div key={group} className="mb-2">
                <button
                  onClick={() => toggleCategoryCollapse(group)}
                  className="flex w-full items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/50 rounded"
                >
                  {collapsedSections.has(group) ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                  <span className="font-medium">{group}</span>
                </button>
                {!collapsedSections.has(group) && (
                  <div className="ml-3 mt-1 space-y-1">
                    {groupFiles.map((file) => (
                      <div
                        key={file.relativePath}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                          selectedRelativePath === file.relativePath && "bg-primary/20 border-l-2 border-primary"
                        )}
                      >
                        <button
                          onClick={() => setSelectedRelativePath(file.relativePath)}
                          className="flex flex-1 items-center gap-2 min-w-0 text-left hover:opacity-80"
                        >
                          <FileCode className="size-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{file.relativePath}</div>
                          </div>
                          {selectedRelativePath === file.relativePath && (
                            <div className="size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded hover:bg-accent"
                          >
                            <MoreVertical className="size-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenInExplorer(file)}>
                              <FolderOpen className="size-4 mr-2" />
                              Open in Explorer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenInExternalEditor(file)}>
                              <ExternalLink className="size-4 mr-2" />
                              Open in External Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFile(file)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete File
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Config Editor */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold">
            {selectedFile ? `Configuring: ${selectedFile.name}` : "Select a config file"}
          </h1>

          {/* Raw Edit Toggle */}
          {canShowGui && (
            <Button
              variant={mode === "raw" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "gui" ? "raw" : "gui")}
            >
              Toggle: Raw Edit Mode
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden min-h-0">
          {!selectedFile ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select a config file to edit</p>
            </div>
          ) : readQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : mode === "gui" && canShowGui ? (
            <div className="h-full overflow-y-auto">
              <div className="mx-auto w-full max-w-5xl px-8 py-6">
                <GuiMode 
                  parsedConfig={parsedConfig} 
                  onItemChange={handleItemChange}
                />
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="size-6 animate-spin" /></div>}>
              <RawMode
                value={draftText}
                language={getMonacoLanguage(fileFormat || "txt")}
                onChange={handleRawTextChange}
              />
            </Suspense>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
          {dirty && (
            <span className="mr-auto text-sm text-muted-foreground">{t("config_editor_unsaved_changes")}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleRevert} disabled={!dirty}>
            Revert
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave} 
            disabled={!dirty || writeMutation.isPending}
          >
            {writeMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog_delete_config_file_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{fileToDelete?.name}</strong> ({fileToDelete?.relativePath})?
              <br /><br />
              This action cannot be undone. The file will be permanently removed from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function GuiMode({ 
  parsedConfig, 
  onItemChange 
}: { 
  parsedConfig: ReturnType<typeof parseBepInExConfig>
  onItemChange: (section: ConfigSection, item: ConfigItem, newValue: string) => void
}) {
  return (
    <div className="space-y-6">
      {parsedConfig.sections.map((section) => (
        <div key={section.name}>
          <h2 className="mb-4 text-lg font-semibold">{section.displayName}</h2>
          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
            {section.items.map((item) => (
              <ConfigItemControl
                key={item.key}
                section={section}
                item={item}
                onChange={onItemChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfigItemControl({
  section,
  item,
  onChange
}: {
  section: ConfigSection
  item: ConfigItem
  onChange: (section: ConfigSection, item: ConfigItem, newValue: string) => void
}) {
  const handleBooleanChange = (checked: boolean) => {
    onChange(section, item, checked ? "true" : "false")
  }

  const handleSelectChange = (value: string | null) => {
    if (value) {
      onChange(section, item, value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(section, item, e.target.value)
  }

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <div className="text-sm font-medium">{item.key}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground">{item.description}</div>
        )}
        {item.defaultValue && (
          <div className="text-xs text-muted-foreground">Default: {item.defaultValue}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {item.type === "boolean" && (
          <Switch 
            checked={item.value.toLowerCase() === "true"} 
            onCheckedChange={handleBooleanChange}
          />
        )}
        {item.type === "select" && item.acceptableValues && (
          <Select value={item.value} onValueChange={handleSelectChange}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {item.acceptableValues.map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {(item.type === "text" || item.type === "number") && (
          <Input
            type={item.type === "number" ? "number" : "text"}
            value={item.value}
            onChange={handleInputChange}
            className="h-8 w-[180px]"
          />
        )}
      </div>
    </div>
  )
}

function RawMode({
  value,
  language,
  onChange
}: {
  value: string
  language: string
  onChange: (value: string | undefined) => void
}) {
  return (
    <div className="h-full w-full p-4 min-h-0">
      <div className="h-full w-full rounded-lg border border-border overflow-hidden">
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  )
}

function getMonacoLanguage(format: FileFormat): string {
  switch (format) {
    case "json":
      return "json"
    case "yaml":
    case "yml":
      return "yaml"
    case "cfg":
    case "ini":
    case "txt":
      return "plaintext"
  }
}
