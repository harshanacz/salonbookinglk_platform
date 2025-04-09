"use client";

import { useState, useRef, useEffect } from "react";
import { X, Calendar, Users, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Worker {
  name: string;
  image: string;
}

interface Appointment {
  id: number;
  time: string;
  worker: string;
  service: string;
  color: string;
  price?: string;
  isWalkIn?: boolean;
  customerName?: string;
  notes?: string;
}

interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
}

interface ContextMenuPosition {
  show: boolean;
  x: number;
  y: number;
  timeSlot: string;
  worker: string;
}

const workers: Worker[] = [
  { name: "Anna", image: "/images/anna.jpg" },
  { name: "Leo", image: "/images/leo.jpg" },
];

const appointments: Appointment[] = [
  {
    id: 1,
    time: "09:00-09:30",
    worker: "Anna",
    service: "Hair cut",
    color: "bg-blue-200",
    price: "LKR 40",
  },
  {
    id: 2,
    time: "10:00-10:30",
    worker: "Leo",
    service: "Nail Extension",
    color: "bg-purple-500",
    price: "LKR 50",
  },
  {
    id: 3,
    time: "10:30-11:00",
    worker: "Leo",
    service: "Nail Extension",
    color: "bg-pink-500",
    price: "LKR 60",
  },
  {
    id: 4,
    time: "11:00-11:30",
    worker: "Anna",
    service: "Nail Polish",
    color: "bg-green-300",
    price: "LKR 30",
  },
  {
    id: 5,
    time: "11:45-12:00",
    worker: "Leo",
    service: "Nail Extension",
    color: "bg-green-500",
    price: "LKR 50",
  },
];

const services: Service[] = [
  { id: 1, name: "Hair cut", duration: "30", price: "LKR 40" },
  { id: 2, name: "Nail Extension", duration: "30", price: "LKR 50" },
  { id: 3, name: "Nail Polish", duration: "30", price: "LKR 30" },
  { id: 4, name: "Hair Color", duration: "60", price: "LKR 80" },
];

// Generate hourly slots with 15-minute subdivisions
const generateHourlySlots = () => {
  const hours = [];
  for (let hour = 0; hour < 24; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    hours.push(formattedHour);
  }
  return hours;
};

// Generate all 15-minute time slots for appointment checking
const generateAllTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return slots;
};

const hourlySlots = generateHourlySlots();
const allTimeSlots = generateAllTimeSlots();

export default function AppointmentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [allAppointments, setAllAppointments] =
    useState<Appointment[]>(appointments);
  const [isStaffUser, setIsStaffUser] = useState(true); // Set to true for demo purposes
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInData, setWalkInData] = useState<{
    worker: string;
    time: string;
    date: string;
  }>({
    worker: "",
    time: "",
    date: "",
  });
  const [walkInCustomerName, setWalkInCustomerName] = useState("");
  const [walkInService, setWalkInService] = useState("");
  const [walkInNotes, setWalkInNotes] = useState("");
  const [currentDate, setCurrentDate] = useState("Monday 9th Aug"); // Current date for demo
  const [showBlockedTimeModal, setShowBlockedTimeModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>({
    show: false,
    x: 0,
    y: 0,
    timeSlot: "",
    worker: "",
  });

  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, show: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const handleCheckout = () => {
    if (selectedAppointment) {
      localStorage.setItem(
        "bookedServices",
        JSON.stringify([selectedAppointment])
      );
      router.push("/owner/summaryBill");
    }
  };

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsOpen(true);
  };

  const openWalkInBookingModal = (data: {
    worker: string;
    time: string;
    date: string;
  }) => {
    setContextMenu({ ...contextMenu, show: false });
    setWalkInData(data);
    setWalkInCustomerName("");
    setWalkInService("");
    setWalkInNotes("");
    setShowWalkInModal(true);
  };

  const openBlockedTimeModal = (data: {
    worker: string;
    time: string;
    date: string;
  }) => {
    setContextMenu({ ...contextMenu, show: false });
    setWalkInData(data);
    setShowBlockedTimeModal(true);
  };

  const handleGroupAppointment = (data: {
    worker: string;
    time: string;
    date: string;
  }) => {
    setContextMenu({ ...contextMenu, show: false });
    // Handle group appointment implementation
    alert(
      `Group appointment for ${data.worker} at ${data.time} would be implemented here`
    );
  };

  const handleWalkInBooking = () => {
    const selectedService = services.find((s) => s.name === walkInService);

    // Calculate time range based on service duration
    const startTime = walkInData.time;

    // Parse the start time
    const [startHour, startMinute] = startTime.split(":").map(Number);

    // Calculate end time based on service duration
    const durationMinutes = selectedService
      ? parseInt(selectedService.duration)
      : 30;
    let endHour = startHour;
    let endMinute = startMinute + durationMinutes;

    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute = endMinute % 60;
    }

    // Format the time range
    const formattedEndHour = endHour.toString().padStart(2, "0");
    const formattedEndMinute = endMinute.toString().padStart(2, "0");
    const timeRange = `${startTime}-${formattedEndHour}:${formattedEndMinute}`;

    const newAppointment: Appointment = {
      id: Date.now(),
      worker: walkInData.worker,
      time: timeRange,
      service: walkInService,
      color: "bg-orange-500", // Special color for walk-ins
      price: selectedService?.price || "",
      isWalkIn: true,
      customerName: walkInCustomerName,
      notes: walkInNotes,
    };

    setAllAppointments([...allAppointments, newAppointment]);
    setShowWalkInModal(false);
  };

  const formatDate = (date: string) => {
    return date; // In a real app, format the date properly
  };

  // Function to check if a time slot has an appointment
  const getAppointmentForTimeSlot = (worker: string, timeSlot: string) => {
    return allAppointments.find((appt) => {
      const [startTime] = appt.time.split("-");
      return appt.worker === worker && startTime === timeSlot;
    });
  };

  // Function to get appointments for a specific 15-minute segment within an hour
  const getAppointmentsForTimeSegment = (
    worker: string,
    hour: string,
    segment: number
  ) => {
    const minute = (segment * 15).toString().padStart(2, "0");
    const timeSlot = `${hour}:${minute}`;
    return getAppointmentForTimeSlot(worker, timeSlot);
  };

  const handleTimeSlotClick = (
    worker: string,
    timeSlot: string,
    event: React.MouseEvent
  ) => {
    const appointment = getAppointmentForTimeSlot(worker, timeSlot);

    if (appointment) {
      openModal(appointment);
    } else if (isStaffUser) {
      // Show context menu instead of immediately opening walk-in modal
      event.preventDefault();
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        timeSlot: timeSlot,
        worker: worker,
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Appointments</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 bg-transparent">
        <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
          <option>Working staff</option>
        </select>
        <div className="flex items-center gap-4">
          <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
            <option>Today | {currentDate}</option>
          </select>
          <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
            <option>Day</option>
          </select>
          <span className="text-xl cursor-pointer">⚙️</span>
        </div>
        <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
          <option>Add New</option>
        </select>
      </div>

      {/* Workers Row */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-center bg-white p-2 rounded-lg shadow sticky top-0 z-10">
        <div className="text-center font-bold">Time</div>
        {workers.map((worker) => (
          <div key={worker.name} className="flex flex-col items-center">
            <img
              src={worker.image}
              alt={worker.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            />
            <span className="text-sm mt-1">{worker.name}</span>
          </div>
        ))}
      </div>

      {/* Timeline - Scrollable container */}
      <div className="h-[calc(100vh-220px)] overflow-y-auto mt-2 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {/* Hour Column */}
          <div className="flex flex-col">
            {hourlySlots.map((hour) => (
              <div
                key={hour}
                className="h-24 flex items-start justify-center border-b text-gray-600 pt-1 font-medium"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Appointments Columns for Each Worker */}
          {workers.map((worker) => (
            <div key={worker.name} className="flex flex-col">
              {hourlySlots.map((hour) => (
                <div
                  key={`${worker.name}-${hour}`}
                  className="h-24 border-b flex flex-col"
                >
                  {/* Each hour divided into 4 segments of 15 minutes */}
                  {[0, 1, 2, 3].map((segment) => {
                    const timeSlot = `${hour}:${(segment * 15)
                      .toString()
                      .padStart(2, "0")}`;
                    const appointment = getAppointmentForTimeSlot(
                      worker.name,
                      timeSlot
                    );

                    return (
                      <div
                        key={`${worker.name}-${timeSlot}`}
                        className={`h-6 flex items-center relative ${
                          segment < 3 ? "border-b border-gray-100" : ""
                        } ${
                          !appointment && isStaffUser
                            ? "hover:bg-blue-100 cursor-pointer"
                            : ""
                        }`}
                        onClick={(e) =>
                          handleTimeSlotClick(worker.name, timeSlot, e)
                        }
                      >
                        {appointment && (
                          <div
                            className={`absolute w-full px-1 py-0.5 text-white rounded text-xs ${appointment.color} cursor-pointer z-10 truncate`}
                          >
                            {appointment.time} {appointment.service}
                            {appointment.isWalkIn && (
                              <span className="ml-1 font-bold">(Walk-in)</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          ref={menuRef}
          className="fixed bg-white rounded-lg shadow-lg z-50 w-64"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            transform: "translate(-50%, 10px)",
          }}
        >
          <div className="p-2 bg-gray-100 rounded-t-lg font-medium text-center">
            {contextMenu.timeSlot}
          </div>
          <ul className="divide-y">
            <li
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              onClick={() =>
                openWalkInBookingModal({
                  worker: contextMenu.worker,
                  time: contextMenu.timeSlot,
                  date: currentDate,
                })
              }
            >
              <Calendar size={18} />
              <span>Add appointment</span>
            </li>
            <li
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              onClick={() =>
                handleGroupAppointment({
                  worker: contextMenu.worker,
                  time: contextMenu.timeSlot,
                  date: currentDate,
                })
              }
            >
              <Users size={18} />
              <span>Add group appointment</span>
            </li>
            <li
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              onClick={() =>
                openBlockedTimeModal({
                  worker: contextMenu.worker,
                  time: contextMenu.timeSlot,
                  date: currentDate,
                })
              }
            >
              <Clock size={18} />
              <span>Add blocked time</span>
            </li>
          </ul>
        </div>
      )}

      {/* Modal for Appointment Details */}
      {isOpen && selectedAppointment && (
        <>
          {/* Backdrop overlay - covers entire screen */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Side panel - takes up 50% of the page width */}
          <div className="fixed inset-y-0 right-0 w-full md:w-1/2 bg-white shadow-xl flex flex-col h-full z-50">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col h-full overflow-auto">
              {/* Profile Section */}
              <div className="bg-purple-50 p-6 flex flex-col items-center border-b">
                <img
                  src="/images/profile.jpg"
                  alt="Profile"
                  className="w-16 h-16 rounded-full border"
                />
                <h3 className="text-lg font-semibold mt-2">
                  {selectedAppointment.customerName || "Jack Deo"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.isWalkIn
                    ? "Walk-in Customer"
                    : "Jack@gmail.com"}
                </p>
                <button className="mt-3 text-purple-600 underline">
                  View Profile
                </button>
                <div className="mt-4 text-xs text-gray-600 space-y-1">
                  <p>📅 Created: 17 Dec 2024</p>
                  <p>➕ Add pronouns</p>
                  <p>➕ Add date of birth</p>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="p-6 flex-1">
                <h2 className="text-xl font-semibold">Appointment Details</h2>
                <div className="mt-2">
                  <select className="w-full border rounded-lg px-3 py-2 bg-gray-100">
                    <option>Booked</option>
                    <option>Completed</option>
                    <option>Canceled</option>
                  </select>
                </div>

                {/* Services */}
                <div className="mt-4">
                  <h3 className="font-semibold">Services</h3>
                  <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedAppointment.service}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedAppointment.time} - {selectedAppointment.worker}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {selectedAppointment.price}
                    </p>
                  </div>
                </div>

                {/* Notes (only for walk-ins) */}
                {selectedAppointment.isWalkIn && selectedAppointment.notes && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Notes</h3>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom button section */}
              <div className="p-6 border-t mt-auto">
                <button
                  onClick={handleCheckout}
                  className="w-full p-3 bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white font-semibold rounded-lg"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book Walk-in Appointment</h2>
            <p>
              <span className="font-semibold">Staff:</span> {walkInData.worker}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {walkInData.time}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(walkInData.date)}
            </p>

            <div className="mt-4">
              <label className="block mb-2">Customer Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={walkInCustomerName}
                onChange={(e) => setWalkInCustomerName(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="block mb-2">Service</label>
              <select
                className="w-full p-2 border rounded"
                value={walkInService}
                onChange={(e) => setWalkInService(e.target.value)}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} - {service.duration} min - {service.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block mb-2">Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                value={walkInNotes}
                onChange={(e) => setWalkInNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowWalkInModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white rounded"
                onClick={handleWalkInBooking}
                disabled={!walkInCustomerName || !walkInService}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Time Modal (placeholder) */}
      {showBlockedTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Blocked Time</h2>
            <p>
              <span className="font-semibold">Staff:</span> {walkInData.worker}
            </p>
            <p>
              <span className="font-semibold">Starting Time:</span>{" "}
              {walkInData.time}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(walkInData.date)}
            </p>

            <div className="mt-4">
              <label className="block mb-2">Duration (minutes)</label>
              <select className="w-full p-2 border rounded">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block mb-2">Reason</label>
              <select className="w-full p-2 border rounded">
                <option value="break">Break</option>
                <option value="lunch">Lunch</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block mb-2">Notes</label>
              <textarea className="w-full p-2 border rounded" />
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowBlockedTimeModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white rounded"
                onClick={() => {
                  alert("Blocked time would be saved here");
                  setShowBlockedTimeModal(false);
                }}
              >
                Block Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
