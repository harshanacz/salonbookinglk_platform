import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
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
    <Link href={`/service/${service.id}`} className="block">
      <Card className="overflow-hidden rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Image */}
        <div className="relative h-48 w-full">
          <Image
            // src={service.image || "/placeholder.svg"}
            src={"https://i.ibb.co/d4nFYfXk/Untitled-design-2-1-2.png"}
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
              {/* <Image src="/salon-icon.png" alt="Salon Icon" width={16} height={16} /> */}
              <Image
                src="https://i.ibb.co/kg8KJNDZ/Icon-Maker-1-1.png"
                alt="Salon Icon"
                width={16}
                height={16}
              />
              <span className="ml-2">{service.salon}</span>
            </div>
            <div className="flex items-center text-xs  text-black px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-black stroke-black mr-1" />
              <span>{service.rating}</span>
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
            From Rs. {service.price}
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
