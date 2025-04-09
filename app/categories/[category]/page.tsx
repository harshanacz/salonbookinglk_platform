"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { useRouter } from "next/navigation";

const services = [
  {
    id: 1,
    title: "Custom Hair Coloring And Highlights",
    image: "/placeholder.svg?height=200&width=200",
    price: 620,
    salon: "Salon Amandi",
    rating: 4.9,
    reviews: 325,
    location: "Katubedda, Galle Road",
  },
  {
    id: 2,
    title: "Professional Hair Styling",
    image: "/placeholder.svg?height=200&width=200",
    price: 450,
    salon: "Beauty Hub",
    rating: 4.8,
    reviews: 280,
    location: "Bambalapitiya, Galle Road",
  },
  {
    id: 3,
    title: "Bridal Makeup Package",
    image: "/placeholder.svg?height=200&width=200",
    price: 1200,
    salon: "Glamour Studio",
    rating: 5.0,
    reviews: 412,
    location: "Wellawatte, Galle Road",
  },
  // Add more sample services...
];

export default function ServiceCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchClick = () => {
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Centered Category Name */}
        <h1 className="text-3xl font-bold mb-6 text-center capitalize">
          {params.category}
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 max-w-3xl mx-auto">
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
            {/* Updated Search Button with onClick handler */}
            <Button onClick={handleSearchClick}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Service List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}