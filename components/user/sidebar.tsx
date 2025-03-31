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
} from "lucide-react";

const routes = [
  {
    label: "Profile",
    icon: User,
    href: "/user",
    color: "text-sky-500",
  },
  {
    label: "My Appointments",
    icon: Calendar,
    href: "/user/appointments",
    color: "text-violet-500",
  },
  {
    label: "My Reviews",
    icon: Star,
    href: "/user/reviews",
    color: "text-pink-700",
  },
  {
    label: "My Messages",
    icon: MessageSquare,
    href: "/user/messages",
    color: "text-orange-700",
  },
  {
    label: "History",
    icon: Clock,
    href: "/user/history",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/user/settings",
    color: "text-gray-700",
  },
];

export const UserSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#FFF5FF] text-black border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/user" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Salon<span className="text-purple-600">Booking</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-purple-600 hover:bg-purple-100/50 rounded-lg transition",
                pathname === route.href
                  ? "text-purple-600 bg-purple-100"
                  : "text-zinc-600"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}; 