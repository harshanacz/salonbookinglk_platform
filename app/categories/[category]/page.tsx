"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

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
}

// Convert URL slug to display name
const getCategoryDisplayName = (slug: string): string => {
  const displayNameMap: Record<string, string> = {
    "hair-cuts": "Hair Cuts",
    "coloring": "Coloring",
    "styling": "Styling",
    "facial": "Facial",
    "massage": "Massage",
    "nails": "Nails",
    "skin-care": "Skin Care",
  };
  
  return displayNameMap[slug] || slug.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export default function ServiceCategoryPage(
  props: {
    params: { category: string };
  }
) {
  const { params } = props;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch services for this category
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct query URL with search parameter if present
        let url = `/api/services/categories/${params.category}`;
        if (searchQuery.trim()) {
          url += `?q=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again later.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [params.category, searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect dependency on searchQuery
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Centered Category Name */}
        <h1 className="text-3xl font-bold mb-6 text-center capitalize">
          {getCategoryDisplayName(params.category)}
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl mx-auto">
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
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.refresh()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium mb-2">No services found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any services in this category{searchQuery ? " matching your search" : ""}.
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            )}
          </div>
        )}

        {/* Service List */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}