"use client"

import { useRef, useEffect } from "react"

interface PreviewProps {
  htmlContent: string
}

export default function Preview({ htmlContent }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()
      }
    }
  }, [htmlContent])

  return (
    <div className="h-full w-full bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none"
        title="Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      <div className="absolute bottom-2 right-2 flex gap-2">
        <button className="text-xs border border-gray-700 bg-transparent text-gray-400 px-2 py-1 rounded">auto</button>
        <button className="text-xs border border-gray-700 bg-transparent text-gray-400 px-2 py-1 rounded">
          reload
        </button>
      </div>
    </div>
  )
}

