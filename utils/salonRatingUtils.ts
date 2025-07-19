import mongoose from 'mongoose';

/**
 * Updates the overall salon rating based on all its services
 * @param salonId - The salon's ObjectId or string ID
 * @returns Promise<void>
 */
export async function updateSalonOverallRating(salonId: string | mongoose.Types.ObjectId): Promise<void> {
  try {
    // Import models dynamically to avoid circular dependencies
    const SalonContext = mongoose.models.SalonContext || (await import('@/models/SalonContext')).default;
    const Service = mongoose.models.Service || (await import('@/models/Service')).default;
    
    // Find the salon
    const salon = await SalonContext.findById(salonId);
    if (!salon) {
      console.error('Salon not found:', salonId);
      return;
    }

    // Get all active services for this salon
    const services = await Service.find({ 
      salonContextId: salonId,
      status: 'ACTIVE' // Only include active services
    });

    if (services.length === 0) {
      // No services, reset rating
      salon.numberOfReviewers = 0;
      salon.reviewScore = 0;
      await salon.save();
      return;
    }

    // Calculate weighted average rating
    let totalWeightedRating = 0;
    let totalReviewers = 0;

    services.forEach((service: any) => {
      if (service.reviewCount > 0) {
        // Weight each service's rating by its number of reviews
        totalWeightedRating += service.averageRating * service.reviewCount;
        totalReviewers += service.reviewCount;
      }
    });

    if (totalReviewers > 0) {
      // Calculate overall salon rating
      salon.reviewScore = parseFloat((totalWeightedRating / totalReviewers).toFixed(2));
      salon.numberOfReviewers = totalReviewers;
    } else {
      // No reviews yet
      salon.reviewScore = 0;
      salon.numberOfReviewers = 0;
    }

    await salon.save();
    
    console.log(`Updated salon ${salonId} overall rating:`, {
      numberOfReviewers: salon.numberOfReviewers,
      reviewScore: salon.reviewScore,
      servicesCount: services.length
    });

  } catch (error) {
    console.error('Error updating salon overall rating:', error);
    throw error;
  }
}

/**
 * Updates all salon ratings in the database
 * Useful for data migration or recalculation
 * @returns Promise<void>
 */
export async function recalculateAllSalonRatings(): Promise<void> {
  try {
    const SalonContext = mongoose.models.SalonContext || (await import('@/models/SalonContext')).default;
    
    const salons = await SalonContext.find({});
    
    console.log(`Recalculating ratings for ${salons.length} salons...`);
    
    for (const salon of salons) {
      await updateSalonOverallRating(salon._id);
    }
    
    console.log('Finished recalculating all salon ratings');
  } catch (error) {
    console.error('Error recalculating all salon ratings:', error);
    throw error;
  }
}
