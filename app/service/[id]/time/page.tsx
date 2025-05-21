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
  duration: number;
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
      time: service.timeSlot || `${service.duration} mins`,
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
    { id: "extra-1", name: "Facial Treatment", duration: 30, price: 2000 },
    { id: "extra-2", name: "Manicure", duration: 15, price: 1000 },
    { id: "extra-3", name: "Pedicure", duration: 20, price: 1500 },
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
        // Save complete time slot information with all needed fields
      sessionStorage.setItem("selectedTimeSlot", JSON.stringify({
        id: slot.slot_id,
        slot_id: slot.slot_id, // Include both formats to ensure compatibility
        start_time: slot.start_time,
        time: format(new Date(slot.start_time), "h:mm a"),
        date: format(selectedDate, "EEEE, MMMM d, yyyy"),
        staffId: selectedStaff,
        period: slot.period || 30, // Ensure period is always set (default to 30 mins)
        timestamp: new Date(slot.start_time).getTime(),
        available: true // Mark as available by default
      }));
      
      // Save selected staff member information if one was selected
      if (selectedStaff) {
        const staffMember = staffMembers.find(s => s._id === selectedStaff);
        if (staffMember) {
          sessionStorage.setItem("selectedStaffMember", JSON.stringify(staffMember));
        }
      } else {
        // Clear any previously selected staff member
        sessionStorage.removeItem("selectedStaffMember");
      }
      
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
      <div className="p-4 md:p-8 w-full min-h-screen bg-purple-50 overflow-y-auto">
        <div className="w-full lg:w-4/5 xl:w-3/4 mx-auto max-w-7xl">
          <BookingNavigation salonId={Number(serviceId)} />
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 w-full min-h-screen bg-purple-50 overflow-y-auto pb-24">
      <div className="w-full lg:w-4/5 xl:w-3/4 mx-auto max-w-7xl">
        <BookingNavigation salonId={Number(serviceId)} />
          {/* Booking Progress Indicator - Simplified */}
        <div className="mb-5 pt-4">
          <div className="flex items-center justify-center max-w-sm mx-auto">
            <div className="text-center mx-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mx-auto">✓</div>
              <span className="text-xs mt-1 block text-green-600">Service</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-500"></div>
            <div className="text-center mx-3">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mx-auto">2</div>
              <span className="text-xs mt-1 block font-medium text-purple-600">Time</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <div className="text-center mx-3">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs mx-auto">3</div>
              <span className="text-xs mt-1 block text-gray-500">Confirm</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-medium mb-5 text-center">Select Date & Time</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar and Salon Info */}
          <div className="lg:sticky lg:top-4 self-start">
            <Card className="p-4 mb-4 shadow-sm">
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
            </Card>              {/* Salon Info Card - Simplified */}
            {selectedSalon && (
              <Card className="p-4 shadow-sm">
                <h3 className="font-medium text-base mb-3">Selected Salon</h3>
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <Image
                      src={selectedSalon.image || "/placeholder-logo.svg"}
                      alt="Testing Purpose"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">Testing Purpose</h3>
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-500">4.5 ⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm mb-1 text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Open until 23:30 • Now Open</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>6.9271, 79.8612</span>
                  <button className="ml-2 text-blue-600 hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                    Get direction
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="pb-1.5 text-gray-500">Professional:</td>
                        <td className="pb-1.5 text-right font-medium">Any Professional</td>
                      </tr>
                      <tr>
                        <td className="pb-1.5 text-gray-500">Date:</td>
                        <td className="pb-1.5 text-right font-medium">November 15</td>
                      </tr>
                      <tr>
                        <td className="pb-1.5 text-gray-500">Service:</td>
                        <td className="pb-1.5 text-right font-medium">Testing Purpose</td>
                      </tr>
                      <tr>
                        <td className="pb-1.5 text-gray-500">Duration:</td>
                        <td className="pb-1.5 text-right font-medium">
                          {mainServices[0]?.duration || 30} mins
                        </td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="pt-2 pb-1 text-gray-500">Price:</td>
                        <td className="pt-2 pb-1 text-right font-medium">LKR 2,200</td>
                      </tr>
                      <tr>
                        <td className="font-medium">Total</td>
                        <td className="text-right font-medium text-purple-700">LKR 2,200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
          
          {/* Middle Column - Staff and Time Slots */}
          <div className="lg:col-span-2">            {/* Staff Selection - Simplified */}
            {staffMembers.length > 0 && (
              <Card className="p-4 mb-4 shadow-sm">                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">Select Professional</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <p className="text-sm text-center mb-2">
                    Currently selected: <span className="font-medium">{selectedProfessionalName}</span>
                  </p>
                  <div className="text-xs text-gray-600 border-t border-gray-200 pt-2">
                    <p className="mb-1">• Choosing "Any Professional" lets the salon assign a staff member.</p>
                    <p>• Selecting a specific staff member guarantees your appointment with them.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {staffMembers.map((staff) => (
                    <div 
                      key={staff._id} 
                      onClick={() => handleStaffSelect(staff._id)}
                      className={`cursor-pointer rounded-md border p-2 text-center ${
                        selectedStaff === staff._id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mb-1">
                          <Image
                            src={staff.profileImage || "/placeholder-user.jpg"}
                            alt={staff.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium truncate w-full">{staff.name}</p>
                        <p className="text-xs text-gray-500 truncate w-full">{staff.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}{/* Time Slots Selection - Simplified */}
            <Card className="p-4 shadow-sm">
              <div className="mb-3">
                <h3 className="font-medium text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" /> 
                  Available Time Slots
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please select a time for your appointment on <span className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</span>
                </p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                  <p className="ml-3 text-sm text-gray-500">Loading time slots...</p>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-4 px-4 bg-gray-50 rounded-md border border-gray-200">
                  <p className="mb-1 text-gray-700 font-medium">No available time slots</p>
                  <p className="text-xs text-gray-500">Please select another date or try a different professional</p>
                </div>
              ) : (
                <>
                  {selectedTimeSlot && (
                    <div className="bg-green-50 rounded-md p-2 mb-3 border border-green-200 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <span className="text-sm text-green-800">
                        Time selected: {availableTimeSlots.find(s => s.slot_id === selectedTimeSlot) ? 
                          format(new Date(availableTimeSlots.find(s => s.slot_id === selectedTimeSlot)!.start_time), "h:mm a") : 
                          ""}
                      </span>
                    </div>
                  )}
                  
                  <div className="overflow-y-auto max-h-[400px] pr-1">
                    {groupTimeSlotsByHour().map(([hour, slots]) => (
                      <div key={hour}>
                        <h4 className="text-sm font-medium text-gray-700 mb-1.5 mt-3">{hour}</h4>
                        <div className="grid grid-cols-4 gap-1.5">
                          {slots.map((slot) => (
                            <button
                              key={slot.slot_id}
                              onClick={() => slot.available ? handleTimeSlotSelect(slot.slot_id) : null}
                              disabled={!slot.available}
                              className={`
                                text-center py-1.5 rounded text-sm 
                                ${!slot.available 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : selectedTimeSlot === slot.slot_id
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white border border-gray-200 hover:border-purple-400'
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
                </>
              )}
            </Card>              {/* Booking Summary Card - Simplified */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 bg-purple-50 border-b border-purple-100">
                  <h3 className="text-lg font-medium text-purple-800">Booking Summary</h3>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative">
                        <Image 
                          src={selectedSalon?.image || "/placeholder-logo.svg"}
                          alt="Testing Purpose"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium">Testing Purpose</h4>
                        <p className="text-xs text-gray-500">Any Professional</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-700">LKR 2,200</p>
                      <p className="text-xs text-gray-500">{mainServices[0]?.duration || 30} mins</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 text-sm">Date:</span>
                      <span className="font-medium text-sm">November 15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Time:</span>
                      <span className="font-medium text-sm">
                        {selectedTimeSlot ? format(new Date(availableTimeSlots.find(s => s.slot_id === selectedTimeSlot)?.start_time || new Date()), "h:mm a") : "Not selected"}
                      </span>
                    </div>
                  </div>
                  
                  {!selectedTimeSlot && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mb-4 text-center">
                      Please select a time slot above
                    </div>
                  )}
                  
                  <button 
                    onClick={handleContinue}
                    disabled={!selectedTimeSlot}
                    className={`w-full py-3 rounded-md font-medium text-center ${
                      selectedTimeSlot 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Extras & Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        {/* Extra Services Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center bg-purple-50 border-b border-purple-100 p-4">
              <h3 className="text-lg font-semibold text-purple-800">Add Extra Services</h3>
              <button 
                onClick={() => setShowPopup(false)}
                className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 transition-colors"
                aria-label="Close popup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <p className="text-gray-800 font-medium mb-1">Almost Done!</p>
                  <p className="text-sm text-gray-600">
                    Would you like to add any extra services to your booking? This is optional.
                  </p>
                </div>
              </div>
              
              {selectedExtraServices.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    {selectedExtraServices.length} extra service{selectedExtraServices.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-green-700">
                    Total additional: {selectedExtraServices.reduce((sum, service) => sum + service.price, 0).toLocaleString()} LKR
                  </p>
                </div>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto p-4 space-y-3">
              <p className="font-medium text-gray-700 mb-2">Available Extra Services:</p>
              
              {extraServices.map((service) => {
                // Check if this service is already selected
                const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);
                
                return (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border ${
                      isAlreadySelected 
                        ? "bg-green-50 border-green-200" 
                        : "bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer"
                    } transition-colors`}
                    onClick={() => !isAlreadySelected && handleSelectExtraService(service)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          <p className="text-sm text-gray-600 mr-3">{service.duration} mins</p>
                          <p className="text-sm font-semibold text-purple-700">
                            LKR {service.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isAlreadySelected ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col space-y-3">
                <button 
                  className="w-full bg-purple-600 text-white py-3 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
                  onClick={navigateToConfirm}
                >
                  {selectedExtraServices.length > 0 
                    ? "Continue with Selected Extra Services" 
                    : "Skip Extra Services"
                  }
                </button>
                <button 
                  className="text-gray-600 text-sm hover:underline"
                  onClick={() => setShowPopup(false)}
                >
                  Go back to time selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
