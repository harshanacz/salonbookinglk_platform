"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Search, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

// Import map component dynamically to avoid SSR issues
const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg"></div>,
})

// Sample salon data (you would fetch this from an API in a real application)
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
]

const categories = [
  "Men Hair Cuts",
  "Female Hair Cuts",
  "Nail Arts",
  "Skin Cares",
  "Brows & Lashes",
  "Makeup",
  "Waxing",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }) // Colombo center
  const [selectedSalon, setSelectedSalon] = useState<number | null>(null)

  useEffect(() => {
    const location = searchParams.get("location")
    if (location) {
      setSearchQuery(location)
      // In a real application, you would geocode the location and update mapCenter
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories */}
      <div className="border-b bg-white sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-4 max-w-3xl mx-auto">
          <div className="flex-1 flex gap-2">
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
            <Input type="text" placeholder="Map Area" className="w-32" />
            <Input type="text" placeholder="Availability" className="w-32" />
          </div>
          <Button>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salon List */}
          <div className="space-y-4">
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
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image src={salon.image || "/placeholder.svg"} alt={salon.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {salon.isBestSeller && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Best Seller
                          </span>
                        )}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{salon.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({salon.reviews})</span>
                        </div>
                      </div>
                      <h3 className="font-medium mt-1">{salon.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {salon.location.address}
                      </div>
                      {salon.services.map((service, index) => (
                        <div key={index} className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm">From Rs. {service.price.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-32 h-[calc(100vh-8rem)]">
            <Map
              center={mapCenter}
              zoom={12}
              markers={salons.map((salon) => ({
                id: salon.id,
                position: salon.location.coordinates,
                label: salon.rating.toString(),
                selected: selectedSalon === salon.id,
              }))}
              onMarkerClick={(id) => setSelectedSalon(id)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

