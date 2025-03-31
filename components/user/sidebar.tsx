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
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Profile",
    icon: User,
    href: "/user",
    color: "text-sky-500",
  },
  // {
  //   label: "My Appointments",
  //   icon: Calendar,
  //   href: "/user/appointments",
  //   color: "text-violet-500",
  // },
  // {
  //   label: "My Reviews",
  //   icon: Star,
  //   href: "/user/reviews",
  //   color: "text-pink-700",
  // },
  // {
  //   label: "My Messages",
  //   icon: MessageSquare,
  //   href: "/user/messages",
  //   color: "text-orange-700",
  // },
  // {
  //   label: "History",
  //   icon: Clock,
  //   href: "/user/history",
  //   color: "text-green-700",
  // },
  {
    label: "Settings",
    icon: Settings,
    href: "/user/settings",
    color: "text-gray-700",
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
          "w-64 h-[calc(100vh-4rem)] bg-[var(--pageBackground)] flex flex-col fixed md:relative transition-transform z-50 top-16 md:top-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
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
        <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 px-4 mr-1 rounded-r-full py-3 hover:bg-[#F3E5F5] text-black",
                pathname === route.href && "bg-[#F3E5F5]"
              )}
            >
              <route.icon className={cn("h-5 w-5 mx-4", route.color)} />
              <span>{route.label}</span>
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
};
