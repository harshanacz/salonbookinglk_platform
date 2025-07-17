"use client";

import type React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAdminLoginTracking } from "@/hooks/useAdminLoginTracking";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Track admin login activity
  useAdminLoginTracking();

  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
