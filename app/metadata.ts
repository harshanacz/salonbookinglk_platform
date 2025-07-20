import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "SalonBooking.lk - Book Premium Salon Services in Sri Lanka",
    template: "%s | SalonBooking.lk"
  },
  description: "Sri Lanka's premier salon booking platform. Find and book beauty services, haircuts, facials, massages and more at top-rated salons across Sri Lanka. Easy online booking, verified salons, competitive prices.",
  keywords: [
    "salon booking Sri Lanka",
    "beauty services Sri Lanka", 
    "haircut booking",
    "facial treatments",
    "massage therapy",
    "nail salon",
    "spa services",
    "beauty appointments",
    "salon near me",
    "Colombo salons",
    "Kandy beauty services",
    "Galle spa",
    "online salon booking"
  ],
  authors: [{ name: "SalonBooking.lk Team" }],
  creator: "SalonBooking.lk",
  publisher: "SalonBooking.lk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://salonbooking.lk"),
  alternates: {
    canonical: "https://salonbooking.lk",
  },
  openGraph: {
    title: "SalonBooking.lk - Book Premium Salon Services in Sri Lanka",
    description: "Sri Lanka's premier salon booking platform. Find and book beauty services at top-rated salons across Sri Lanka.",
    url: "https://salonbooking.lk",
    siteName: "SalonBooking.lk",
    locale: "en_LK",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SalonBooking.lk - Premier Salon Services in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SalonBooking.lk - Book Premium Salon Services in Sri Lanka",
    description: "Sri Lanka's premier salon booking platform. Find and book beauty services at top-rated salons.",
    images: ["/twitter-image.jpg"],
    creator: "@salonbookinglk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
    // yandex: "your-yandex-verification-code", // If needed
    // yahoo: "your-yahoo-verification-code", // If needed
  },
  category: "Beauty & Wellness",
  generator: 'Next.js',
}
