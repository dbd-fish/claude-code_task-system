const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Integration Test Suite...\n');

// Test files to validate
const testFiles = [
  'tests/integration/setup.js',
  'tests/integration/globalSetup.js',
  'tests/integration/globalTeardown.js',
  'tests/integration/api/auth.integration.test.js',
  'tests/integration/api/tasks.integration.test.js',
  'tests/integration/database/models.integration.test.js',
  'tests/integration/e2e/userWorkflow.integration.test.js',
  'tests/integration/e2e/realApi.integration.test.js',
  'tests/integration/server/app.integration.test.js'
];

// Configuration files
const configFiles = [
  'jest.integration.config.js',
  'package.json'
];

function validateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.trim().length === 0) {
      console.log(`⚠️  Empty: ${filePath}`);
      return false;
    }
    
    // Basic syntax validation for JavaScript files
    if (filePath.endsWith('.js')) {
      // Check for basic test structure
      if (filePath.includes('test.js') && !content.includes('describe')) {
        console.log(`⚠️  No test structure: ${filePath}`);
        return false;
      }
    }
    
    console.log(`✅ Valid: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

function validateTestStructure() {
  console.log('📋 Validating Test Files:');
  console.log('─'.repeat(40));
  
  let validFiles = 0;
  let totalFiles = 0;
  
  for (const file of testFiles) {
    totalFiles++;
    if (validateFile(file)) {
      validFiles++;
    }
  }
  
  console.log('\n📋 Validating Configuration Files:');
  console.log('─'.repeat(40));
  
  for (const file of configFiles) {
    totalFiles++;
    if (validateFile(file)) {
      validFiles++;
    }
  }
  
  console.log('\n' + '='.repeat(40));
  console.log(`📊 Validation Results: ${validFiles}/${totalFiles} files valid`);
  console.log('='.repeat(40));
  
  return validFiles === totalFiles;
}

function analyzeTestCoverage() {
  console.log('\n🔍 Test Coverage Analysis:');
  console.log('─'.repeat(40));
  
  const testTypes = {
    'API Tests': ['api/auth.integration.test.js', 'api/tasks.integration.test.js'],
    'Database Tests': ['database/models.integration.test.js'],
    'E2E Tests': ['e2e/userWorkflow.integration.test.js', 'e2e/realApi.integration.test.js'],
    'Server Tests': ['server/app.integration.test.js']
  };
  
  for (const [type, files] of Object.entries(testTypes)) {
    console.log(`\n${type}:`);
    for (const file of files) {
      const fullPath = path.join(__dirname, 'tests/integration', file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const testCount = (content.match(/it\(|test\(/g) || []).length;
        const describeCount = (content.match(/describe\(/g) || []).length;
        console.log(`  ✅ ${file}: ${testCount} tests, ${describeCount} suites`);
      } else {
        console.log(`  ❌ ${file}: Missing`);
      }
    }
  }
}

function checkDependencies() {
  console.log('\n📦 Checking Dependencies:');
  console.log('─'.repeat(40));
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const devDeps = packageJson.devDependencies || {};
    
    const requiredDeps = ['jest', 'supertest', 'axios'];
    
    for (const dep of requiredDeps) {
      if (devDeps[dep]) {
        console.log(`✅ ${dep}: ${devDeps[dep]}`);
      } else {
        console.log(`❌ ${dep}: Missing`);
      }
    }
    
    // Check scripts
    const scripts = packageJson.scripts || {};
    const requiredScripts = ['test', 'test:integration'];
    
    console.log('\n📋 Test Scripts:');
    for (const script of requiredScripts) {
      if (scripts[script]) {
        console.log(`✅ ${script}: ${scripts[script]}`);
      } else {
        console.log(`❌ ${script}: Missing`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
  }
}

function generateTestReport() {
  console.log('\n📊 Integration Test Report:');
  console.log('='.repeat(50));
  
  let totalTests = 0;
  let totalSuites = 0;
  
  for (const file of testFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const testCount = (content.match(/it\(|test\(/g) || []).length;
        const suiteCount = (content.match(/describe\(/g) || []).length;
        totalTests += testCount;
        totalSuites += suiteCount;
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
  
  console.log(`📁 Test Files: ${testFiles.length}`);
  console.log(`📋 Test Suites: ${totalSuites}`);
  console.log(`🧪 Individual Tests: ${totalTests}`);
  console.log(`🎯 Test Categories: API, Database, E2E, Server`);
  console.log(`⚙️  Configuration: Jest + Supertest + Axios`);
  console.log('='.repeat(50));
}

// Run validation
async function runValidation() {
  const isValid = validateTestStructure();
  analyzeTestCoverage();
  checkDependencies();
  generateTestReport();
  
  if (isValid) {
    console.log('\n🎉 Integration test suite validation completed successfully!');
    console.log('✅ All test files are present and valid');
    console.log('🚀 Ready to run integration tests');
  } else {
    console.log('\n⚠️  Integration test suite validation found issues');
    console.log('❌ Some test files are missing or invalid');
    console.log('🔧 Please review and fix the issues above');
  }
  
  return isValid;
}

// Run the validation
runValidation().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});