"use client";;
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Share2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { useCheckoutStore } from "@/store/checkoutStore";

interface ServicePageProps {
  params: {
    id: string;
  };
}

export default function ServicePage(props: ServicePageProps) {
  const { params } = props;
  const addService = useCheckoutStore((state) => state.addService);

  const service = {
    id: Number.parseInt(params.id),
    title: "Custom Hair Coloring and Highlights",
    image: "/placeholder.svg?height=600&width=800",
    price: 1500,
    salon: {
      name: "Salon Amaya",
      rating: 4.9,
      reviews: 485,
      location: "Molpe Road, Moratuwa",
      isOpen: true,
      openUntil: "7:30PM",
      bestSeller: true,
    },
    description: [
      "Wash your hair 1-2 days before coloring. Freshly washed hair can strip natural oils, making it more porous and potentially leading to uneven color.",
      "Use a deep conditioner or hair mask to hydrate your hair. This helps protect it from the chemicals in the dye.",
    ],
    staff: Array.from({ length: 6 }).map((_, index) => ({
      id: index + 1,
      name: `Staff Member ${index + 1}`,
      image: "/placeholder.svg?height=100&width=100",
    })),
  };

  const relatedServices = [
    {
      id: 2,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amaya",
      rating: 4.9,
      reviews: 130,
      location: "Molpe Road, Moratuwa",
    },
    {
      id: 3,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amaya",
      rating: 4.8,
      reviews: 150,
      location: "Molpe Road, Moratuwa",
    },
    {
      id: 4,
      title: "Acrylic Nail Extensions With Custom Art",
      image: "/placeholder.svg?height=300&width=400",
      price: 1500,
      salon: "Salon Amaya",
      rating: 4.9,
      reviews: 130,
      location: "Molpe Road, Moratuwa",
    },
    {
      id: 5,
      title: "Custom Hair Coloring And Highlights",
      image: "/placeholder.svg?height=300&width=400",
      price: 620,
      salon: "Salon Amaya",
      rating: 4.8,
      reviews: 120,
      location: "Katubedda, Galle Road",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 w-full">
          <nav className="text-sm mb-4">
            <Link
              href="/services"
              className="text-gray-500 hover:text-gray-700"
            >
              Main HairCuts
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{service.title}</span>
          </nav>

          <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

          <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`relative w-20 h-20 rounded-md overflow-hidden ${
                  i === 0 ? "border-2 border-purple-600" : ""
                }`}
              >
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="space-y-4">
              {service.description.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Booking Card: Mobile only */}
          <div className="lg:hidden mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-yellow-100">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt={service.salon.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {service.salon.name}
                  </h3>
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-500 mr-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-black">
                        {service.salon.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({service.salon.reviews})
                    </span>
                  </div>
                </div>
              </div>
              {service.salon.bestSeller && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full inline-block mb-4">
                  Best Seller
                </div>
              )}
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <svg
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div>Open until {service.salon.openUntil}</div>
                  <div className="text-green-600 font-medium">Now Open</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-700 mb-6">
                <MapPin className="h-5 w-5 mr-1 text-gray-500" />
                <span>{service.salon.location}</span>
                <Link href="#" className="ml-2 text-purple-600 hover:underline">
                  Get direction
                </Link>
              </div>
              <div className="mb-6">
                <div className="text-gray-700 mb-1">From</div>
                <div className="text-2xl font-bold mb-4">
                  LKR {service.price}.00
                </div>
              </div>
              <div className="space-y-3">
                <Link href={`/service/${params.id}/time`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Book now
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {service.staff.map((staff) => (
                <div key={staff.id} className="flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
                    <Image
                      src={staff.image}
                      alt={staff.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    {staff.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Services you may like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/3">
          <Card className="sticky top-24 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-yellow-100">
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt={service.salon.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{service.salon.name}</h3>
                <div className="flex items-center">
                  <div className="flex items-center text-yellow-500 mr-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-black">
                      {service.salon.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({service.salon.reviews})
                  </span>
                </div>
              </div>
            </div>
            {service.salon.bestSeller && (
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full inline-block mb-4">
                Best Seller
              </div>
            )}
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <svg
                className="h-5 w-5 mr-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div>Open until {service.salon.openUntil}</div>
                <div className="text-green-600 font-medium">Now Open</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-700 mb-6">
              <MapPin className="h-5 w-5 mr-1 text-gray-500" />
              <span>{service.salon.location}</span>
              <Link href="#" className="ml-2 text-purple-600 hover:underline">
                Get direction
              </Link>
            </div>
            <div className="mb-6">
              <div className="text-gray-700 mb-1">From</div>
              <div className="text-2xl font-bold mb-4">
                LKR {service.price}.00
              </div>
            </div>
            <div className="space-y-3">
              <Link href={`/service/${params.id}/time`}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Book now
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-4 text-center">
              Something went wrong
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
