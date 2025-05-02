"use client"

import { useRef } from "react"
import { Editor as MonacoEditor } from "@monaco-editor/react"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export default function Editor({ value, onChange, language = "javascript" }: EditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor

    // Set editor options
    editor.updateOptions({
      fontSize: 12,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "all",
      wordWrap: "on",
      theme: "vs-dark",
      padding: { bottom: 40 }, // Add padding at the bottom for the navigation buttons
    })
  }

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 12,
          lineNumbers: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          wordWrap: "on",
          theme: "vs-dark",
          padding: { bottom: 40 }, // Add padding at the bottom for the navigation buttons
        }}
      />
    </div>
  )
}

