"use client";

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
    <body>
        {!isAdminPage && <Navbar />}
        <main>{children}</main>
        {!isAdminPage && <Footer />}
        <Toaster />
      </body>
    </html>
  )
}