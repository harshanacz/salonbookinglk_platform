import Staff from "@/models/Staff";
import SalonContext from "@/models/SalonContext";

// Function to clean up time slots for all staff and salons
async function cleanupTimeSlots() {
  try {
    console.log("[Scheduled Task] Starting daily time slots cleanup...");
    
    // Clean up staff time slots
    const staffMembers = await Staff.find({});
    for (const staff of staffMembers) {
      await staff.cleanupTimeSlots();
    }
    console.log(`[Scheduled Task] Cleaned up time slots for ${staffMembers.length} staff members`);

    // Clean up salon time slots
    const salons = await SalonContext.find({});
    for (const salon of salons) {
      await salon.cleanupTimeSlots();
    }
    console.log(`[Scheduled Task] Cleaned up time slots for ${salons.length} salons`);

    console.log("[Scheduled Task] Daily cleanup completed successfully");
  } catch (error) {
    console.error("[Scheduled Task] Error during cleanup:", error);
  }
}

// Function to start the scheduled task
export function startScheduledTasks() {
  // Run cleanup every 24 hours
  setInterval(cleanupTimeSlots, 24 * 60 * 60 * 1000);
  
  // Run cleanup immediately when the server starts
  cleanupTimeSlots();
  
  console.log("[Scheduled Task] Time slots cleanup scheduled to run every 24 hours");
} 