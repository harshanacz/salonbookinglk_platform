"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  Settings,
  Users,
  CreditCard,
  BarChart3,
  Scissors,
  Menu,
  X,
  LogOut,
  CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "Dashboard",
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
];

export function SalonOwnerSidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide sidebar on the signup and signin pages
  if (pathname === "/salon-owner/sign-up" || pathname === "/salon-owner/sign-in") {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  // Hide sidebar on the signup page
  if (pathname === "/salon-owner/sign-up") {
    return null
  }

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
            <CircleUserRound className="h-10 w-10 text-purple-700" />
            <div>
              <div className="font-medium text-sm">John Doe</div>
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
