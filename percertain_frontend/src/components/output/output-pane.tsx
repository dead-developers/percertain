import React from 'react';
import { Editor } from '@monaco-editor/react';

interface OutputPaneProps {
  code: string;
}

export function OutputPane({ code }: OutputPaneProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white p-2 text-sm font-medium">
        Generated FastHTML Python
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
