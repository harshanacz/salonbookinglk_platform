"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SalonCard from "@/components/booking/SalonCard";
import BookingNavigation from "@/components/booking/BookingNavigation"


interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
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

const availableServices: Service[] = [
  { id: 1, name: "Hair Massage", price: 2000, duration: "1hr" },
  { id: 2, name: "Hair Color", price: 5000, duration: "1hr" },
  { id: 3, name: "Hair Treatment", price: 2000, duration: "2hr" },
  { id: 4, name: "Hair extension", price: 1000, duration: "1hr" },
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
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon>(availableSalons[0]);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState("John Doe");
  const [selectedDate, setSelectedDate] = useState("15");
  const [selectedTime, setSelectedTime] = useState("2:30 PM");
  const router = useRouter();

  const addService = (service: Service) => {
    if (!selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

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
    <div className="p-8 shadow-lg w-full h-screen bg-purple-50 flex flex-col overflow-y-auto"> {/* Changed p-7 to p-8 */}
      {/* Navigation */}
      {/* <nav className="text-gray-600 mb-4 mt-5">
        <span className="text-black font-semibold pr-3">Services</span> {"> "}
        <Link
          href="/user-booking/time"
          className="text-gray-500 hover:underline pl-3 pr-3"
        >
          Time
        </Link>{" "}
        {"> "}
        <Link href="/user-booking/confirm" className="text-gray-500 hover:underline pl-3">
          Confirm
        </Link>
      </nav> */}
      <>
      <BookingNavigation/>
      </>


      {/* Header */}
      <h1 className="pl-6 text-2xl font-bold mb-4">Services</h1>
      <button className="bg-purple-900 text-white px-4 py-1 lg:w-[250px] rounded-full lg:text-sm">
        Available services
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8"> {/* Changed gap-6 mt-4 to gap-8 mt-8 */}
        {/* Available Services */}
        <div className="space-y-3">
          {availableServices.map((service) => (
            <div
              key={service.id}
              className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md lg:w-[750px]"
            >
              <div>
                <p className="text-lg font-normal">{service.name}</p>
                <p className="text-sm text-gray-500">{service.duration}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-normal">
                  LKR {service.price.toLocaleString()}
                </p>
                <button
                  onClick={() => addService(service)}
                  className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center" 
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SalonCard Component Integration */}
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
          selectedProfessionalId="1"
          selectedProfessionalName={selectedProfessionalName}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={() => router.push("/user-booking/time")}
          buttonText="Continue"
        />
      </div>
    </div>
  );
};

export default ServicesPage;