"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { ServiceCard } from "@/components/service-card";
import { CategoryButton } from "@/components/category-button";
import { PromoBanner } from "@/components/user/home/promo-banner";
import { StylesGallery } from "@/components/user/home/styles-gallery";
import { UserTypeCards } from "@/components/user/home/user-type-cards";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/user/home/hero-section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ... (keep existing imports and data)

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

export default function Home() {
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    router.push(`/search?location=${encodeURIComponent(location)}`);
  };

  // Sample data for services
  const popularServices = [
    {
      id: 1,
      title: "Custom Hair Coloring And Highlights Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 620,
      salon: "Salon Amayali",
      rating: 4.8,
      reviews: 120,
      location: "Katubedda, Galle Road",
    },
    {
      id: 2,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amayali",
      rating: 4.9,
      reviews: 130,
      location: "Moipe Road, Moratuwa",
    },
    {
      id: 3,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amayali",
      rating: 4.8,
      reviews: 150,
      location: "Moipe Road, Moratuwa",
    },
    {
      id: 4,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amayali",
      rating: 4.9,
      reviews: 130,
      location: "Moipe Road, Moratuwa",
    },
  ];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Top Rated */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Top rated</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
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
