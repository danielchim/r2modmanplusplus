import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { openFolder, selectFolder } from "@/lib/desktop"
import { cn } from "@/lib/utils"

type FolderPathControlProps = {
  value: string
  placeholder?: string
  onChangePath: (nextPath: string) => void
  className?: string
}

export function FolderPathControl({
  value,
  placeholder = "Not set",
  onChangePath,
  className,
}: FolderPathControlProps) {
  const canBrowse = (value || "").trim().length > 0

  const handleBrowse = () => {
    if (!canBrowse) return
    openFolder(value)
  }

  const handleChange = async () => {
    const newPath = await selectFolder()
    if (newPath) {
      onChangePath(newPath)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        value={value || ""}
        placeholder={placeholder}
        readOnly
        className="font-mono text-xs flex-1 min-w-0"
        onFocus={(e) => e.currentTarget.select()}
      />
      <Button variant="outline" size="sm" onClick={handleBrowse} disabled={!canBrowse}>
        Browse
      </Button>
      <Button variant="outline" size="sm" onClick={handleChange}>
        Change
      </Button>
    </div>
  )
}
