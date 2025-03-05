"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/checkoutStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Sample service data (you would fetch this based on the ID in a real application)
const serviceData = {
  id: 1,
  name: "Custom Hair Coloring And Highlights",
  image: "/placeholder.svg?height=200&width=200",
  price: 620,
  duration: 120,
  salon: {
    name: "Salon Amandi",
    rating: 4.9,
    reviews: 325,
    location: "Katubedda, Galle Road",
  },
  staff: [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Stylist",
      image: "/placeholder.svg?height=100&width=100",
      experience: "8 years",
      specialties: ["Hair Coloring", "Styling"],
    },
    {
      id: 2,
      name: "Mike Smith",
      role: "Hair Specialist",
      image: "/placeholder.svg?height=100&width=100",
      experience: "5 years",
      specialties: ["Haircuts", "Treatments"],
    },
    {
      id: 3,
      name: "Emma Davis",
      role: "Color Expert",
      image: "/placeholder.svg?height=100&width=100",
      experience: "10 years",
      specialties: ["Hair Coloring", "Highlights"],
    },
  ],
};

export default function BookingPage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const router = useRouter();
  const addService = useCheckoutStore((state) => state.addService);

  const handleBooking = () => {
    if (!selectedStaff) {
      alert("Please select a staff member");
      return;
    }
    // Add service to checkout store
    addService({
      id: serviceData.id,
      name: serviceData.name,
      price: serviceData.price,
      image: serviceData.image,
    });
    // Redirect to checkout
    router.push("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Your Appointment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mb-4 w-full"
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
                <div className="mb-4">
                  <Label htmlFor="time">Select Time</Label>
                  <Select onValueChange={setSelectedTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "09:00",
                        "10:00",
                        "11:00",
                        "14:00",
                        "15:00",
                        "16:00",
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Select Staff Member</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  onValueChange={setSelectedStaff}
                  className="space-y-4"
                >
                  {serviceData.staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4"
                    >
                      <RadioGroupItem
                        value={member.id.toString()}
                        id={`staff-${member.id}`}
                      />
                      <Label
                        htmlFor={`staff-${member.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">
                              {member.role}
                            </div>
                            <div className="text-xs text-gray-400">
                              {member.experience} experience
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden mr-4">
                    <Image
                      src={serviceData.image || "/placeholder.svg"}
                      alt={serviceData.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{serviceData.name}</h3>
                    <div className="text-sm text-gray-500">
                      {serviceData.salon.name}
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>
                      {selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>{selectedTime || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff</span>
                    <span>
                      {selectedStaff
                        ? serviceData.staff.find(
                            (s) => s.id.toString() === selectedStaff
                          )?.name
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{serviceData.duration} minutes</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rs. {serviceData.price}</span>
                </div>
                <Button className="w-full mt-6" onClick={handleBooking}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Salon Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">
                    {serviceData.salon.rating}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({serviceData.salon.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{serviceData.salon.location}</span>
                </div>
                <Link href={`/salons/${serviceData.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Salon Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
