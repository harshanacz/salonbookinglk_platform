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
import Head from "next/head";

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
        <head>
          {/* Basic SEO Meta Tags */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          
          {/* Theme and App Icons */}
          <meta name="theme-color" content="#9333ea" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          
          {/* Canonical URL - will be set per page */}
          <link rel="canonical" href={`https://salonbooking.lk${pathname}`} />
          
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Favicon and App Icons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          
          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "SalonBooking.lk",
                "url": "https://salonbooking.lk",
                "description": "Sri Lanka's premier salon booking platform. Find and book beauty services, haircuts, facials, massages and more at top-rated salons across Sri Lanka.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://salonbooking.lk/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </head>
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
