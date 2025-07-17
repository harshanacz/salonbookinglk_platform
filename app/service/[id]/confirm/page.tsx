"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import SalonCard from "@/components/booking/salon-card";
import BookingNavigation from "@/components/booking/booking-navigation";
import PaymentWrapper from "@/components/payment/payment-wrapper";
import CheckoutForm from "@/components/checkout/checkout-form";
import { PaymentMethod } from "@/models/enums";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VENUE);
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardDetails | null>(null);
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      setPaymentMethod(PaymentMethod.CARD_PAYMENT);
    }
  }, [searchParams]);

  const calculateTotal = () => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return total;
  };

  const calculateTotalFormatted = () => {
    return `LKR ${calculateTotal().toLocaleString()}`;
  };

  // Format services for SalonCard
  const formattedServices = selectedServices.map((service) => ({
    name: service.name,
    time: service.timeSlot || service.duration,
    professional: service.professional || selectedProfessional,
    price: `LKR ${service.price.toLocaleString()}`,
  }));

  const handlePaymentMethodChange = (method: "venue" | "card") => {
    setPaymentMethod(method === "venue" ? PaymentMethod.VENUE : PaymentMethod.CARD_PAYMENT);
    setShowPaymentForm(false);
  };

  const createPaymentIntent = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         amount: calculateTotal(), 
        currency: 'usd', 
          metadata: {
            salonId: selectedSalon?.id?.toString() || params.id,
            services: selectedServices.map(s => s.id).join(','),
            date: selectedDate,
            time: selectedTime,
            professional: selectedProfessional,
          },
        }),
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAppointment = async (paymentIntentId?: string) => {
    try {
      setIsProcessing(true);

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
      
      // Ensure slot_id is set correctly
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
        salonUserId = params.id[0];
      }
      
      // Prepare the data for the booking API
      const bookingData = {
        timeSlot: {
          ...timeSlot,
          slot_id: timeSlot.slot_id || timeSlot.id,
          id: timeSlot.id || timeSlot.slot_id,
          start_time: timeSlot.start_time,
          period: timeSlot.period || 30,
          timestamp: timeSlot.timestamp || new Date(timeSlot.start_time).getTime()
        },
        salonId: salonUserId,
        serviceId: serviceId || salonUserId,
        staffId: staffMember ? staffMember._id : null,
        paymentMethod: paymentMethod,
        paymentIntentId: paymentIntentId || null,
        amount: calculateTotal(), // Make sure this is passed
        totalAmount: calculateTotal(), // Add this field specifically
        paymentStatus: paymentIntentId ? 'completed' : 'pending', // Set proper status
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
      
      // Store final booking data for access on appointment/payment pages
      const finalBookingData = {
        services: selectedServices,
        salon: selectedSalon,
        professional: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
        paymentMethod: paymentMethod,
        totalAmount: calculateTotalFormatted(),
        card: selectedCard,
        appointmentId: result.appointmentId,
        paymentIntentId: paymentIntentId,
      };

      sessionStorage.setItem(
        "finalBookingData",
        JSON.stringify(finalBookingData)
      );
      
      // Redirect to user appointments page
      router.push("/user/booking/user-appointments");
    } catch (error) {
      console.error("Error processing booking:", error);
      alert("There was an error booking your appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = async () => {
    if (paymentMethod === PaymentMethod.CARD_PAYMENT) {
      await createPaymentIntent();
    } else {
      // Handle venue payment
      await saveAppointment();
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    saveAppointment(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
    setShowPaymentForm(false);
    setIsProcessing(false);
  };

  // If showing payment form, render the payment interface
  if (showPaymentForm) {
    return (
      <div className="p-7 shadow-lg w-full min-h-screen bg-purple-50 flex flex-col overflow-y-auto">
        <BookingNavigation salonId={Number(params.id || 1)} />
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Complete Payment</h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <p className="text-gray-600">{selectedSalon?.name}</p>
              <p className="text-gray-600">{selectedServices.map(s => s.name).join(', ')}</p>
              <p className="text-gray-600">{selectedDate} at {selectedTime}</p>
              <p className="text-gray-600">Professional: {selectedProfessional}</p>
              <div className="mt-2 pt-2 border-t">
    <p className="font-semibold">Total: LKR {calculateTotal().toLocaleString()}</p>
    <p className="text-sm text-gray-500">
      (Approximately ${(calculateTotal() / 300).toFixed(2)} USD)
    </p>
  </div>
            </div>

            <PaymentWrapper clientSecret={clientSecret}>
              <CheckoutForm
                amount={calculateTotal()}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </PaymentWrapper>

            <button
              onClick={() => setShowPaymentForm(false)}
              className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Back to Payment Options
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                paymentMethod === PaymentMethod.VENUE
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("venue")}
              disabled={isProcessing}
            >
              🏠 Pay at venue
            </button>
            <button
              className={`w-full p-3 border rounded-lg flex items-center gap-2 ${
                paymentMethod === PaymentMethod.CARD_PAYMENT
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange("card")}
              disabled={isProcessing}
            >
              💳 Pay via Credit/Debit Card
            </button>
          </div>

          {/* Selected Card Details (if any) */}
          {paymentMethod === PaymentMethod.CARD_PAYMENT && selectedCard && (
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
                  disabled={isProcessing}
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
            disabled={isProcessing}
          />
        </div>

        {/* SalonCard Component */}
        <SalonCard
          salonName={selectedSalon?.name || ""}
          services={formattedServices}
          total={calculateTotalFormatted()}
          selectedSalon={selectedSalon || undefined}
          selectedProfessionalId="1"
          selectedProfessionalName={selectedProfessional}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={handleContinue}
          buttonText={
            isProcessing
              ? "Processing..."
              : paymentMethod === PaymentMethod.CARD_PAYMENT
              ? "Proceed to Payment"
              : "Confirm Booking"
          }
          paymentMethod={paymentMethod === PaymentMethod.VENUE ? "venue" : "card"}
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