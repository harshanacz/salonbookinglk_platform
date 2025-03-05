"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CalendarDays, Home, Settings, Users, Store, AlertTriangle, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Service Cards",
    href: "/admin/service-cards",
    icon: Scissors,
  },
  {
    title: "Appointments",
    href: "/admin/appointments",
    icon: CalendarDays,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Salons",
    href: "/admin/salons",
    icon: Store,
  },
  {
    title: "Complains",
    href: "/admin/complains",
    icon: AlertTriangle,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            <Image src="/placeholder.svg?height=40&width=40" alt="Admin" fill className="object-cover" />
          </div>
          <div>
            <div className="font-medium">Super Admin</div>
          </div>
        </div>
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
    </div>
  )
}

