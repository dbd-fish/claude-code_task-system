const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { register, login, getProfile, updateProfile, logout } = require('../../controllers/authController');

// Mock dependencies
jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: { id: 1, name: 'Test User', email: 'test@example.com' }
      });
    });

    test('should return 400 for missing required fields', async () => {
      req.body = {
        email: 'test@example.com'
        // Missing name and password
      };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Name, email, and password are required'
      });
    });

    test('should return 400 for invalid email format', async () => {
      req.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Please provide a valid email address'
      });
    });

    test('should return 400 for short password', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Password must be at least 6 characters long'
      });
    });

    test('should return 400 for existing user', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User already exists with this email'
      });
    });
  });

  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-jwt-token');

      await login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        token: 'mocked-jwt-token'
      });
    });

    test('should return 400 for missing email', async () => {
      req.body = {
        password: 'password123'
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required'
      });
    });

    test('should return 400 for missing password', async () => {
      req.body = {
        email: 'test@example.com'
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required'
      });
    });

    test('should return 401 for non-existent user', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    test('should return 401 for invalid password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });
  });

  describe('getProfile', () => {
    test('should return user profile', async () => {
      req.user = { id: 1, email: 'test@example.com' };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      User.findByPk.mockResolvedValue(mockUser);

      await getProfile(req, res, next);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser
      });
    });

    test('should return 404 for non-existent user', async () => {
      req.user = { id: 999, email: 'test@example.com' };

      User.findByPk.mockResolvedValue(null);

      await getProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('updateProfile', () => {
    test('should update user profile', async () => {
      req.user = { id: 1, email: 'test@example.com' };
      req.body = { name: 'Updated Name' };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        update: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Updated Name',
          email: 'test@example.com'
        })
      };

      User.findByPk.mockResolvedValue(mockUser);

      await updateProfile(req, res, next);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: { id: 1, name: 'Updated Name', email: 'test@example.com' }
      });
    });

    test('should return 404 for non-existent user', async () => {
      req.user = { id: 999, email: 'test@example.com' };
      req.body = { name: 'Updated Name' };

      User.findByPk.mockResolvedValue(null);

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('logout', () => {
    test('should logout successfully', async () => {
      await logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
    });
  });
});