"use client"

import { useRef, useEffect } from "react"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { PercertainLanguage, PercertainTheme } from "@/lib/percertain-language"
import type { editor } from 'monaco-editor'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    // Register the Percertain language and theme
    if (window.monaco) {
      window.monaco.languages.register({ id: 'percertain' })
      window.monaco.languages.setMonarchTokensProvider('percertain', PercertainLanguage)
      window.monaco.editor.defineTheme('percertain-theme', PercertainTheme)
    }
  }, [])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "all",
      wordWrap: "on",
      theme: "percertain-theme",
      padding: { top: 16, bottom: 16 },
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      folding: true,
      bracketPairColorization: { enabled: true },
    })
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <div className="p-2 text-sm text-gray-400 border-b border-gray-800">
        Percertain DSL
      </div>
      <div className="h-[calc(100%-33px)]">
        <MonacoEditor
          height="100%"
          language="percertain"
          value={value}
          onChange={(value: string | undefined) => onChange(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            wordWrap: "on",
            theme: "percertain-theme",
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  )
}
