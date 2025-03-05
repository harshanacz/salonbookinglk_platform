"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Search, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Sample service data (you would fetch this from an API in a real application)
const services = [
  {
    id: 1,
    name: "Custom Hair Coloring And Highlights",
    image: "/placeholder.svg?height=200&width=200",
    price: 620,
    salon: "Salon Amandi",
    rating: 4.9,
    reviews: 325,
    location: "Katubedda, Galle Road",
  },
  {
    id: 2,
    name: "Professional Hair Styling",
    image: "/placeholder.svg?height=200&width=200",
    price: 450,
    salon: "Beauty Hub",
    rating: 4.8,
    reviews: 280,
    location: "Bambalapitiya, Galle Road",
  },
  {
    id: 3,
    name: "Bridal Makeup Package",
    image: "/placeholder.svg?height=200&width=200",
    price: 1200,
    salon: "Glamour Studio",
    rating: 5.0,
    reviews: 412,
    location: "Wellawatte, Galle Road",
  },
  // Add more sample services...
]

export default function ServiceCategoryPage({ params }: { params: { category: string } }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">{params.category}</h1>

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
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Service List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <Link href={`/service/${service.id}`}>
                <div className="relative h-48">
                  <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{service.name}</h3>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{service.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({service.reviews} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{service.salon}</div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Rs. {service.price}</span>
                    <Button size="sm">Book Now</Button>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

