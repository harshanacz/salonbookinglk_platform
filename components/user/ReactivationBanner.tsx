"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReactivationBannerProps {
  onClose?: () => void
}

export default function ReactivationBanner({ onClose }: ReactivationBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isReactivated, setIsReactivated] = useState(false)

  useEffect(() => {
    // Check if user was just reactivated
    const checkReactivationStatus = async () => {
      try {
        const response = await fetch("/api/user/reactivate", {
          method: "POST",
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.message.includes("reactivated")) {
            setIsReactivated(true)
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.error("Error checking reactivation status:", error)
      }
    }

    checkReactivationStatus()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !isReactivated) {
    return null
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Welcome back! Your account has been reactivated.
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your account was successfully reactivated when you logged in. 
              All your previous data and preferences have been restored.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-green-600 hover:text-green-800 p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
