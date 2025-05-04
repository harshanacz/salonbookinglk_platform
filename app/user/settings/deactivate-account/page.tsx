"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"
import Link from "next/link";

/**
 * Account Deactivation Page Component
 * Allows users to deactivate their account after confirming their identity
 */
export default function AccountDeactivationPage() {
  // State to store user's email address
  const [email, setEmail] = useState("")

  // State to store user's password
  const [password, setPassword] = useState("")

  // State to store user's confirmation password
  const [confirmPassword, setConfirmPassword] = useState("")

  // Handler function for form submission
  const handleDeactivate = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle account deactivation logic here
    console.log("Deactivation requested")
  }

  return (
    <div className="bg-[var(--pageBackground)] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page header with warning icon */}
        <div className="flex items-center gap-2 mb-12">
          <AlertTriangle className="h-6 w-6 text-[var(--warning)]" />
          <h1 className="text-2xl font-medium text-[var(--warning)]">Deactivate Account</h1>
        </div>

        {/* Warning information box */}
        <div className="bg-[var(--warningsLight)] border border-[var(--warning)] p-4 rounded-lg mb-8">
          <p className="text-sm text-[var(--errorOrRedNotifications)]">
            You can reactivate your account within <strong>30 days</strong> after deactivation.
            <br />
            <strong>You cannot deactivate your account if you have ongoing bookings.</strong>
          </p>
        </div>

        {/* Account deactivation form */}
        <form onSubmit={handleDeactivate}>
          <div className="space-y-4 max-w-md">
            {/* Email address field */}
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
              />
            </div>

            {/* Password field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-2"
              />
            </div>

            {/* Password confirmation field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="confirm-password" className="text-sm">
                Re-enter Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-2"
              />
            </div>

            {/* Deactivation confirmation button */}
            <div className="flex justify-end mt-6">
              <Link href="/">
                <Button
                  type="submit"
                  className="bg-[var(--warning)] hover:bg-[var(--errorOrRedNotifications)] text-[var(--whiteColor)]"
                >
                  Confirm Deactivation
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
