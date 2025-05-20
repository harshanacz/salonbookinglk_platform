"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addDays, parse, isAfter, isBefore, addMinutes } from "date-fns";
import Image from "next/image";
import SalonCard from "@/components/booking/salon-card";
import BookingNavigation from "@/components/booking/booking-navigation";

// Define TimeSlot interface for availability
interface TimeSlot {
  slot_id: string;
  start_time: Date;
  appointmentId: string | null;
  period: number;
  available: boolean;
}

// Define StaffMember interface for professionals
interface StaffMember {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

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
  const serviceId = params.id as string;
  
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string>("Any Professional");
  const [mainServices, setMainServices] = useState<Service[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedExtraServices, setSelectedExtraServices] = useState<Service[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  // Load services and salon info from sessionStorage
  useEffect(() => {
    const servicesData = sessionStorage.getItem("bookingServices");
    if (servicesData) {
      setMainServices(JSON.parse(servicesData));
    }
    
    const salonData = sessionStorage.getItem("salonInfo");
    if (salonData) {
      setSelectedSalon(JSON.parse(salonData));
    }
    
    // Fetch staff members for this service
    const fetchStaffMembers = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}/staff`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setStaffMembers(data.staff);
      } catch (err) {
        console.error("Error fetching staff members:", err);
        setError("Failed to load staff members. Please try again later.");
      }
    };

    fetchStaffMembers();
  }, [serviceId]);

  // Fetch available time slots when date or staff selection changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const endpoint = selectedStaff 
          ? `/api/services/${serviceId}/availability?date=${formattedDate}&staffId=${selectedStaff}`
          : `/api/services/${serviceId}/availability?date=${formattedDate}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAvailableTimeSlots(data.timeSlots);
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load available time slots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [serviceId, selectedDate, selectedStaff]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Clear time slot selection when date changes
    }
  };

  // Handle staff selection
  const handleStaffSelect = (staffId: string) => {
    if (selectedStaff === staffId) {
      setSelectedStaff(null);
      setSelectedProfessionalName("Any Professional");
    } else {
      setSelectedStaff(staffId);
      const staff = staffMembers.find(s => s._id === staffId);
      if (staff) {
        setSelectedProfessionalName(staff.name);
      }
    }
    setSelectedTimeSlot(null); // Clear time slot selection when staff changes
  };

  // Function to group time slots by hour for better display
  const groupTimeSlotsByHour = () => {
    const grouped: { [hour: string]: TimeSlot[] } = {};

    availableTimeSlots.forEach((slot) => {
      const slotDate = new Date(slot.start_time);
      const hour = format(slotDate, 'h a');
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });

    return Object.entries(grouped).sort(([hourA], [hourB]) => {
      const dateA = parse(hourA, 'h a', new Date());
      const dateB = parse(hourB, 'h a', new Date());
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
    const slot = availableTimeSlots.find(s => s.slot_id === slotId);
    if (slot) {
      const timeString = format(new Date(slot.start_time), "h:mm a");
      
      // Update main services with selected time and professional
      const updatedMainServices = mainServices.map(service => ({
        ...service,
        timeSlot: timeString,
        professional: selectedProfessionalName
      }));
      
      setMainServices(updatedMainServices);
    }
  };

  // Format services for SalonCard display
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
    const allServices = [...mainServices, ...selectedExtraServices];
    const total = allServices.reduce((sum, service) => sum + service.price, 0);
    return `LKR ${total.toLocaleString()}`;
  };

  // Extra services available to add
  const extraServices: Service[] = [
    { id: "extra-1", name: "Facial Treatment", duration: "30 mins", price: 2000 },
    { id: "extra-2", name: "Manicure", duration: "15 mins", price: 1000 },
    { id: "extra-3", name: "Pedicure", duration: "20 mins", price: 1500 },
  ];

  // Handle booking continue
  const handleContinue = () => {
    if (!selectedTimeSlot) {
      alert("Please select a time slot before continuing");
      return;
    }
    
    setShowPopup(true);
  };

  // Navigate to confirmation page
  const navigateToConfirm = () => {
    // Store all the booking information in sessionStorage
    const slot = availableTimeSlots.find(s => s.slot_id === selectedTimeSlot);
    if (slot) {
      sessionStorage.setItem("bookingServices", JSON.stringify(mainServices));
      sessionStorage.setItem("bookingProfessional", selectedProfessionalName);
      sessionStorage.setItem("bookingDate", format(selectedDate, "yyyy-MM-dd"));
      sessionStorage.setItem("bookingTime", format(new Date(slot.start_time), "h:mm a"));
      sessionStorage.setItem("selectedTimeSlot", JSON.stringify({
        id: slot.slot_id,
        time: format(new Date(slot.start_time), "h:mm a"),
        date: format(selectedDate, "EEEE, MMMM d, yyyy"),
        staffId: selectedStaff,
        timestamp: slot.start_time
      }));
      
      // If we have selected extra services, add them too
      if (selectedExtraServices.length > 0) {
        const allServices = [...mainServices, ...selectedExtraServices];
        sessionStorage.setItem("bookingServices", JSON.stringify(allServices));
      }
      
      router.push(`/service/${serviceId}/confirm`);
    }
  };

  // Handle selecting an extra service
  const handleSelectExtraService = (service: Service) => {
    // Check if this service is already selected
    const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);
    
    if (!isAlreadySelected) {
      const updatedService = {
        ...service,
        timeSlot: format(new Date(), "h:mm a"), // Default to current time
        professional: selectedProfessionalName
      };
      
      setSelectedExtraServices(prev => [...prev, updatedService]);
    }
  };

  // Loading state
  if (loading && !availableTimeSlots.length) {
    return (
      <div className="p-12 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto">
        <BookingNavigation salonId={Number(serviceId)} />
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto">
      <BookingNavigation salonId={Number(serviceId)} />
      <div className="w-full lg:w-3/4 mx-auto">
        <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar and Salon Info */}
          <div>
            <Card className="p-4 mb-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" /> 
                  Select Date
                </h3>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  isBefore(date, new Date()) || 
                  isAfter(date, addDays(new Date(), 30))
                }
                className="rounded-md border"
              />
            </Card>
            
            {/* Salon Info Card */}
            {selectedSalon && (
              <Card className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={selectedSalon.image || "/placeholder-logo.svg"}
                      alt={selectedSalon.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedSalon.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      {selectedSalon.address}
                    </div>
                  </div>
                </div>
                {selectedSalon.isOpen ? (
                  <div className="text-sm text-green-600">
                    Open until {selectedSalon.closingTime}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Currently closed
                  </div>
                )}
              </Card>
            )}
          </div>
          
          {/* Middle Column - Staff and Time Slots */}
          <div className="lg:col-span-2">
            {/* Staff Selection */}
            {staffMembers.length > 0 && (
              <Card className="p-4 mb-4">
                <h3 className="font-medium text-lg mb-4">Select Professional (Optional)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {staffMembers.map((staff) => (
                    <div 
                      key={staff._id} 
                      onClick={() => handleStaffSelect(staff._id)}
                      className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center ${
                        selectedStaff === staff._id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={staff.profileImage || "/placeholder-user.jpg"}
                          alt={staff.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">{staff.name}</span>
                      <span className="text-xs text-gray-500">{staff.role}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Time Slots Selection */}
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" /> 
                  Available Time Slots
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select a convenient time for your appointment on {format(selectedDate, "EEEE, MMMM d")}
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No available time slots for this date.</p>
                  <p>Please select another date or try a different professional.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupTimeSlotsByHour().map(([hour, slots]) => (
                    <div key={hour}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{hour}</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.slot_id}
                            onClick={() => slot.available ? handleTimeSlotSelect(slot.slot_id) : null}
                            disabled={!slot.available}
                            className={`
                              text-center py-2 px-3 rounded-md text-sm
                              ${!slot.available 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : selectedTimeSlot === slot.slot_id
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white border border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                              }
                            `}
                          >
                            {format(new Date(slot.start_time), "h:mm a")}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Booking Summary Card */}
            <div className="mt-6">
              <SalonCard
                salonName={selectedSalon?.name || ""}
                services={formatServicesForSalonCard([...mainServices, ...selectedExtraServices])}
                total={calculateTotal()}
                selectedSalon={selectedSalon || undefined}
                selectedProfessionalId={selectedStaff || undefined}
                selectedProfessionalName={selectedProfessionalName}
                selectedDate={format(selectedDate, "yyyy-MM-dd")}
                selectedTime={selectedTimeSlot ? format(new Date(availableTimeSlots.find(s => s.slot_id === selectedTimeSlot)?.start_time || new Date()), "h:mm a") : null}
                onContinue={handleContinue}
                buttonText="Continue"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Extra Services Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
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
                className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg"
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
  );
}
