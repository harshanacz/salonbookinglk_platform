"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AccountStatusCheckerProps {
  children: React.ReactNode
}

interface AccountStatus {
  isActive: boolean
  deactivatedAt?: string
  canReactivate?: boolean
  daysSinceDeactivation?: number
}

export default function AccountStatusChecker({ children }: AccountStatusCheckerProps) {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const userData = await response.json()
          
          setAccountStatus({
            isActive: userData.isActive ?? true,
            deactivatedAt: userData.deactivatedAt,
            canReactivate: userData.deactivatedAt ? 
              Math.floor((new Date().getTime() - new Date(userData.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24)) <= 30 
              : false,
            daysSinceDeactivation: userData.deactivatedAt ? 
              Math.floor((new Date().getTime() - new Date(userData.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24))
              : 0
          })
        }
      } catch (error) {
        console.error("Error checking account status:", error)
        // If we can't check status, assume account is active
        setAccountStatus({ isActive: true })
      } finally {
        setIsLoading(false)
      }
    }

    checkAccountStatus()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // If account is active or status check failed, show normal content
  if (!accountStatus || accountStatus.isActive) {
    return <>{children}</>
  }

  // Account is deactivated - show deactivated message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Account Deactivated
        </h1>
        
        {accountStatus.canReactivate ? (
          <div>
            <p className="text-gray-600 mb-4">
              Your account was deactivated {accountStatus.daysSinceDeactivation} days ago. 
              You can reactivate it by simply logging in again.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You have {30 - (accountStatus.daysSinceDeactivation || 0)} days remaining to reactivate your account.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Reactivate Account
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Your account was deactivated more than 30 days ago and cannot be automatically reactivated.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please contact our support team for assistance.
            </p>
            <Link href="/contact">
              <Button className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        )}
        
        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
