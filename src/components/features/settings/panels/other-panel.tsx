import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/store/settings-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PanelProps {
  searchQuery?: string
}

export function OtherPanel(_props: PanelProps) {
  const { theme, cardDisplayType, funkyMode, enforceDependencyVersions } = useSettingsStore((s) => s.global)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)

  const handleRefreshModList = () => {
    // TODO: Implement refresh online mod list
    console.log("Refreshing online mod list...")
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of r2modman
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title="Theme"
          description="Choose your preferred color scheme"
          rightContent={
            <div className="flex gap-2">
              {(["system", "light", "dark"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={theme === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateGlobal({ theme: mode })}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          }
        />

        <SettingsRow
          title="Card display type"
          description="Choose how mod cards are displayed in the library"
          rightContent={
            <Select
              value={cardDisplayType}
              onValueChange={(value: "collapsed" | "expanded" | null) => {
                if (value) updateGlobal({ cardDisplayType: value })
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collapsed">Collapsed</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <SettingsRow
          title="Funky mode"
          description="Enable experimental and fun UI effects"
          rightContent={
            <Switch
              checked={funkyMode}
              onCheckedChange={(checked) => updateGlobal({ funkyMode: checked })}
            />
          }
        />

        <SettingsRow
          title="Refresh online mod list"
          description="Fetch the latest list of available mods from Thunderstore"
          rightContent={
            <Button variant="outline" size="sm" onClick={handleRefreshModList}>
              Refresh
            </Button>
          }
        />
      </div>

      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Mod Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure how mods and their dependencies are handled
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title="Enforce dependency versions"
          description="When enabled, mods with specific version requirements will only accept that exact version. When disabled, any version of the dependency will be considered acceptable."
          rightContent={
            <Switch
              checked={enforceDependencyVersions}
              onCheckedChange={(checked) => updateGlobal({ enforceDependencyVersions: checked })}
            />
          }
        />
      </div>
    </div>
  )
}
