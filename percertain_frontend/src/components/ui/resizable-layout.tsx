"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Split from "split.js"

interface ResizableLayoutProps {
  children: ReactNode
  direction: "horizontal" | "vertical"
  sizes?: number[]
  minSizes?: number[] | number
  gutterSize?: number
  className?: string
  id?: string
}

export default function ResizableLayout({
  children,
  direction,
  sizes = [50, 50],
  minSizes = 100,
  gutterSize = 6,
  className = "",
  id,
}: ResizableLayoutProps) {
  const splitRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const childElements = Array.from(containerRef.current.children)

    // Filter out gutter elements that might be added by Split.js
    const panes = childElements.filter((child) => !child.classList.contains("gutter"))

    if (panes.length < 2) return

    // Initialize Split.js
    splitRef.current = Split(panes, {
      sizes,
      minSize: minSizes,
      gutterSize,
      direction,
      gutter: (index, direction) => {
        const gutter = document.createElement("div")
        gutter.className = `gutter gutter-${direction} bg-gray-800 hover:bg-gray-700 transition-colors`
        return gutter
      },
    })

    // Cleanup on unmount
    return () => {
      if (splitRef.current) {
        splitRef.current.destroy()
        splitRef.current = null
      }
    }
  }, [direction, sizes, minSizes, gutterSize])

  const containerClass = `flex ${direction === "horizontal" ? "flex-row" : "flex-col"} ${className}`

  return (
    <div ref={containerRef} className={containerClass} id={id}>
      {children}
    </div>
  )
}

