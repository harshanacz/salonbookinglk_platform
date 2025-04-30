"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  selectedTime?: string;
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
  const [appointmentStatus, setAppointmentStatus] = useState<"Confirmed" | "Canceled" | "Rescheduled">("Confirmed");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Layer Hair Cut", price: 3000, duration: "45 min", selectedTime: "14:15" },
    { id: "2", name: "Hair Styling", price: 2000, duration: "30 min", selectedTime: "15:00" }
  ]);
  const router = useRouter();

  const userName = "Naduni";
  const selectedSalon = {
    name: "Salon Dmesh",
    image: "/Dmesh.jpg"
  };

  // New state to track if there's an upcoming appointment 
  const [hasUpcomingAppointment, setHasUpcomingAppointment] = useState(true);
  
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment>({
    salon: "Salon Dmesh",
    date: new Date(),
    price: services.reduce((sum, service) => sum + service.price, 0),
    image: "/Dmesh.jpg",
    services: services
  });

  const [pastAppointments, setPastAppointments] = useState([
    {
      id: 1,
      name: "Layer Hair Cut",
      price: 7000,
      date: "Wednesday 13 December",
      image: "/haircut.jpg",
    },
    {
      id: 2,
      name: "Nail Polish",
      price: 7000,
      date: "Wednesday 09 December",
      image: "/nailpolish.jpg",
    }
  ]);

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
  }
  if (week.length > 0) {
    weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Time slots for services
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Randomly mark some slots as unavailable
        const status = Math.random() > 0.3 ? "available" : "unavailable";
        slots.push({ time, status });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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

  const handleSelectDate = (day: number | null) => {
    if (day) {
      const date = new Date(currentYear, currentMonth, day);
      setSelectedDate(date);
    }
  };

  const handleSelectTime = (serviceId: string, time: string) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === serviceId ? { ...service, selectedTime: time } : service
      )
    );
  };

  const handleRescheduleAppointment = () => {
    if (appointmentStatus === "Canceled") {
      alert("Cannot reschedule a canceled appointment");
      return;
    }
    setActivePopup("reschedule");
  };

  const handleConfirmReschedule = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    
    const allServicesHaveTime = services.every(service => service.selectedTime);
    if (!allServicesHaveTime) {
      alert("Please select time slots for all services");
      return;
    }
    
    setAppointmentStatus("Rescheduled");
    setActivePopup(null);
    
    // Update the upcoming appointment with new date and services with updated times
    setUpcomingAppointment(prev => ({
      ...prev,
      date: selectedDate,
      services: [...services]
    }));
  };

  const handleCancelAppointment = () => {
    setAppointmentStatus("Canceled");
    setActivePopup(null);
    
    // Move the canceled appointment to past appointments
    const canceledAppointment = {
      id: pastAppointments.length + 1,
      name: upcomingAppointment.services.map(s => s.name).join(", "),
      price: upcomingAppointment.price,
      date: formatDate(upcomingAppointment.date),
      image: upcomingAppointment.image,
    };
    
    setPastAppointments(prev => [canceledAppointment, ...prev]);
    
    // Remove from upcoming appointments
    setHasUpcomingAppointment(false);
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="p-7 pl-24 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold mb-6">Welcome, {userName}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Upcoming and Past Appointments */}
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md w-full">
            <h2 className="font-semibold text-lg mb-2">Upcoming</h2>
            {hasUpcomingAppointment && appointmentStatus !== "Canceled" ? (
              <div className="flex items-center gap-4">
                <Image
                  src={upcomingAppointment.image}
                  alt={upcomingAppointment.salon}
                  width={80}
                  height={60}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{upcomingAppointment.salon}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(upcomingAppointment.date)} at {upcomingAppointment.services[0].selectedTime 
                      ? formatTime(upcomingAppointment.services[0].selectedTime) 
                      : ""}
                  </p>
                  <p className="font-bold">
                    LKR {upcomingAppointment.price.toLocaleString()}
                  </p>
                </div>
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
                    src={appointment.image}
                    alt={appointment.name}
                    width={50}
                    height={50}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{appointment.name}</h3>
                    <p className="text-sm text-gray-500">{appointment.date}</p>
                    <p className="font-bold">LKR {appointment.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-start">
                    <button className="text-black underline m-4 border-2 rounded-lg border-black p-2">
                      Review
                    </button>
                    <Link href="/book" className="text-black underline">
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
          {hasUpcomingAppointment && appointmentStatus !== "Canceled" ? (
            <>
              <div className="w-full mt-3">
                <Image
                  src={selectedSalon.image}
                  alt={selectedSalon.name}
                  width={800}
                  height={300}
                  className="rounded-lg"
                  style={{ objectFit: "cover", height: "500px" }}
                />
              </div>
              
              <h2 className={`inline-block ${getStatusStyle()} px-3 py-1 rounded-full text-sm font-bold mt-4`}>
                {appointmentStatus}
              </h2>
              
              <p className="text-gray-600">
                {formatDate(upcomingAppointment.date)} at {upcomingAppointment.services.map(s => 
                  s.selectedTime ? formatTime(s.selectedTime) : "").join(", ")}
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
                {upcomingAppointment.services.map((service, index) => (
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
                <span>LKR {upcomingAppointment.price.toLocaleString()}</span>
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
                <Link href="/book" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Book a New Appointment
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Appointment Popup */}
      {activePopup === "manage" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold">Manage appointment</h2>
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-3 mt-4 border-b pb-2 last:border-0">
                <div className="flex-1">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-gray-500 text-sm">{service.duration}</p>
                </div>
                <p className="font-bold">LKR {service.price.toLocaleString()}</p>
              </div>
            ))}
            <div className="mt-4 space-y-2">
              <button 
                className={`w-full p-3 border rounded-lg ${appointmentStatus === "Canceled" ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100 text-blue-500"}`}
                onClick={handleRescheduleAppointment}
                disabled={appointmentStatus === "Canceled"}
              >
                📅 Reschedule appointment
              </button>
              <button
                className={`w-full p-3 border rounded-lg ${appointmentStatus === "Canceled" ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100 text-red-500"}`}
                onClick={handleCancelAppointment}
                disabled={appointmentStatus === "Canceled"}
              >
                ❌ {appointmentStatus === "Canceled" ? "Appointment Canceled" : "Cancel appointment"}
              </button>
            </div>
            <button
              className="w-full p-3 border rounded-lg bg-purple-500 text-white mt-4"
              onClick={() => setActivePopup(null)}
            >
              Close
            </button>
          </div>
        </div>
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
                <p><span className="font-medium">Date:</span> {formatDate(upcomingAppointment.date)}</p>
                <p><span className="font-medium">Time:</span> {upcomingAppointment.services.map(s => 
                  s.selectedTime ? formatTime(s.selectedTime) : "").join(", ")}</p>
                <p><span className="font-medium">Services:</span> {upcomingAppointment.services.map(s => s.name).join(", ")}</p>
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