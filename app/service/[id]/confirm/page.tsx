"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import SalonCard from "@/components/booking/salon-card";
import BookingNavigation from "@/components/booking/booking-navigation";

// Define Service interface - making it compatible with the format from SelectTime
interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  timeSlot?: string;
  professional?: string;
}

// Define Salon interface
interface Salon {
  id?: number;
  name: string;
  rating: number;
  image: string;
  closingTime?: string;
  isOpen?: boolean;
  address?: string;
  mapLink?: string;
}

interface CardDetails {
  id: number | null;
  type: string;
  lastFour: string;
  holder: string;
}

const ConfirmPage = () => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"venue" | "card">("venue");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardDetails | null>(null);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Load booking data from sessionStorage
  useEffect(() => {
    try {
      // Retrieve services
      const servicesData = sessionStorage.getItem("bookingServices");
      if (servicesData) {
        setSelectedServices(JSON.parse(servicesData));
      }

      // Retrieve salon info
      const salonData = sessionStorage.getItem("salonInfo");
      if (salonData) {
        setSelectedSalon(JSON.parse(salonData));
      }

      // Retrieve other booking details
      setSelectedProfessional(
        sessionStorage.getItem("bookingProfessional") || ""
      );
      setSelectedDate(sessionStorage.getItem("bookingDate") || "");
      setSelectedTime(sessionStorage.getItem("bookingTime") || "");
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  }, []);

  // Check for card details in URL params on component mount
  useEffect(() => {
    const cardId = searchParams.get("cardId");
    const cardType = searchParams.get("cardType");
    const cardLastFour = searchParams.get("cardLastFour");
    const cardHolder = searchParams.get("cardHolder");

    if (cardId && cardType && cardLastFour && cardHolder) {
      setSelectedCard({
        id: parseInt(cardId),
        type: cardType,
        lastFour: cardLastFour,
        holder: cardHolder,
      });
      setPaymentMethod("card");
    }
  }, [searchParams]);

  const calculateTotal = () => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return `LKR ${total.toLocaleString()}`;
  };

  // Format services for SalonCard
  const formattedServices = selectedServices.map((service) => ({
    name: service.name,
    time: service.timeSlot || service.duration,
    professional: service.professional || selectedProfessional,
    price: `LKR ${service.price.toLocaleString()}`,
  }));

  const handlePaymentMethodChange = (method: "venue" | "card") => {
    setPaymentMethod(method);
  };

  const handleContinue = () => {
    // Store final booking data for access on appointment/payment pages
    const finalBookingData = {
      services: selectedServices,
      salon: selectedSalon,
      professional: selectedProfessional,
      date: selectedDate,
      time: selectedTime,
      paymentMethod: paymentMethod,
      totalAmount: calculateTotal(),
      card: selectedCard,
    };

    sessionStorage.setItem(
      "finalBookingData",
      JSON.stringify(finalBookingData)
    );

    if (paymentMethod === "venue") {
      router.push("/user/booking/user-appointments");
    } else {
      router.push("/user/booking/payment-success");
    }
  };

  return (
    <div className="p-7 shadow-lg w-full min-h-screen bg-purple-50 flex flex-col overflow-y-auto">
      <BookingNavigation salonId={Number(params.id || 1)} />

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
              onClick={() => handlePaymentMethodChange("venue")}
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

          {/* Selected Card Details (if any) */}
          {paymentMethod === "card" && selectedCard && (
            <div className="mt-2 p-3 border border-purple-200 rounded-lg bg-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Selected Card</h4>
                  <p className="text-gray-600">
                    {selectedCard.type} ending in {selectedCard.lastFour}
                  </p>
                  <p className="text-sm text-gray-500">{selectedCard.holder}</p>
                </div>
                <button
                  className="text-sm text-purple-600 hover:underline"
                  onClick={() => router.push("/user/payments/payment-cards")}
                >
                  Change
                </button>
              </div>
            </div>
          )}

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
          salonName={selectedSalon?.name || ""}
          services={formattedServices}
          total={calculateTotal()}
          selectedSalon={selectedSalon || undefined}
          selectedProfessionalId="1"
          selectedProfessionalName={selectedProfessional}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={handleContinue}
          buttonText="Confirm Booking"
          paymentMethod={paymentMethod}
          cardDetails={
            selectedCard
              ? {
                  type: selectedCard.type,
                  lastFour: selectedCard.lastFour,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default ConfirmPage;
