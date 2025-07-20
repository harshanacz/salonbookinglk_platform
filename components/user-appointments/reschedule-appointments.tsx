import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  date: Date;
  appointmentTime: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  duration: string;
  selectedTime?: string;
}

interface RescheduleAppointmentPopupProps {
  appointment: Appointment;
  services: Service[];
  onClose: () => void;
  onConfirm: (newDate: Date, newTimes: { [serviceId: string]: string }) => void;
  onSelectTime: (serviceId: string, time: string) => void;
}

export const RescheduleAppointmentPopup: React.FC<RescheduleAppointmentPopupProps> = ({
  appointment,
  services,
  onClose,
  onConfirm,
  onSelectTime
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTimes, setSelectedTimes] = useState<{ [serviceId: string]: string }>({});

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDateObj = new Date(currentYear, currentMonth, day);
      
      // Prevent selecting past dates
      if (selectedDateObj >= today) {
        setSelectedDate(selectedDateObj);
        // Clear selected times when date changes
        setSelectedTimes({});
      }
    }
  };

  const handleSelectTime = (serviceId: string, time: string) => {
    setSelectedTimes(prev => ({
      ...prev,
      [serviceId]: time
    }));
    onSelectTime(serviceId, time);
  };

  const handleConfirmReschedule = () => {
    if (selectedDate && Object.keys(selectedTimes).length === appointment.services.length) {
      onConfirm(selectedDate, selectedTimes);
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
    if (!time || time.length < 5) return "";
    
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
    return `${displayHour}:${minutes} ${period}`;
  };

  const isDateSelectable = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return dateToCheck >= today;
  };

  const allTimesSelected = appointment.services.every(service => selectedTimes[service.id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reschedule Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Current Appointment</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><span className="font-medium">Date:</span> {formatDate(appointment.date)}</p>
            <p><span className="font-medium">Time:</span> {formatTime(appointment.appointmentTime)}</p>
            <p><span className="font-medium">Services:</span> {appointment.services.map(s => s.name).join(", ")}</p>
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
                  disabled={!day || !isDateSelectable(day)}
                  onClick={() => day && handleSelectDate(day)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
                    ${!day ? "invisible" : ""}
                    ${!day || (day && !isDateSelectable(day)) ? "text-gray-300 cursor-not-allowed" : ""}
                    ${selectedDate && selectedDate.getDate() === day 
                      ? "bg-purple-600 text-white" 
                      : day && isDateSelectable(day) ? "hover:bg-gray-100" : ""}`}
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
            {appointment.services.map((service) => (
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
                        ${selectedTimes[service.id] === slot.time 
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
            onClick={onClose}
            className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReschedule}
            className={`px-4 py-2 rounded-lg ${selectedDate && allTimesSelected
              ? "bg-purple-600 text-white hover:bg-purple-700" 
              : "bg-purple-300 text-white cursor-not-allowed"}`}
            disabled={!selectedDate || !allTimesSelected}
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
  );
};
