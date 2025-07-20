import type React from "react";
import { SalonOwnerSidebar } from "@/components/salon-owner/sidebar";
import { Toaster } from "@/components/ui/toaster";
import SalonStatusChecker from "@/components/salon-owner/salon-status-checker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Owner Dashboard - SalonBooking.lk",
  description: "Manage your salon services and appointments",
};

export default function SalonOwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SalonStatusChecker>
      <div className="h-screen flex overflow-hidden">
        <SalonOwnerSidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </SalonStatusChecker>
  );
}
