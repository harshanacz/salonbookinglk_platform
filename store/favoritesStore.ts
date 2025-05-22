import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteService {
  id: number | string
  title: string
  image: string
  price: number
  salon: string
  rating: number
  reviews: number
  location: string
}

interface FavoritesState {
  favorites: FavoriteService[]
  addFavorite: (service: FavoriteService) => void
  removeFavorite: (serviceId: number | string) => void
  isFavorite: (serviceId: number | string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (service: FavoriteService) => {
        const { favorites } = get();
        // Only add if not already in favorites
        if (!favorites.some(fav => fav.id === service.id)) {
          set({ favorites: [...favorites, service] });
        }
      },
      
      removeFavorite: (serviceId: number | string) => {
        const { favorites } = get();
        set({
          favorites: favorites.filter(service => service.id !== serviceId)
        });
      },
      
      isFavorite: (serviceId: number | string) => {
        return get().favorites.some(service => service.id === serviceId);
      }
    }),
    {
      name: 'favorites-storage',
    }
  )
)
