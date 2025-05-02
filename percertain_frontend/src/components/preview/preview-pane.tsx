import React from 'react';

interface PreviewPaneProps {
  html: string;
}

export function PreviewPane({ html }: PreviewPaneProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white p-2 text-sm font-medium">
        Preview
      </div>
      <div className="flex-grow bg-white">
        <iframe
          srcDoc={html}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-popups allow-forms"
          title="Preview"
        />
      </div>
    </div>
  );
}
