"use client";

import { useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

export default function UpdateAttendanceForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("All Day");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    console.log({
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
    });

    alert("Attendance updated successfully!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-gray-700 text-center">Update the Attendance</h2>

        <p className="mt-2 text-gray-600 text-center">Member: <span className="font-bold">Danushka Perera</span></p>

        {/* Date Picker */}
        <label className="block mt-4 text-sm font-medium text-gray-700">Select the Date:</label>
        <div className="relative mt-1">
            <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>

        {/* Time Selection */}
        <label className="block mt-4 text-sm font-medium text-gray-700">Select the Time Duration:</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All Day">All Day</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
          <option value="Custom">Custom (Specify in notes)</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
}
