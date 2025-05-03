"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export default function ResetPasswordPage() {
  // States for new password and confirmation
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Handle reset password form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Add validation or submission logic here
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    console.log("Password reset submitted")
    // You can call an API or trigger logic to update the password here
  }

  return (
    <div className="bg-[var(--pageBackground)] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-12">
          <Lock className="h-6 w-6" />
          <h1 className="text-2xl font-medium">Reset Password</h1>
        </div>

        <div className="mt-12">
          {/* Section Title */}
          <h2 className="text-sm font-medium uppercase mb-6">Enter Your New Password</h2>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-w-md">
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

              {/* Confirm New Password Field */}
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

              {/* Confirm Button */}
              <div className="flex justify-end mt-6">
                <Button type="submit" className="bg-[var(--primary2)] hover:bg-[var(--secondary2)] text-[var(--whiteColor)]">
                  Confirm
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
