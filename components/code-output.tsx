"use client"

import { Editor as MonacoEditor } from "@monaco-editor/react"

interface CodeOutputProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeOutput({ value, onChange }: CodeOutputProps) {
  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <div className="p-2 text-sm text-gray-400 border-b border-gray-800">
        Generated HTML
      </div>
      <MonacoEditor
        height="calc(100% - 33px)"
        language="html"
        value={value}
        onChange={(value: string | undefined) => onChange(value || "")}
        options={{
          fontSize: 14,
          lineNumbers: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          wordWrap: "on",
          theme: "vs-dark",
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          folding: true,
        }}
      />
    </div>
  )
}
