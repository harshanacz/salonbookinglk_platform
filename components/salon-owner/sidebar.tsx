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
  FileText,
  Bell,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/salon-owner",
    icon: Home,
  },
  {
    title: "Profile",
    href: "/salon-owner/profile",
    icon: UserCog,
  },
  {
    title: "Manage Appointments",
    href: "/salon-owner/manage-appointments",
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
    title: "Staff",
    href: "/salon-owner/staff",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/salon-owner/payments",
    icon: CreditCard,
  },
  {
    title: "Summary Bill",
    href: "/salon-owner/summary-bill",
    icon: FileText,
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
  const [businessName, setBusinessName] = useState("Loading...");

  useEffect(() => {
    const fetchSalonContext = async () => {
      try {
        const response = await fetch("/api/salon-context");
        if (response.ok) {
          const data = await response.json();
          setBusinessName(data.businessName || "My Salon");
        } else {
          setBusinessName("My Salon");
        }
      } catch (error) {
        console.error("Failed to fetch salon context:", error);
        setBusinessName("My Salon");
      }
    };

    fetchSalonContext();
  }, []);

  // Hide sidebar on auth pages
  if (
    pathname === "/salon-owner/sign-up" ||
    pathname === "/salon-owner/sign-in" ||
    pathname === "/salon-owner/forgot-password"
  ) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            <CircleUserRound className="h-10 w-10 text-purple-700" />
            <div>
              <div className="font-medium text-sm">
                {businessName || "Loading..."}
              </div>
              <div className="text-xs text-gray-500">Salon Owner</div>
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
          <SignOutButton>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
