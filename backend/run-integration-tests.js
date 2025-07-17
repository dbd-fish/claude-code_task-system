const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Integration Test Suite...\n');

// Test configuration
const testConfig = {
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
};

// Test files to run
const testFiles = [
  'tests/integration/server/app.integration.test.js',
  'tests/integration/api/auth.integration.test.js',
  'tests/integration/api/tasks.integration.test.js',
  'tests/integration/database/models.integration.test.js',
  'tests/integration/e2e/userWorkflow.integration.test.js'
];

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running: ${testFile}`);
    console.log('─'.repeat(50));
    
    const jest = spawn('npx', [
      'jest',
      testFile,
      '--testTimeout=30000',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} - PASSED`);
        resolve();
      } else {
        console.log(`❌ ${testFile} - FAILED (exit code: ${code})`);
        resolve(); // Continue with other tests even if one fails
      }
    });

    jest.on('error', (error) => {
      console.error(`❌ Error running ${testFile}:`, error.message);
      resolve(); // Continue with other tests
    });
  });
}

async function runAllTests() {
  console.log('Integration Test Suite');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  // Run tests sequentially to avoid database conflicts
  for (const testFile of testFiles) {
    await runTest(testFile);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(50));
  console.log(`🏁 Integration Test Suite Completed in ${duration}s`);
  console.log('='.repeat(50));
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n❌ Integration tests interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n❌ Integration tests terminated');
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Integration test suite failed:', error);
  process.exit(1);
});