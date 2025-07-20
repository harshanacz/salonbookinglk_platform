"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useClerk } from "@clerk/nextjs"

export default function AccountDeactivationPage() {
  // State to store user's email address
  const [email, setEmail] = useState("")

  // State to store confirmation text
  const [confirmationText, setConfirmationText] = useState("")

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useClerk()

  // Handler function for form submission
  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          confirmationText,
        }),
      })

      const data = await response.json()
      console.log("Deactivation response:", response.status, data)

      if (!response.ok) {
        if (data.upcomingAppointments) {
          setError(
            `You have ${data.upcomingAppointments} upcoming appointment(s). Please cancel or complete them before deactivating your account.`
          )
        } else {
          setError(data.error || "Failed to deactivate account")
        }
        return
      }

      // Success
      console.log("Account deactivated successfully, signing out...")
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated successfully. You will be signed out now.",
      })

      // Wait a moment for the toast to show, then sign out
      setTimeout(async () => {
        await signOut({
          redirectUrl: "/"
        })
      }, 1500)
    } catch (error) {
      console.error("Error deactivating account:", error)
      setError("An unexpected error occurred. Please try again.")
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
            <br />
            Please enter your email and type <strong>"CONFIRM DEACTIVATION"</strong> to proceed.
          </p>
        </div>

        {/* Deactivation form */}
        <form onSubmit={handleDeactivate}>
          <div className="space-y-4 max-w-md">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-300 p-3 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

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
                disabled={isLoading}
                required
              />
            </div>

            {/* Confirmation text input field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="confirmation-text" className="text-sm">
                Type "CONFIRM DEACTIVATION"
              </label>
              <Input
                id="confirmation-text"
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="col-span-2"
                placeholder="CONFIRM DEACTIVATION"
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={
                  confirmationText !== "CONFIRM DEACTIVATION" || 
                  !email || 
                  isLoading
                }
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Deactivating..." : "Confirm Deactivation"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
