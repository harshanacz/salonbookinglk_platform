"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, MapPin, Clock, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    image: string;
    price: number;
    salon: string;
    salonLogo?: string;
    salonContextId?: string;
    rating: number;
    reviews: number;
    location: string;
    duration?: string;
    type?: string;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [salonName, setSalonName] = useState(service.salon || "Unknown Salon");
  const [salonLogo, setSalonLogo] = useState(service.salonLogo || "/placeholder-logo.svg");
  const [isLoading, setIsLoading] = useState(!!service.salonContextId);
  
  // Fetch salon context details if salonContextId is provided
  useEffect(() => {
    const fetchSalonContext = async () => {
      // If no salonContextId, use default values and skip fetching
      if (!service.salonContextId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`[ServiceCard] Fetching salon context with ID: ${service.salonContextId}`);
        
        const response = await fetch(`/api/salons/${service.salonContextId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch salon details: ${response.status} - ${errorText}`);
        }
        
        const salonData = await response.json();
        console.log(`[ServiceCard] Salon data fetched:`, salonData);
        
        // Update salon name and logo from the fetched context
        if (salonData && salonData.businessName) {
          setSalonName(salonData.businessName);
        }
        
        if (salonData && salonData.profilePictureUrl) {
          setSalonLogo(salonData.profilePictureUrl);
        }
      } catch (error) {
        console.error('Failed to fetch salon context:', error, `(salonContextId: ${service.salonContextId})`);
        // No need to reset state, keep the default values
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalonContext();
  }, [service.salonContextId]);
  
  // Function to track service view
  const trackServiceView = useCallback(async () => {
    try {
      // Don't await this request - fire and forget to avoid delaying navigation
      fetch('/api/services/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          metricType: 'view'
        }),
      });
    } catch (error) {
      // Just log the error, don't disrupt the user experience
      console.error('Failed to track service view:', error);
    }
  }, [service.id]);

  return (
    <Link 
      href={`/service/${service.id}`} 
      className="block group"
      onClick={trackServiceView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 
        hover:shadow-lg hover:border-gray-300 hover:-translate-y-1">
        {/* Image with overlay and service type badge */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 600px) 100vw, 50vw"
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70"></div>
          
          {/* Service type badge */}
          {service.type && (
            <div className="absolute top-3 left-3 bg-white/90 text-purple-700 text-xs font-medium px-2 py-1 rounded-full shadow-md">
              {service.type}
            </div>
          )}
          
          {/* Price tag */}
          <div className="absolute bottom-3 left-3 bg-white/90 shadow-md rounded-lg py-1 px-3">
            <span className="font-bold text-sm text-purple-800">
              Rs. {service.price.toFixed(0)}
            </span>
          </div>
          
          {/* Wishlist button */}
          <button 
            className="absolute top-3 right-3 bg-white/40 hover:bg-white/70 p-2 rounded-full transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              // Add wishlist functionality here
            }}
          >
            <Heart className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-4 pb-2">
          {/* Salon information with logo */}
          <div className="flex items-center justify-between mb-3">              <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative">
                <Image
                  src={salonLogo}
                  alt={salonName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // If image fails to load, set to fallback
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-logo.svg";
                  }}
                />
              </div>
              <span className="ml-2 text-sm font-medium line-clamp-1">
                {isLoading ? (
                  <span className="inline-block w-20 h-4 bg-gray-200 animate-pulse rounded"></span>
                ) : (
                  salonName
                )}
              </span>
            </div>
            
            {/* Show reviews */}
            <div className="flex items-center bg-yellow-50 text-xs px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400 mr-1" />
              <span className="font-medium">{service.reviews > 0 ? service.rating.toFixed(1) : "0"}</span>
              <span className="text-gray-500 ml-1">({service.reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors">
            {service.title}
          </h3>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm">
          {/* Location */}
          <div className="flex items-center text-gray-500">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="line-clamp-1 text-xs">{service.location}</span>
          </div>
          
          {/* Duration if available */}
          {service.duration && (
            <div className="flex items-center text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">{service.duration}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
