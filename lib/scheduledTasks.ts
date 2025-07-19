import Staff from "@/models/Staff";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

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

// Function to clean up expired deactivated accounts
async function cleanupExpiredDeactivatedAccounts() {
  try {
    console.log("[Scheduled Task] Starting expired deactivated accounts cleanup...");
    
    // Find users that have been deactivated for more than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const expiredUsers = await User.find({
      isActive: false,
      deactivatedAt: { $lt: thirtyDaysAgo, $ne: null }
    });

    // Delete expired user accounts and their associated salon contexts
    for (const user of expiredUsers) {
      // Find and delete associated salon context
      const salonContext = await SalonContext.findOne({ userId: user._id });
      if (salonContext) {
        await SalonContext.findByIdAndDelete(salonContext._id);
        console.log(`[Scheduled Task] Deleted salon context for: ${salonContext.businessName}`);
      }
      
      // Delete the user account
      await User.findByIdAndDelete(user._id);
      console.log(`[Scheduled Task] Permanently deleted expired user: ${user.email || user.userName}`);
    }

    console.log(`[Scheduled Task] Cleaned up ${expiredUsers.length} expired deactivated accounts`);
  } catch (error) {
    console.error("[Scheduled Task] Error during deactivated accounts cleanup:", error);
  }
}

// Function to start the scheduled task
export function startScheduledTasks() {
  // Run cleanup every 24 hours
  setInterval(cleanupTimeSlots, 24 * 60 * 60 * 1000);
  setInterval(cleanupExpiredDeactivatedAccounts, 24 * 60 * 60 * 1000);
  
  // Run cleanup immediately when the server starts
  cleanupTimeSlots();
  cleanupExpiredDeactivatedAccounts();
  
  console.log("[Scheduled Task] Time slots cleanup scheduled to run every 24 hours");
  console.log("[Scheduled Task] Expired deactivated accounts cleanup scheduled to run every 24 hours");
} 