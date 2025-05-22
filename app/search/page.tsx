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
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) {
      setSearchQuery(location);
    }
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
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Service List */}
          <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}