"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard } from "@/components/service-card";

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
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to perform search
  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/services/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial search from URL parameters
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
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
        <div className="max-w-7xl mx-auto">
          {/* Service List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No services found. Try a different search term.
              </div>
            ) : (
              services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={{
                    id: service.id,
                    title: service.title,
                    image: service.image,
                    price: service.price,
                    salon: service.salon,
                    salonContextId: service.salonContextId || undefined,
                    rating: service.rating,
                    reviews: service.reviews,
                    location: service.address,
                    type: service.type
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}