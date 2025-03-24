"use client"

import { useEffect, useRef } from "react"

interface PreviewProps {
  htmlContent: string
}

export default function Preview({ htmlContent }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        // Write the initial HTML content
        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Inter', sans-serif;
                  margin: 0;
                  padding: 20px;
                }
              </style>
              <script>
                function updateContent() {
                  const randomValue = Math.floor(Math.random() * 100)
                  document.querySelector('p').textContent = 'Random value: ' + randomValue
                }

                // Handle messages from parent
                window.addEventListener('message', (event) => {
                  if (event.data.type === 'update') {
                    // Handle updates from parent
                    console.log('Received update from parent:', event.data)
                  }
                })
              </script>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `)
        doc.close()
      }
    }
  }, [htmlContent])

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <div className="p-2 text-sm text-gray-400 border-b border-gray-800">
        Preview
      </div>
      <div className="h-[calc(100%-33px)] w-full bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
