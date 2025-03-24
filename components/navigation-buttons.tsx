"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function NavigationButtons() {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-400 transition-colors"
        onClick={() => {
          // Navigate to previous step
          console.log("Previous step")
        }}
      >
        <ChevronLeft className="h-3 w-3 mr-1" />
        <span>Previous</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-400 transition-colors"
        onClick={() => {
          // Navigate to next step
          console.log("Next step")
        }}
      >
        <span>Next</span>
        <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-400 transition-colors"
        onClick={() => {
          // Save current state
          console.log("Save state")
        }}
      >
        <span>Save</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-gray-700 bg-[#1e1e1e] hover:bg-gray-800 text-gray-400 transition-colors"
        onClick={() => {
          // Load saved state
          console.log("Load state")
        }}
      >
        <span>Load</span>
      </Button>
    </div>
  )
}
