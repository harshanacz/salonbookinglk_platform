"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  image: string;
  price: number;
  salon: string;
  salonContextId: string | null;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  reviews: number;
  type: string;
  isBestSeller: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) {
      setSearchQuery(location);
    }
    
    // Set default showMap state based on screen size
    const handleResize = () => {
      setShowMap(window.innerWidth >= 1024);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [searchParams]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/services/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate map URL with markers for all services
  const getMapUrl = () => {
    if (!services.length) return "https://maps.google.com/maps?width=600&height=800&hl=en&q=Colombo, Sri Lanka&t=&z=12&ie=UTF8&iwloc=B&output=embed";
    
    const markers = services.map(service => 
      `${service.location.lat},${service.location.lng}`
    ).join('|');
    
    return `https://maps.google.com/maps?width=600&height=800&hl=en&q=Colombo, Sri Lanka&t=&z=12&ie=UTF8&iwloc=B&output=embed&markers=${markers}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for services or salons"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            className="w-full md:w-auto"
            onClick={handleSearch}
            disabled={isLoading}
          >
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
          {/* Service List */}
          <div className={`space-y-4 ${showMap ? "hidden lg:block" : "block"}`}>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Clock className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No services found. Try a different search term.
              </div>
            ) : (
              services.map((service) => (
                <Card
                  key={service.id}
                  className={`p-4 cursor-pointer transition-shadow hover:shadow-md ${
                    selectedSalon === service.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedSalon(service.id)}
                >
                  <Link href={`/services/${service.id}`}>
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {service.isBestSeller && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Best Seller
                            </span>
                          )}
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm font-medium">
                              {service.rating}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">
                              ({service.reviews})
                            </span>
                          </div>
                        </div>
                        <h3 className="font-medium mt-1 text-sm sm:text-base">{service.title}</h3>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{service.address}</span>
                        </div>
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <div className="font-medium text-xs sm:text-sm">{service.salon}</div>
                          <div className="text-xs sm:text-sm">
                            From Rs. {service.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
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
                  src={getMapUrl()}
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