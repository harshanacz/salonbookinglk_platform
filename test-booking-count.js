// Test script to verify booking count calculation
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Define schemas directly (simplified for testing)
const serviceSchema = new mongoose.Schema({
  title: String,
  bookings: { type: Number, default: 0 },
  userId: mongoose.Schema.Types.ObjectId,
  // ... other fields
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  clientId: mongoose.Schema.Types.ObjectId,
  // ... other fields
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

async function testBookingCount() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get some services to test
    const services = await Service.find().limit(5);
    console.log(`Found ${services.length} services for testing`);

    if (services.length === 0) {
      console.log('No services found to test');
      return;
    }

    // Test booking count calculation for each service
    for (const service of services) {
      console.log(`\n--- Testing service: ${service.title} (ID: ${service._id}) ---`);
      console.log(`Salon ID (userId): ${service.userId}`);
      
      // Get booking count from service model (old way)
      const oldBookingCount = service.bookings || 0;
      console.log(`Old booking count (from service.bookings): ${oldBookingCount}`);
      
      // Calculate actual booking count from appointments (new way)
      const actualBookingCount = await Appointment.countDocuments({ serviceId: service._id });
      console.log(`Actual booking count (from appointments): ${actualBookingCount}`);
      
      if (oldBookingCount !== actualBookingCount) {
        console.log(`⚠️  Mismatch detected! Service shows ${oldBookingCount} but actual is ${actualBookingCount}`);
      } else {
        console.log(`✅ Counts match!`);
      }
    }

  } catch (error) {
    console.error('Error testing booking count:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testBookingCount();
