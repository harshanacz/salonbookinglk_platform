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
  
  const router = useRouter();
  const { moveAppointmentToPast, checkAndMovePastAppointments, loadBookingData } = useAppointmentDataManager();

  // Add this function to handle appointment selection
  const handleSelectAppointment = (appointment: Appointment) => {
    setLatestAppointment(appointment);
  };

  // Fetch real past appointments from database
  const fetchPastAppointments = async () => {
    try {
      const response = await fetch('/api/user/past-appointments');
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
      } else {
        console.error('Failed to fetch past appointments');
        // Fallback to localStorage as backup
        const savedPastAppointments = localStorage.getItem("pastAppointments");
        if (savedPastAppointments) {
          const pastApps = JSON.parse(savedPastAppointments);
          const uniquePastApps = removeDuplicatePastAppointments(pastApps);
          setPastAppointments(uniquePastApps);
        }
      }
    } catch (error) {
      console.error('Error fetching past appointments:', error);
      // Fallback to localStorage as backup
      const savedPastAppointments = localStorage.getItem("pastAppointments");
      if (savedPastAppointments) {
        const pastApps = JSON.parse(savedPastAppointments);
        const uniquePastApps = removeDuplicatePastAppointments(pastApps);
        setPastAppointments(uniquePastApps);
      }
    }
  };

  // Load data from storage when component mounts
  useEffect(() => {
    try {
      // Fetch real past appointments from API
      fetchPastAppointments();

      // Load upcoming appointments from localStorage
      const savedUpcomingAppointments = localStorage.getItem("upcomingAppointments");
      let upcomingApps: Appointment[] = [];
      
      if (savedUpcomingAppointments) {
        try {
          const parsed = JSON.parse(savedUpcomingAppointments);
          upcomingApps = parsed.map((app: any) => ({
            ...app,
            date: new Date(app.date)
          }));
          console.log('Loaded upcoming appointments:', upcomingApps);
        } catch (error) {
          console.error('Error parsing upcoming appointments:', error);
        }
      }

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

      // Get final booking data (new appointment)
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
            salonId: bookingData.salon.id || bookingData.salon._id, // Include salon ID
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
          
          // Check if appointment time has passed exactly
          if (appointmentTime && isAppointmentPast(appointmentDate, appointmentTime)) {
            // Move to past appointments automatically
            moveAppointmentToPast(
              newAppointment, 
              'completed', 
              pastAppointments,
              setPastAppointments,
              upcomingAppointments,
              setUpcomingAppointments,
              latestAppointment,
              setLatestAppointment
            );
          } else {
            // Add to upcoming appointments
            const updatedUpcomingApps = [...upcomingApps, newAppointment];
            upcomingApps = updatedUpcomingApps;
            setUpcomingAppointments(updatedUpcomingApps);
            
            // IMPORTANT: Set this as the latest appointment immediately
            setLatestAppointment(newAppointment);
            
            // Save to localStorage
            localStorage.setItem("upcomingAppointments", JSON.stringify(updatedUpcomingApps));
          }
          
          // Clear booking data from sessionStorage as it's now processed
          sessionStorage.removeItem("finalBookingData");
        }
      }

      // Set upcoming appointments first
      setUpcomingAppointments(upcomingApps);
      
      // Then immediately check for past appointments
      setTimeout(() => {
        checkAndMovePastAppointments(
          upcomingApps,
          pastAppointments,
          setPastAppointments,
          setUpcomingAppointments,
          latestAppointment,
          setLatestAppointment
        );
      }, 100);
      
      // Get user info if available
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo.name) {
          setUserName(userInfo.name);
        }
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
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
    // Example: Remove the appointment from upcomingAppointments
    const updatedAppointments = upcomingAppointments.filter(app => app.id !== appointment.id);
    setUpcomingAppointments(updatedAppointments);
    // Optionally, update localStorage
    localStorage.setItem("upcomingAppointments", JSON.stringify(updatedAppointments));
    setActivePopup(null);
  };

  // Handler for confirming reschedule
  const handleConfirmReschedule = (updatedAppointment: Appointment) => {
    // Replace the appointment in upcomingAppointments with the updated one
    const updatedAppointments = upcomingAppointments.map(app =>
      app.id === updatedAppointment.id ? updatedAppointment : app
    );
    setUpcomingAppointments(updatedAppointments);
    localStorage.setItem("upcomingAppointments", JSON.stringify(updatedAppointments));
    setActivePopup(null);
    setSelectedAppointmentForAction(null);
  };

  // Handler for selecting a time (used in RescheduleAppointmentPopup)
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
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
          services={services}
          onClose={() => setActivePopup(null)}
          onConfirm={() => {
            // You may want to update the appointment here, e.g.:
            // handleConfirmReschedule(selectedAppointmentForAction);
            setActivePopup(null);
            setSelectedAppointmentForAction(null);
          }}
          onSelectTime={handleSelectTime}
        />
      )}
    </div>
  );
};

export default AppointmentSummary;