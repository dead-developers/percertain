"use client"
import { Editor as MonacoEditor } from "@monaco-editor/react"

interface CodeOutputProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
}

export default function CodeOutput({
  value,
  onChange,
  language = "html",
  readOnly = false,
}: CodeOutputProps) {
  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange?.(value || "")}
        options={{
          readOnly,
          fontSize: 12,
          lineNumbers: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          wordWrap: "on",
          theme: "vs-dark",
        }}
      />
    </div>
  )
}

