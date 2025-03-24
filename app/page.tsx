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
  const [dslCode, setDslCode] = useState(`// Welcome to Percertain - AI Web App Builder!
// This DSL helps you create AI-powered web applications using FastHTML

// Step 1: Define your app and its description
@app "AI Image Generator"
@description "Create and edit images using AI, with real-time preview"

// Step 2: Define your data structures
@data:
  // Define the data types your app will use
  images: {
    type: list,
    items: {
      url: string,
      prompt: string,
      settings: object
    }
  }
  currentImage: {
    type: object,
    properties: {
      prompt: string,
      style: string,
      size: string
    }
  }

// Step 3: Define your variables
@variables:
  imageHistory: images  // Store generated images
  userPrompt: ""       // Current user input
  selectedStyle: "realistic"
  imageSize: "1024x1024"

// Step 4: Define your UI layout and components
@ui:
  // Layout defines the structure of your page
  layout:
    - section: header
    - section: mainContent
    - section: controls
    - section: gallery

  // Components define the interactive elements
  components:
    header:
      - heading: {
          text: "AI Image Generator",
          style: "text-3xl font-bold"
        }
      - text: {
          content: "Create amazing images with AI",
          style: "text-gray-600"
        }

    mainContent:
      - container: {
          style: "flex justify-center p-8 bg-gray-100"
        }
      - image: {
          src: "{currentImage}",
          alt: "Generated image",
          style: "rounded-lg shadow-xl"
        }

    controls:
      - textInput: {
          label: "Describe your image",
          placeholder: "A serene lake at sunset...",
          bind: userPrompt
        }
      - select: {
          label: "Style",
          options: [
            "realistic",
            "artistic",
            "cartoon",
            "sketch"
          ],
          bind: selectedStyle
        }
      - button: {
          text: "Generate Image",
          onClick: "generateImage",
          style: "primary"
        }

    gallery:
      - heading: {text: "Your Generated Images"}
      - grid: {
          for: "image in imageHistory",
          columns: 3,
          gap: 4
        }
      - image: {
          src: "{image.url}",
          alt: "{image.prompt}",
          onClick: "selectImage(image)"
        }

// Step 5: Define your actions
@actions:
  generateImage:
    """
    // This will be converted to FastHTML Python code
    
    # Generate image using AI
    result = visual-create(
      prompt: userPrompt,
      style: selectedStyle,
      size: imageSize
    )

    # Process the result
    if result.success:
      # Add to history
      imageHistory.append({
        url: result.url,
        prompt: userPrompt,
        settings: {
          style: selectedStyle,
          size: imageSize
        }
      })
      
      # Update current image
      currentImage = result.url
    else:
      # Show error message
      showError(result.error)
    """

  selectImage:
    """
    # Load selected image details
    currentImage = image
    userPrompt = image.prompt
    selectedStyle = image.settings.style
    """

// Step 6: Define your AI mods
@mods:
  - visual-create   // Creates images from text
  - visual-edit    // Edits existing images
  - visual-think   // Analyzes images
  - text-think     // Processes text prompts

// This DSL will generate:
// 1. FastHTML Python code for the backend
// 2. HTML/CSS for the frontend
// 3. API integrations for AI services
// 4. Database schema for storing results
// 5. Error handling and validation`)

  const [htmlCode, setHtmlCode] = useState(`<!-- Generated FastHTML Template -->
<div class="min-h-screen bg-gray-50">
  <!-- Header Section -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto py-6 px-4">
      <h1 class="text-3xl font-bold text-gray-900">AI Image Generator</h1>
      <p class="mt-2 text-gray-600">Create amazing images with AI</p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-8 px-4">
    <!-- Image Preview -->
    <div class="flex justify-center p-8 bg-gray-100 rounded-lg">
      <div class="w-[512px] h-[512px] bg-white rounded-lg shadow-xl flex items-center justify-center">
        <p class="text-gray-400">Generated image will appear here</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="mt-8 max-w-2xl mx-auto">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Describe your image
          </label>
          <input
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="A serene lake at sunset..."
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Style
          </label>
          <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option>realistic</option>
            <option>artistic</option>
            <option>cartoon</option>
            <option>sketch</option>
          </select>
        </div>

        <button
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onclick="generateImage()"
        >
          Generate Image
        </button>
      </div>
    </div>

    <!-- Gallery -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold text-gray-900">Your Generated Images</h2>
      <div class="mt-4 grid grid-cols-3 gap-4">
        <!-- Images will be dynamically inserted here -->
      </div>
    </div>
  </main>
</div>

<script>
function generateImage() {
  // This will be replaced by FastHTML's Python implementation
  console.log("Generating image...")
}

function selectImage(image) {
  // This will be replaced by FastHTML's Python implementation
  console.log("Selected image:", image)
}
</script>`)

  const [previewContent, setPreviewContent] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  const horizontalSplitRef = useRef<any>(null)
  const verticalSplitRef = useRef<any>(null)

  // Initialize Split.js
  useEffect(() => {
    if (!isFullscreen) {
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
    const titleMatch = dslCode.match(/@app\s*"([^"]*)"/)
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
        <div className="flex flex-1 overflow-hidden">
          <div className="left-pane h-full overflow-hidden relative">
            <Editor value={dslCode} onChange={setDslCode} />
            <NavigationButtons />
          </div>

          <div className="right-pane h-full flex flex-col overflow-hidden">
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

            <div className="output-pane overflow-hidden">
              <CodeOutput value={htmlCode} onChange={setHtmlCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
