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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Profile",
    icon: User,
    href: "/user/profile",
  },
  {
    label: "My Bookings",
    icon: Calendar,
    href: "/user/booking/user-appointments",
  },
  {
    label: "My Payments",
    icon: CreditCard,
    href: "/user/payments",
  },
  {
    label: "My Complaints",
    icon: MessageSquare,
    href: "/user/complaints",
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
    label: "Settings",
    icon: Settings,
    href: "/user/settings",
  },
];

export const UserSidebar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ fullName: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
              <div className="font-medium text-sm">
                {isLoading ? "Loading..." : userData.fullName || "Guest User"}
              </div>
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
