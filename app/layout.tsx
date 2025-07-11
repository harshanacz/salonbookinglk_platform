"use client";

import type React from "react";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/user/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

// Fallback font configuration
const montserrat = {
  className: "font-sans"
};

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
    <ClerkProvider>
      <html lang="en"> 
        <body className={montserrat.className}>
          {!isAdminPage && !isSalonOwnerPage && <Navbar />}
          <main>{children}</main>
          {!isAdminPage && !isUserPage && !isSalonOwnerPage && <Footer />}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
