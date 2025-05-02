import React from 'react';
import { Editor } from '@monaco-editor/react';

interface EditorPaneProps {
  initialValue: string;
  onChange: (value: string) => void;
  errors?: string[];
}

export function EditorPane({ initialValue, onChange, errors = [] }: EditorPaneProps) {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white p-2 text-sm font-medium">
        DSL Editor
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          defaultLanguage="percertain"
          defaultValue={initialValue}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          beforeMount={(monaco) => {
            // Register the Percertain language
            monaco.languages.register({ id: "percertain" });
            
            // Define the language syntax highlighting
            monaco.languages.setMonarchTokensProvider("percertain", {
              tokenizer: {
                root: [
                  [/@(app|description|data|variables|ui|actions|mods)/, "keyword"],
                  [/[a-zA-Z][\w$]*/, "identifier"],
                  [/".*?"/, "string"],
                  [/\d+(\.\d+)?/, "number"],
                  [/[{}()\[\]]/, "@brackets"],
                  [/[;,.]/, "delimiter"],
                  [/#.*$/, "comment"],
                ],
              },
            });
          }}
          onMount={(editor, monaco) => {
            // Add error markers
            if (errors.length > 0) {
              const model = editor.getModel();
              if (model) {
                const markers = errors.map(error => {
                  // Parse error message to get line and column
                  const match = error.match(/Error at line (\d+), column (\d+):/);
                  
                  if (match) {
                    const line = parseInt(match[1], 10);
                    const column = parseInt(match[2], 10);
                    
                    return {
                      severity: monaco.MarkerSeverity.Error,
                      message: error,
                      startLineNumber: line,
                      startColumn: column,
                      endLineNumber: line,
                      endColumn: column + 1,
                    };
                  }
                  
                  return {
                    severity: monaco.MarkerSeverity.Error,
                    message: error,
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 2,
                  };
                });
                
                monaco.editor.setModelMarkers(model, 'percertain', markers);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
