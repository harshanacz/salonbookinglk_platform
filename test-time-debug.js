// Quick test to check current time and appointment filtering
const now = new Date();
const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const currentTimeInHHMM = now.getHours() * 100 + now.getMinutes();

console.log('=== TIME DEBUG ===');
console.log('Current time:', now.toISOString());
console.log('Current time local:', now.toString());
console.log('Current date (midnight):', currentDate.toISOString());
console.log('Current time in HHMM format:', currentTimeInHHMM);
console.log('Current hour:', now.getHours());
console.log('Current minute:', now.getMinutes());

// Test appointments
const testAppointments = [
  { time: 1000, date: '2025-07-19' }, // 10:00 AM
  { time: 1600, date: '2025-07-19' }  // 4:00 PM (16:00)
];

console.log('\n=== APPOINTMENT FILTERING TEST ===');
testAppointments.forEach(apt => {
  const aptDate = new Date(apt.date);
  const isToday = aptDate.getTime() === currentDate.getTime();
  const isPast = apt.time <= currentTimeInHHMM;
  
  console.log(`Appointment ${apt.time}:`);
  console.log(`  - Time: ${Math.floor(apt.time / 100)}:${(apt.time % 100).toString().padStart(2, '0')}`);
  console.log(`  - Is today: ${isToday}`);
  console.log(`  - Is past (${apt.time} <= ${currentTimeInHHMM}): ${isPast}`);
  console.log(`  - Should be in: ${isPast ? 'PAST' : 'UPCOMING'}`);
  console.log('');
});
