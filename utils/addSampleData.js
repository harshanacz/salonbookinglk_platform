// Sample script to add past appointments for testing
// This would typically be called from the browser console

function addSamplePastAppointments() {
  const samplePastAppointments = [
    {
      id: 1001,
      name: "Hair Cut & Styling",
      price: 2500,
      date: "2024-01-15",
      image: "/placeholder.jpg",
      status: "completed",
      appointmentId: "687a8a149d76323badc2aee99", // Use actual appointment ID from recent booking (24 chars)
      serviceId: "682f020bcd730a47ee6c8842", // Use actual service ID from logs
      salonId: "682cb62965c20f6d24ae9d0c" // Use actual salon ID from logs
    },
    {
      id: 1002,
      name: "Facial Treatment",
      price: 3500,
      date: "2024-01-10",
      image: "/placeholder.jpg",
      status: "completed",
      appointmentId: "687a8a149d76323badc2aee98", // Properly formatted ObjectId (24 chars)
      serviceId: "682f020bcd730a47ee6c8842", // Use same service ID
      salonId: "682cb62965c20f6d24ae9d0c" // Use same salon ID
    },
    {
      id: 1003,
      name: "Manicure & Pedicure",
      price: 2000,
      date: "2024-01-05",
      image: "/placeholder.jpg",
      status: "completed",
      appointmentId: "687a8a149d76323badc2aee97", // Properly formatted ObjectId (24 chars)
      serviceId: "682f020bcd730a47ee6c8842", // Use same service ID
      salonId: "682cb62965c20f6d24ae9d0c" // Use same salon ID
    }
  ];

  // Clear any existing past appointments first to avoid mixing with invalid IDs
  localStorage.removeItem("pastAppointments");
  localStorage.setItem("pastAppointments", JSON.stringify(samplePastAppointments));
  console.log("Sample past appointments added with valid MongoDB ObjectIds!");
  console.log("Sample data:", samplePastAppointments);
  // Reload the page to see the changes
  window.location.reload();
}

// Function to clear sample data if needed
function clearPastAppointments() {
  localStorage.removeItem("pastAppointments");
  console.log("Past appointments cleared!");
  window.location.reload();
}

// Run this function in the browser console to add sample data
console.log("To add sample past appointments, run: addSamplePastAppointments()");
console.log("To clear past appointments, run: clearPastAppointments()");
