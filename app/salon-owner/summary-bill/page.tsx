"use client";

import { useEffect, useState } from "react";

interface Service {
  id: number;
  date: string;
  time: string;
  service: string;
  duration: string;
  price: number;
  clientName?: string;
  reference?: string;
  bookedDate?: string;
}

export default function SummaryBill() {
  const [bookedServices, setBookedServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [clientName, setClientName] = useState("");
  const [reference, setReference] = useState("");
  const [bookedDate, setBookedDate] = useState("");

  useEffect(() => {
    // Fetch booked services from localStorage
    const savedServices: Service[] = JSON.parse(
      localStorage.getItem("bookedServices") || "[]"
    );

    if (savedServices.length > 0) {
      setBookedServices(savedServices);
      setClientName(savedServices[0].clientName || "Unknown");
      setReference(savedServices[0].reference || "N/A");
      setBookedDate(savedServices[0].bookedDate || "N/A");
    }

    // Calculate total price
    const totalPrice = savedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    setTotal(totalPrice);
  }, []);

  return (
    <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center">Summary Bill</h1>

        {/* Service List */}
        {bookedServices.length > 0 ? (
          bookedServices.map((service) => (
            <div key={service.id} className="border-b py-4">
              <h2 className="text-lg font-semibold">{service.date}</h2>
              <p className="text-sm text-gray-600">{service.time}</p>
              <p className="text-md">{service.service}</p>
              <p className="text-sm text-gray-500">{service.duration}</p>
              <p className="text-right font-semibold">
                {service.price.toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-6">No services booked.</p>
        )}

        {/* Total */}
        <div className="border-t mt-4 py-4 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{total.toLocaleString()}</span>
        </div>

        {/* Booking Details */}
        <p className="text-xs text-gray-500 mt-4">
          Booked by {clientName}, reference {reference} at {bookedDate}
        </p>
      </div>
    </div>
  );
}
