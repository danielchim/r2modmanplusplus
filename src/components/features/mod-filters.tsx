import { useState, memo } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ModFiltersProps = {
  section: "mod" | "modpack"
  onSectionChange: (section: "mod" | "modpack") => void
  categories: string[]
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
  onClearCategories: () => void
  categoryCounts?: Record<string, number>
  sortKey: "updated" | "name" | "downloads"
  sortDir: "asc" | "desc"
  onSortChange: (sort: { key: "updated" | "name" | "downloads"; dir: "asc" | "desc" }) => void
}

export const ModFilters = memo(function ModFilters({
  section,
  onSectionChange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  sortKey,
  sortDir,
  onSortChange,
}: ModFiltersProps) {
  const { t } = useTranslation()
  const [sectionsOpen, setSectionsOpen] = useState(true)
  const [sortOpen, setSortOpen] = useState(true)
  const [categoriesOpen, setCategoriesOpen] = useState(true)

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{t("filters_title")}</h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Sections Group */}
        <div className="border-b border-border">
          <button
            onClick={() => setSectionsOpen(!sectionsOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>{t("filters_sections")}</span>
            {sectionsOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          {sectionsOpen && (
            <div className="px-4 pb-3 space-y-1">
              <button
                onClick={() => onSectionChange("mod")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  section === "mod"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    section === "mod"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {section === "mod" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("filters_mods")}</span>
              </button>
              <button
                onClick={() => onSectionChange("modpack")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  section === "modpack"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    section === "modpack"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {section === "modpack" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("filters_modpacks")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Sort Group */}
        <div className="border-b border-border">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>{t("filters_sort")}</span>
            {sortOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          {sortOpen && (
            <div className="px-4 pb-3 space-y-1">
              <button
                onClick={() => onSortChange({ key: "updated", dir: "desc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "updated" && sortDir === "desc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "updated" && sortDir === "desc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "updated" && sortDir === "desc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_last_updated_newest")}</span>
              </button>
              <button
                onClick={() => onSortChange({ key: "updated", dir: "asc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "updated" && sortDir === "asc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "updated" && sortDir === "asc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "updated" && sortDir === "asc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_last_updated_oldest")}</span>
              </button>
              <button
                onClick={() => onSortChange({ key: "name", dir: "asc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "name" && sortDir === "asc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "name" && sortDir === "asc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "name" && sortDir === "asc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_name_az")}</span>
              </button>
              <button
                onClick={() => onSortChange({ key: "name", dir: "desc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "name" && sortDir === "desc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "name" && sortDir === "desc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "name" && sortDir === "desc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_name_za")}</span>
              </button>
              <button
                onClick={() => onSortChange({ key: "downloads", dir: "desc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "downloads" && sortDir === "desc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "downloads" && sortDir === "desc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "downloads" && sortDir === "desc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_downloads_most")}</span>
              </button>
              <button
                onClick={() => onSortChange({ key: "downloads", dir: "asc" })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  sortKey === "downloads" && sortDir === "asc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 flex items-center justify-center",
                    sortKey === "downloads" && sortDir === "asc"
                      ? "border-primary"
                      : "border-muted-foreground/50"
                  )}
                >
                  {sortKey === "downloads" && sortDir === "asc" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span>{t("sort_downloads_least")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Categories Group */}
        <div className="border-b border-border">
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>{t("filters_categories")}</span>
            {categoriesOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          {categoriesOpen && (
            <div className="px-4 pb-3">
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category)
                  const count = categoryCounts?.[category] ?? 0
                  return (
                    <label
                      key={category}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleCategory(category)}
                      />
                      <span className="flex-1">{category}</span>
                      {count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {count}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Button */}
      {selectedCategories.length > 0 && (
        <div className="shrink-0 border-t border-border p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCategories}
            className="w-full"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
})
