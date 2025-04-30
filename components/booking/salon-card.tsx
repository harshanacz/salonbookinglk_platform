import React from "react";
import { Button } from "@/components/ui/button";

interface ServiceItem {
  name: string;
  time: string;
  professional: string;
  price: string;
}

interface CardDetails {
  type: string;
  lastFour: string;
}

interface SalonCardProps {
  salonName: string;
  services: ServiceItem[];
  total: string;
  selectedSalon?: {
    image?: string;
    rating?: number;
    closingTime?: string;
    isOpen?: boolean;
    address?: string;
    mapLink?: string;
  };
  // Add new props for selected booking details
  selectedProfessionalId?: string | null;
  selectedProfessionalName?: string;
  selectedDate?: string | null;
  selectedTime?: string | null;
  onContinue?: () => void; 
  buttonText?: string;
  paymentMethod?: "venue" | "card";
  cardDetails?: CardDetails;
}

const SalonCard = ({
  salonName,
  services,
  total,
  selectedSalon = {},
  selectedProfessionalId,
  selectedProfessionalName,
  selectedDate,
  selectedTime,
  onContinue,
  buttonText = "Continue",
  paymentMethod,
  cardDetails,
}: SalonCardProps) => {
 
  // Function to generate star ratings
  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span>
        {"⭐".repeat(fullStars)}
        {halfStar && <span>⭐</span>}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  // Format the selected date to display month and day
  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const day = parseInt(selectedDate);
    const date = new Date(currentYear, currentMonth, day);
    
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg min-h-[700px] w-full max-w-[700px] lg:absolute lg:top-20 lg:right-20 lg:w-[570px] md:relative md:mt-0 md:min-h-[500px]">
      {/* Salon Info Section */}
      <div className="flex items-center gap-5 w-full pr-6 mb-4">
        <img
          src={selectedSalon.image || "/default-salon.jpg"}
          alt={salonName}
          className="w-20 h-20 rounded-lg"
        />
        <div>
          <h3 className="text-lg font-semibold">{salonName}</h3>
          <p className="text-sm text-gray-500">
            {selectedSalon.rating ?? "0"} {renderStars(selectedSalon.rating)}
          </p>
          <div className="text-sm text-gray-600 ">
            {/* Time and Open/Closed Status in One Line */}
            <div className="flex flex-col text-sm text-gray-600 pt-1">
              <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span> Open until {selectedSalon.closingTime}</span>
                <span
                  className={`font-semibold ${
                    selectedSalon.isOpen ? "text-green-700" : "text-red-500"
                  }`}
                >
                  {selectedSalon.isOpen ? "Now Open" : "Closed"}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span>{selectedSalon.address}</span>
                <a
                  href={selectedSalon.mapLink}
                  target="_blank"
                  className="text-purple-500"
                >
                  Get direction
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Booking Details Section */}
      {(selectedProfessionalId || selectedDate || selectedTime) && (
        <div className="mt-4 mb-6 p-3">
          {selectedProfessionalName && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="text-sm text-gray-600 ">Professional: <span className="text-sm">{selectedProfessionalName}</span></span>
            </div>
          )}
          {selectedDate && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
              <span className="text-sm text-gray-600">Date: <span className="text-sm">{formatSelectedDate()}</span></span>
            </div>
          )}
          {selectedTime && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-sm text-gray-600">Time: <span className="text-sm">{selectedTime}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Section */}
      {paymentMethod && (
        <div className="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5v-9A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5ZM3 10.5h18" />
          </svg>
          <span className="text-sm text-gray-600">
            Payment Method:{" "}
            <span className="text-sm font-medium">
              {paymentMethod === "venue" ? "Pay at Venue" : "Card Payment"}
              {paymentMethod === "card" && cardDetails && (
                <span> ({cardDetails.type} ending in {cardDetails.lastFour})</span>
              )}
            </span>
          </span>
        </div>
      )}

      {/* Services Section */}
      <div className="mb-6 max-h-64 overflow-y-auto pr-2">
        {services.map((service, index) => (
          <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <p className="font-medium">{service.name}</p>
              <p className="font-medium">{service.price}</p>
            </div>
            <p className="text-sm text-gray-500">{service.time}</p>
            <p className="text-sm text-gray-500">{service.professional}</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between border-t pt-4 pb-5 font-semibold text-lg">
        <span>Total</span>
        <span>{total}</span>
      </div>
      
      <Button 
        variant="default" 
        className="w-full bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white py-3 rounded-2xl text-lg"
        onClick={onContinue}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default SalonCard;