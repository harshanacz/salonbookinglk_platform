"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { ServiceCard } from "@/components/service-card";
import { CategoryButton } from "@/components/category-button";
import { PromoBanner } from "@/components/user/home/promo-banner";
import { StylesGallery } from "@/components/user/home/styles-gallery";
import { UserTypeCards } from "@/components/user/home/user-type-cards";
import { useRouter, useSearchParams } from "next/navigation";
import HeroSection from "@/components/user/home/hero-section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

const nearbySalons = [
  {
    id: 1,
    name: "Salon Elegance",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
    reviews: 120,
    distance: 0.5,
    address: "123 Main St, Colombo 03",
  },
  {
    id: 2,
    name: "Beauty Hub",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.6,
    reviews: 95,
    distance: 0.8,
    address: "456 Park Ave, Colombo 05",
  },
  {
    id: 3,
    name: "Glamour Studio",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.7,
    reviews: 150,
    distance: 1.2,
    address: "789 Lake Rd, Colombo 06",
  },
];

function HomeContent() {
  const [location, setLocation] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [topRatedServices, setTopRatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load services data on component mount
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

  // Sample fallback data for categories
  const categories = [
    { id: 1, name: "Hair Cuts", icon: "✂️" },
    { id: 2, name: "Nail Arts", icon: "💅" },
    { id: 3, name: "Skin Care", icon: "✨" },
    { id: 4, name: "Brows & Lashes", icon: "👁️" },
    { id: 5, name: "Makeup", icon: "💄" },
  ];

  return (
    <div className="flex flex-col min-h-screen lg-mx-5 mx-4">
      {/* Hero Section */}
      <HeroSection />

      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Popular services</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
          <div className="text-center py-6 text-gray-500">
            No popular services available at the moment.
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Top Rated */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Top rated</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
          <div className="text-center py-6 text-gray-500">
            No top-rated services available at the moment.
          </div>
        )}
      </section>

      {/* User Type Cards */}
      <UserTypeCards />

      {/* Styles Gallery */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">
          New styles publish by salons
        </h2>
        <StylesGallery />
      </section>
    </div>
  );
}

export default function Home() {
  return (
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
  );
}
