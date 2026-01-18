import { useState, useRef, useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { GameDashboard } from "@/components/features/game-dashboard"
import { ModInspector } from "@/components/features/mod-inspector"

export function ContextPanel() {
  const selectedModId = useAppStore((s) => s.selectedModId)
  const [width, setWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = window.innerWidth - e.clientX
      // Constrain width between 280px and 800px
      const constrainedWidth = Math.max(280, Math.min(800, newWidth))
      setWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ew-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing])

  return (
    <div 
      ref={panelRef}
      className="relative flex h-full shrink-0 flex-col overflow-y-auto border-l border-border bg-card"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-ew-resize hover:bg-primary/50 active:bg-primary"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsResizing(true)
        }}
      />
      {selectedModId ? <ModInspector /> : <GameDashboard />}
    </div>
  )
}
