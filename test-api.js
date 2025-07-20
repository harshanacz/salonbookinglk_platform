// Test the admin salon services API endpoint
const https = require('https');

async function testAPI() {
  console.log('Testing the admin salon services API...');
  
  // Using one of the salon IDs from the test
  const salonId = '682f020bcd730a47ee6c88442'; // This is actually a service ID, let me get a salon ID
  
  try {
    const response = await fetch(`http://localhost:3000/api/admin/salons/${salonId}/services`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testAPI();
