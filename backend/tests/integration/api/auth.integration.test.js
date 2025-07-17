const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../../index');
const { cleanupTestData, createTestUser, getAuthHeaders } = require('../setup');

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          email: 'user2@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          username: 'user2'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await createTestUser({
        username: 'loginuser',
        email: 'loginuser@example.com',
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'loginuser');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should login with email instead of username', async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await createTestUser({
        username: 'emaillogin',
        email: 'emaillogin@example.com',
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'emaillogin@example.com', // Using email as username
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.user).toHaveProperty('email', 'emaillogin@example.com');
    });

    it('should return 400 for invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await createTestUser({
        username: 'testuser',
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for inactive user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await createTestUser({
        username: 'inactiveuser',
        password: hashedPassword,
        isActive: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'inactiveuser',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Account is inactive');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await createTestUser({
        username: 'profileuser',
        email: 'profileuser@example.com',
        password: hashedPassword
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'profileuser',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'profileuser');
      expect(response.body.user).toHaveProperty('email', 'profileuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await createTestUser({
        username: 'updateuser',
        email: 'updateuser@example.com',
        password: hashedPassword,
        firstName: 'Old',
        lastName: 'Name'
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'updateuser',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeaders(token))
        .send({
          firstName: 'New',
          lastName: 'Name',
          email: 'newemail@example.com'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user).toHaveProperty('firstName', 'New');
      expect(response.body.user).toHaveProperty('lastName', 'Name');
      expect(response.body.user).toHaveProperty('email', 'newemail@example.com');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          firstName: 'New'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create first user
      await createTestUser({
        username: 'user1',
        email: 'user1@example.com',
        password: hashedPassword
      });

      // Create second user
      const user2 = await createTestUser({
        username: 'user2',
        email: 'user2@example.com',
        password: hashedPassword
      });

      // Login as second user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'user2',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      // Try to update to first user's email
      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeaders(token))
        .send({
          email: 'user1@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already in use');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await createTestUser({
        username: 'logoutuser',
        password: hashedPassword
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logoutuser',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});