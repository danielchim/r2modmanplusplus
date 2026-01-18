import { useMemo, useEffect, useRef } from "react"
import DOMPurify from "dompurify"

import type { Config } from "dompurify"

type HtmlReadmeProps = {
  html: string
  onOpenLink?: (url: string) => void
}

export function HtmlReadme({ html, onOpenLink }: HtmlReadmeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Sanitize HTML with strict HTTPS-only policy
  const sanitizedHtml = useMemo(() => {
    // Configure DOMPurify with allowed tags and attributes
    const config: Config = {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "hr",
        "strong", "em", "u", "s",
        "blockquote",
        "ul", "ol", "li",
        "code", "pre",
        "a",
        "img",
      ],
      ALLOWED_ATTR: [
        "href", "title",
        "src", "alt", "width", "height",
      ],
    }

    // Add hook to enforce HTTPS-only protocol for links and images
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      // Create anchor element for URL parsing
      const anchor = document.createElement("a")

      // Enforce HTTPS-only for links
      if (node.hasAttribute("href")) {
        anchor.href = node.getAttribute("href") || ""
        
        // Remove href if not HTTPS or relative
        if (anchor.protocol && anchor.protocol !== "https:" && anchor.protocol !== "http:") {
          node.removeAttribute("href")
        } else if (anchor.protocol === "http:") {
          // Block http:// links (only allow https://)
          node.removeAttribute("href")
        } else if (anchor.protocol === "https:") {
          // Add security attributes for external links
          node.setAttribute("target", "_blank")
          node.setAttribute("rel", "noopener noreferrer")
        }
      }

      // Enforce HTTPS-only for images
      if (node.hasAttribute("src")) {
        anchor.href = node.getAttribute("src") || ""
        
        // Remove image if not HTTPS
        if (anchor.protocol && anchor.protocol !== "https:") {
          node.remove()
        } else if (anchor.protocol === "https:") {
          // Add lazy loading and privacy attributes
          node.setAttribute("loading", "lazy")
          node.setAttribute("decoding", "async")
          node.setAttribute("referrerpolicy", "no-referrer")
        }
      }
    })

    const sanitized = DOMPurify.sanitize(html, config)
    
    // Remove the hook after sanitization
    DOMPurify.removeAllHooks()
    
    return sanitized
  }, [html])

  // Handle link clicks to prevent navigation and use custom handler
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      
      if (anchor && anchor.hasAttribute("href")) {
        e.preventDefault()
        
        const href = anchor.getAttribute("href")
        if (!href) return

        try {
          const url = new URL(href, window.location.href)
          
          // Only allow HTTPS protocol
          if (url.protocol === "https:") {
            if (onOpenLink) {
              onOpenLink(url.href)
            } else {
              window.open(url.href, "_blank", "noopener,noreferrer")
            }
          }
        } catch {
          // Invalid URL, do nothing
          console.warn("Invalid URL in readme:", href)
        }
      }
    }

    container.addEventListener("click", handleClick)
    return () => container.removeEventListener("click", handleClick)
  }, [onOpenLink])

  return (
    <div
      ref={containerRef}
      className="readme prose-sm"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
