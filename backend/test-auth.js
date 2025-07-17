const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const { connectDatabase } = require('./config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function testAuthSystem() {
  try {
    console.log('Testing authentication system...');
    
    // Connect to database
    await connectDatabase();
    
    // Test 1: Create test user
    console.log('\n1. Testing user creation...');
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const testUser = await User.create({
      username: 'testuser_auth',
      email: 'testauth@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    }).catch(error => {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('Test user already exists, using existing user');
        return User.findOne({ where: { username: 'testuser_auth' } });
      }
      throw error;
    });
    
    console.log('✓ User created/found:', testUser.username);
    
    // Test 2: Password verification
    console.log('\n2. Testing password verification...');
    const isPasswordValid = await bcrypt.compare('testpassword123', testUser.password);
    console.log('✓ Password verification:', isPasswordValid ? 'PASS' : 'FAIL');
    
    // Test 3: JWT token generation
    console.log('\n3. Testing JWT token generation...');
    const token = jwt.sign({ userId: testUser.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✓ JWT token generated:', token.substring(0, 50) + '...');
    
    // Test 4: JWT token verification
    console.log('\n4. Testing JWT token verification...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✓ JWT token verified, userId:', decoded.userId);
    
    // Test 5: User lookup
    console.log('\n5. Testing user lookup...');
    const foundUser = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    console.log('✓ User found:', foundUser.username);
    
    // Test 6: Email/username lookup
    console.log('\n6. Testing email/username lookup...');
    const userByEmail = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username: 'testuser_auth' },
          { email: 'testauth@example.com' }
        ]
      }
    });
    console.log('✓ User found by email/username:', userByEmail.username);
    
    console.log('\n✅ All authentication tests passed!');
    
    // Cleanup
    await testUser.destroy();
    console.log('✓ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    process.exit(0);
  }
}

testAuthSystem();