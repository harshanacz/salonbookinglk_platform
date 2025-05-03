"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export default function ForgotPasswordPage() {
  // State to store the user's email input
  const [email, setEmail] = useState("")

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password request logic here (e.g., send email to backend)
    console.log("Forgot password request submitted")
  }

  return (
    <div className="bg-[var(--pageBackground)] min-h-screen w-full">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-12">
          <Lock className="h-6 w-6" />
          <h1 className="text-2xl font-medium">Forgot Password</h1>
        </div>

        <div className="mt-12">
          {/* Section Title */}
          <h2 className="text-sm font-medium uppercase mb-6">Request Password Reset</h2>

          {/* Password Reset Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-w-md">
              {/* Email Input Field */}
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

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button type="submit" className="bg-[var(--primary2)] hover:bg-[var(--secondary2)] text-[var(--whiteColor)]">
                  Request Password Change
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
