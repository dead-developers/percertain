"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize } from "lucide-react"
import Editor from "@/components/editor"
import Preview from "@/components/preview"
import CodeOutput from "@/components/code-output"
import NavigationButtons from "@/components/navigation-buttons"
import Split from "split.js"

export default function Home() {
  const [dslCode, setDslCode] = useState(`// Note: Text that comes after "//" is ignored, which allows
// you to write notes - like the one you're reading now!

title
  Your WebApp's Title

description
  A short description of your web app.

output
  // This is the main output panel. You can use HTML here.
  // The square brackets allow you to insert data from your lists.
  // For example, if you have a list called "myList", then writing
  // [myList] here will insert a random item from that list.
  // You can also do [myList.pluralize], [myList.capitalize], etc.
  // Learn more in the tutorial: https://perchance.org/tutorial
  Hello [name]! Welcome to [title].

// Tips:
// - Highlight multiple lines and press Tab or Shift+Tab to indent and un-indent them all at once
// - You can change the URL of your generator by clicking the "settings" button in the top-right
// - You can use the sparkle button in the lower-right of the screen to ask the AI to adjust the visual design
// - Add background images, fonts, and other stuff with plugins:  perchance.org/plugins
// - Here are some generators you might like to import:  perchance.org/useful-generators
// - Read this page after reading the tutorial:  perchance.org/examples
// - There's a gear button in the top-left which you can use to make the lines wrap around when they reach the edge
// - Ask our friendly community members if you need help:  lemmy.world/c/perchance`)

  const [htmlCode, setHtmlCode] = useState(`<!-- Edit your HTML here -->
<h1>Your WebApp's Title</h1>
<p>Enter your content here</p>
<button onclick="updateContent()">randomize</button>

<style>
  body {
    font-family: system-ui, sans-serif;
    text-align: center;
    padding: 2rem;
  }
  button {
    background: #444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background: #555;
  }
</style>`)

  const [previewContent, setPreviewContent] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  const horizontalSplitRef = useRef<any>(null)
  const verticalSplitRef = useRef<any>(null)

  // Initialize Split.js
  useEffect(() => {
    // Only initialize splits if not in fullscreen mode
    if (!isFullscreen) {
      // Horizontal split (main editor vs preview+output)
      if (!horizontalSplitRef.current) {
        horizontalSplitRef.current = Split([".left-pane", ".right-pane"], {
          sizes: [50, 50],
          minSize: [200, 200],
          gutterSize: 6,
          direction: "horizontal",
          cursor: "col-resize",
          gutter: (index, direction) => {
            const gutter = document.createElement("div")
            gutter.className = `gutter gutter-${direction} bg-gray-800 hover:bg-gray-700 transition-colors`
            return gutter
          },
        })
      }

      // Vertical split (preview vs code output)
      if (!verticalSplitRef.current) {
        verticalSplitRef.current = Split([".preview-pane", ".output-pane"], {
          sizes: [50, 50],
          minSize: [100, 100],
          gutterSize: 6,
          direction: "vertical",
          cursor: "row-resize",
          gutter: (index, direction) => {
            const gutter = document.createElement("div")
            gutter.className = `gutter gutter-${direction} bg-gray-800 hover:bg-gray-700 transition-colors`
            return gutter
          },
        })
      }
    }

    // Cleanup on unmount or when toggling fullscreen
    return () => {
      if (horizontalSplitRef.current) {
        horizontalSplitRef.current.destroy()
        horizontalSplitRef.current = null
      }
      if (verticalSplitRef.current) {
        verticalSplitRef.current.destroy()
        verticalSplitRef.current = null
      }
    }
  }, [isFullscreen])

  // Update preview content when DSL or HTML changes
  useEffect(() => {
    // Process DSL code to extract variables
    const titleMatch = dslCode.match(/title\s*\n\s*(.*)/)
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Your WebApp's Title"

    // Simple DSL processing - replace variables in HTML
    let processedHtml = htmlCode
    processedHtml = processedHtml.replace(/\[title\]/g, title)

    // Set the processed HTML as the preview content
    setPreviewContent(processedHtml)
  }, [dslCode, htmlCode])

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 overflow-hidden">
      {isFullscreen ? (
        // Fullscreen preview mode
        <div className="w-full h-full relative">
          <Preview htmlContent={previewContent} />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 text-xs border-gray-700 bg-transparent text-gray-400 flex items-center gap-1 z-10"
            onClick={toggleFullscreen}
          >
            <Minimize className="h-3 w-3" />
            <span>exit fullscreen</span>
          </Button>
        </div>
      ) : (
        // Normal editor mode
        <div className="flex flex-1 overflow-hidden">
          {/* Left pane - DSL editor */}
          <div className="left-pane h-full overflow-hidden relative">
            <Editor value={dslCode} onChange={setDslCode} language="javascript" />
            <NavigationButtons />
          </div>

          {/* Right pane - Preview and code output */}
          <div className="right-pane h-full flex flex-col overflow-hidden">
            {/* Preview area */}
            <div className="preview-pane overflow-hidden relative">
              <Preview htmlContent={previewContent} />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 text-xs border-gray-700 bg-transparent text-gray-400 flex items-center gap-1 z-10"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-3 w-3" />
                <span>fullscreen</span>
              </Button>
            </div>

            {/* Code output area */}
            <div className="output-pane overflow-hidden">
              <CodeOutput value={htmlCode} onChange={setHtmlCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

