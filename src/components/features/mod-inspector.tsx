import { ArrowLeft, Download, Trash2, ExternalLink, AlertCircle, FileText, History, Network, Package } from "lucide-react"

import { useAppStore } from "@/store/app-store"
import { MODS } from "@/mocks/mods"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HtmlReadme } from "@/components/readme/html-readme"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function ModInspector() {
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectMod = useAppStore((s) => s.selectMod)

  const mod = MODS.find((m) => m.id === selectedModId)

  if (!mod) {
    return null
  }

  const handleBack = () => {
    selectMod(null)
  }

  return (
    <div className="flex flex-col">
      {/* Header with Back Button */}
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

      {/* Primary Action */}
      <div className="shrink-0 border-b border-border p-4">
        {mod.isEnabled ? (
          <Button variant="destructive" size="lg" className="w-full gap-2">
            <Trash2 className="size-4" />
            <span>Uninstall</span>
          </Button>
        ) : (
          <Button variant="default" size="lg" className="w-full gap-2">
            <Download className="size-4" />
            <span>Install</span>
          </Button>
        )}
      </div>

      {/* Metadata */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Version</span>
            <Badge variant="secondary">{mod.version}</Badge>
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
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <div className="mt-4">
              <HtmlReadme html={mod.readmeHtml} />
            </div>
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
            <h3 className="mb-3 text-sm font-semibold">Dependencies</h3>
            {mod.dependencies.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/50 p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  This mod has no dependencies
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {mod.dependencies.map((dep) => (
                  <div
                    key={dep}
                    className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                  >
                    <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{dep}</p>
                      <p className="text-xs text-muted-foreground">Required</p>
                    </div>
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
                        {version.version_number === mod.version && mod.isEnabled ? (
                          <Badge variant="outline" className="text-xs">Installed</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
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
