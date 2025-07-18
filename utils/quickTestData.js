// Quick fix for sample data with real IDs
// Run this in browser console after navigating to user appointments page

function addRealSampleData() {
  // Using the actual appointment ID from your recent booking that I saw in the logs
  const realSampleData = [
    {
      id: 1001,
      name: "Hair Cut & Styling",
      price: 2500,
      date: "2024-01-15",
      image: "/placeholder.jpg",
      status: "completed",
      appointmentId: "687a8a149d76323badc2aee99", // Real appointment ID from logs
      serviceId: "682f020bcd730a47ee6c8842", // Real service ID from logs
      salonId: "682cb62965c20f6d24ae9d0c" // Real salon ID from logs
    }
  ];

  // Clear any existing data first
  localStorage.removeItem("pastAppointments");
  localStorage.removeItem("ratedAppointments");
  
  // Add the sample data
  localStorage.setItem("pastAppointments", JSON.stringify(realSampleData));
  
  console.log("Real sample data added with IDs:", realSampleData[0]);
  
  // Reload to see changes
  window.location.reload();
}

// To run: addRealSampleData()
console.log("Run addRealSampleData() to add sample data with real MongoDB IDs");
