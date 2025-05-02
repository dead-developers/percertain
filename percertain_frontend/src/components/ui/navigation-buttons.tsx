"use client"

import { Save, Upload, User, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NavigationButtons() {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-gray-800 p-2">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            title="Save"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            <span>Save</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            title="Publish"
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            <span>Publish</span>
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            title="Profile"
          >
            <User className="h-3.5 w-3.5 mr-1" />
            <span>Profile</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            title="Home"
          >
            <Home className="h-3.5 w-3.5 mr-1" />
            <span>Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

