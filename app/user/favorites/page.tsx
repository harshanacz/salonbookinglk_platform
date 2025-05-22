'use client'

import { ServiceCard } from "@/components/service-card"
import { Heart } from "lucide-react"
import { useFavoritesStore } from "@/store/favoritesStore"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FavouritesPage() {
  const { favorites } = useFavoritesStore();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">
            Start adding services to your favorites to see them here
          </p>
          <Link href="/">
            <Button>Browse Services</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((service) => (
            <ServiceCard key={service.id} service={{ ...service, id: String(service.id) }} />
          ))}
        </div>
      )}
    </div>
  )
}
