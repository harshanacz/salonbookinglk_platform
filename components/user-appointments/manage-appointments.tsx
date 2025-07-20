import React from 'react';

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

interface ManageAppointmentPopupProps {
  appointment: Appointment;
  onClose: () => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export const ManageAppointmentPopup: React.FC<ManageAppointmentPopupProps> = ({
  appointment,
  onClose,
  onReschedule,
  onCancel
}) => {
  console.log("ManageAppointmentPopup received:", appointment); // Debug log
  
  const handleCancelClick = () => {
    onCancel(appointment); // This should call the updated handleCancelClick function
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold">Manage appointment</h2>
        
        {/* Display appointment details */}
        <div className="mt-2 mb-4 text-sm">
          <p className="font-semibold text-gray-800">{appointment.salon}</p>
          <div className="flex items-center mt-1">
            <span className="text-gray-600">
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {appointment.appointmentTime && ` at ${
                appointment.appointmentTime.includes('AM') || appointment.appointmentTime.includes('PM') 
                  ? appointment.appointmentTime 
                  : (() => {
                      const [hours, minutes] = appointment.appointmentTime.split(':');
                      const hour = parseInt(hours);
                      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
                    })()
              }`}
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
              appointment.status === "Confirmed" ? "bg-green-100 text-green-800" :
              appointment.status === "Canceled" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>

        {appointment.services.map((service) => (
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
            className={`w-full p-3 border rounded-lg ${
              appointment.status === "Canceled" 
                ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                : "bg-gray-100 text-blue-500 hover:bg-blue-50"
            }`}
            onClick={() => onReschedule(appointment)}
            disabled={appointment.status === "Canceled"}
          >
            📅 {appointment.status === "Canceled" ? "Cannot Reschedule" : "Reschedule appointment"}
          </button>
          <button
            className={`w-full p-3 border rounded-lg ${
              appointment.status === "Canceled" 
                ? "bg-red-100 cursor-not-allowed text-red-400" 
                : "bg-gray-100 text-red-500 hover:bg-red-50"
            }`}
            onClick={handleCancelClick}
            disabled={appointment.status === "Canceled"}
          >
            ❌ {appointment.status === "Canceled" ? "Appointment Canceled" : "Cancel appointment"}
          </button>
        </div>
        <button
          className="w-full p-3 border rounded-lg bg-purple-500 text-white mt-4 hover:bg-purple-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};