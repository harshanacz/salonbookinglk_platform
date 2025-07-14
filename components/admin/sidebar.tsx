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
  CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

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
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      // Log the logout activity before signing out
      await fetch('/api/admin/log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'LOGOUT',
          target: 'system',
          details: 'Admin logged out from the system'
        }),
      }).catch(error => {
        console.error('Failed to log logout activity:', error);
      });

      // Clear login session tracking before signing out
      if (user?.id) {
        sessionStorage.removeItem(`admin_login_logged_${user.id}`);
      }

      await signOut();
      router.push("/sign-in");
    } catch (err) {
      console.error("Error during logout:", err);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
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
            <CircleUserRound className="h-10 w-10 text-[var(--secondary)]]" />
            <div>
              <div className="font-medium text-sm">
                {user?.fullName || "Admin"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
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
                "flex items-center gap-2 px-4 mr-3 rounded-r-full py-3 hover:bg-[var(--superAccent2)] text-[var(--darkPurple)]",
                pathname === item.href && "bg-[var(--superAccent2)]"
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mx-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-[var(lightGreyColor)]">
          <div className="flex justify-center">
            <Button
              variant="cancel"
              className="border-none w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}