"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import SalonCard from "@/components/booking/SalonCard";
import BookingNavigation from "@/components/booking/BookingNavigation";

// Define Service interface
interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  timeSlot?: string;
}

// Define formatted service interface for SalonCard
interface FormattedService {
  name: string;
  time: string;
  professional: string;
  price: string;
}

export default function SelectTime() {
  const router = useRouter();
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Professional, 2: Date, 3: Time
  const [selectedExtraServices, setSelectedExtraServices] = useState<Service[]>([]);
  const [currentServiceForTimeSelection, setCurrentServiceForTimeSelection] = useState<Service | null>(null);
  const [isSelectingTimeForExtra, setIsSelectingTimeForExtra] = useState(false);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDayOfMonth).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const professionals = [
    {
      id: "1",
      name: "John Doe",
      specialty: "Hair Specialist",
      image: "/images/john.jpg",
    },
    {
      id: "2",
      name: "Jane Smith",
      specialty: "Nail Specialist",
      image: "/images/jane.jpg",
    },
    {
      id: "3",
      name: "Alice Johnson",
      specialty: "Makeup Artist",
      image: "/images/alice.jpg",
    },
  ];

  useEffect(() => {
    if (selectedProfessional) {
      const professional = professionals.find(p => p.id === selectedProfessional);
      if (professional) {
        setSelectedProfessionalName(professional.name);
        setCurrentStep(2); // Move to date selection after professional is selected
      }
    }
  }, [selectedProfessional]);

  useEffect(() => {
    if (selectedDate) {
      setCurrentStep(3); // Move to time selection after date is selected
    }
  }, [selectedDate]);

  const handleSelectProfessional = (id: string) => {
    setSelectedProfessional(id);
    // Reset date and time when changing professional
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleSelectDate = (day: number | null) => {
    if (day && selectedProfessional) {
      setSelectedDate(day.toString());
    }
  };

  const handleSelectTime = (time: string) => {
    if (selectedProfessional && selectedDate) {
      setSelectedTime(time);
      
      // If we're selecting time for an extra service, update that service's time slot
      if (isSelectingTimeForExtra && currentServiceForTimeSelection) {
        setSelectedExtraServices(prev => 
          prev.map(service => 
            service.id === currentServiceForTimeSelection.id 
              ? { ...service, timeSlot: time } 
              : service
          )
        );
        
        // Check if more extra services need time slots
        const nextServiceNeedingTime = selectedExtraServices.find(
          service => !service.timeSlot && service.id !== currentServiceForTimeSelection.id
        );
        
        if (nextServiceNeedingTime) {
          // Move to the next service that needs a time slot
          setCurrentServiceForTimeSelection(nextServiceNeedingTime);
          // Reset time for the next service selection
          setSelectedTime(null);
        } else {
          // All services have time slots, we can proceed to confirmation
          setIsSelectingTimeForExtra(false);
          setCurrentServiceForTimeSelection(null);
        }
      }
    }
  };

  const handleMonthChange = (increment: number) => {
    setCurrentMonth((prevMonth) => {
      let newMonth = prevMonth + increment;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const timeSlots = Array.from({ length: 6 }, (_, i) => ({
    time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"} ${9 + Math.floor(i / 2) < 12 ? "AM" : "PM"}`,
    status: i % 4 === 0 ? "unavailable" : "available",
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Main services
  const services: FormattedService[] = [
    {
      name: "Layer Hair Cut",
      time: "9:30-10:00AM",
      professional: selectedProfessionalName || "Layer cut with Dhanuka",
      price: "LKR 7,000",
    },
    {
      name: "Scalp Anti-Dandruff treatment",
      time: "10:00-10:30AM",
      professional: selectedProfessionalName || "Layer cut with Dhanuka",
      price: "LKR 1,000",
    },
  ];

  // Available extra services
  const extraServices: Service[] = [
    { id: "1", name: "Facial Treatment", duration: "30 mins", price: 2000 },
    { id: "2", name: "Manicure", duration: "15 mins", price: 1000 },
    { id: "3", name: "Pedicure", duration: "20 mins", price: 1500 },
  ];

  // Add extra service to selection
  const handleAddExtraService = (service: Service) => {
    const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);
    
    if (isAlreadySelected) {
      // Deselect the service if it's already selected
      setSelectedExtraServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      // Add the service with no time slot initially
      setSelectedExtraServices([...selectedExtraServices, { ...service, timeSlot: undefined }]);
    }
  };

  // Format extra services for SalonCard
  const formattedExtraServices: FormattedService[] = selectedExtraServices.map(service => ({
    name: service.name,
    time: service.timeSlot || "Time to be selected",
    professional: selectedProfessionalName || "Staff",
    price: `LKR ${service.price.toLocaleString()}`
  }));

  // Combine main services and extra services
  const allServices = [...services, ...formattedExtraServices];

  // Calculate total price
  const calculateTotal = (): string => {
    const mainServicesTotal = 8000; // 7000 + 1000 from the original services
    const extraServicesTotal = selectedExtraServices.reduce((sum, service) => sum + service.price, 0);
    return `LKR ${(mainServicesTotal + extraServicesTotal).toLocaleString()}`;
  };

  const selectedSalon = {
    name: "Saloon Dmesh",
    image: "/salon-dmesh.jpg",
    rating: 4.5,
    closingTime: "8:00 PM",
    isOpen: true,
    address: "123 Salon Street, Colombo",
    mapLink: "https://maps.google.com/?q=Saloon+Dmesh",
  };

  const handleContinue = () => {
    if (!selectedProfessional || !selectedDate || !selectedTime) {
      alert("Please complete all selections before continuing");
      return;
    }
    setShowPopup(true);
  };

  const beginExtraServiceTimeSelection = () => {
    // Hide the popup
    setShowPopup(false);
    
    if (selectedExtraServices.length > 0) {
      // Start with the first extra service
      const firstExtraService = selectedExtraServices[0];
      setCurrentServiceForTimeSelection(firstExtraService);
      setIsSelectingTimeForExtra(true);
      
      // Reset selection for new time slot selection
      setSelectedTime(null);
      
      // Keep date and professional selected
      setCurrentStep(3); // Move directly to time selection
    } else {
      // If no extra services, go to confirmation
      navigateToConfirm();
    }
  };

  const navigateToConfirm = () => {
    // Check if all extra services have time slots
    const allServicesHaveTimeSlots = selectedExtraServices.every(service => service.timeSlot);
    
    if (selectedExtraServices.length > 0 && !allServicesHaveTimeSlots) {
      // If there are extra services without time slots, begin time selection
      beginExtraServiceTimeSelection();
    } else {
      // All services have time slots, proceed to confirmation
      router.push(`/service/${params.id}/confirm`);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-purple-700 text-white" : "bg-gray-300"}`}>
            1
          </div>
          <span className="ml-2 font-medium">Professional</span>
        </div>
        <div className={`h-0.5 w-12 mx-2 ${currentStep >= 2 ? "bg-purple-700" : "bg-gray-300"}`}></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-purple-700 text-white" : "bg-gray-300"}`}>
            2
          </div>
          <span className="ml-2 font-medium">Date</span>
        </div>
        <div className={`h-0.5 w-12 mx-2 ${currentStep >= 3 ? "bg-purple-700" : "bg-gray-300"}`}></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-purple-700 text-white" : "bg-gray-300"}`}>
            3
          </div>
          <span className="ml-2 font-medium">Time</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-12 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto">
      <BookingNavigation salonId={Number(params.id)}/>
      <h2 className="pl-6 text-2xl font-bold mb-4">
        {isSelectingTimeForExtra 
          ? `Select Time for ${currentServiceForTimeSelection?.name}` 
          : "Select Time"}
      </h2>
      
      <div className="w-full lg:w-1/2 p-4 space-y-6">
        {renderStepIndicator()}

        {/* Step 1: Professional Selection */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${isSelectingTimeForExtra ? "opacity-50 pointer-events-none" : ""}`}>
          <h3 className="text-lg font-semibold mb-4">1. Select Professional</h3>
          <div className="grid grid-cols-3 gap-4">
            {professionals.map((professional) => (
              <button
                key={professional.id}
                onClick={() => handleSelectProfessional(professional.id)}
                className={`p-4 rounded-lg border transition-all flex flex-col items-center 
                  ${
                    selectedProfessional === professional.id
                      ? "border-purple-700 shadow-lg"
                      : "border-gray-300"
                  }`}
                disabled={isSelectingTimeForExtra}
              >
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-20 h-20 rounded-full mb-2"
                />
                <p className="text-md font-semibold">{professional.name}</p>
                <p className="text-sm text-gray-500">
                  {professional.specialty}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Calendar - Only visible after professional selection */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          (currentStep < 2 || isSelectingTimeForExtra) ? "opacity-50 pointer-events-none" : ""
        }`}>
          <h3 className="text-lg font-semibold mb-4">
            2. Select Date
            {currentStep < 2 && !isSelectingTimeForExtra && (
              <span className="ml-2 text-sm text-purple-700 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Please select a professional first
              </span>
            )}
          </h3>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => handleMonthChange(-1)} disabled={currentStep < 2 || isSelectingTimeForExtra}>
              <ChevronLeft />
            </button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <button onClick={() => handleMonthChange(1)} disabled={currentStep < 2 || isSelectingTimeForExtra}>
              <ChevronRight />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7">
              {week.map((day, j) => (
                <button
                  key={j}
                  onClick={() => handleSelectDate(day)}
                  disabled={!day || currentStep < 2 || isSelectingTimeForExtra}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all 
                    ${
                      selectedDate === day?.toString()
                        ? "bg-purple-700 text-white"
                        : day ? "bg-gray-200 text-black hover:bg-gray-300" : "opacity-0"
                    } 
                    ${!day ? "opacity-0" : ""}`}
                >
                  {day || ""}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Step 3: Time Slot Selection */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          (currentStep < 3 && !isSelectingTimeForExtra) ? "opacity-50 pointer-events-none" : ""
        }`}>
          <h3 className="text-lg font-semibold mb-4">
            {isSelectingTimeForExtra 
              ? `3. Select Time for ${currentServiceForTimeSelection?.name}` 
              : "3. Select a Time Slot"}
            {currentStep < 3 && !isSelectingTimeForExtra && (
              <span className="ml-2 text-sm text-purple-700 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Please select a date first
              </span>
            )}
          </h3>
          <div className="w-full max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                disabled={slot.status === "unavailable" || (currentStep < 3 && !isSelectingTimeForExtra)}
                onClick={() => handleSelectTime(slot.time)}
                className={`w-full p-4 flex justify-between items-center rounded-lg text-sm font-medium
                  ${
                    slot.status === "unavailable"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }
                  ${selectedTime === slot.time ? "border-black border-2" : ""}`}
              >
                <span>{slot.time || "No Time Available"}</span>
                {slot.status !== "unavailable" && (
                  <span className="text-gray-500">High Demand</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Your Information */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          (!selectedTime || isSelectingTimeForExtra) ? "opacity-50 pointer-events-none" : ""
        }`}>
          <h3 className="text-lg font-semibold mb-4">
            4. Your Information
            {(!selectedTime && !isSelectingTimeForExtra) && (
              <span className="ml-2 text-sm text-purple-700 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Complete previous steps first
              </span>
            )}
          </h3>
          <div className="space-y-4 w-full">
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={!selectedTime || isSelectingTimeForExtra}
              />
            </div>

            <div>
              <label className="block font-medium">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={!selectedTime || isSelectingTimeForExtra}
              />
            </div>
          </div>
        </div>

        {/* Salon Card with Continue Button */}
        <SalonCard
          salonName="Saloon Dmesh"
          services={allServices}
          total={calculateTotal()}
          selectedSalon={selectedSalon}
          selectedProfessionalId={selectedProfessional}
          selectedProfessionalName={selectedProfessionalName || ""}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={isSelectingTimeForExtra 
            ? () => {
                // Handle time selection for extra service
                if (selectedTime) {
                  handleSelectTime(selectedTime);
                  
                  // Check if we've scheduled all extra services
                  const allTimesSlotsAssigned = selectedExtraServices.every(
                    service => service.id === currentServiceForTimeSelection?.id ? true : service.timeSlot
                  );
                  
                  if (allTimesSlotsAssigned) {
                    // If all services have times, go to confirm
                    navigateToConfirm();
                  }
                } else {
                  alert("Please select a time for this service");
                }
              }
            : handleContinue
          }
          buttonText={isSelectingTimeForExtra 
            ? `Confirm Time for ${currentServiceForTimeSelection?.name}` 
            : "Continue"
          }
        />

        {/* Popup for Extra Service */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold">Add An Extra Service?</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {extraServices.map((service) => (
                  <div
                    key={service.id}
                    className={`p-3 ${selectedExtraServices.some(s => s.id === service.id) 
                      ? "bg-purple-200" 
                      : "bg-purple-100"} 
                      rounded-lg mb-2 cursor-pointer hover:bg-purple-200 transition-colors`}
                    onClick={() => handleAddExtraService(service)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.duration}</p>
                        <p className="text-sm">
                          From LKR {service.price.toLocaleString()}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedExtraServices.some(s => s.id === service.id) 
                          ? "bg-purple-700 text-white" 
                          : "border border-purple-700"
                      }`}>
                        {selectedExtraServices.some(s => s.id === service.id) && "✓"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <button 
                  className="w-full bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white py-3 rounded-2xl text-lg"
                  onClick={beginExtraServiceTimeSelection}
                >
                  Select Time for Extra Services
                </button>
                <button 
                  className="w-full bg-transparent border border-purple-700 text-purple-700 py-3 rounded-2xl text-lg"
                  onClick={navigateToConfirm}
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}