import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - SalonBooking.lk",
  description: "Manage salon services and users",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}

