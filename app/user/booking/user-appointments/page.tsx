"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ManageAppointmentPopup } from "@/components/user-appointments/manage-appointments";
import { RescheduleAppointmentPopup } from "@/components/user-appointments/reschedule-appointments";
import LeftColumn from "@/components/user-appointments/left-column";
import RightColumn from "@/components/user-appointments/right-column";
import { 
  Service, 
  Appointment, 
  PastAppointment, 
  PaymentMethod,
  isAppointmentPast,
  removeDuplicatePastAppointments,
  getStatusStyle,
  generateTimeSlots
} from "@/components/user-appointments/appointment-utils";
import { 
  formatDate, 
  formatTime, 
  getStatusColor, 
  getStatusText 
} from "@/components/user-appointments/form-utils";
import { useAppointmentDataManager } from "@/components/user-appointments/appointment-datamanager";

const AppointmentSummary = () => {
  const [activePopup, setActivePopup] = useState<"manage" | "reschedule" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [services, setServices] = useState<Service[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [latestAppointment, setLatestAppointment] = useState<Appointment | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
  const [userName, setUserName] = useState("User");
  const [selectedTime, setSelectedTime] = useState("");
  const [pastAppointments, setPastAppointments] = useState<PastAppointment[]>([]);
  const [selectedAppointmentForAction, setSelectedAppointmentForAction] = useState<Appointment | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VENUE);
  const [bookingNotes, setBookingNotes] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { moveAppointmentToPast, checkAndMovePastAppointments, loadBookingData } = useAppointmentDataManager();

  // Add this function to handle appointment selection
  const handleSelectAppointment = (appointment: Appointment) => {
    setLatestAppointment(appointment);
  };

  // Add refresh function to reload appointments
  const handleRefreshAppointments = async () => {
    try {
      const [upcomingApps, pastApps] = await Promise.all([
        fetchUpcomingAppointments(),
        fetchPastAppointments()
      ]);
      
      console.log('Refreshed appointments:', { upcoming: upcomingApps, past: pastApps });
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    }
  };

  // Fetch upcoming appointments from database
  const fetchUpcomingAppointments = async () => {
    try {
      console.log('Fetching upcoming appointments...');
      const response = await fetch('/api/user/upcoming-appointments');
      console.log('Upcoming appointments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched upcoming appointments:', data);
        
        // Transform API response to match the expected format
        const transformedAppointments: Appointment[] = data.upcomingAppointments.map((appointment: any) => ({
          ...appointment,
          date: new Date(appointment.date)
        }));
        
        setUpcomingAppointments(transformedAppointments);
        
        // Set the latest appointment (first one after sorting)
        if (transformedAppointments.length > 0) {
          setLatestAppointment(transformedAppointments[0]);
        }
        
        return transformedAppointments;
      } else if (response.status === 401) {
        console.log('User not authenticated');
        // Handle authentication error - redirect to sign in or show message
        setError("Please sign in to view your appointments");
        return [];
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch upcoming appointments:', response.status, errorData);
        return [];
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  };

  // Fetch real past appointments from database
  const fetchPastAppointments = async () => {
    try {
      console.log('Fetching past appointments...');
      const response = await fetch('/api/user/past-appointments');
      console.log('Past appointments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched past appointments:', data);
        
        // Transform API response to match the expected format
        const transformedAppointments: PastAppointment[] = data.pastAppointments.map((appointment: any) => ({
          id: appointment.appointmentId,
          appointmentId: appointment.appointmentId,
          serviceId: appointment.serviceId,
          salonId: appointment.salonId,
          name: appointment.name,
          salonName: appointment.salonName,
          price: appointment.price,
          date: appointment.date,
          image: appointment.image,
          status: appointment.status,
          time: appointment.time,
          currentRating: appointment.currentRating
        }));
        
        setPastAppointments(transformedAppointments);
        return transformedAppointments;
      } else if (response.status === 401) {
        console.log('User not authenticated');
        setError("Please sign in to view your appointments");
        return [];
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch past appointments:', response.status, errorData);
        return [];
      }
    } catch (error) {
      console.error('Error fetching past appointments:', error);
      return [];
    }
  };

  // Load data from storage when component mounts
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both upcoming and past appointments from API
        const [upcomingApps, pastApps] = await Promise.all([
          fetchUpcomingAppointments(),
          fetchPastAppointments()
        ]);

        // Load booking data from sessionStorage
        loadBookingData(
          setSelectedServices,
          setServices,
          setSelectedSalon,
          setSelectedProfessional,
          setSelectedDate,
          setSelectedTime,
          setPaymentMethod,
          setBookingNotes
        );

        // Check for new booking data from sessionStorage (new appointment)
        const bookingDataStr = sessionStorage.getItem("finalBookingData");
        
        if (bookingDataStr) {
          const bookingData = JSON.parse(bookingDataStr);
          
          // Set services
          if (bookingData.services) {
            setServices(bookingData.services);
          }
          
          // Set salon
          if (bookingData.salon) {
            setSelectedSalon(bookingData.salon);
          }
          
          // Set date and time
          if (bookingData.date) {
            const appointmentDate = new Date(bookingData.date);
            setSelectedDate(appointmentDate);
          }
          
          if (bookingData.time) {
            setSelectedTime(bookingData.time);
          }
          
          // Calculate total price
          const totalPrice = bookingData.services.reduce(
            (sum: number, service: Service) => sum + service.price, 
            0
          );
          
          // Create new appointment
          if (bookingData.salon && bookingData.date) {
            const appointmentDate = new Date(bookingData.date);
            const appointmentTime = bookingData.time || bookingData.services[0]?.selectedTime;
            
            const newAppointment: Appointment = {
              id: Date.now().toString(),
              salon: bookingData.salon.name,
              salonId: bookingData.salon.id || bookingData.salon._id,
              date: appointmentDate,
              price: totalPrice,
              image: bookingData.salon.image,
              services: bookingData.services,
              status: "Confirmed",
              appointmentTime: appointmentTime || "",
              professional: bookingData.professional,
              paymentMethod: bookingData.paymentMethod,
              note: bookingData.note
            };
            
            // Check if appointment time has passed
            if (appointmentTime && isAppointmentPast(appointmentDate, appointmentTime)) {
              // Move to past appointments automatically
              moveAppointmentToPast(
                newAppointment, 
                'completed', 
                pastApps,
                setPastAppointments,
                upcomingApps,
                setUpcomingAppointments,
                latestAppointment,
                setLatestAppointment
              );
            } else {
              // Add to upcoming appointments
              const updatedUpcomingApps = [...upcomingApps, newAppointment];
              setUpcomingAppointments(updatedUpcomingApps);
              
              // Set this as the latest appointment immediately
              setLatestAppointment(newAppointment);
              
              // Save to localStorage as backup
              localStorage.setItem("upcomingAppointments", JSON.stringify(updatedUpcomingApps));
            }
            
            // Clear booking data from sessionStorage as it's now processed
            sessionStorage.removeItem("finalBookingData");
          }
        }
        
        // Get user info if available
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          if (userInfo.name) {
            setUserName(userInfo.name);
          }
        }
      } catch (error) {
        console.error("Error loading appointment data:", error);
        setError("Failed to load appointments. Please try refreshing the page.");
        
        // Fallback to localStorage for upcoming appointments
        const savedUpcomingAppointments = localStorage.getItem("upcomingAppointments");
        if (savedUpcomingAppointments) {
          try {
            const parsed = JSON.parse(savedUpcomingAppointments);
            const upcomingApps = parsed.map((app: any) => ({
              ...app,
              date: new Date(app.date)
            }));
            setUpcomingAppointments(upcomingApps);
            console.log('Loaded upcoming appointments from localStorage:', upcomingApps);
            
            if (upcomingApps.length > 0) {
              setLatestAppointment(upcomingApps[0]);
            }
          } catch (parseError) {
            console.error('Error parsing localStorage appointments:', parseError);
          }
        }
        
        // Fallback to localStorage for past appointments
        const savedPastAppointments = localStorage.getItem("pastAppointments");
        if (savedPastAppointments) {
          try {
            const pastApps = JSON.parse(savedPastAppointments);
            const uniquePastApps = removeDuplicatePastAppointments(pastApps);
            setPastAppointments(uniquePastApps);
          } catch (parseError) {
            console.error('Error parsing localStorage past appointments:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Rest of your component with event handlers and rendering logic...
  // [Rest of the component remains the same]

  // Handler for rescheduling an appointment
  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointmentForAction(appointment);
    setActivePopup("reschedule");
  };

  // Handler for canceling an appointment
  const handleCancelAppointment = (appointment: Appointment) => {
    // Update the appointment status to "Canceled" instead of removing it
    const updatedAppointments = upcomingAppointments.map(app => 
      app.id === appointment.id 
        ? { ...app, status: "Canceled" as const }
        : app
    );
    setUpcomingAppointments(updatedAppointments);
    
    // If the canceled appointment is the currently selected one, clear it from right column
    if (latestAppointment && latestAppointment.id === appointment.id) {
      setLatestAppointment(null);
    }
    
    // Update localStorage
    localStorage.setItem("upcomingAppointments", JSON.stringify(updatedAppointments));
    setActivePopup(null);
    setSelectedAppointmentForAction(null);
  };

  // Handler for selecting a time (used in RescheduleAppointmentPopup)
  const handleSelectTime = (serviceId: string, time: string) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === serviceId 
          ? { ...service, selectedTime: time }
          : service
      )
    );
  };

  // Handler for confirming reschedule
  const handleConfirmReschedule = (updatedAppointment: Appointment) => {
    // Replace the appointment in upcomingAppointments with the updated one
    const updatedAppointments = upcomingAppointments.map(app =>
      app.id === updatedAppointment.id ? updatedAppointment : app
    );
    setUpcomingAppointments(updatedAppointments);
    
    // Update the latest appointment if it's the one being rescheduled
    if (latestAppointment && latestAppointment.id === updatedAppointment.id) {
      setLatestAppointment(updatedAppointment);
    }
    
    localStorage.setItem("upcomingAppointments", JSON.stringify(updatedAppointments));
    setActivePopup(null);
    setSelectedAppointmentForAction(null);
  };

  return (
    <div className="p-7 pl-24 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold mb-6">Welcome, {userName}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Upcoming and Past Appointments */}
         <LeftColumn
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
          latestAppointment={latestAppointment}
          onSelectAppointment={handleSelectAppointment}
          onRefreshAppointments={handleRefreshAppointments}
        />

        {/* Right Column - Appointment Details */}
         <RightColumn
          latestAppointment={latestAppointment}
          onManageAppointment={(appointment) => {
            setSelectedAppointmentForAction(appointment);
            setActivePopup("manage");
          }}
        />
      </div>

      {/* Manage Appointment Popup */}
      {activePopup === "manage" && selectedAppointmentForAction && (
        <ManageAppointmentPopup
          appointment={selectedAppointmentForAction}
          onClose={() => setActivePopup(null)}
          onReschedule={handleRescheduleAppointment}
          onCancel={handleCancelAppointment}
        />
      )}

      {/* Reschedule Popup */}
      {activePopup === "reschedule" && selectedAppointmentForAction && (
        <RescheduleAppointmentPopup
          appointment={selectedAppointmentForAction}
          services={selectedAppointmentForAction.services || []}
          onClose={() => setActivePopup(null)}
          onConfirm={(newDate: Date, newTimes: { [serviceId: string]: string }) => {
            // Create updated appointment with new date and times
            const updatedAppointment: Appointment = {
              ...selectedAppointmentForAction,
              date: newDate,
              appointmentTime: Object.values(newTimes)[0] || selectedAppointmentForAction.appointmentTime,
              services: selectedAppointmentForAction.services.map(service => ({
                ...service,
                selectedTime: newTimes[service.id] || service.selectedTime
              }))
            };
            handleConfirmReschedule(updatedAppointment);
          }}
          onSelectTime={handleSelectTime}
        />
      )}
    </div>
  );
};

export default AppointmentSummary;