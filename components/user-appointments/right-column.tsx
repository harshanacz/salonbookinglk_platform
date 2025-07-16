import Image from "next/image";
import Link from "next/link";

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

interface RightColumnProps {
  latestAppointment: Appointment | null;
  onManageAppointment: (appointment: Appointment) => void;
}

const RightColumn: React.FC<RightColumnProps> = ({
  latestAppointment,
  onManageAppointment
}) => {
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

  if (!latestAppointment) {
    return (
      <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">No Upcoming Appointment</h2>
            <p className="text-gray-600 mb-6">You don't have any active appointments at the moment.</p>
            <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Book a New Appointment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
      <div className="w-full mt-3">
        <Image
          src={latestAppointment.image}
          alt={latestAppointment.salon}
          width={800}
          height={300}
          className="rounded-lg"
          style={{ objectFit: "cover", height: "500px" }}
        />
      </div>
      
      <h2 className={`inline-block ${getStatusStyle(latestAppointment.status)} px-3 py-1 rounded-full text-sm font-bold mt-4`}>
        {latestAppointment.status}
      </h2>
      
      <p className="text-gray-600">
        {formatDate(latestAppointment.date)} at {formatTime(latestAppointment.appointmentTime)}
      </p>

      <div className="mt-4 space-y-2">
        <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
          📅 Add to Calendar
        </button>
        <button
          className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100"
          onClick={() => onManageAppointment(latestAppointment)}
        >
          📂 Manage Appointments
        </button>
        <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
          📍 Venue Details
        </button>
      </div>

      <h2 className="font-semibold text-lg mt-6">Overview</h2>
      <div className="mt-2">
        {latestAppointment.services.map((service, index) => (
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
        <span>LKR {latestAppointment.price.toLocaleString()}</span>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-red-500">Cancellation policy</h3>
        <p className="text-sm text-gray-600">
          Please avoid canceling within <strong>12 hours</strong> of your appointment time.
        </p>
      </div>
    </div>
  );
};

export default RightColumn;