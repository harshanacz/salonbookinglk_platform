"use client";

import type React from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/user/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIChat } from "@/components/user/Home/ai-chat";

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
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={montserrat.className}>
          {!isAdminPage && !isSalonOwnerPage && <Navbar />}
          <main>{children}</main>
          {!isAdminPage && !isUserPage && !isSalonOwnerPage && <Footer />}
          <Toaster />
          {!isAdminPage && !isSalonOwnerPage && !isUserPage && (
            <>
              <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white
                  rounded-full p-4 shadow-lg hover:scale-110 transition-transform duration-300
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
              >
                <Sparkles className="h-8 w-8" />
              </button>
              {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
