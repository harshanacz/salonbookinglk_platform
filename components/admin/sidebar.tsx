"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Home,
  Settings,
  Users,
  Store,
  AlertTriangle,
  Scissors,
  Menu,
  X,
  BadgeCheck,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Verification",
    href: "/admin/verification",
    icon: BadgeCheck,
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
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Complaints",
    href: "/admin/complaints",
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
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  return (
    <div className="relative">
      {/* Hamburger Icon */}
      <button className="md:hidden p-4" onClick={toggleSidebar}>
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 min-h-screen bg-[var(--pageBackground)] flex flex-col fixed md:relative transition-transform z-50",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ top: 0 }}
      >
        {/* Close Button for Small Screens */}
        <button className="md:hidden p-4 self-end" onClick={toggleSidebar}>
          <X className="h-6 w-6" />
        </button>

        {/* Header Section */}
        <div className="p-4 border-b border-[#D9D9D9]">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Admin"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-sm">Admin</div>
            </div>
          </div>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 py-6 flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 mr-1 rounded-r-full py-3 hover:bg-[#F3E5F5] text-black",
                pathname === item.href && "bg-[#F3E5F5]"
              )}
            >
              <item.icon className="h-5 w-5 mx-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#D9D9D9]">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
