"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

export default function AccountDeactivationPage() {
  // State to store user's email address
  const [email, setEmail] = useState("")

  // State to store confirmation text
  const [confirmationText, setConfirmationText] = useState("")

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Error state
  const [error, setError] = useState("")

  // Success state
  const [success, setSuccess] = useState("")

  const router = useRouter()
  const { signOut } = useAuth()

  // Handler function for form submission
  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Basic validation
    if (!email || !confirmationText) {
      setError("All fields are required")
      return
    }

    if (confirmationText !== "DEACTIVATE") {
      setError("Please type 'DEACTIVATE' exactly to confirm")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmationText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate account')
      }

      setSuccess("Account deactivated successfully. You will be signed out shortly.")
      
      // Sign out the user after a delay
      setTimeout(async () => {
        await signOut()
        router.push('/sign-in')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while deactivating your account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#FFF5FF] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page title and alert icon */}
        <div className="flex items-center gap-2 mb-12">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-medium text-red-600">Deactivate Account</h1>
        </div>

        {/* Warning box with important information */}
        <div className="bg-red-50 border border-red-300 p-4 rounded-lg mb-8">
          <p className="text-sm text-red-700">
            You can reactivate your account within <strong>30 days</strong> after deactivation.
            <br />
            <strong>You cannot deactivate your account if you have ongoing bookings.</strong>
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

        {/* Deactivation form */}
        <form onSubmit={handleDeactivate}>
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
                required
                disabled={isLoading}
              />
            </div>

            {/* Confirmation text input field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="confirmation" className="text-sm">
                Type "DEACTIVATE"
              </label>
              <Input
                id="confirmation"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="col-span-2"
                placeholder="DEACTIVATE"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-between mt-6">
              <Link href="/user/settings">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  "Confirm Deactivation"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
