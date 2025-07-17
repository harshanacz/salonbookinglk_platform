import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

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

interface PastAppointment {
  id: number;
  name: string;
  price: number;
  date: string;
  image: string;
  status?: 'completed' | 'canceled';
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
                    <button className="text-black underline text-xs border border-black rounded px-2 py-1 mb-1">
                      Review
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
    </div>
  );
};

export default LeftColumn;