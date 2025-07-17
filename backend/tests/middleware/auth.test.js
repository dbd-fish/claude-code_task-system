const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { authMiddleware } = require('../../middleware/auth');

// Mock dependencies
jest.mock('../../models');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    test('should authenticate user with valid token', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isActive: true
      };

      req.headers.authorization = 'Bearer valid-jwt-token';
      
      jwt.verify.mockReturnValue({ userId: 1 });
      User.findByPk.mockResolvedValue(mockUser);

      await authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-jwt-token', expect.any(String));
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] }
      });
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should return 401 for missing authorization header', async () => {
      // No authorization header

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for malformed authorization header', async () => {
      req.headers.authorization = 'InvalidFormat';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for expired token', async () => {
      req.headers.authorization = 'Bearer expired-token';
      
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for non-existent user', async () => {
      req.headers.authorization = 'Bearer valid-jwt-token';
      
      jwt.verify.mockReturnValue({ userId: 999 });
      User.findByPk.mockResolvedValue(null);

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found or inactive'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      req.headers.authorization = 'Bearer valid-jwt-token';
      
      jwt.verify.mockReturnValue({ userId: 1 });
      User.findByPk.mockRejectedValue(new Error('Database error'));

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});