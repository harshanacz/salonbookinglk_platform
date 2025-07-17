"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import Image from "next/image";
import BookingNavigation from "@/components/booking/booking-navigation";
import ExtraServicesPopup from "@/components/booking/ExtraServicesPopup";
import ProfessionalSelection from "@/components/booking/ProfessionalSelection";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";

// Define interfaces
interface TimeSlot {
  slot_id: string;
  start_time: Date;
  appointmentId: string | null;
  period: number;
  available: boolean;
}

interface StaffMember {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

interface Service {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  price: number;
  duration: number;
  type: string;
  timeSlot?: string;
  professional?: string;
  salonContextId: string; // Make this always a string
  status: string;
}

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
  _id?: string; // Add salon ID for API calls
  salonContextId?: string; // Add salonContextId for compatibility
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
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedExtraServices, setSelectedExtraServices] = useState<Service[]>([]);
  const [extraServices, setExtraServices] = useState<Service[]>([]);
  const [loadingExtraServices, setLoadingExtraServices] = useState<boolean>(false);

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

  // Fetch extra services when popup opens
  const fetchExtraServices = async () => {
    const salonId = selectedSalon?.salonContextId || params.id;
    
    console.log('Fetching extra services for salon:', salonId);
    
    if (!salonId) {
      console.error("No salon ID available");
      return;
    }

    setLoadingExtraServices(true);
    try {
      const response = await fetch(`/api/services/salon/${salonId}`);
      const data = await response.json();
      
      console.log('Extra services response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load services');
      }
      
      // Filter out the currently selected main service
      const filteredServices = data.services.filter((service: Service) => 
        service.salonContextId === salonId && 
        service.status === "ACTIVE" &&
        !mainServices.some(main => main._id === service._id)
      );
      
      console.log('Filtered extra services:', filteredServices);
      setExtraServices(filteredServices);
      
    } catch (err) {
      console.error("Error fetching extra services:", err);
      setExtraServices([]);
    } finally {
      setLoadingExtraServices(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
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
    setSelectedTimeSlot(null);
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

  // Handle booking continue
  const handleContinue = async () => {
    if (!selectedTimeSlot) {
      alert("Please select a time slot before continuing");
      return;
    }
    
    // Fetch extra services before showing popup
    await fetchExtraServices();
    setShowPopup(true);
  };

  // Navigate to confirmation page
  const navigateToConfirm = () => {
    const slot = availableTimeSlots.find(s => s.slot_id === selectedTimeSlot);
    if (slot) {
      sessionStorage.setItem("bookingServices", JSON.stringify(mainServices));
      sessionStorage.setItem("bookingProfessional", selectedProfessionalName);
      sessionStorage.setItem("bookingDate", format(selectedDate, "yyyy-MM-dd"));
      sessionStorage.setItem("bookingTime", format(new Date(slot.start_time), "h:mm a"));
      
      sessionStorage.setItem("selectedTimeSlot", JSON.stringify({
        id: slot.slot_id,
        slot_id: slot.slot_id,
        start_time: slot.start_time,
        time: format(new Date(slot.start_time), "h:mm a"),
        date: format(selectedDate, "EEEE, MMMM d, yyyy"),
        staffId: selectedStaff,
        period: slot.period || 30,
        timestamp: new Date(slot.start_time).getTime(),
        available: true
      }));

      if (selectedStaff) {
        const staffMember = staffMembers.find(s => s._id === selectedStaff);
        if (staffMember) {
          sessionStorage.setItem("selectedStaffMember", JSON.stringify(staffMember));
        }
      } else {
        sessionStorage.removeItem("selectedStaffMember");
      }

      if (selectedExtraServices.length > 0) {
        const allServices = [...mainServices, ...selectedExtraServices];
        sessionStorage.setItem("bookingServices", JSON.stringify(allServices));
      }

      router.push(`/service/${serviceId}/confirm`);
    }
  };

  // Handle selecting an extra service
  const handleSelectExtraService = (service: Service) => {
    setSelectedExtraServices(prev => [...prev, service]);
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

  // Debugging info
  console.log('Current salonId:', {
    fromParams: params.id,
    fromSelectedSalon: selectedSalon?.salonContextId,
    finalId: selectedSalon?.salonContextId || params.id
  });
  console.log('Salon details:', {
    selectedSalon,
    paramsId: params.id,
    salonIdUsed: selectedSalon?.salonContextId || params.id
  });
  console.log('Debug Salon Info:', {
    selectedSalon,
    salonContextId: selectedSalon?.salonContextId,
    paramsId: params.id,
    mainServices,
    extraServices
  });

  const rawSalonId = selectedSalon?.salonContextId || params.id;
  const currentSalonId = Array.isArray(rawSalonId) ? rawSalonId[0] : rawSalonId as string;

  return (
    <div className="p-4 md:p-8 w-full min-h-screen bg-purple-50 overflow-y-auto pb-24">
      <div className="w-full mx-auto max-w-7xl">
        <BookingNavigation salonId={Number(serviceId)} />

        {/* Progress Indicator */}
        <div className="mb-5 pt-4">
          <div className="flex items-center justify-center max-w-sm mx-auto">
            <div className="text-center mx-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mx-auto">✓</div>
              <span className="text-xs mt-1 block text-green-600">Professional</span>
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

        {/* Main Layout */}
        <div className="flex justify-between gap-8">
          {/* Left Column - Selection Components */}
          <div className="w-[45%] space-y-4">
            {/* Professional Selection Component */}
            <ProfessionalSelection
              staffMembers={staffMembers}
              selectedStaff={selectedStaff}
              selectedProfessionalName={selectedProfessionalName}
              onStaffSelect={handleStaffSelect}
            />

            {/* Calendar Selection */}
            <Card className="p-4 shadow-sm">
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

            {/* Time Slots Selection Component */}
            <TimeSlotSelection
              selectedDate={selectedDate}
              availableTimeSlots={availableTimeSlots}
              selectedTimeSlot={selectedTimeSlot}
              loading={loading}
              onTimeSlotSelect={handleTimeSlotSelect}
            />
          </div>

          {/* Right Column - Booking Summary */}
          <div className="w-[45%] flex flex-col space-y-6">
            <div className="mt-4">
              <Card className="p-4 shadow-sm bg-white">
                <div className="bg-purple-50 -m-4 p-4 mb-4 border-b">
                  <h3 className="font-medium text-lg text-purple-800">Booking Summary</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <Image
                          src={selectedSalon?.image || "/placeholder-logo.svg"}
                          alt="Salon"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Testing Purpose</p>
                        <p className="text-sm text-gray-600">{selectedProfessionalName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-700">LKR 2,200</p>
                      <p className="text-sm text-gray-500">{mainServices[0]?.duration || 30} mins</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium">
                          {selectedTimeSlot ?
                            format(new Date(availableTimeSlots.find(s => s.slot_id === selectedTimeSlot)?.start_time || new Date()), "h:mm a")
                            : "Not selected"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={!selectedTimeSlot}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue to Extras & Confirm
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Services Popup Component */}
      {showPopup && currentSalonId && (
        <ExtraServicesPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onContinue={navigateToConfirm}
          salonId={currentSalonId}
          selectedExtraServices={selectedExtraServices}
          onSelectExtraService={handleSelectExtraService}
        />
      )}
    </div>
  );
}