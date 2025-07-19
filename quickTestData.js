// Quick Test Data for Rating System
// Run this in your browser console (F12 → Console) while on the user appointments page

// Based on real IDs from your recent appointment booking:
const testData = {
  appointmentId: "687a8a149d76323badc2aee99", // From terminal log: "Appointment created successfully"
  serviceId: "682f020bcd730a47ee6c8842",     // From appointment data in terminal
  rating: 5,
  comment: "Great service! Testing rating system."
};

console.log("Testing rating system with real MongoDB IDs...");
console.log("Test data:", testData);

// Test the rating submission
fetch('/api/ratings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log(`Response status: ${response.status}`);
  return response.json();
})
.then(data => {
  console.log('Rating submission result:', data);
  if (data.success) {
    console.log('✅ Rating system working correctly!');
  } else {
    console.log('❌ Rating submission failed:', data.error);
  }
})
.catch(error => {
  console.error('Error testing rating:', error);
});
