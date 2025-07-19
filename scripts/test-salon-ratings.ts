import dbConnect from "../lib/mongodb";
import { updateSalonOverallRating, recalculateAllSalonRatings } from "../utils/salonRatingUtils";
import SalonContextModel from "../models/SalonContext";
import ServiceModel from "../models/Service";
import RatingModel from "../models/Rating";

async function testSalonRatingSystem() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Get all salons
    const salons = await SalonContextModel.find({}).limit(5);
    console.log(`Found ${salons.length} salons`);

    for (const salon of salons) {
      console.log(`\n--- Testing Salon: ${salon.basicInfo?.name || salon._id} ---`);
      
      // Get services for this salon
      const services = await ServiceModel.find({ salonContextId: salon._id });
      console.log(`Services: ${services.length}`);

      // Get ratings for services of this salon
      const ratings = await RatingModel.find({ 
        serviceId: { $in: services.map(s => s._id) } 
      });
      console.log(`Total ratings: ${ratings.length}`);

      // Show current salon rating
      console.log(`Current salon rating: ${salon.reviewScore || 0} (${salon.numberOfReviewers || 0} reviews)`);

      // Test updating salon rating
      await updateSalonOverallRating(salon._id.toString());
      
      // Get updated salon data
      const updatedSalon = await SalonContextModel.findById(salon._id);
      console.log(`Updated salon rating: ${updatedSalon?.reviewScore || 0} (${updatedSalon?.numberOfReviewers || 0} reviews)`);

      // Show service ratings
      for (const service of services) {
        const serviceRatings = ratings.filter(r => r.serviceId.toString() === service._id.toString());
        if (serviceRatings.length > 0) {
          const avgRating = serviceRatings.reduce((sum, r) => sum + r.rating, 0) / serviceRatings.length;
          console.log(`  - ${service.title}: ${avgRating.toFixed(1)} (${serviceRatings.length} ratings)`);
        }
      }
    }

    console.log("\n--- Testing bulk recalculation ---");
    await recalculateAllSalonRatings();
    console.log("Bulk recalculation completed");

  } catch (error) {
    console.error("Error testing salon rating system:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSalonRatingSystem().then(() => {
    console.log("\nTest completed");
    process.exit(0);
  });
}

export { testSalonRatingSystem };
