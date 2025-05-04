"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    image: string;
    price: number;
    salon: string;
    rating: number;
    reviews: number;
    location: string;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
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
      className="block"
      onClick={trackServiceView}
    >
      <Card className="overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Image */}
        <div className="relative h-48 w-full">
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 50vw"
          />
        </div>

        {/* Content */}
        <CardContent className="p-4 pb-2">
          {/* Salon Name and Rating */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm font-medium">
              <Image
                src="https://i.ibb.co/kg8KJNDZ/Icon-Maker-1-1.png"
                alt="Salon Icon"
                width={16}
                height={16}
              />
              <span className="ml-2">{service.salon}</span>
            </div>
            <div className="flex items-center text-xs text-black px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400 mr-1" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-black ml-1">({service.reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold line-clamp-2">
            {service.title}
          </h3>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0 flex-col justify-between items-start text-sm">
          <div className="font-semibold text-black pb-2">
            From Rs. {service.price.toFixed(2)}
          </div>
          <div className="flex items-center text-black">
            <MapPin className="h-4 w-4 mr-1" />
            {service.location}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
