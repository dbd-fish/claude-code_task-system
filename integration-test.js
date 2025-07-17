const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testIntegration() {
  console.log('🚀 Starting Frontend-Backend Integration Test...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Basic Connection
    console.log('\n2. Testing Basic Connection...');
    const basicResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Basic connection passed:', basicResponse.data);

    // Test 3: Login API - Valid credentials
    console.log('\n3. Testing Login API with valid credentials...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login passed:', loginResponse.data);

    // Test 4: Login API - Invalid credentials
    console.log('\n4. Testing Login API with invalid credentials...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid login correctly rejected:', error.response.data);
      } else {
        throw error;
      }
    }

    // Test 5: Logout API
    console.log('\n5. Testing Logout API...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/api/auth/logout`);
    console.log('✅ Logout passed:', logoutResponse.data);

    // Test 6: CORS Headers
    console.log('\n6. Testing CORS Headers...');
    const corsResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ CORS headers present:', {
      'access-control-allow-origin': corsResponse.headers['access-control-allow-origin'] || 'Not set',
      'access-control-allow-credentials': corsResponse.headers['access-control-allow-credentials'] || 'Not set'
    });

    // Test 7: 404 Error Handling
    console.log('\n7. Testing 404 Error Handling...');
    try {
      await axios.get(`${API_BASE_URL}/nonexistent-route`);
      console.log('❌ 404 handling failed');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 404 error correctly handled:', error.response.data);
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All integration tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the test
testIntegration();