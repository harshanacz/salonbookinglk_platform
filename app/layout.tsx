"use client";

import type React from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/user/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { AIAgentProvider } from "@/components/salon/ai-agent-provider";
import FloatingAIAgent from "@/components/salon/floating-ai-agent";

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
    <ClerkProvider>
      <html lang="en"> 
        <body className={montserrat.className}>
          <AIAgentProvider defaultEnabled={!isAdminPage && !isSalonOwnerPage}>
            {!isAdminPage && !isSalonOwnerPage && <Navbar />}
            <main>{children}</main>
            {!isAdminPage && !isUserPage && !isSalonOwnerPage && <Footer />}
            <Toaster />
            {/* AI Agent - Only show on public pages */}
            {!isAdminPage && !isSalonOwnerPage && <FloatingAIAgent />}
          </AIAgentProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
