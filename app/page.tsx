"use client";

import { useState, useEffect, Suspense } from "react";
import { ServiceCard } from "@/components/service-card";
import { PromoBanner } from "@/components/user/Home/promo-banner";
import { StylesGallery } from "@/components/user/Home/styles-gallery";
import { UserTypeCards } from "@/components/user/Home/user-type-cards";
import { useRouter, useSearchParams } from "next/navigation";
import HeroSection from "@/components/user/Home/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

// Define service interface
interface Service {
  id: string;
  title: string;
  image: string;
  price: number;
  salon: string;
  rating: number;
  reviews: number;
  location: string;
  type: string;
}



function HomeContent() {
  const [location] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [topRatedServices, setTopRatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const response = await fetch('/api/services/home');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPopularServices(data.popularServices || []);
        setTopRatedServices(data.topRatedServices || []);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        // Fallback to empty arrays if fetching fails
        setPopularServices([]);
        setTopRatedServices([]);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  // Redirect logic
  useEffect(() => {
    const redirectType = searchParams.get("redirect_type");
    if (redirectType && !hasRedirected) {
      setHasRedirected(true);
      
      // Try redirect multiple times with increasing delays
      const delays = [1000, 2000, 3000]; // 1s, 2s, 3s delays
      
      delays.forEach((delay, index) => {
        setTimeout(() => {
          const redirectPath = redirectType === "SALON_OWNER" 
            ? "/salon-owner/profile" 
            : "/user/profile";
          
          // On last attempt, use replace. Otherwise use assign
          if (index === delays.length - 1) {
            window.location.replace(redirectPath);
          } else {
            window.location.assign(redirectPath);
          }
        }, delay);
      });
    }
  }, [searchParams, hasRedirected]);

  const handleSearch = () => {
    router.push(`/search?location=${encodeURIComponent(location)}`);
  };

  

  return (
    <div className="flex flex-col min-h-screen lg-mx-5 mx-4">
      {/* Hero Section */}
      <HeroSection />

      {/* Popular services section with enhanced UI */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
                  Popular Services
                </h2>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-6 h-6 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-600 hover:text-purple-700 transition-colors"
                  title="Help"
                >
                  <span className="text-sm font-semibold">?</span>
                </button>
              </div>
              <p className="text-gray-500 mt-2">Most booked services by our customers</p>
            </div>
          </div>
          
          <Link href="/search" className="text-purple-700 font-medium hover:text-purple-800 hover:underline flex items-center">
            View all
            <span className="ml-1">→</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden rounded-xl">
                <div className="h-52 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : popularServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <div className="mb-4 text-gray-400">✨</div>
            <h3 className="text-xl font-semibold mb-2">No popular services yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We're constantly adding new services to our platform. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Top Rated Services with enhanced UI */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
              Top Rated Services
            </h2>
            <p className="text-gray-500 mt-2">Highest rated services by our customers</p>
          </div>
          
          <Link href="/search?sort=rating" className="text-blue-600 font-medium hover:text-blue-800 hover:underline flex items-center">
            View all
            <span className="ml-1">→</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden rounded-xl">
                <div className="h-52 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topRatedServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
            <div className="mb-4 text-blue-400">⭐</div>
            <h3 className="text-xl font-semibold mb-2">No top-rated services yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              As our community grows, highly-rated services will appear here. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* User Type Cards */}
      <UserTypeCards />

      {/* Styles Gallery with enhanced UI */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-600">
              Latest Style Inspiration
            </h2>
            <p className="text-gray-500 mt-2">New styles published by top salons</p>
          </div>
          
          <Link href="/styles" className="text-pink-500 font-medium hover:text-pink-600 hover:underline flex items-center">
            Explore all styles
            <span className="ml-1">→</span>
          </Link>
        </div>
        <StylesGallery />
      </section>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Help - Popular Services</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-700 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="relative w-full h-auto">
                <Image
                  src="/dev/Add a heading.png"
                  alt="Help - Popular Services Guide"
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>SalonBooking.lk - Book Premium Salon Services in Sri Lanka</title>
        <meta 
          name="description" 
          content="Sri Lanka's premier salon booking platform. Find and book beauty services, haircuts, facials, massages and more at top-rated salons across Sri Lanka." 
        />
        <meta 
          name="keywords" 
          content="salon booking Sri Lanka, beauty services, haircut booking, facial treatments, massage therapy, spa services, Colombo salons" 
        />
        <link rel="canonical" href="https://salonbooking.lk" />
        
        {/* Open Graph */}
        <meta property="og:title" content="SalonBooking.lk - Book Premium Salon Services in Sri Lanka" />
        <meta property="og:description" content="Sri Lanka's premier salon booking platform. Find and book beauty services at top-rated salons." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://salonbooking.lk" />
        <meta property="og:image" content="https://salonbooking.lk/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SalonBooking.lk - Book Premium Salon Services in Sri Lanka" />
        <meta name="twitter:description" content="Sri Lanka's premier salon booking platform. Find and book beauty services at top-rated salons." />
        <meta name="twitter:image" content="https://salonbooking.lk/twitter-image.jpg" />
        
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://salonbooking.lk",
              "name": "SalonBooking.lk",
              "description": "Sri Lanka's premier salon booking platform connecting customers with top-rated beauty salons and wellness centers.",
              "url": "https://salonbooking.lk",
              "telephone": "+94-11-123-4567", // Replace with actual phone
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "LK",
                "addressRegion": "Western Province"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Sri Lanka"
              },
              "serviceType": [
                "Hair Salon",
                "Beauty Salon", 
                "Spa Services",
                "Massage Therapy",
                "Nail Salon",
                "Skincare Services"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Salon Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Hair Cut & Styling"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Facial Treatments"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Massage Therapy"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">
              Loading...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </>
  );
}
