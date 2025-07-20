"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Share2, Star, Phone, Clock, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { RatingDisplay } from "@/components/ui/rating-display";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/store/favoritesStore";

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
    address: string;
    phoneNumber: string;
    isOpen: boolean;
    openUntil: string;
    bestSeller: boolean;
    profilePictureUrl: string;
    todaysClosingTime: string;
    isVerified?: boolean;
    workingHours: Array<{
      day: string;
      isWorking: boolean;
      start: string;
      end: string;
    }>;
    businessHours: Array<{
      day: string;
      isOpen: boolean;
      open: string;
      close: string;
    }>;
  };
  staffAssigned: string[];
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  profileImage: string;
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

interface ServiceRating {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface RatingStatistics {
  averageRating: number;
  totalRatings: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ServicePage(props: ServicePageProps) {
  const { params } = props;
  const router = useRouter();
  const addService = useCheckoutStore((state) => state.addService);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  // Define state for our data
  const [service, setService] = useState<ServiceData | null>(null);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [serviceRatings, setServiceRatings] = useState<ServiceRating[]>([]);
  const [ratingStatistics, setRatingStatistics] = useState<RatingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [copied, setCopied] = useState(false);

  // Function to clean up address by removing plus codes
  const cleanAddress = (address: string) => {
    return address.replace(/(?:^|\s)[A-Z0-9]+\+[A-Z0-9]+(?:,\s*|\s+)/, ' ').trim();
  };

  // Geocoding function to convert coordinates to address
  const geocodeLocation = useCallback(async (lat: number, lng: number) => {
    try {
      setCoordinates({ lat, lng });
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setFormattedAddress(cleanAddress(address));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, []);

  useEffect(() => {
    const salonData = sessionStorage.getItem("salonInfo");
    if (salonData) {
      setSelectedSalon(JSON.parse(salonData));
    }
  }, []);

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

        // If location is in coordinates format, geocode it
        if (data.service?.salon?.location) {
          const locationStr = data.service.salon.location;
          if (locationStr.includes(',')) {
            const [lat, lng] = locationStr.split(',').map((coord: string) => parseFloat(coord.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              geocodeLocation(lat, lng);
            } else {
              setFormattedAddress(cleanAddress(locationStr));
            }
          } else {
            setFormattedAddress(cleanAddress(locationStr));
          }
        }

        // Track the service view
        trackServiceView(params.id);

        // Fetch service ratings
        fetchServiceRatings(params.id);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Failed to load service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [params.id, geocodeLocation]);

  // Fetch service ratings
  const fetchServiceRatings = async (serviceId: string) => {
    try {
      setRatingsLoading(true);
      const response = await fetch(`/api/services/${serviceId}/ratings?limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        setServiceRatings(data.ratings);
        setRatingStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching service ratings:", error);
    } finally {
      setRatingsLoading(false);
    }
  };

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

  // Check if service is in favorites
  const isCurrentServiceFavorite = service ? isFavorite(service.id) : false;

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!service) return;

    const favoriteService = {
      id: service.id,
      title: service.title,
      image: service.images[0] || "/placeholder.svg",
      price: service.price,
      salon: service.salon.name,
      rating: service.salon.rating,
      reviews: service.salon.reviews,
      location: service.salon.location,
    };

    if (isCurrentServiceFavorite) {
      removeFavorite(service.id);
    } else {
      addFavorite(favoriteService);
    }
  };

  // Handle adding to checkout and navigation
  const handleBookNow = () => {
    if (service) {
      addService({
        id: parseInt(service.id),
        name: service.title,
        price: service.price,
        salonId: service.salon.id,
        salonName: service.salon.name,
        duration: service.duration || 60,
      });

      // Store main service for the next page
      sessionStorage.setItem(
        "bookingServices",
        JSON.stringify([
          {
            id: service.id,
            name: service.title,
            price: service.price,
            duration: service.duration,
          },
        ])
      );

      // Store salon info for the next page
      sessionStorage.setItem(
        "salonInfo",
        JSON.stringify({
          id: service.salon.id,
          name: service.salon.name,
          image:
            service.images && service.images.length > 0
              ? service.images[0]
              : "/placeholder.svg?height=100&width=100",
          rating: service.salon.rating,
          reviews: service.salon.reviews,
          closingTime: service.salon.openUntil,
          isOpen: service.salon.isOpen,
          address: service.salon.location,
          mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            service.salon.location
          )}`,
          bestSeller: service.salon.bestSeller,
        })
      );

      router.push(`/service/${params.id}/time`);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
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

          <h1 className="text-2xl font-bold mb-2">{service.title}</h1>

          {/* Service Rating */}
          {ratingStatistics && ratingStatistics.totalRatings > 0 && (
            <div className="mb-6">
              <RatingDisplay 
                rating={ratingStatistics.averageRating} 
                totalRatings={ratingStatistics.totalRatings}
                size="md"
              />
            </div>
          )}

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
            <h2 className="text-xl font-semibold mb-4">Description</h2>
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {service.salon.name}
                    </h3>
                    {service.salon.isVerified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
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
                  {service.salon.isOpen ? (
                    <div>Open until {service.salon.openUntil}</div>
                  ) : (
                    <div>Closed for today</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-sm text-gray-700 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1 text-gray-500" />
                  <span>{formattedAddress || service.salon.location}</span>
                </div>
                {coordinates && (
                  <Link 
                    href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`} 
                    target="_blank"
                    className="ml-6 mt-1 text-purple-600 hover:underline"
                  >
                    Get direction
                  </Link>
                )}
              </div>
              <div className="mb-6">
                <div className="text-gray-700 mb-1">From</div>
                <div className="text-2xl font-bold mb-4">
                  LKR {service.price}.00
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleBookNow}
                >
                  Book now
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={toggleFavorite}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${isCurrentServiceFavorite ? "fill-red-500 text-red-500" : ""}`} 
                    /> 
                    {isCurrentServiceFavorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleShare}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
            {staffMembers.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {staffMembers.map((staff) => (
                  <div key={staff._id} className="flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
                      <Image
                        src={staff.profileImage || "/placeholder-user.jpg"}
                        alt={staff.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-600">
                      {staff.name}
                    </span>
                    <span className="text-xs text-center text-gray-500 capitalize">
                      {staff.role.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No staff members available</p>
              </div>
            )}
          </div>

          {/* Service Reviews Section */}
          {ratingStatistics && ratingStatistics.totalRatings > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
              
              {/* Rating Overview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{ratingStatistics.averageRating}</div>
                      <div className="flex items-center justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(ratingStatistics.averageRating)
                                ? "fill-yellow-400 stroke-yellow-400"
                                : "fill-gray-200 stroke-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {ratingStatistics.totalRatings} reviews
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingStatistics.distribution[star as keyof typeof ratingStatistics.distribution];
                      const percentage = ratingStatistics.totalRatings > 0 ? (count / ratingStatistics.totalRatings) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-3">{star}</span>
                          <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-500 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              {serviceRatings.length > 0 && (
                <div className="space-y-4">
                  {serviceRatings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">User</span>
                          <span className="text-sm text-gray-500">
                            on {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? "fill-yellow-400 stroke-yellow-400"
                                  : "fill-gray-200 stroke-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 text-sm">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Other Services at this Salon
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
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={service.salon.profilePictureUrl}
                  alt={service.salon.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{service.salon.name}</h3>
                  {service.salon.isVerified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">
                    {service.salon.reviews > 0 ? Number(service.salon.rating).toFixed(1) : "0"} ({service.salon.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{formattedAddress || service.salon.address}</span>
                </div>
                {coordinates && (
                  <Link 
                    href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`} 
                    target="_blank"
                    className="ml-6 text-purple-600 hover:underline text-sm"
                  >
                    Get direction
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>{service.salon.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {service.salon.isOpen ? (
                    <>Open until {service.salon.openUntil}</>
                  ) : (
                    "Closed for today"
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={toggleFavorite}
                >
                  <Heart 
                    className={`w-4 h-4 mr-2 ${isCurrentServiceFavorite ? "fill-red-500 text-red-500" : ""}`} 
                  />
                  {isCurrentServiceFavorite ? "Favorited" : "Favorite"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleShare}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}