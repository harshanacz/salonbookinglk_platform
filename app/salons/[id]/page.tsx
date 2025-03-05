"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Facebook,
  Instagram,
  Share2,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
  ),
});

// Sample salon data (in a real app, you'd fetch this based on the ID)
const salonData = {
  id: 1,
  name: "Salon Amandi",
  description:
    "Your one-stop destination for all beauty needs in the heart of Colombo.",
  rating: 4.9,
  reviews: 325,
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
  contact: {
    phone: "+94 77 123 4567",
    email: "info@salonamandi.lk",
    website: "www.salonamandi.lk",
    address: "123 Galle Road, Colombo 03",
    coordinates: { lat: 6.9271, lng: 79.8612 },
  },
  hours: {
    monday: { open: "09:00", close: "20:00" },
    tuesday: { open: "09:00", close: "20:00" },
    wednesday: { open: "09:00", close: "20:00" },
    thursday: { open: "09:00", close: "20:00" },
    friday: { open: "09:00", close: "20:00" },
    saturday: { open: "10:00", close: "18:00" },
    sunday: { open: "10:00", close: "16:00" },
  },
  services: [
    {
      category: "Hair",
      items: [
        { id: 1, name: "Haircut & Blow Dry", price: 1500, duration: 60 },
        { id: 2, name: "Hair Coloring", price: 3500, duration: 120 },
        { id: 3, name: "Hair Treatment", price: 2500, duration: 90 },
      ],
    },
    {
      category: "Nails",
      items: [
        { id: 4, name: "Manicure", price: 1200, duration: 45 },
        { id: 5, name: "Pedicure", price: 1500, duration: 60 },
        { id: 6, name: "Nail Art", price: 800, duration: 30 },
      ],
    },
  ],
  staff: [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Stylist",
      image: "/placeholder.svg?height=200&width=200",
      specialties: ["Hair Coloring", "Styling"],
    },
    {
      id: 2,
      name: "Mike Smith",
      role: "Hair Specialist",
      image: "/placeholder.svg?height=200&width=200",
      specialties: ["Haircuts", "Treatments"],
    },
  ],
  reviewList: [
    {
      id: 1,
      user: "Jane Doe",
      rating: 5,
      date: "2024-01-15",
      comment: "Amazing service! The staff was very professional and friendly.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      user: "John Smith",
      rating: 4,
      date: "2024-01-10",
      comment: "Great experience overall. Will definitely come back.",
      image: "/placeholder.svg?height=100&width=100",
    },
  ],
};

export default function SalonPage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gray-900">
        <Image
          src={salonData.images[0] || "/placeholder.svg"}
          alt={salonData.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-4xl font-bold">{salonData.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{salonData.rating}</span>
                  <span className="ml-1 text-gray-300">
                    ({salonData.reviewList.length} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5" />
                  <span className="ml-1">{salonData.contact.address}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About {salonData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{salonData.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{salonData.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{salonData.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{salonData.contact.website}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 text-gray-400 mr-2" />
                      <span>Facebook</span>
                    </div>
                    <div className="flex items-center">
                      <Instagram className="h-5 w-5 text-gray-400 mr-2" />
                      <span>Instagram</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={salonData.services[0].category.toLowerCase()}
                >
                  <TabsList className="mb-6">
                    {salonData.services.map((category) => (
                      <TabsTrigger
                        key={category.category}
                        value={category.category.toLowerCase()}
                      >
                        {category.category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {salonData.services.map((category) => (
                    <TabsContent
                      key={category.category}
                      value={category.category.toLowerCase()}
                    >
                      <div className="space-y-4">
                        {category.items.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium">{service.name}</h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {service.duration} mins
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                Rs. {service.price}
                              </div>
                              <Link href={`/service/${service.id}`}>
                                <Button size="sm" className="mt-2">
                                  Book Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {salonData.staff.map((member) => (
                    <div key={member.id} className="text-center space-y-3">
                      <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-2 ring-gray-100">
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {salonData.reviewList.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-4">
                        <Image
                          src={review.image || "/placeholder.svg"}
                          alt={review.user}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-gray-100"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{review.user}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 z-10 bg-white">
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full justify-between",
                      head_cell:
                        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                      row: "flex w-full mt-2 justify-between",
                      cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 mx-auto",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-3">Available Time Slots</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(
                      (time) => (
                        <Button key={time} variant="outline" className="w-full">
                          {time}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <Button className="w-full">Book Now</Button>
              </CardContent>
            </Card>

            <Card className="relative z-0">
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-lg overflow-hidden ring-2 ring-gray-100">
                  <Map
                    center={salonData.contact.coordinates}
                    zoom={15}
                    markers={[
                      {
                        id: salonData.id,
                        position: salonData.contact.coordinates,
                        label: salonData.rating.toString(),
                        selected: true,
                      },
                    ]}
                  />
                </div>
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Business Hours</h3>
                  <div className="space-y-2">
                    {Object.entries(salonData.hours).map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours.open} - {hours.close}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
