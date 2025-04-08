"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SalonCard from "@/components/booking/SalonCard";
import BookingNavigation from "@/components/booking/BookingNavigation";

export default function SelectTime() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

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

  const professionals = [
    {
      id: "1",
      name: "John Doe",
      specialty: "Hair Specialist",
      image: "/images/john.jpg",
    },
    {
      id: "2",
      name: "Jane Smith",
      specialty: "Nail Specialist",
      image: "/images/jane.jpg",
    },
    {
      id: "3",
      name: "Alice Johnson",
      specialty: "Makeup Artist",
      image: "/images/alice.jpg",
    },
  ];

  useEffect(() => {
    if (selectedProfessional) {
      const professional = professionals.find(p => p.id === selectedProfessional);
      if (professional) {
        setSelectedProfessionalName(professional.name);
      }
    }
  }, [selectedProfessional]);

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

  const timeSlots = Array.from({ length: 6 }, (_, i) => ({
    time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"} AM`,
    status: i % 4 === 0 ? "unavailable" : "available",
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const services = [
    {
      name: "Layer Hair Cut",
      time: "9:30-10:00AM",
      professional: "Layer cut with Dhanuka",
      price: "LKR 7,000",
    },
    {
      name: "Scalp Anti-Dandruff treatment",
      time: "10:00-10:30AM",
      professional: "Layer cut with Dhanuka",
      price: "LKR 1,000",
    },
  ];

  const extraServices = [
    { id: "1", name: "Facial Treatment", duration: "30 mins", price: 2000 },
    { id: "2", name: "Manicure", duration: "15 mins", price: 1000 },
    { id: "3", name: "Pedicure", duration: "20 mins", price: 1500 },
  ];

  const selectedSalon = {
    name: "Saloon Dmesh",
    image: "/salon-dmesh.jpg",
    rating: 4.5,
    closingTime: "8:00 PM",
    isOpen: true,
    address: "123 Salon Street, Colombo",
    mapLink: "https://maps.google.com/?q=Saloon+Dmesh",
  };

  const handleContinue = () => {
    console.log("Continue button clicked!");
    setShowPopup(true);
  };

  const navigateToConfirm = () => {
    console.log("Navigating to Confirm page");
    router.push("/user-booking/confirm");
  };

  return (
    <div className="p-12 shadow-lg w-full h-screen bg-purple-50 overflow-y-auto">
      <BookingNavigation/>
      <h2 className="pl-6 text-2xl font-bold mb-4">Select Time</h2>

      <div className="w-full lg:w-1/2 p-4 space-y-6">
        {/* Professional Selection */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Select Professional</h3>
          <div className="grid grid-cols-3 gap-4">
            {professionals.map((professional) => (
              <button
                key={professional.id}
                onClick={() => setSelectedProfessional(professional.id)}
                className={`p-4 rounded-lg border transition-all flex flex-col items-center 
                  ${
                    selectedProfessional === professional.id
                      ? "border-purple-700 shadow-lg"
                      : "border-gray-300"
                  }`}
              >
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-20 h-20 rounded-full mb-2"
                />
                <p className="text-md font-semibold">{professional.name}</p>
                <p className="text-sm text-gray-500">
                  {professional.specialty}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => handleMonthChange(-1)}>
              <ChevronLeft />
            </button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <button onClick={() => handleMonthChange(1)}>
              <ChevronRight />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7">
              {week.map((day, j) => (
                <button
                  key={j}
                  onClick={() => day && setSelectedDate(day.toString())}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all 
                    ${
                      selectedDate === day?.toString()
                        ? "bg-purple-700 text-white"
                        : "bg-gray-200 text-black"
                    } 
                    ${!day ? "opacity-0" : ""}`}
                >
                  {day || ""}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Time Slot Selection */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Select a Time Slot</h2>
          <div className="w-full max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                disabled={slot.status === "unavailable"}
                onClick={() => setSelectedTime(slot.time)}
                className={`w-full p-4 flex justify-between items-center rounded-lg text-sm font-medium
                  ${
                    slot.status === "unavailable"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }
                  ${selectedTime === slot.time ? "border-black border-2" : ""}`}
              >
                <span>{slot.time || "No Time Available"}</span>
                {slot.status !== "unavailable" && (
                  <span className="text-gray-500">High Demand</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Your Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Your Information</h2>
          <div className="space-y-4 w-full">
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Salon Card with Continue Button */}
        <SalonCard
          salonName="Saloon Dmesh"
          services={services}
          total="LKR 8,000"
          selectedSalon={selectedSalon}
          selectedProfessionalId={selectedProfessional}
          selectedProfessionalName={selectedProfessionalName || ""}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={handleContinue}
          buttonText="Continue"
        />

        {/* Popup for Extra Service */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold">Add An Extra Service?</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {extraServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 bg-purple-100 rounded-lg mb-2"
                  >
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                    <p className="text-sm">
                      From LKR {service.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              <button 
                className="mt-4 w-full bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white py-3 rounded-2xl text-lg"
                onClick={navigateToConfirm}
              >
                No Thanks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}