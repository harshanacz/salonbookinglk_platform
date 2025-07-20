// Test script for complaint status update functionality
// Run this from the root directory: node test-complaint-status-update.js

const BASE_URL = 'http://localhost:3000';

async function testComplaintStatusUpdate() {
  console.log('🚀 Testing Complaint Status Update API...\n');

  // You'll need to replace this with an actual complaint ID from your database
  const complaintId = 'YOUR_COMPLAINT_ID_HERE';
  
  const testCases = [
    { status: 'resolved', description: 'Resolving complaint' },
    { status: 'closed', description: 'Dismissing complaint' },
    { status: 'in-progress', description: 'Setting to in-progress' },
    { status: 'pending', description: 'Setting back to pending' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 ${testCase.description}...`);
      
      const response = await fetch(`${BASE_URL}/api/admin/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // You'll need to add authentication headers here if testing manually
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
        body: JSON.stringify({ status: testCase.status }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success: ${testCase.description}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.message}\n`);
      } else {
        console.log(`❌ Failed: ${testCase.description}`);
        console.log(`   Error: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`❌ Network Error for ${testCase.description}:`);
      console.log(`   ${error.message}\n`);
    }
  }
}

// Test invalid status
async function testInvalidStatus() {
  console.log('🧪 Testing invalid status...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/complaints/YOUR_COMPLAINT_ID_HERE`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'invalid-status' }),
    });

    const result = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Correctly rejected invalid status');
      console.log(`   Error: ${result.error}\n`);
    } else {
      console.log('❌ Should have rejected invalid status');
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

// Run tests
if (require.main === module) {
  console.log('⚠️  Please update the complaintId variable with a real ID before running this test.\n');
  // Uncomment the lines below after updating the complaint ID
  // testComplaintStatusUpdate();
  // testInvalidStatus();
}

module.exports = { testComplaintStatusUpdate, testInvalidStatus };
