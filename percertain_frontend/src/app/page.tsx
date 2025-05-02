"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize, FileText, Settings, Sparkles, BookOpen } from "lucide-react"
import Editor from "@/components/ui/editor" // Assuming editor is in ui subdir now
import Preview from "@/components/ui/preview" // Assuming preview is in ui subdir now
import CodeOutput from "@/components/ui/code-output" // Assuming code-output is in ui subdir now
// import NavigationButtons from "@/components/navigation-buttons" // Keep if needed
import Split from "split.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Use Tabs for multi-file editing

// Define types for DSL files and generated code
type DslFiles = {
  pc: string
  sc: string
  features: string
  styles: string
}

type GeneratedCode = {
  uiPreview?: string // HTML mockup from DeepSeek-V3
  logicFiles?: { [filename: string]: string } // e.g., {"main.py": "...", "requirements.txt": "..."}
  error?: string
  status?: string[] // To show progress messages
}

export default function Home() {
  // State for DSL files
  const [dslFiles, setDslFiles] = useState<DslFiles>({
    pc: `// --- app.pc --- 

// Metadata Section
@app "My AI App"
@description "An example application demonstrating the Percertain DSL."
@version "1.0"

// Data Section
@data:
  title: "Welcome!"
  counter: 0

// UI Layout Section
@ui_layout:
  description: "Header, main content with counter and button."

// UI Theme Section
@ui_theme:
  description: "Default theme."

// UI Components Section
@ui_components:
  header:
    - heading: "{title}"
  main:
    - text: "Count: {counter}"
    - button: { id: "incBtn", label: "Increment", onClick: "increment" }

// Logic Flow Section
@logic_flow:
  increment:
    - action: update_state
      target: counter
      value: "{counter + 1}"

// AI Tasks Section
@ai_tasks:
  placeholder: "No AI tasks defined yet."
`, // Default app.pc content
    sc: `// --- app.sc --- 

@goal
  "A simple counter app."

@success_criteria
  - "Counter increments on button click."

@target_audience
  "Demo users."
`, // Default app.sc content
    features: `// --- app.features --- 

@optional
  decrement_button:
    description: "Add a decrement button."

@brainstorm
  - "Could the counter reset?"
`, // Default app.features content
    styles: `// --- app.styles --- 

@style_guide
  palette:
    primary: "blue"
`, // Default app.styles content
  })

  const [activeDslFile, setActiveDslFile] = useState<keyof DslFiles>("pc")
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({ status: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const horizontalSplitRef = useRef<any>(null)
  const verticalSplitRef = useRef<any>(null)

  // Initialize Split.js
  useEffect(() => {
    if (!isFullscreen) {
      if (!horizontalSplitRef.current) {
        horizontalSplitRef.current = Split([".left-pane", ".right-pane"], {
          sizes: [50, 50],
          minSize: [300, 300],
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

  // Handle DSL code changes
  const handleDslChange = (value: string) => {
    setDslFiles((prev) => ({ ...prev, [activeDslFile]: value }))
  }

  // Function to call the backend API
  const handleGenerate = async () => {
    setIsLoading(true)
    setGeneratedCode({ status: ["Starting generation..."] })

    try {
      const response = await fetch("/api/ask-ai", { // Assuming the backend runs on the same host/port
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dsl: dslFiles }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Handle streaming response (if backend streams)
      // For now, assume backend sends status updates then final JSON
      // This needs refinement based on actual backend implementation
      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to get response reader.")

      const decoder = new TextDecoder()
      let result = ""
      let currentStatus: string[] = []
      let finalJson: GeneratedCode | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        result += chunk

        // Simple status update parsing (assuming lines starting with "---")
        const lines = result.split("\n")
        currentStatus = lines.filter(line => line.startsWith("---") || line.startsWith("ERROR") || line.startsWith("DSL"))
        setGeneratedCode(prev => ({ ...prev, status: currentStatus }))

        // Try to parse the last part as JSON (crude approach)
        try {
            const potentialJson = lines[lines.length - 1] || lines[lines.length - 2] || "{}";
            if (potentialJson.startsWith("{") && potentialJson.endsWith("}")) {
                 // This logic is flawed for streaming, backend should send distinct final JSON
                 // finalJson = JSON.parse(potentialJson);
            }
        } catch {}
      }
      
      // TODO: Refine based on how backend sends final data.
      // Assuming backend sends UI preview and logic files separately or combined.
      // For now, let's parse the full result assuming it contains markers.
      const uiMatch = result.match(/--- Generating UI Code ---\n([\s\S]*?)--- Generating Main Application Code/);
      const logicMatch = result.match(/--- Generating Main Application Code ---\n([\s\S]*?)--- Code Generation Process Finished ---/);
      
      let uiPreview = uiMatch ? uiMatch[1].replace("UI Code Generation Complete.\n", "").trim() : "(UI Preview Generation Failed or Not Found)";
      let logicFiles: { [filename: string]: string } = { "main.py": "(Logic Code Generation Failed or Not Found)" };
      
      // Attempt to parse logic code if found
      if (logicMatch) {
          const logicBlock = logicMatch[1].replace("Main Application Code Generation Complete. Received JSON structure.\n", "").trim();
          try {
              // Try parsing as JSON (if backend sends JSON)
              const parsedLogic = JSON.parse(logicBlock);
              logicFiles = parsedLogic;
          } catch (e) {
              // Assume it's raw code if JSON parse fails
              logicFiles = { "main.py": logicBlock };
          }
      }

      setGeneratedCode({
          status: currentStatus,
          uiPreview: uiPreview,
          logicFiles: logicFiles,
      });

    } catch (error: any) {
      console.error("Generation failed:", error)
      setGeneratedCode({ status: [...(generatedCode.status || []), `Error: ${error.message}`], error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Determine content for the output pane (show main.py if available)
  const outputContent = generatedCode.logicFiles?.["main.py"] || generatedCode.error || generatedCode.status?.join("\n") || "// Generated code will appear here";

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 overflow-hidden">
      {isFullscreen ? (
        // Fullscreen preview mode
        <div className="w-full h-full relative">
          <Preview htmlContent={generatedCode.uiPreview || ""} />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 text-xs border-gray-700 bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white flex items-center gap-1 z-10"
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
          <div className="left-pane h-full overflow-hidden flex flex-col">
            <Tabs value={activeDslFile} onValueChange={(value) => setActiveDslFile(value as keyof DslFiles)} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-1 border-b border-gray-700">
                <TabsList className="bg-transparent border-none p-0 h-auto">
                  <TabsTrigger value="pc" className="text-xs px-2 py-1 data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-sm border-none">app.pc</TabsTrigger>
                  <TabsTrigger value="sc" className="text-xs px-2 py-1 data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-sm border-none">app.sc</TabsTrigger>
                  <TabsTrigger value="features" className="text-xs px-2 py-1 data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-sm border-none">app.features</TabsTrigger>
                  <TabsTrigger value="styles" className="text-xs px-2 py-1 data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-sm border-none">app.styles</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                      <BookOpen className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                      <Settings className="h-4 w-4" />
                   </Button>
                   <Button onClick={handleGenerate} disabled={isLoading} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1">
                      {isLoading ? "Generating..." : "Generate"}
                   </Button>
                </div>
              </div>
              <TabsContent value="pc" className="flex-1 overflow-hidden mt-0">
                <Editor value={dslFiles.pc} onChange={handleDslChange} language="yaml" />
              </TabsContent>
              <TabsContent value="sc" className="flex-1 overflow-hidden mt-0">
                <Editor value={dslFiles.sc} onChange={handleDslChange} language="yaml" />
              </TabsContent>
              <TabsContent value="features" className="flex-1 overflow-hidden mt-0">
                <Editor value={dslFiles.features} onChange={handleDslChange} language="yaml" />
              </TabsContent>
              <TabsContent value="styles" className="flex-1 overflow-hidden mt-0">
                <Editor value={dslFiles.styles} onChange={handleDslChange} language="yaml" />
              </TabsContent>
            </Tabs>
            {/* <NavigationButtons /> */} // Consider where to place these if needed
          </div>

          {/* Right pane - Preview and code output */}
          <div className="right-pane h-full flex flex-col overflow-hidden">
            {/* Preview area */}
            <div className="preview-pane overflow-hidden relative">
              <Preview htmlContent={generatedCode.uiPreview || ""} />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 text-xs border-gray-700 bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white flex items-center gap-1 z-10"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-3 w-3" />
                <span>fullscreen</span>
              </Button>
            </div>

            {/* Code output area */}
            <div className="output-pane overflow-hidden">
              {/* Display status messages or generated code */}
              <CodeOutput value={outputContent} language="python" readOnly />
              {/* TODO: Add Deploy button here, enabled when logicFiles exist */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

