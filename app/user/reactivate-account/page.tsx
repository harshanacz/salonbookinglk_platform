"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function AccountReactivationPage() {
  // State to store user's email address
  const [email, setEmail] = useState("")

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Error state
  const [error, setError] = useState("")

  // Success state
  const [success, setSuccess] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if coming from expired reactivation attempt
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError("Your 30-day reactivation period has expired. Please contact support to restore your account.")
    }
  }, [searchParams])

  // Handler function for form submission
  const handleReactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Basic validation
    if (!email) {
      setError("Email address is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate account')
      }

      setSuccess("Account reactivated successfully! You can now sign in.")
      
      // Redirect to sign in after a delay
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while reactivating your account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#FFF5FF] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page title and success icon */}
        <div className="flex items-center gap-2 mb-12">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-medium text-green-600">Reactivate Account</h1>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg mb-8">
          <p className="text-sm text-blue-700">
            Welcome back! You can reactivate your account within <strong>30 days</strong> of deactivation.
            <br />
            After 30 days, deactivated accounts are permanently deleted.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Reactivation form */}
        <form onSubmit={handleReactivate}>
          <div className="space-y-4 max-w-md">
            {/* Email input field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="email" className="text-sm">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-2"
                placeholder="Enter your registered email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-between mt-6">
              <Link href="/sign-in">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Back to Sign In
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  "Reactivate Account"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Help section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Need Help?</h3>
          <p className="text-xs text-gray-600">
            If you're having trouble reactivating your account or if your 30-day period has expired, 
            please contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
