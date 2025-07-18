import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RatingModal } from "@/components/ui/rating-modal";
import { PastAppointment } from "@/components/user-appointments/appointment-utils";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  selectedTime?: string;
  professional?: string;
  timeSlot?: string;
}

interface Appointment {
  id: string;
  salon: string;
  date: Date;
  price: number;
  image: string;
  services: Service[];
  status: "Confirmed" | "Canceled" | "Rescheduled";
  appointmentTime: string;
}

interface LeftColumnProps {
  upcomingAppointments: Appointment[];
  pastAppointments: PastAppointment[];
  latestAppointment: Appointment | null;
  onSelectAppointment: (appointment: Appointment) => void;
}

const LeftColumn: React.FC<LeftColumnProps> = ({
  upcomingAppointments,
  pastAppointments,
  latestAppointment,
  onSelectAppointment
}) => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState<PastAppointment | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    console.log('LeftColumn received updated appointments:', upcomingAppointments);
  }, [upcomingAppointments]);

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-purple-100 text-purple-500";
      case "Canceled": return "bg-red-100 text-red-500";
      case "Rescheduled": return "bg-blue-100 text-blue-500";
      default: return "bg-purple-100 text-purple-500";
    }
  };

  const getStatusColor = (status?: 'completed' | 'canceled') => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'canceled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status?: 'completed' | 'canceled') => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'canceled': return 'Canceled';
      default: return 'Completed';
    }
  };

  const activeUpcomingAppointments = upcomingAppointments.filter(app => app.status !== "Canceled");

  // Handle review button click
  const handleReviewClick = (appointment: PastAppointment) => {
    setSelectedAppointmentForRating(appointment);
    setIsRatingModalOpen(true);
  };

  // Handle rating submission (create or update)
  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!selectedAppointmentForRating) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: selectedAppointmentForRating.appointmentId,
          serviceId: selectedAppointmentForRating.serviceId,
          salonId: selectedAppointmentForRating.salonId, // Add the missing salonId
          rating,
          comment,
          ratingId: selectedAppointmentForRating.currentRating?.ratingId // Include for updates
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the appointment data locally to reflect the change
        const updatedAppointments = pastAppointments.map(apt => {
          if (apt.appointmentId === selectedAppointmentForRating.appointmentId) {
            return {
              ...apt,
              currentRating: {
                ratingId: result.rating._id,
                rating: rating,
                comment: comment,
                createdAt: new Date().toISOString()
              }
            };
          }
          return apt;
        });
        
        // If there's a way to update the parent component's state, do it here
        // For now, we'll just show the success message
        
        const action = result.isUpdate ? 'updated' : 'submitted';
        alert(`Rating ${action} successfully!`);
        setIsRatingModalOpen(false);
        setSelectedAppointmentForRating(null);
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Check if appointment has been rated
  const isAppointmentRated = (appointment: PastAppointment) => {
    return appointment.currentRating !== null;
  };

  // Get rating button text
  const getRatingButtonText = (appointment: PastAppointment) => {
    return appointment.currentRating ? 'Edit Review' : 'Review';
  };

  return (
    <div>
      {/* Upcoming Appointments */}
      <div className="bg-white p-4 rounded-lg shadow-md w-full">
        <h2 className="font-semibold text-lg mb-2">Upcoming</h2>
        {activeUpcomingAppointments.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeUpcomingAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                  latestAppointment?.id === appointment.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onSelectAppointment(appointment)}
              >
                <Image
                  src={appointment.image}
                  alt={appointment.salon}
                  width={60}
                  height={45}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{appointment.salon}</h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(appointment.appointmentTime)}
                  </p>
                  <p className="font-bold text-sm">
                    LKR {appointment.price.toLocaleString()}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
      </div>

      {/* Past Appointments */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-semibold text-lg mb-2">Past appointments</h2>
        {pastAppointments.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-3 border-b py-2 last:border-0">
                <Image
                  src={appointment.image}
                  alt={appointment.name}
                  width={50}
                  height={50}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{appointment.name}</h3>
                  <p className="text-xs text-gray-500">{appointment.date}</p>
                  <p className="font-bold text-sm">LKR {appointment.price.toLocaleString()}</p>
                  <p className={`text-xs ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  {appointment.status === 'completed' && (
                    <button 
                      className="text-xs border rounded px-2 py-1 mb-1 text-black border-black hover:bg-gray-50"
                      onClick={() => handleReviewClick(appointment)}
                    >
                      {getRatingButtonText(appointment)}
                    </button>
                  )}
                  <Link href="/book" className="text-black underline text-xs">
                    {appointment.status === 'canceled' ? 'Rebook' : 'Complain'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No past appointments</p>
        )}
      </div>

      {/* Rating Modal */}
      {selectedAppointmentForRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedAppointmentForRating(null);
          }}
          onSubmit={handleRatingSubmit}
          serviceName={selectedAppointmentForRating.name}
          salonName={selectedAppointmentForRating.salonName || "Salon"}
          loading={isSubmittingRating}
          existingRating={selectedAppointmentForRating.currentRating ? {
            rating: selectedAppointmentForRating.currentRating.rating,
            comment: selectedAppointmentForRating.currentRating.comment
          } : null}
        />
      )}
    </div>
  );
};

export default LeftColumn;