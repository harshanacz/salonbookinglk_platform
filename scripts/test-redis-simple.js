// Simple Redis test (run with: node scripts/test-redis-simple.js)
const { Redis } = require('@upstash/redis');

async function testRedis() {
  console.log('🧪 Testing Upstash Redis Connection...\n');

  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('✅ Redis client initialized');

    // Test basic operations
    const testKey = 'test:service:views';
    
    // Set a test value
    await redis.set(testKey, 1);
    console.log('✅ Set test value');

    // Get the value
    const value = await redis.get(testKey);
    console.log(`✅ Retrieved value: ${value}`);

    // Increment the value
    const newValue = await redis.incr(testKey);
    console.log(`✅ Incremented value: ${newValue}`);

    // Clean up
    await redis.del(testKey);
    console.log('✅ Cleaned up test key');

    console.log('\n🎉 Redis is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Redis test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Check your UPSTASH_REDIS_REST_TOKEN');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.log('\n💡 Check your UPSTASH_REDIS_REST_URL and internet connection');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testRedis();
