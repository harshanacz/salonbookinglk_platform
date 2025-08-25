import { formatDate } from '@/components/user-appointments/form-utils';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  selectedTime?: string;
  professional?: string;
  timeSlot?: string;
}

export interface Appointment {
  id: string;
  salon: string;
  salonId?: string; // Add salon ID for rating functionality
  date: Date;
  price: number;
  image: string;
  services: Service[];
  status: "Confirmed" | "Canceled" | "Rescheduled";
  appointmentTime: string;
  professional?: string;
  paymentMethod?: string;
  note?: string;
}

export interface PastAppointment {
  id: string;
  appointmentId: string;
  serviceId: string;
  salonId: string;
  name: string;
  salonName?: string;
  price: number;
  date: string;
  image: string;
  status?: 'completed' | 'canceled';
  time?: string;
  currentRating?: {
    ratingId: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
}

export enum PaymentMethod {
  VENUE = "venue",
  CARD_PAYMENT = "card"
}

// Utility functions related to appointments
export const isAppointmentPast = (appointmentDate: Date, appointmentTime: string) => {
  const now = new Date();
  
  // Parse appointment time (format: "HH:MM AM/PM" or "HH:MM")
  let hours, minutes;
  
  if (appointmentTime.includes('AM') || appointmentTime.includes('PM')) {
    // Handle 12-hour format
    const [time, period] = appointmentTime.split(' ');
    [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    // Handle 24-hour format
    [hours, minutes] = appointmentTime.split(':').map(Number);
  }
  
  // Create appointment datetime
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  // Debug logging
  console.log('Current time:', now.toLocaleString());
  console.log('Appointment time:', appointmentDateTime.toLocaleString());
  console.log('Is past:', appointmentDateTime < now);
  
  // Only return true if appointment time is in the past
  return appointmentDateTime < now;
};

// Function to remove duplicates from past appointments
export const removeDuplicatePastAppointments = (appointments: PastAppointment[]) => {
  const seen = new Set();
  const unique = appointments.filter(appointment => {
    const key = `${appointment.name}-${appointment.price}-${appointment.date}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  return unique;
};

// Time slots for services
export const generateTimeSlots = () => {
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

export const getStatusStyle = (status: string) => {
  switch (status) {
    case "Confirmed": return "bg-purple-100 text-purple-500";
    case "Canceled": return "bg-red-100 text-red-500";
    case "Rescheduled": return "bg-blue-100 text-blue-500";
    default: return "bg-purple-100 text-purple-500";
  }
};