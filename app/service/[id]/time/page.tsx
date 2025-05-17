"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import SalonCard from "@/components/booking/salon-card";
import BookingNavigation from "@/components/booking/booking-navigation";

// Define Service interface
interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  timeSlot?: string;
  professional?: string;
}

// Define formatted service interface for SalonCard
interface FormattedService {
  name: string;
  time: string;
  professional: string;
  price: string;
}

// Define Salon interface
interface Salon {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  closingTime: string;
  isOpen: boolean;
  address: string;
  mapLink: string;
  bestSeller?: boolean;
}

export default function SelectTime() {
  const router = useRouter();
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>("any"); // Default to "any" professional
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string>("Any Professional"); // Default to "Any Professional"
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Professional, 2: Date, 3: Time
  const [selectedExtraServices, setSelectedExtraServices] = useState<Service[]>([]); // Selected extra services array
  const [currentExtraService, setCurrentExtraService] = useState<Service | null>(null); // Service we're currently scheduling
  const [isSelectingTimeForExtra, setIsSelectingTimeForExtra] = useState(false);
  const [mainServices, setMainServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
    const servicesData = sessionStorage.getItem("bookingServices");
    if (servicesData) {
      setMainServices(JSON.parse(servicesData));
    }
  }, []);

  useEffect(() => {
    const staffData = sessionStorage.getItem("bookingStaffMembers");
    if (staffData) {
      setStaffMembers(JSON.parse(staffData));
    }
  }, []);

  // Load salon info from sessionStorage
  useEffect(() => {
    const salonData = sessionStorage.getItem("salonInfo");
    if (salonData) {
      setSelectedSalon(JSON.parse(salonData));
    }
  }, []);

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
      id: "any",
      name: "Any Professional",
      specialty: "No Preference",
      image: "/images/any-professional.jpg",
    },
    ...staffMembers.map((staff) => ({
      id: staff.id,
      name: staff.name,
      specialty: staff.specialty || "Staff",
      image: staff.image || "/images/any-professional.jpg",
    })),
  ];

  useEffect(() => {
    if (selectedProfessional) {
      const professional = professionals.find(p => p.id === selectedProfessional);
      if (professional) {
        setSelectedProfessionalName(professional.name);
        setCurrentStep(2); // Move to date selection after professional is selected
        
        // Update professional name in main services
        updateMainServicesProfessional(professional.name);
      }
    }
  }, [selectedProfessional]);

  // Update main services professional name when it changes
  const updateMainServicesProfessional = (name: string) => {
    mainServices.forEach(service => {
      service.professional = name;
    });
  };

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
    if (day) {
      setSelectedDate(day.toString());
    }
  };

  const handleSelectTime = (time: string) => {
    if (selectedDate) {
      setSelectedTime(time);
      
      // If we're selecting time for an extra service, update that service's time slot
      if (isSelectingTimeForExtra && currentExtraService) {
        setCurrentExtraService(prevService => 
          prevService ? { ...prevService, timeSlot: time } : null
        );
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

  // Available extra services
  const extraServices: Service[] = [
    { id: "extra-1", name: "Facial Treatment", duration: "30 mins", price: 2000 },
    { id: "extra-2", name: "Manicure", duration: "15 mins", price: 1000 },
    { id: "extra-3", name: "Pedicure", duration: "20 mins", price: 1500 },
  ];

  // Handle selecting a single extra service
  const handleSelectExtraService = (service: Service) => {
    // Check if this service is already selected
    const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);
    
    if (isAlreadySelected) {
      // If already selected, do nothing or provide feedback
      return;
    }
    
    // Set the current extra service
    setCurrentExtraService(service);
    // Close the popup and move to time selection
    setShowPopup(false);
    setIsSelectingTimeForExtra(true);
    // Reset time selection for new time slot
    setSelectedTime(null);
    // Move directly to time selection
    setCurrentStep(3);
  };

  // Get all services (main + extra)
  const getAllServices = (): Service[] => {
    return [...mainServices, ...selectedExtraServices];
  };

  // Format services for SalonCard
  const formatServicesForSalonCard = (services: Service[]): FormattedService[] => {
    return services.map(service => ({
      name: service.name,
      time: service.timeSlot || service.duration,
      professional: service.professional || selectedProfessionalName,
      price: `LKR ${service.price.toLocaleString()}`
    }));
  };

  // Calculate total price
  const calculateTotal = (): string => {
    const allServices = getAllServices();
    const total = allServices.reduce((sum, service) => sum + service.price, 0);
    return `LKR ${total.toLocaleString()}`;
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time before continuing");
      return;
    }
    setShowPopup(true);
  };

  const navigateToConfirm = () => {
    // All services have time slots, proceed to confirmation
    // Pass all the selected services and other booking details via query params or state
    const allServices = getAllServices();
    
    // Store the data in sessionStorage or localStorage for the confirmation page to access
    sessionStorage.setItem('bookingServices', JSON.stringify(allServices));
    sessionStorage.setItem('bookingProfessional', selectedProfessionalName);
    sessionStorage.setItem('bookingDate', selectedDate || '');
    sessionStorage.setItem('bookingTime', selectedTime || '');
    sessionStorage.setItem(
      "bookingStaffMembers",
      JSON.stringify(professionals)
    );
    
    router.push(`/service/${params.id}/confirm`);
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
          ? `Select Time for ${currentExtraService?.name}` 
          : null}
      </h2>
      
      <div className="w-full lg:w-1/2 p-4 space-y-6">
        {renderStepIndicator()}

        {/* Step 1: Professional Selection */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${isSelectingTimeForExtra ? "opacity-50 pointer-events-none" : ""}`}>
          <h3 className="text-lg font-semibold mb-4">1. Select Professional</h3>
          <select
            value={selectedProfessional || "any"}
            onChange={(e) => handleSelectProfessional(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            disabled={isSelectingTimeForExtra}
          >
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name} - {professional.specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Calendar */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          isSelectingTimeForExtra ? "opacity-50 pointer-events-none" : ""
        }`}>
          <h3 className="text-lg font-semibold mb-4">
            2. Select Date
          </h3>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => handleMonthChange(-1)} disabled={isSelectingTimeForExtra}>
              <ChevronLeft />
            </button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <button onClick={() => handleMonthChange(1)} disabled={isSelectingTimeForExtra}>
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
                  disabled={!day || isSelectingTimeForExtra}
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

        {/* Step 3: Time Slot Selection - Only visible after date selection */}
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          (currentStep < 3 && !isSelectingTimeForExtra) ? "opacity-50 pointer-events-none" : ""
        }`}>
          <h3 className="text-lg font-semibold mb-4">
            {isSelectingTimeForExtra 
              ? `3. Select Time for ${currentExtraService?.name}` 
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

        {/* Salon Card with Continue Button */}
        <SalonCard
          salonName={selectedSalon?.name || ""}
          services={formatServicesForSalonCard(getAllServices())}
          total={calculateTotal()}
          selectedSalon={selectedSalon || undefined}
          selectedProfessionalId={selectedProfessional}
          selectedProfessionalName={selectedProfessionalName}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={isSelectingTimeForExtra 
            ? () => {
                if (selectedTime && currentExtraService) {
                  setSelectedExtraServices(prev => [
                    ...prev, 
                    { 
                      ...currentExtraService, 
                      timeSlot: selectedTime, 
                      professional: selectedProfessionalName 
                    }
                  ]);
                  setCurrentExtraService(null);
                  setIsSelectingTimeForExtra(false);
                  setSelectedTime(null);
                  setShowPopup(true);
                } else {
                  alert("Please select a time for this service");
                }
              }
            : handleContinue
          }
          buttonText={isSelectingTimeForExtra 
            ? `Confirm Time for ${currentExtraService?.name}` 
            : "Continue"
          }
        />

        {/* Modified Popup for Single Extra Service Selection */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold">Add Extra Service</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                Select an extra service to add
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {extraServices.map((service) => {
                  // Check if this service is already selected
                  const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);
                  
                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg mb-2 ${
                        isAlreadySelected 
                          ? "bg-green-100 cursor-not-allowed" 
                          : "bg-purple-100 cursor-pointer hover:bg-purple-200 transition-colors"
                      }`}
                      onClick={() => !isAlreadySelected && handleSelectExtraService(service)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.duration}</p>
                          <p className="text-sm">
                            From LKR {service.price.toLocaleString()}
                          </p>
                        </div>
                        {isAlreadySelected && (
                          <div className="text-green-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <button 
                  className="w-full bg-transparent border border-purple-700 text-purple-700 py-3 rounded-2xl text-lg"
                  onClick={navigateToConfirm}
                >
                  {selectedExtraServices.length > 0 
                    ? "Proceed with Selected Services" 
                    : "Skip Extra Services"
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
