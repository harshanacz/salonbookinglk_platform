'use client'; // Add this at the top to mark this as a Client Component

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [shouldHideHeaderFooter, setShouldHideHeaderFooter] = useState(false);

  useEffect(() => {
    const hideHeaderFooterRoutes = ["/add-complaint"];
    setShouldHideHeaderFooter(hideHeaderFooterRoutes.includes(pathname));
  }, [pathname]);

  return (
    <html lang="en">
      <body className={inter.className}>
        {!shouldHideHeaderFooter && <Navbar />}
        <main>{children}</main>
        {!shouldHideHeaderFooter && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}