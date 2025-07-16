import { useState } from 'react';
import { formatDate } from '@/components/user-appointments/form-utils';
import { 
  Appointment, 
  PastAppointment, 
  Service, 
  PaymentMethod, 
  isAppointmentPast,
  removeDuplicatePastAppointments
} from '@/components/user-appointments/appointment-utils';

export const useAppointmentDataManager = () => {
  // Helper function to move appointment to past
  const moveAppointmentToPast = (
    appointment: Appointment, 
    status: 'completed' | 'canceled' = 'completed',
    pastAppointments: PastAppointment[],
    setPastAppointments: React.Dispatch<React.SetStateAction<PastAppointment[]>>,
    upcomingAppointments: Appointment[],
    setUpcomingAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>,
    latestAppointment: Appointment | null,
    setLatestAppointment: React.Dispatch<React.SetStateAction<Appointment | null>>
  ) => {
    // Check if this appointment is already in past appointments to prevent duplicates
    const isAlreadyInPast = pastAppointments.some(pastApp => 
      pastApp.id === parseInt(appointment.id) || 
      (pastApp.name === appointment.services.map(s => s.name).join(", ") && 
       pastApp.price === appointment.price &&
       pastApp.date === formatDate(appointment.date))
    );
    
    if (isAlreadyInPast) {
      console.log(`Appointment ${appointment.id} is already in past appointments, skipping...`);
      return;
    }
    
    const pastAppointment: PastAppointment = {
      id: parseInt(appointment.id), // Use the original appointment ID to prevent duplicates
      name: appointment.services.map(s => s.name).join(", "),
      price: appointment.price,
      date: formatDate(appointment.date),
      image: appointment.image,
      status: status
    };
    
    setPastAppointments(prev => {
      // Double-check for duplicates before adding
      const isDuplicate = prev.some(pastApp => 
        pastApp.id === pastAppointment.id ||
        (pastApp.name === pastAppointment.name && 
         pastApp.price === pastAppointment.price &&
         pastApp.date === pastAppointment.date)
      );
      
      if (isDuplicate) {
        console.log('Duplicate detected, not adding to past appointments');
        return prev;
      }
      
      const updated = [pastAppointment, ...prev];
      localStorage.setItem("pastAppointments", JSON.stringify(updated));
      return updated;
    });
    
    setUpcomingAppointments(prev => {
      const updated = prev.filter(app => app.id !== appointment.id);
      localStorage.setItem("upcomingAppointments", JSON.stringify(updated));
      return updated;
    });
    
    // Update latest appointment if this was the latest one
    if (latestAppointment?.id === appointment.id) {
      setUpcomingAppointments(current => {
        const remaining = current.filter(app => app.id !== appointment.id && app.status !== "Canceled");
        if (remaining.length > 0) {
          const newLatest = remaining.reduce((latest, current) => 
            new Date(current.date) > new Date(latest.date) ? current : latest
          );
          setLatestAppointment(newLatest);
        } else {
          setLatestAppointment(null);
        }
        return current;
      });
    }
  };

  // IMPROVED: Function to check and move past appointments
  const checkAndMovePastAppointments = (
    appointments: Appointment[],
    pastAppointments: PastAppointment[],
    setPastAppointments: React.Dispatch<React.SetStateAction<PastAppointment[]>>,
    setUpcomingAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>,
    latestAppointment: Appointment | null,
    setLatestAppointment: React.Dispatch<React.SetStateAction<Appointment | null>>
  ) => {
    const upcomingApps: Appointment[] = [];
    const pastApps: Appointment[] = [];

    appointments.forEach(appointment => {
      // Make sure we have a valid date and time
      if (!appointment.date || !appointment.appointmentTime) {
        console.log(`Appointment ${appointment.id} missing date or time, keeping as upcoming`);
        upcomingApps.push(appointment);
        return;
      }

      // Ensure appointment date is a Date object
      const appointmentDate = appointment.date instanceof Date ? 
        appointment.date : new Date(appointment.date);
      
      const isPast = isAppointmentPast(appointmentDate, appointment.appointmentTime);
      
      console.log(`Checking appointment ${appointment.id}: ${appointmentDate.toLocaleDateString()} at ${appointment.appointmentTime} - Is past? ${isPast}`);
      
      if (isPast) {
        console.log(`Scheduling to move appointment ${appointment.id} to past`);
        pastApps.push({...appointment, date: appointmentDate});
      } else {
        console.log(`Keeping appointment ${appointment.id} as upcoming`);
        upcomingApps.push({...appointment, date: appointmentDate});
      }
    });

    // Move past appointments one by one to prevent duplicates
    pastApps.forEach(appointment => {
      // Add a small delay to prevent race conditions
      setTimeout(() => {
        moveAppointmentToPast(
          appointment, 
          'completed', 
          pastAppointments,
          setPastAppointments,
          upcomingApps,
          setUpcomingAppointments,
          latestAppointment,
          setLatestAppointment
        );
      }, 100);
    });

    return upcomingApps;
  };

  // Load booking data from sessionStorage - Enhanced version
  const loadBookingData = (
    setSelectedServices: React.Dispatch<React.SetStateAction<Service[]>>,
    setServices: React.Dispatch<React.SetStateAction<Service[]>>,
    setSelectedSalon: React.Dispatch<React.SetStateAction<any | null>>,
    setSelectedProfessional: React.Dispatch<React.SetStateAction<string>>,
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>,
    setSelectedTime: React.Dispatch<React.SetStateAction<string>>,
    setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>,
    setBookingNotes: React.Dispatch<React.SetStateAction<string>>
  ) => {
    try {
      // Retrieve services
      const servicesData = sessionStorage.getItem("bookingServices");
      if (servicesData) {
        const parsedServices = JSON.parse(servicesData);
        setSelectedServices(parsedServices);
        setServices(parsedServices);
      }

      // Retrieve salon info
      const salonData = sessionStorage.getItem("salonInfo");
      if (salonData) {
        const parsedSalon = JSON.parse(salonData);
        setSelectedSalon(parsedSalon);
      }

      // Check if a specific staff member was selected
      const staffMemberData = sessionStorage.getItem("selectedStaffMember");
      if (staffMemberData) {
        const staffMember = JSON.parse(staffMemberData);
        setSelectedProfessional(staffMember.name || "");
      } else {
        // If no specific staff member, use the general professional name
        setSelectedProfessional(
          sessionStorage.getItem("bookingProfessional") || ""
        );
      }
      
      const bookingDate = sessionStorage.getItem("bookingDate");
      const bookingTime = sessionStorage.getItem("bookingTime");
      
      if (bookingDate) {
        setSelectedDate(new Date(bookingDate));
      }
      
      if (bookingTime) {
        setSelectedTime(bookingTime);
      }

      // Load payment method and notes if available
      const paymentMethodData = sessionStorage.getItem("paymentMethod");
      if (paymentMethodData) {
        setPaymentMethod(paymentMethodData as PaymentMethod);
      }

      const notesData = sessionStorage.getItem("bookingNotes");
      if (notesData) {
        setBookingNotes(notesData);
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  };

  return {
    moveAppointmentToPast,
    checkAndMovePastAppointments,
    loadBookingData
  };
};