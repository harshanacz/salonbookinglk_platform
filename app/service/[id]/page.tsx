"use client";

import { useState, useEffect } from "react";
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

// Define interfaces for our data
interface ServiceData {
  id: string;
  title: string;
  images: string[];
  price: number;
  type: string;
  description: string[];
  duration: number;
  salon: {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    location: string;
    isOpen: boolean;
    openUntil: string;
    bestSeller: boolean;
  };
  staffAssigned: string[];
}

interface StaffMember {
  id: number;
  name: string;
  image: string;
}

interface RelatedService {
  id: string;
  title: string;
  image: string;
  price: number;
  salon: string;
  rating: number;
  reviews: number;
  location: string;
}

export default function ServicePage(props: ServicePageProps) {
  const { params } = props;
  const addService = useCheckoutStore((state) => state.addService);

  // Define state for our data
  const [service, setService] = useState<ServiceData | null>(null);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch service data
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/services/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setService(data.service);
        setRelatedServices(data.relatedServices);
        setStaffMembers(data.staff);
        
        // Track the service view
        trackServiceView(params.id);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Failed to load service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceData();
  }, [params.id]);

  // Function to track service view
  const trackServiceView = async (serviceId: string) => {
    try {
      // Don't await this request - fire and forget to avoid delaying navigation
      fetch('/api/services/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          metricType: 'view'
        }),
      });
    } catch (error) {
      // Just log the error, don't disrupt the user experience
      console.error('Failed to track service view:', error);
    }
  };

  // Handle adding to checkout
  const handleBookNow = () => {
    if (service) {
      addService({
        id: service.id,
        name: service.title,
        price: service.price,
        salonId: service.salon.id,
        salonName: service.salon.name,
        duration: service.duration || 60,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 w-full">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
            <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
            <div className="flex gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-md bg-gray-200 animate-pulse"></div>
              ))}
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="space-y-4 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/3">
            <Card className="p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {error || "Service not found"}
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't load the service details at this time.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 w-full">
          <nav className="text-sm mb-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link
              href={`/categories/${service.type.toLowerCase().replace(/_/g, '-')}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {service.type.replace(/_/g, ' ')}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{service.title}</span>
          </nav>

          <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

          <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={service.images[selectedImage] || "/placeholder.svg?height=600&width=800"}
              alt={service.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {service.images.map((image, i) => (
              <div
                key={i}
                className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer ${
                  i === selectedImage ? "border-2 border-purple-600" : ""
                }`}
                onClick={() => setSelectedImage(i)}
              >
                <Image
                  src={image || "/placeholder.svg?height=100&width=100"}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            {service.description.length > 0 ? (
              <ul className="space-y-4">
                {service.description.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No instructions provided for this service.</p>
            )}
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
                <Link 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.salon.location)}`} 
                  target="_blank"
                  className="ml-2 text-purple-600 hover:underline"
                >
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
                <Link href={`/user/booking?serviceId=${service.id}`}>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleBookNow}
                  >
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
              {staffMembers.map((staff) => (
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
            {relatedServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedServices.map((relService) => (
                  <ServiceCard key={relService.id} service={relService} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No related services found.</p>
            )}
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
                      {service.salon.rating.toFixed(1)}
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
              <Link 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.salon.location)}`}
                target="_blank" 
                className="ml-2 text-purple-600 hover:underline"
              >
                Get direction
              </Link>
            </div>
            <div className="mb-6">
              <div className="text-gray-700 mb-1">From</div>
              <div className="text-2xl font-bold mb-4">
                LKR {service.price.toFixed(2)}
              </div>
              {service.duration && (
                <div className="text-sm text-gray-600">
                  Duration: {service.duration} minutes
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Link href={`/user/booking?serviceId=${service.id}`}>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleBookNow}
                >
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
      </div>
    </div>
  );
}
