// Test script for Redis view tracking
// Run with: npx ts-node scripts/test-redis.ts

import { incrementServiceViews, getServiceViews, syncServiceViewsToMongoDB } from '../lib/redis';
import dbConnect from '../lib/mongodb';
import Service from '../models/Service';

async function testRedisViewTracking() {
  console.log('🧪 Testing Redis View Tracking...\n');

  try {
    // Test Redis connection
    console.log('1. Testing Redis connection...');
    const testServiceId = '507f1f77bcf86cd799439011'; // Sample ObjectId
    
    // Test incrementing views
    console.log('2. Testing view increment...');
    const newCount1 = await incrementServiceViews(testServiceId);
    console.log(`   View count after increment: ${newCount1}`);
    
    const newCount2 = await incrementServiceViews(testServiceId);
    console.log(`   View count after second increment: ${newCount2}`);
    
    // Test getting views
    console.log('3. Testing view retrieval...');
    const currentViews = await getServiceViews(testServiceId);
    console.log(`   Current view count: ${currentViews}`);
    
    // Test MongoDB connection and sync (commented out to avoid affecting real data)
    /*
    console.log('4. Testing MongoDB sync...');
    await dbConnect();
    
    // Create a test service
    const testService = new Service({
      userId: '507f1f77bcf86cd799439012',
      salonContextId: '507f1f77bcf86cd799439013',
      title: 'Test Service',
      type: 'HAIRCUT',
      price: 100,
      duration: 60,
      status: 'ACTIVE'
    });
    
    await testService.save();
    console.log(`   Created test service: ${testService._id}`);
    
    // Sync views for this service
    await syncServiceViewsToMongoDB(testService._id.toString());
    
    // Verify sync
    const updatedService = await Service.findById(testService._id);
    console.log(`   MongoDB viewsCount: ${updatedService?.viewsCount}`);
    console.log(`   MongoDB views: ${updatedService?.views}`);
    
    // Clean up
    await Service.findByIdAndDelete(testService._id);
    console.log('   Test service cleaned up');
    */
    
    console.log('\n✅ Redis view tracking test completed successfully!');
    console.log('\nNote: MongoDB sync test is commented out to avoid affecting real data.');
    console.log('Uncomment the MongoDB section to test full functionality with a test database.');
    
  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Redis')) {
        console.log('\n💡 Possible fixes:');
        console.log('1. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local');
        console.log('2. Verify your Upstash Redis database is active');
        console.log('3. Check your internet connection');
      }
    }
  }
}

// Run the test
testRedisViewTracking();
