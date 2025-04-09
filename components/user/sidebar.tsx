"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Calendar,
  Settings,
  MessageSquare,
  Star,
  Clock,
  Menu,
  X,
  LogOut,
  CircleUserRound,
  CreditCard,
  Heart,
  AlertTriangle,
  BarChart3,
  KeyRound,
  BellIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Profile",
    icon: User,
    href: "/user",
  },
  {
    label: "My Bookings",
    icon: Calendar,
    href: "/user/booking",
  },
  {
    label: "My Payments",
    icon: CreditCard,
    href: "/user/payments",
  },
  {
    label: "Financial Summary",
    icon: BarChart3,
    href: "/user/financial-summary",
  },
  {
    label: "Notifications",
    icon: BellIcon,
    href: "/user/notifications",
  },
  {
    label: "My Favorites",
    icon: Heart,
    href: "/user/favorites",
  },
  {
    label: "Add Complaint",
    icon: AlertTriangle,
    href: "/user/add-complaint",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/user/settings",
  },
];

export const UserSidebar = () => {
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
        <div className="p-4 border-b border-[var(lightGreyColor)]">
          <div className="flex items-center gap-2">
            <CircleUserRound className="h-10 w-10 text-[var(--secondary)]" />
            <div>
              <div className="font-medium text-sm">John Doe</div>
            </div>
          </div>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 py-6 flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 px-4 mr-3 rounded-r-full py-3 hover:bg-[var(--superAccent2)] text-[var(--darkPurple)]",
                pathname === route.href && "bg-[var(--superAccent2)]"
              )}
            >
              <route.icon className="h-5 w-5 mx-4" />
              <span>{route.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-[var(lightGreyColor)]">
          <div className="flex justify-center">
            <Button
              variant="cancel"
              className="border-none"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
