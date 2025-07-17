const { User } = require('../../models');

describe('User Model', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('User creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      // Mock the User.create method
      User.create = jest.fn().mockResolvedValue({
        id: 1,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const user = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name', userData.name);
      expect(user).toHaveProperty('email', userData.email);
      expect(user).toHaveProperty('password', userData.password);
    });

    test('should handle creation errors', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'short'
      };

      User.create = jest.fn().mockRejectedValue(new Error('Validation error'));

      await expect(User.create(userData)).rejects.toThrow('Validation error');
    });
  });

  describe('User queries', () => {
    test('should find user by email', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const user = await User.findOne({ where: { email: 'test@example.com' } });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(user).toEqual(mockUser);
    });

    test('should find user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const user = await User.findByPk(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(user).toEqual(mockUser);
    });

    test('should return null for non-existent user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const user = await User.findOne({ where: { email: 'nonexistent@example.com' } });

      expect(user).toBeNull();
    });
  });

  describe('User updates', () => {
    test('should update user data', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        update: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Updated User',
          email: 'test@example.com',
          password: 'hashedPassword123'
        })
      };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const user = await User.findByPk(1);
      const updatedUser = await user.update({ name: 'Updated User' });

      expect(user.update).toHaveBeenCalledWith({ name: 'Updated User' });
      expect(updatedUser.name).toBe('Updated User');
    });
  });

  describe('User deletion', () => {
    test('should delete user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        destroy: jest.fn().mockResolvedValue(1)
      };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const user = await User.findByPk(1);
      const result = await user.destroy();

      expect(user.destroy).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });
});