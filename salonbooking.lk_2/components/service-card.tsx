import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  service: {
    id: number;
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
  return (
    <Link href={`/service/${service.id}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Star className="h-3 w-3 fill-yellow-500 stroke-yellow-500 mr-1" />
              <span>{service.rating}</span>
              <span className="text-gray-500 ml-1">({service.reviews})</span>
            </div>
            <div className="text-sm font-medium">{service.salon}</div>
          </div>
          <h3 className="font-medium line-clamp-2">{service.title}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {service.location}
          </div>
          <div className="font-semibold">From Rs. {service.price}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
