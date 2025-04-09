'use client'

import { ServiceCard } from "@/components/service-card"
import { useState } from "react"
import { Heart } from "lucide-react"

export default function FavouritesPage() {
  // Sample data for favourite services (Replace with actual favourite data)
  const [favourites, setFavourites] = useState([
    {
      id: 1,
      title: "Luxury Haircut & Styling",
      image: "/images/services/haircut.jpg",
      price: 2500,
      salon: "Elite Salon",
      rating: 4.8,
      reviews: 120,
      location: "Colombo",
    },
    {
      id: 2,
      title: "Relaxing Spa Treatment",
      image: "/images/services/spa.jpg",
      price: 5000,
      salon: "Tranquil Spa",
      rating: 4.9,
      reviews: 85,
      location: "Kandy",
    },
    {
      id: 3,
      title: "Professional Makeup Service",
      image: "/images/services/makeup.jpg",
      price: 3500,
      salon: "Glamour Studio",
      rating: 4.7,
      reviews: 95,
      location: "Galle",
    },
  ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Favorites</h1>
      
      {favourites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">No favorites yet</h2>
          <p className="text-gray-500">
            Start adding services to your favorites to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
