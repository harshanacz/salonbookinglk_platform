"use client";

import type React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAdminLoginTracking } from "@/hooks/useAdminLoginTracking";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Track admin login activity
  useAdminLoginTracking();
  
  const pathname = usePathname();
  const isViewComplaintPage = pathname?.includes('/admin/complaints/view_complaint');

  return (
    <div className="h-screen flex overflow-hidden">
      {!isViewComplaintPage && <AdminSidebar />}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
