"use client";

import Link from "next/link";
import Image from "next/image";

const Appointments = () => {
    const selectedAppointment = {
        name: "Instyle Family Salon",
        date: "Thu, Mar 20, 2025 at 09:30",
        duration: "45 minutes",
        price: 300,
        items: 2,
        image: "/salon2.jpg",
        canceled: true,
      };
    const selectedSalon = {
        name: "Salon Dmesh",
        image: "/Dmesh.jpg",
      };
      
    
  const pastAppointments = [
    {
      id: 1,
      name: "SalonDmesh",
      date: "Fri, Apr 4, 2025 at 09:00",
      price: 6000,
      items: 1,
      image: "/salon1.jpg",
    },
    {
      id: 2,
      name: "Instyle Family Salon",
      date: "Thu, Mar 20, 2025 at 09:30",
      price: 300,
      items: 2,
      image: "/salon2.jpg",
      canceled: true,
    },
  ];

  return (
    <div className="p-7 pl-24 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto scrollbar-hide">
      {/* Upcoming Section */}
      <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white col-span-1 p-4 rounded-lg shadow-md w-full">  

      <h1 className="text-xl font-bold">Upcoming</h1>
      <div className="mt-4 bg-gray-100 p-6 rounded-lg text-center flex flex-col items-center">
        <div className="w-12 h-12 mb-2">
          <Image src="/calendar-icon.png" alt="Calendar" width={48} height={48} />
        </div>
        <p className="text-gray-500">No upcoming appointments</p>
        <button className="mt-2 px-4 py-2 border border-gray-400 rounded-lg">
          Search salons
        </button>
      
      </div>
      

      {/* Past Appointments Section */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mt-6">Past Appointments</h1>
      <div className="mt-4 space-y-4">
        {pastAppointments.map(({ id, name, date, price, items, image, canceled }) => (
          <div key={id} className={`flex items-center p-4 border rounded-lg shadow-sm ${canceled ? "border-purple-500" : ""}`}>
            {/* Salon Image */}
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <Image src={image} alt={name} width={64} height={64} />
            </div>
            {/* Appointment Details */}
            <div className="ml-4 flex-1">
              <h3 className="font-semibold">{name}</h3>
              <p className="text-gray-500 text-sm">{date}</p>
              <p className="font-bold text-sm">LKR {price.toLocaleString()} • {items} item(s)</p>
              {canceled && <span className="text-red-500 font-bold">Cancelled</span>}
            </div>
            {/* Book Again Link */}
            <Link href="/salons" className="text-blue-500 font-medium">
              Book again
            </Link>
          </div>
        ))}
      </div>
      </div>
      </div>
      {/* Order Confirmation */}
      <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
  <div className="w-full mt-3">
    <Image 
      src={selectedSalon.image} 
      alt={selectedSalon.name} 
      width={800} 
      height={300} 
      className="rounded-lg" 
      style={{ objectFit: 'cover', height: '500px' }} 
    />
  </div>
  <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mt-4">
    🚫 Cancelled
  </span>
  {/* Appointment Date & Duration */}
  <p className="text-gray-600 mt-3 text-lg font-medium">
    {selectedAppointment.date}
  </p>
  <p className="text-gray-500 text-sm">{selectedAppointment.duration} duration</p>

 

  {/* Venue Details Section */}
  <div className="mt-4 space-y-2">
            <Link href="/salons">
            <button className="w-full p-4 border rounded-lg flex items-center gap-2  text-black ">
            Book again
            </button>
            </Link>
            
            <button className="w-full p-4 border rounded-lg flex items-center gap-2 ">
              📍 Venue Details
            </button>
          </div>
          <div className="mt-6 border-t pt-4">
    <h3 className="text-lg font-semibold text-gray-800">Booked Appointment Summary</h3>
    <div className="mt-4 flex items-center">
      <div className="w-16 h-16 rounded-md overflow-hidden">
        <Image src={pastAppointments[0].image} alt={pastAppointments[0].name} width={64} height={64} />
      </div>
      <div className="ml-4">
        
        <p className="text-gray-500 text-sm">{pastAppointments[0].date}</p>
        <p className="text-gray-500 text-sm">Price: LKR {pastAppointments[0].price.toLocaleString()}</p>
      </div>
    </div>
  </div>
          
          {selectedAppointment.canceled && (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-800">Cancelled Booking Overview</h3>
      <p className="text-gray-500 text-sm mt-2">
        Unfortunately, your booking for <strong>{selectedAppointment.name}</strong> has been cancelled.
      </p>
      <div className="mt-2">
        <p className="text-gray-500 text-sm">Reference No: <strong>{selectedAppointment.name.split(' ').join('-')}-{Date.now()}</strong></p>
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-sm">
          If you wish to inquire further, please contact our support team with the Reference No above.
        </p>
      </div>
    </div>
  )}
</div>
    
    </div>

    </div>
  );
};

export default Appointments;
