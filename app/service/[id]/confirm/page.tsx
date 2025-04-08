"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter ,useParams} from "next/navigation";
import SalonCard from "@/components/booking/SalonCard";
import BookingNavigation from "@/components/booking/BookingNavigation";

interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
  time?: string;
  professional?: string;
}

interface Salon {
  id: number;
  name: string;
  rating: number;
  image: string;
  closingTime?: string;
  isOpen?: boolean;
  address?: string;
  mapLink?: string;
}

const availableSalons: Salon[] = [
  {
    id: 1,
    name: "Salon Dmesh",
    rating: 4.9,
    image: "/Dmesh.jpg",
    closingTime: "8:00 PM",
    isOpen: true,
    address: "123 Main St, New York",
    mapLink: "https://maps.google.com",
  },
  { id: 2, name: "Style Hub", rating: 4.7, image: "/images/StyleHub.jpg" },
  { id: 3, name: "Elite Salon", rating: 4.8, image: "/images/EliteSalon.jpg" },
];

const ConfirmPage = () => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([
    {
      id: 1,
      name: "Haircut & Styling",
      price: 65,
      duration: "45 min",
      time: "45 min",
      professional: "Sarah Johnson",
    },
    {
      id: 2,
      name: "Hair Coloring",
      price: 85,
      duration: "60 min",
      time: "60 min",
      professional: "Michael Chen",
    },
  ]);
  const [selectedSalon, setSelectedSalon] = useState<Salon>(availableSalons[0]);
  const [paymentMethod, setPaymentMethod] = useState<"venue" | "card">("venue");
  const [selectedProfessional, setSelectedProfessional] =
    useState("Sarah Johnson");
  const [selectedDate, setSelectedDate] = useState("15"); // Assuming day of month
  const [selectedTime, setSelectedTime] = useState("2:30 PM");
  const router = useRouter();

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );

  // Format services for SalonCard
  const formattedServices = selectedServices.map((service) => ({
    name: service.name,
    time: service.time || service.duration,
    professional: service.professional || "Staff",
    price: `$${service.price}`,
  }));

  const handlePaymentMethodChange = (method: "venue" | "card") => {
    setPaymentMethod(method);

    // If card payment is selected, navigate to payment cards page
    if (method === "card") {
      router.push("/payments/paymentCards");
    }
  };
  const handleContinue = () => {
    // If venue payment is selected, proceed with booking confirmation
    if (paymentMethod === "venue") {
      router.push("/booking-confirmed");
    } else {
      // For card payments, navigate to payment cards page
      router.push("/payments/paymentCards");
    }
  };
  return (
    <div className="p-7 shadow-lg w-full min-h-screen bg-purple-50 flex flex-col overflow-y-auto">
     
     <BookingNavigation salonId={Number(useParams().id)}/>

      <h1 className="pl-6 text-2xl font-bold mb-4">Review and Confirm</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Payment Method Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">Payment Method</h3>
          <div className="space-y-2">
            <button
              className={`w-full p-3 border rounded-lg flex items-center gap-2 ${
                paymentMethod === "venue"
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-300"
              }`}
              onClick={() => setPaymentMethod("venue")}
            >
              🏠 Pay at venue
            </button>
            <button
              className={`w-full p-3 border rounded-lg flex items-center gap-2 ${
                paymentMethod === "card"
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("card")}
            >
              💳 Pay via Credit/Debit Card
            </button>
          </div>

          <h3 className="font-semibold">Special Notice</h3>
          <p className="text-gray-600 text-sm">
            To Confirm Your Appointment ✴ Please Make Sure to Send Your Hair
            Picture
          </p>

          <h3 className="font-semibold">Booking Notes</h3>
          <textarea
            className="w-full p-3 border rounded-lg mt-2 text-sm"
            placeholder="Include comments on your booking"
          />
        </div>

        {/* SalonCard Component */}
        <SalonCard
          salonName={selectedSalon.name}
          services={formattedServices}
          total={`$${totalPrice}`}
          selectedSalon={{
            image: selectedSalon.image,
            rating: selectedSalon.rating,
            closingTime: selectedSalon.closingTime,
            isOpen: selectedSalon.isOpen,
            address: selectedSalon.address,
            mapLink: selectedSalon.mapLink,
          }}
          selectedProfessionalId="1"
          selectedProfessionalName={selectedProfessional}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={handleContinue}
          buttonText="Confirm Booking"
        />
      </div>
    </div>
  );
};

export default ConfirmPage;
