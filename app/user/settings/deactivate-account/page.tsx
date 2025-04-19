"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"
import Link from "next/link";

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
              />
            </div>

            {/* Password input field */}
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

            {/* Confirm password input field */}
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

            {/* Submit button */}
            <div className="flex justify-end mt-6">
              <Link href="/">
              <Button
                type="submit"
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
