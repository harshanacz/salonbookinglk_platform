"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"
import Link from "next/link"

/**
 * User Settings Page Component
 * Allows users to change their password and access account deactivation
 */
export default function SettingsPage() {
  // State for password change form fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  /**
   * Handles password change form submission
   * @param e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password change logic here
    console.log("Password change submitted")
  }

  return (
    <div className="bg-[var(--pageBackground)] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-12">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-medium">Change Password</h1>
        </div>

        <div className="mt-12">
          {/* Form Section Title */}
          <h2 className="text-sm font-medium uppercase mb-6">Create new password</h2>
          
          {/* Password Change Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-w-md">
              {/* Current Password Field */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="current-password" className="text-sm">
                  Current Password
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-2"
                />
              </div>

              {/* New Password Field */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="new-password" className="text-sm">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-2"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="confirm-password" className="text-sm">
                  Confirm Password
                </label>
                <div className="col-span-2">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <p className="text-xs text-[var(--greyColor)] mt-2">
                    8 characters or longer. Combine upper and lowercase letters and numbers.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  className="bg-[var(--primary2)] hover:bg-[var(--secondary2)] text-[var(--whiteColor)]"
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Account Deactivation Section */}
        <div className="mt-24 flex justify-center">
          <Link href="/user/settings/deactivate-account">
            <Button 
              variant="outline" 
              className="text-[var(--warning)] border-[var(--warning)] hover:bg-[var(--warningsLight)] hover:text-[var(--errorOrRedNotifications)]"
            >
              Deactivate my account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}