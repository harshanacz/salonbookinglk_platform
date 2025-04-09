'use client'

import { ServiceCard } from "@/components/service-card"
import { useState } from "react"

export default function FavouritesPage() {
  // Sample data for favourite services (Replace with actual favourite data)
  const [favourites, setFavourites] = useState([
    {
      id: 1,
      title: "Luxury Haircut & Styling",
      image: "#",
      price: 2500,
      salon: "Elite Salon",
      rating: 4.8,
      reviews: 120,
      location: "Colombo",
    },
    {
      id: 2,
      title: "Relaxing Spa Treatment",
      image: "#",
      price: 5000,
      salon: "Tranquil Spa",
      rating: 4.9,
      reviews: 85,
      location: "Kandy",
    },
    {
        id: 1,
        title: "Luxury Haircut & Styling",
        image: "#",
        price: 2500,
        salon: "Elite Salon",
        rating: 4.8,
        reviews: 120,
        location: "Colombo",
      },
  ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-10 mt-5">Favourite Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favourites.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
