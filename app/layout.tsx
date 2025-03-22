import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/user/Home/Navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "SalonBooking.lk - Book Your Salon, Anytime",
  description: "Find and book the best salon services in Sri Lanka",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}