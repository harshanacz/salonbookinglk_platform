"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Home, Settings, Users, CreditCard, BarChart3, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const sidebarItems = [
  {
    title: "Home",
    href: "/salon-owner",
    icon: Home,
  },
  {
    title: "Appointments",
    href: "/salon-owner/appointments",
    icon: CalendarDays,
  },
  {
    title: "Services",
    href: "/salon-owner/services",
    icon: Scissors,
  },
  {
    title: "Clients",
    href: "/salon-owner/clients",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/salon-owner/payments",
    icon: CreditCard,
  },
  {
    title: "Staff Management",
    href: "/salon-owner/staff",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/salon-owner/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/salon-owner/settings",
    icon: Settings,
  },
]

export function SalonOwnerSidebar() {
  const pathname = usePathname()

  // Hide sidebar on the signup page
  if (pathname === "/salon-owner/sign-up") {
    return null
  }

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link href="/salon-owner" className="flex items-center">
          <span className="text-xl font-semibold">salonbooking.lk</span>
        </Link>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors",
              pathname === item.href && "bg-gray-800 text-white",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            <Image src="/placeholder.svg?height=40&width=40" alt="Profile" fill className="object-cover" />
          </div>
          <div>
            <div className="font-medium">Profile</div>
            <Link href="/salon-owner/profile" className="text-sm text-gray-400 hover:text-white">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
