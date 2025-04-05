"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const salons = [
  {
    id: 1,
    name: "Salon Amandi",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    reviews: 325,
    services: [
      {
        name: "Custom Hair Coloring And Highlights",
        price: 620,
      },
    ],
    location: {
      address: "Katubedda, Galle Road",
      coordinates: { lat: 6.9271, lng: 79.8612 }, // Colombo coordinates
    },
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Beauty Hub",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviews: 280,
    services: [
      {
        name: "Professional Hair Styling",
        price: 450,
      },
    ],
    location: {
      address: "Bambalapitiya, Galle Road",
      coordinates: { lat: 6.8867, lng: 79.8564 },
    },
    isBestSeller: false,
  },
  {
    id: 3,
    name: "Glamour Studio",
    image: "/placeholder.svg?height=200&width=200",
    rating: 5.0,
    reviews: 412,
    services: [
      {
        name: "Bridal Makeup Package",
        price: 1200,
      },
    ],
    location: {
      address: "Wellawatte, Galle Road",
      coordinates: { lat: 6.8744, lng: 79.8561 },
    },
    isBestSeller: true,
  },
];



export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Fixed: Explicitly typed as string | null
  const [selectedSalon, setSelectedSalon] = useState<number | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) {
      setSearchQuery(location);
    }
    
    // Set default showMap state based on screen size
    const handleResize = () => {
      setShowMap(window.innerWidth >= 1024); // Show map by default on lg screens and above
    };
    
    // Initialize on mount
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 max-w-3xl mx-auto">
          <div className="flex-1 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for services or salons"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Input type="text" placeholder="Map Area" className="flex-1" />
              <Input type="text" placeholder="Availability" className="flex-1" />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Search className="h-4 w-4 mr-2 md:mr-0" />
            <span className="md:hidden">Search</span>
          </Button>
        </div>
        
       
        
        {/* Mobile toggle for map/list */}
        <div className="mt-4 lg:hidden flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                !showMap ? "bg-primary text-white" : "bg-white text-gray-700"
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                showMap ? "bg-primary text-white" : "bg-white text-gray-700"
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salon List */}
          <div className={`space-y-4 ${showMap ? "hidden lg:block" : "block"}`}>
            {salons.map((salon) => (
              <Card
                key={salon.id}
                className={`p-4 cursor-pointer transition-shadow hover:shadow-md ${
                  selectedSalon === salon.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSalon(salon.id)}
              >
                <Link href={`/salons/${salon.id}`}>
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
                      <Image
                        src={salon.image || "/placeholder.svg"}
                        alt={salon.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {salon.isBestSeller && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Best Seller
                          </span>
                        )}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">
                            {salon.rating}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({salon.reviews})
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium mt-1 text-sm sm:text-base">{salon.name}</h3>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{salon.location.address}</span>
                      </div>
                      {salon.services.map((service, index) => (
                        <div
                          key={index}
                          className="mt-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="font-medium text-xs sm:text-sm">{service.name}</div>
                          <div className="text-xs sm:text-sm">
                            From Rs. {service.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {/* Map */}
          <div className={`h-[50vh] lg:h-[calc(100vh-8rem)] bg-white rounded-lg overflow-hidden ${showMap ? "block" : "hidden lg:block"}`}>
            <div className="relative h-full">
              {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm">Loading map...</span>
                  </div>
                </div>
              )}
              <div className="h-full">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://maps.google.com/maps?width=600&height=800&hl=en&q=Colombo, Sri Lanka&t=&z=12&ie=UTF8&iwloc=B&output=embed"
                  style={{ border: "none" }}
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIsMapLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}