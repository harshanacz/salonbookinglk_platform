"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  selectedTime?: string;
  professional?: string;
  timeSlot?: string;
}

interface Salon {
  id?: string;
  name: string;
  rating?: number;
  image: string;
  closingTime?: string;
  isOpen?: boolean;
  address?: string;
  mapLink?: string;
}

interface ApiAppointment {
  id: string;
  date: string;
  time: number;
  status: string;
  service: Service;
  salon: Salon;
  note?: string;
  paymentMethod?: string;
}

interface Appointment {
  salon: string;
  date: Date;
  price: number;
  image: string;
  services: Service[];
}

const AppointmentSummary = () => {
  const [activePopup, setActivePopup] = useState<"manage" | "reschedule" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [services, setServices] = useState<Service[]>([]);
  const [hasUpcomingAppointment, setHasUpcomingAppointment] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ApiAppointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<ApiAppointment[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [userName, setUserName] = useState("User");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { moveAppointmentToPast, checkAndMovePastAppointments, loadBookingData } = useAppointmentDataManager();

  // Load real appointment data from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/appointments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data = await response.json();
        
        setUpcomingAppointments(data.upcoming || []);
        setPastAppointments(data.past || []);
        setHasUpcomingAppointment(data.upcoming && data.upcoming.length > 0);
        setUserName(data.user?.name || "User");
        
        // Set up data for the first upcoming appointment if exists
        if (data.upcoming && data.upcoming.length > 0) {
          const firstAppointment = data.upcoming[0];
          setServices([firstAppointment.service]);
          setSelectedSalon(firstAppointment.salon);
          setSelectedDate(new Date(firstAppointment.date));
          
          // Convert time (minutes from midnight) to HH:MM format
          const hours = Math.floor(firstAppointment.time / 60);
          const minutes = firstAppointment.time % 60;
          setSelectedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        }
        
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Calendar generation logic
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
    
    setAppointmentStatus("Rescheduled");
    setActivePopup(null);
    
    // Update the upcoming appointment with new date and services with updated times
    if (upcomingAppointments.length > 0) {
      // Update the first upcoming appointment
      const updatedAppointments = [...upcomingAppointments];
      updatedAppointments[0] = {
        ...updatedAppointments[0],
        date: selectedDate.toISOString(),
      };
      setUpcomingAppointments(updatedAppointments);
    }
  };

  const handleCancelAppointment = () => {
    setAppointmentStatus("Canceled");
    setActivePopup(null);
    
    // Move the canceled appointment to past appointments
    if (upcomingAppointments.length > 0) {
      const canceledAppointment = upcomingAppointments[0];
      
      // Add to past appointments
      setPastAppointments(prev => [canceledAppointment, ...prev]);
      
      // Remove from upcoming appointments
      setUpcomingAppointments(prev => prev.slice(1));
      setHasUpcomingAppointment(upcomingAppointments.length > 1);
    }
  };

  const getStatusStyle = () => {
    switch (appointmentStatus) {
      case "Confirmed": return "bg-purple-100 text-purple-500";
      case "Canceled": return "bg-red-100 text-red-500";
      case "Rescheduled": return "bg-blue-100 text-blue-500";
      default: return "bg-purple-100 text-purple-500";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string | number) => {
    let timeStr: string;
    
    if (typeof time === 'number') {
      // Convert minutes from midnight to HH:MM format
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      timeStr = time;
    }
    
    if (!timeStr || timeStr.length < 5) return "";
    
    const [hours, minutes] = timeStr.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
    return `${displayHour}:${minutes} ${period}`;

  };

  return (
    <div className="p-7 pl-24 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto scrollbar-hide">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading appointments...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Welcome, {userName}</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Upcoming and Past Appointments */}
            <div>
              <div className="bg-white p-4 rounded-lg shadow-md w-full">
                <h2 className="font-semibold text-lg mb-2">Upcoming</h2>
                {hasUpcomingAppointment && upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-4">
                        <Image
                          src={appointment.service.image}
                          alt={appointment.service.name}
                          width={80}
                          height={60}
                          className="rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{appointment.salon.name}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(new Date(appointment.date))} at {formatTime(selectedTime)}
                          </p>
                          <p className="font-bold">
                            LKR {appointment.service.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming appointments</p>
                )}
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                <h2 className="font-semibold text-lg mb-2">Past appointments</h2>
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 border-b py-2 last:border-0">
                      <Image
                        src={appointment.service.image}
                        alt={appointment.service.name}
                        width={50}
                        height={50}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{appointment.service.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(new Date(appointment.date))}</p>
                        <p className="font-bold">LKR {appointment.service.price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-start">
                        <button className="text-black underline m-4 border-2 rounded-lg border-black p-2">
                          Review
                        </button>
                        <Link href="/user/add-complaint" className="text-black underline">
                          Complain
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No past appointments</p>
                )}
              </div>
            </div>

            {/* Right Column - Appointment Details */}
            <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
              {hasUpcomingAppointment && upcomingAppointments.length > 0 && selectedSalon ? (
                <>
                  <div className="w-full mt-3">
                    <Image
                      src={selectedSalon.image}
                      alt={selectedSalon.name}
                      width={800}
                      height={300}
                      className="rounded-lg"
                      style={{ objectFit: "cover", height: "300px" }}
                    />
                  </div>
                  
                  <h2 className={`inline-block ${getStatusStyle()} px-3 py-1 rounded-full text-sm font-bold mt-4`}>
                    {appointmentStatus}
                  </h2>
                  
                  <p className="text-gray-600">
                    {selectedDate 
                      ? formatDate(selectedDate)
                      : formatDate(new Date(upcomingAppointments[0].date))} at {formatTime(selectedTime)}
                  </p>

                  <div className="mt-4 space-y-2">
                    <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
                      📅 Add to Calendar
                    </button>
                    <button
                      className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100"
                      onClick={() => setActivePopup("manage")}
                    >
                      📂 Manage Appointments
                    </button>
                    <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
                      📍 Venue Details
                    </button>
                  </div>

                  <h2 className="font-semibold text-lg mt-6">Overview</h2>
                  <div className="mt-2">
                    {services.map((service, index) => (
                      <div key={index} className="flex justify-between border-b py-2 last:border-0">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-gray-500 text-sm">{service.duration}</p>
                        </div>
                        <p className="font-bold">LKR {service.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>LKR {services.reduce((sum, service) => sum + service.price, 0).toLocaleString()}</span>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-red-500">Cancellation policy</h3>
                    <p className="text-sm text-gray-600">
                      Please avoid canceling within <strong>12 hours</strong> of your appointment time.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">No Upcoming Appointment</h2>
                    <p className="text-gray-600 mb-6">You don't have any active appointments at the moment.</p>
                    <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                      Book a New Appointment
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
      {activePopup === "reschedule" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reschedule Appointment</h2>
              <button onClick={() => setActivePopup(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Current Appointment</h3>
              <div className="bg-gray-50 p-3 rounded">
                {upcomingAppointments.length > 0 && (
                  <>
                    <p><span className="font-medium">Date:</span> {formatDate(new Date(upcomingAppointments[0].date))}</p>
                    <p><span className="font-medium">Time:</span> {selectedTime 
                      ? formatTime(selectedTime) 
                      : formatTime(upcomingAppointments[0].time.toString())}</p>
                    <p><span className="font-medium">Services:</span> {services.map(s => s.name).join(", ")}</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Calendar */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Select New Date</h3>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="font-medium">
                    {months[currentMonth]} {currentYear}
                  </div>
                  <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div key={index} className="text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {weeks.flat().map((day, index) => (
                    <button
                      key={index}
                      disabled={!day}
                      onClick={() => day && handleSelectDate(day)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
                        ${!day ? "invisible" : ""}
                        ${selectedDate && selectedDate.getDate() === day 
                          ? "bg-purple-600 text-white" 
                          : "hover:bg-gray-100"}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Time Slots for each service */}
            {selectedDate && (
              <div className="space-y-6">
                {services.map((service) => (
                  <div key={service.id} className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Select Time for {service.name} ({service.duration})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot, index) => (
                        <button
                          key={index}
                          disabled={slot.status === "unavailable"}
                          onClick={() => handleSelectTime(service.id, slot.time)}
                          className={`p-2 border rounded-lg text-center
                            ${slot.status === "unavailable" 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "hover:bg-gray-50"}
                            ${service.selectedTime === slot.time 
                              ? "border-purple-600 border-2 bg-purple-50" 
                              : ""}`}
                        >
                          {formatTime(slot.time)}
                          {slot.status === "unavailable" && (
                            <span className="block text-xs text-gray-400">Unavailable</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setActivePopup(null)}
                className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className={`px-4 py-2 rounded-lg ${selectedDate && services.every(s => s.selectedTime)
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "bg-purple-300 text-white cursor-not-allowed"}`}
                disabled={!selectedDate || !services.every(s => s.selectedTime)}
              >
                Confirm Reschedule
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Rescheduling Policy:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Reschedule at least 24 hours before your appointment</li>
                <li>You can reschedule up to 2 times per booking</li>
                <li>No additional fee for rescheduling when done in advance</li>
              </ul>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default AppointmentSummary;