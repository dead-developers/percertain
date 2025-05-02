"use client"
import { Editor as MonacoEditor } from "@monaco-editor/react"

interface CodeOutputProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeOutput({ value, onChange }: CodeOutputProps) {
  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language="html"
        value={value}
        onChange={(value) => onChange(value || "")}
        options={{
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

