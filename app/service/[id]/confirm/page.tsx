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
  const [bookingNotes, setBookingNotes] = useState<string>("");

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

      // Check if a specific staff member was selected
      const staffMemberData = sessionStorage.getItem("selectedStaffMember");
      if (staffMemberData) {
        const staffMember = JSON.parse(staffMemberData);
        setSelectedProfessional(staffMember.name || "");
      } else {
        // If no specific staff member, use the general professional name
        setSelectedProfessional(
          sessionStorage.getItem("bookingProfessional") || ""
        );
      }
      
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

  const handleContinue = async () => {
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
    
    try {
      // Show loading state to the user
      const loadingToast = () => {
        alert("Processing your booking request...");
      };
      loadingToast();
      
      // Get the time slot data from sessionStorage
      const timeSlotData = sessionStorage.getItem("selectedTimeSlot");
      let timeSlot = null;
      
      if (timeSlotData) {
        try {
          timeSlot = JSON.parse(timeSlotData);
          console.log("Retrieved time slot data:", timeSlot);
        } catch (err) {
          console.error("Error parsing time slot data:", err);
          alert("Error: Invalid booking information. Please try selecting your time again.");
          return;
        }
      }
      
      if (!timeSlot) {
        console.error("No time slot data found");
        alert("Error: Missing booking information. Please try selecting your time again.");
        return;
      }
      
      // Enhanced validation for time slot data
      if (!timeSlot.start_time) {
        console.error("Missing start time in time slot data");
        alert("Error: Invalid time slot information. Please try selecting your time again.");
        return;
      }
      
      // Ensure slot_id is set correctly - this is critical for matching with the database
      if (!timeSlot.slot_id && timeSlot.id) {
        timeSlot.slot_id = timeSlot.id;
        console.log("Set slot_id from id:", timeSlot.slot_id);
      }
      
      // Ensure period is set
      if (!timeSlot.period) {
        const serviceDuration = selectedServices.length > 0 ? (selectedServices[0].duration || 30) : 30;
        timeSlot.period = serviceDuration;
        console.log("Set default period for time slot:", timeSlot.period);
      }

      // Get the first service ID as the main service
      const serviceId = selectedServices.length > 0 ? selectedServices[0].id : null;
      
      // Get the selected staff member data if available
      const staffMemberData = sessionStorage.getItem("selectedStaffMember");
      let staffMember = null;
      
      if (staffMemberData) {
        staffMember = JSON.parse(staffMemberData);
      }
      
      // Get the salon ID from selected salon if available
      let salonUserId = selectedSalon && selectedSalon.id ? selectedSalon.id : params.id;
      console.log("Using salon ID:", salonUserId);
      
      // For debugging purposes, see if we have a direct salon ID from the URL
      if (typeof params.id === 'string') {
        console.log("URL params ID:", params.id);
      } else if (Array.isArray(params.id)) {
        console.log("URL params ID (array):", params.id[0]);
        salonUserId = params.id[0]; // Use the first value if it's an array
      }
      
      // Prepare the data for the booking API
      const bookingData = {
        timeSlot: {
          ...timeSlot,
          // Ensure both id and slot_id are set correctly
          slot_id: timeSlot.slot_id || timeSlot.id,
          id: timeSlot.id || timeSlot.slot_id,
          // Make sure we include all fields needed for creating a new time slot
          start_time: timeSlot.start_time,
          period: timeSlot.period || 30,
          timestamp: timeSlot.timestamp || new Date(timeSlot.start_time).getTime()
        },
        salonId: salonUserId,
        userId: salonUserId, // Using salon ID as the user ID
        clientId: salonUserId, // Using salon ID as the client ID for demo purposes
        serviceId: serviceId || salonUserId, // Fallback to salonId if no serviceId
        staffId: staffMember ? staffMember._id : null, // Use staffMember._id if a specific staff was selected
        paymentMethod: paymentMethod,
        note: bookingNotes,
        date: selectedDate,
        time: selectedTime
      };
      
      // Final validation before sending
      if (!bookingData.timeSlot || !bookingData.timeSlot.slot_id) {
        console.error("Invalid time slot data:", bookingData.timeSlot);
        alert("Error: Invalid time slot information. Please try selecting your time again.");
        return;
      }
      
      // Add a debug log to see what's being sent
      console.log("Sending booking data:", JSON.stringify(bookingData, null, 2));
      
      // Call the API to save the booking
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error booking appointment:", result);
        
        // Handle specific error cases with more helpful messages
        let errorMessage = result.error || 'Unknown error';
        
        if (errorMessage.includes("Time slot not found in salon schedule")) {
          errorMessage = "The selected time slot is no longer available. Please select another time slot.";
        } else if (errorMessage.includes("Salon not found")) {
          errorMessage = "Salon information couldn't be found. Please try again or contact support.";
        }
        
        alert(`There was an error booking your appointment: ${errorMessage}. Please try again.`);
        return;
      }
      
      console.log("Booking successful:", result);
      
      // Redirect to user appointments page
      router.push("/user/booking/user-appointments");
    } catch (error) {
      console.error("Error processing booking:", error);
      alert("There was an error booking your appointment. Please try again.");
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
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
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
