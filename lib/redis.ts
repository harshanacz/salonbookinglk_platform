import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;

// Helper functions for service view tracking
export const incrementServiceViews = async (serviceId: string): Promise<number> => {
  try {
    const key = `service:${serviceId}:views`;
    const count = await redis.incr(key);
    
    // Set expiration to 30 days for cleanup
    await redis.expire(key, 60 * 60 * 24 * 30);
    
    return count;
  } catch (error) {
    console.error('Error incrementing service views in Redis:', error);
    throw error;
  }
};

export const getServiceViews = async (serviceId: string): Promise<number> => {
  try {
    const key = `service:${serviceId}:views`;
    const count = await redis.get(key);
    return count ? Number(count) : 0;
  } catch (error) {
    console.error('Error getting service views from Redis:', error);
    return 0;
  }
};

export const syncServiceViewsToMongoDB = async (serviceId: string): Promise<void> => {
  try {
    const views = await getServiceViews(serviceId);
    
    // Import here to avoid circular dependency
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Service } = await import('@/models/Service');
    
    await dbConnect();
    
    await Service.findByIdAndUpdate(
      serviceId,
      { 
        $set: { 
          viewsCount: views,
          views: views // Also update the existing views field for compatibility
        }
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error syncing service views to MongoDB:', error);
    throw error;
  }
};

// Batch sync multiple services
export const batchSyncServiceViews = async (serviceIds: string[]): Promise<void> => {
  try {
    const promises = serviceIds.map(id => syncServiceViewsToMongoDB(id));
    await Promise.all(promises);
  } catch (error) {
    console.error('Error in batch sync:', error);
    throw error;
  }
};
