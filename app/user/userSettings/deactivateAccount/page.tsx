"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DeactivateAccount() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle deactivation logic here
    console.log("Account deactivation requested for:", email)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdf4f8] p-4">
      <div className="w-full max-w-md">
        <Button type="button" variant="ghost" className="mb-2 p-0 hover:bg-transparent" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </Button>

        <h1 className="text-3xl font-medium text-red-600 text-center mt-4 mb-16">Deactivate my Account</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-base font-medium mb-8">Deactivate my account</h2>

          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <label htmlFor="email" className="text-sm">
              Email Address:
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>

          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <label htmlFor="password" className="text-sm">
              Password:
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>

          <div className="text-sm text-gray-600 mt-2 ml-[140px]">
            You can recover your profile within 30 days after deactivation by login again
          </div>

          <div className="flex justify-between items-center mt-8">
            <Link href="#" className="text-sm">
              Forgot password?
            </Link>
            <Button
              type="submit"
              className="border border-red-500 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full px-6"
            >
              Confirm Deactivation
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}