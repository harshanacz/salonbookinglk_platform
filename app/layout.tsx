"use client";

import type React from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/user/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage =
    pathname.startsWith("/admin") || pathname.startsWith("/super-admin");
  const isUserPage = pathname.startsWith("/user");
  const isSalonOwnerPage = pathname.startsWith("/salon-owner");

  return (
    <html lang="en">
      <body className={montserrat.className}>
        {!isAdminPage && !isSalonOwnerPage && <Navbar />} 
        <main>{children}</main>
        {!isAdminPage && !isUserPage && !isSalonOwnerPage && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}
