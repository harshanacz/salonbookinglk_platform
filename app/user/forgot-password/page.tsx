"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log("Forgot password request submitted")
  }

  return (
    <div className="bg-[#FFF5FF] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center gap-2 mb-12">
          <Lock className="h-6 w-6" />
          <h1 className="text-2xl font-medium">Forgot Password</h1>
        </div>

        <div className="mt-12">
          <h2 className="text-sm font-medium uppercase mb-6">Reset Your Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-w-md">
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
                  <p className="text-xs text-gray-500 mt-2">
                    8 characters or longer. Combine upper and lowercase letters and numbers.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Reset Password
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
