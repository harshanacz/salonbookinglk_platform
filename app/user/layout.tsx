import type React from "react";
import { UserSidebar } from "@/components/user/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Dashboard - SalonBooking.lk",
  description: "Manage your salon appointments and profile",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
} 