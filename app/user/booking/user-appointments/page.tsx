"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const AppointmentSummary = () => {
  const [showPopup, setShowPopup] = useState(false);

  const userName = "Naduni"; // Replace with actual user data if available
  const bookedDate = "Monday, March 18"; // Replace with dynamic date if available

  const selectedSalon = {
    name: "Salon Dmesh",
    image: "/Dmesh.jpg",
  };

  const upcomingAppointment = {
    salon: "Salon Dmesh",
    time: "Today at 14:15",
    price: 5000,
    image: "/Dmesh.jpg",
  };

  const pastAppointments = [
    { id: 1, name: "Layer Hair Cut", price: 7000, date: "Wednesday 13 December", image: "/haircut.jpg" },
    { id: 2, name: "Nail Polish", price: 7000, date: "Wednesday 09 December", image: "/nailpolish.jpg" },
    { id: 3, name: "Layer Hair Cut", price: 7000, date: "Saturday 02 December", image: "/haircut.jpg" },
  ];

  const overview = [
    { name: "Layer Hair Cut", price: 7000, duration: "1hr - Layer cut with Dhanuka" },
    { name: "Scalp Anti-Dandruff Treatment", price: 1000, duration: "10:00-10:30AM - Layer cut with Dhanuka" },
  ];

  const total = overview.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="p-7 pl-24 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold mb-6">Welcome, {userName}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          {/* Upcoming Appointment */}
          <div className="bg-white col-span-1 p-4 rounded-lg shadow-md w-full">
            <h2 className="font-semibold text-lg mb-2">Upcoming</h2>
            <div className="flex items-center gap-4">
              <Image src={upcomingAppointment.image} alt={upcomingAppointment.salon} width={80} height={60} className="rounded-lg" />
              <div>
                <h3 className="font-semibold">{upcomingAppointment.salon}</h3>
                <p className="text-sm text-gray-500">{upcomingAppointment.time}</p>
                <p className="font-bold">LKR {upcomingAppointment.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Past Appointments */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-semibold text-lg mb-2">Past appointments</h2>
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-3 border-b py-2 last:border-0">
                <Image src={appointment.image} alt={appointment.name} width={50} height={50} className="rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold">{appointment.name}</h3>
                  <p className="text-sm text-gray-500">{appointment.date}</p>
                  <p className="font-bold">LKR {appointment.price.toLocaleString()}</p>
                  <Link href="/book" className="text-purple-500 underline">Book Again</Link>
                </div>
                <div className="flex flex-col items-start">
                  <button className="text-black underline m-4 border-2 rounded-lg border-black p-2">Review</button>
                  <Link href="/book" className="text-black underline">Complain</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Confirmation */}
        <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
          <div className="w-full mt-3">
            <Image src={selectedSalon.image} alt={selectedSalon.name} width={800} height={300} className="rounded-lg" style={{ objectFit: 'cover', height: '500px' }} />
          </div>
          <h2 className="inline-block bg-purple-100 text-purple-500 px-3 py-1 rounded-full text-sm font-bold mt-4">Confirmed</h2>
          <p className="text-gray-600">{bookedDate}</p>

          <div className="mt-4 space-y-2">
            <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
              📅 Add to Calendar
            </button>
            <button 
              className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100"
              onClick={() => setShowPopup(true)}
            >
              📂 Manage Appointments
            </button>
            <button className="w-full p-3 border rounded-lg flex items-center gap-2 bg-gray-100">
              📍 Venue Details
            </button>
          </div>

          <h2 className="font-semibold text-lg mt-6">Overview</h2>
          <div className="mt-2">
            {overview.map((service, index) => (
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
            <span>LKR {total.toLocaleString()}</span>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-red-500">Cancellation policy</h3>
            <p className="text-sm text-gray-600">
              Please avoid canceling within <strong>12 hours</strong> of your appointment time.
            </p>
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold">Manage appointment</h2>
            {overview.map((service, index) => (
        <div key={index} className="flex items-center gap-3 mt-4 border-b pb-2 last:border-0">
          <div className="flex-1">
            <h3 className="font-semibold">{service.name}</h3>
            <p className="text-gray-500 text-sm">{service.duration}</p>
          </div>
          <p className="font-bold">LKR {service.price.toLocaleString()}</p>
        </div>
      ))}
            <div className="mt-4 space-y-2">
              <button className="w-full p-3 border rounded-lg bg-gray-100">📅 Reschedule appointment</button>
              <button className="w-full p-3 border rounded-lg bg-gray-100">❌ Cancel appointment</button>
            </div>
            <button 
              className="w-full p-3 border rounded-lg bg-purple-500 text-white mt-4"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSummary;
