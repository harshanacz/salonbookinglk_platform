import type React from "react"
import { SalonOwnerSidebar } from "@/components/salon-owner/sidebar"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Salon Owner Dashboard - SalonBooking.lk",
  description: "Manage your salon services and staff",
}

export default function SalonOwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalonOwnerSidebar />
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}

