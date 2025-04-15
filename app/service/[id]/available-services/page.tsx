"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import SalonCard from "@/components/booking/salon-card";
import BookingNavigation from "@/components/booking/booking-navigation";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
  image: string;
}

interface Salon {
  id: number;
  name: string;
  rating: number;
  image: string;
  closingTime: string;
  isOpen: boolean;
  address: string;
  mapLink: string;
}

// Updated to include images for services
const availableServices: Service[] = [
  { id: 1, name: "Hair Massage", price: 2000, duration: "1hr", image: "/hairMassage.jpg" },
  { id: 2, name: "Hair Color", price: 5000, duration: "1hr", image: "/hairColor.jpg" },
  { id: 3, name: "Hair Treatment", price: 2000, duration: "2hr", image: "/hairTreatment.jpg" },
  { id: 4, name: "Hair extension", price: 1000, duration: "1hr", image: "/hairExtension.jpg" },
];

const availableSalons: Salon[] = [
  {
    id: 1,
    name: "Salon Dmesh",
    rating: 4.9,
    image: "/Dmesh.jpg",
    closingTime: "7:30 PM",
    isOpen: true,
    address: "Molpe Road, Moratuwa",
    mapLink: "https://maps.google.com/?q=Molpe+Road,+Moratuwa",
  },
  {
    id: 2,
    name: "Style Hub",
    rating: 4.7,
    image: "/images/StyleHub.jpg",
    closingTime: "7:30 PM",
    isOpen: false,
    address: "Dompe Road, Moratuwa",
    mapLink: "https://maps.google.com/?q=Molpe+Road,+Moratuwa",
  },
  {
    id: 3,
    name: "Elite Salon",
    rating: 4.8,
    image: "/images/EliteSalon.jpg",
    closingTime: "7:30 PM",
    isOpen: true,
    address: "Molpe Road, Moratuwa",
    mapLink: "https://maps.google.com/?q=Molpe+Road,+Moratuwa",
  },
];

const ServicesPage = () => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([
    availableServices[0], // Pre-select the first service for display
  ]);
  const [selectedSalon, setSelectedSalon] = useState<Salon>(availableSalons[0]);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState("John Doe");
  const [selectedDate, setSelectedDate] = useState("15");
  const [selectedTime, setSelectedTime] = useState("2:30 PM");
  const router = useRouter();
  const params = useParams();
  const salonId = params.id;

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );

  // Format selected services for SalonCard component
  const formattedServices = selectedServices.map(service => ({
    name: service.name,
    time: service.duration,
    professional: selectedProfessionalName,
    price: `LKR ${service.price.toLocaleString()}`
  }));

  return (
    <div className="p-8 shadow-lg w-full h-screen bg-purple-50 flex flex-col overflow-y-auto">
      <BookingNavigation salonId={Number(useParams().id)}/>
      
      {/* Header */}
      

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        {/* Left Side - Display Images of Selected Service and Salon */}
        <div className="space-y-6">
          {/* Selected Salon */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Your Selected Salon</h2>
            <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
              {selectedSalon.image.startsWith('/images') ? (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <p className="text-gray-500">Salon Image</p>
                </div>
              ) : (
                <Image 
                  src={selectedSalon.image} 
                  alt={selectedSalon.name}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
            <h3 className="text-lg font-medium">{selectedSalon.name}</h3>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{selectedSalon.rating}</span>
            </div>
            <p className="text-gray-600 mt-2">{selectedSalon.address}</p>
          </div>

          {/* Selected Services */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Your Selected Services</h2>
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.id} className="relative h-40 w-full rounded-lg overflow-hidden group">
                  <div className="relative h-full w-full">
                    <Image 
                      src={service.image} 
                      alt={service.name}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                      <h3 className="text-white font-medium">{service.name}</h3>
                      <div className="flex justify-between text-white">
                        <p>{service.duration}</p>
                        <p>LKR {service.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SalonCard Component Integration - Right Side */}
        <SalonCard
          salonName={selectedSalon.name}
          services={formattedServices}
          total={`LKR ${totalPrice.toLocaleString()}`}
          selectedSalon={{
            image: selectedSalon.image,
            rating: selectedSalon.rating,
            closingTime: selectedSalon.closingTime,
            isOpen: selectedSalon.isOpen,
            address: selectedSalon.address,
            mapLink: selectedSalon.mapLink
          }}
          
          onContinue={() => router.push(`/service/${salonId}/time`)}
          buttonText="Continue"
        />
      </div>
    </div>
  );
};

export default ServicesPage;