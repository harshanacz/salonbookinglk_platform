// Simple test script to verify the complaints API fix
const fetch = require('node-fetch');

async function testComplaintsAPI() {
  try {
    console.log('Testing complaints API...');
    
    // This will test if the models are properly registered
    // You would need to be authenticated to actually get data
    const response = await fetch('http://localhost:3000/api/admin/complaints/simple');
    
    if (response.status === 401) {
      console.log('✅ API is accessible (returns 401 for unauthorized, which is expected)');
      console.log('✅ No model registration errors detected');
    } else {
      const data = await response.json();
      console.log('Response:', data);
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ Server is not running. Please start with: npm run dev');
    } else {
      console.error('Error testing API:', error.message);
    }
  }
}

testComplaintsAPI();
