import { useState, lazy, Suspense, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, ChevronRight, ChevronDown, FileCode, Search, MoreVertical, FolderOpen, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseBepInExConfig, updateConfigValue, type ConfigSection, type ConfigItem } from "@/lib/config-parser"
import BepInExCfg from "@/mocks/BepInEx.cfg?raw"
import ModProjectYaml from "@/mocks/mod-project.yaml?raw"

// Lazy load Monaco editor
const MonacoEditor = lazy(() => import("@monaco-editor/react"))

type ConfigDoc = {
  id: string
  title: string
  subtitle?: string
  format: "cfg" | "yaml" | "json"
  initialText: string
  category: "core" | "user"
  icon?: string
}

const CONFIG_DOCS: ConfigDoc[] = [
  { id: "bepinex", title: "BepInEx", subtitle: "(BepInEx.cfg)", format: "cfg", initialText: BepInExCfg, category: "core" },
  { id: "bigger-lobby", title: "BiggerLobby", subtitle: "(Com.BiggerLobby.cfg)", format: "cfg", initialText: BepInExCfg, category: "user" },
  { id: "ftw-arms", title: "FTW Arms", subtitle: "(project.yaml)", format: "yaml", initialText: ModProjectYaml, category: "user" },
]

export function ConfigEditorCenter() {
  const [selectedDocId, setSelectedDocId] = useState<string>("bepinex")
  const [mode, setMode] = useState<"gui" | "raw">("gui")
  const [baselineText, setBaselineText] = useState<string>("")
  const [draftText, setDraftText] = useState<string>("")
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<ConfigDoc | null>(null)

  const selectedDoc = CONFIG_DOCS.find(d => d.id === selectedDocId)!

  // Initialize baseline and draft when doc changes
  useMemo(() => {
    setBaselineText(selectedDoc.initialText)
    setDraftText(selectedDoc.initialText)
  }, [selectedDoc.id])

  const dirty = draftText !== baselineText

  // Parse config for GUI mode (only for cfg format)
  const parsedConfig = useMemo(() => {
    if (selectedDoc.format === "cfg") {
      return parseBepInExConfig(draftText)
    }
    return null
  }, [draftText, selectedDoc.format])

  const handleSave = () => {
    setBaselineText(draftText)
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

  const handleOpenInExplorer = (doc: ConfigDoc) => {
    // Placeholder: In a real app, this would call an Electron API or filesystem API
    console.log(`Opening in explorer: ${doc.title} (${doc.subtitle})`)
    alert(`Open in Explorer: ${doc.title}\n\nThis would open the file location in your system file explorer.`)
  }

  const handleOpenInExternalEditor = (doc: ConfigDoc) => {
    // Placeholder: In a real app, this would call an Electron API
    console.log(`Opening in external editor: ${doc.title} (${doc.subtitle})`)
    alert(`Open in External Editor: ${doc.title}\n\nThis would open the file in your default text editor (e.g., VS Code, Notepad++).`)
  }

  const handleDeleteFile = (doc: ConfigDoc) => {
    setFileToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (fileToDelete) {
      // Placeholder: In a real app, this would delete the file from filesystem
      console.log(`Deleting file: ${fileToDelete.title} (${fileToDelete.subtitle})`)
      alert(`File Deleted: ${fileToDelete.title}\n\nIn a real app, this would delete the config file from disk.`)
      
      // If deleting the currently selected file, switch to another file
      if (fileToDelete.id === selectedDocId) {
        const remainingDocs = CONFIG_DOCS.filter(d => d.id !== fileToDelete.id)
        if (remainingDocs.length > 0) {
          setSelectedDocId(remainingDocs[0].id)
        }
      }
      
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  const canShowGui = selectedDoc.format === "cfg" && parsedConfig

  // Group docs by category
  const coreSystemDocs = CONFIG_DOCS.filter(d => d.category === "core")
  const userModsDocs = CONFIG_DOCS.filter(d => d.category === "user")

  // Filter docs by search
  const filteredCoreSystemDocs = coreSystemDocs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredUserModsDocs = userModsDocs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full min-h-0">
      {/* Left Panel: Config Files */}
      <div className="w-64 shrink-0 border-r border-border bg-muted/30 min-h-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-border p-4">
            <h2 className="text-lg font-semibold">Config Files</h2>
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
            {/* Core System */}
            <div className="mb-2">
              <button
                onClick={() => toggleCategoryCollapse("core")}
                className="flex w-full items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/50 rounded"
              >
                {collapsedSections.has("core") ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                <span className="font-medium">Core System</span>
              </button>
              {!collapsedSections.has("core") && (
                <div className="ml-3 mt-1 space-y-1">
                  {filteredCoreSystemDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                        selectedDocId === doc.id && "bg-primary/20 border-l-2 border-primary"
                      )}
                    >
                      <button
                        onClick={() => setSelectedDocId(doc.id)}
                        className="flex flex-1 items-center gap-2 min-w-0 text-left hover:opacity-80"
                      >
                        <FileCode className="size-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{doc.subtitle}</div>
                        </div>
                        {selectedDocId === doc.id && (
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
                          <DropdownMenuItem onClick={() => handleOpenInExplorer(doc)}>
                            <FolderOpen className="size-4 mr-2" />
                            Open in Explorer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenInExternalEditor(doc)}>
                            <ExternalLink className="size-4 mr-2" />
                            Open in External Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFile(doc)}
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

            {/* User Mods */}
            <div>
              <button
                onClick={() => toggleCategoryCollapse("user")}
                className="flex w-full items-center gap-1 px-2 py-1.5 text-sm hover:bg-muted/50 rounded"
              >
                {collapsedSections.has("user") ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                <span className="font-medium">User Mods</span>
              </button>
              {!collapsedSections.has("user") && (
                <div className="ml-3 mt-1 space-y-1">
                  {filteredUserModsDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                        selectedDocId === doc.id && "bg-primary/20 border-l-2 border-primary"
                      )}
                    >
                      <button
                        onClick={() => setSelectedDocId(doc.id)}
                        className="flex flex-1 items-center gap-2 min-w-0 text-left hover:opacity-80"
                      >
                        <FileCode className="size-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{doc.subtitle}</div>
                        </div>
                        {selectedDocId === doc.id && (
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
                          <DropdownMenuItem onClick={() => handleOpenInExplorer(doc)}>
                            <FolderOpen className="size-4 mr-2" />
                            Open in Explorer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenInExternalEditor(doc)}>
                            <ExternalLink className="size-4 mr-2" />
                            Open in External Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFile(doc)}
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
          </div>
        </div>
      </div>

      {/* Right Panel: Config Editor */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold">Configuring: {selectedDoc.title}</h1>

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
          {mode === "gui" && canShowGui ? (
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
                language={getMonacoLanguage(selectedDoc.format)}
                onChange={handleRawTextChange}
              />
            </Suspense>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
          {dirty && (
            <span className="mr-auto text-sm text-muted-foreground">Unsaved changes</span>
          )}
          <Button variant="outline" size="sm" onClick={handleRevert} disabled={!dirty}>
            Revert
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={!dirty}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Config File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{fileToDelete?.title}</strong> ({fileToDelete?.subtitle})?
              <br /><br />
              This action cannot be undone. The file will be permanently removed from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete File
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

function getMonacoLanguage(format: "cfg" | "yaml" | "json"): string {
  switch (format) {
    case "json":
      return "json"
    case "yaml":
      return "yaml"
    case "cfg":
      return "plaintext"
  }
}
