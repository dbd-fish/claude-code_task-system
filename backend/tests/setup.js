// Test setup file
const { connectDatabase } = require('../config/database');

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock database connection
jest.mock('../config/database', () => ({
  connectDatabase: jest.fn().mockResolvedValue(true),
}));

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
  verify: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
}));

// Mock bcrypt for testing
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Increase timeout for async operations
jest.setTimeout(10000);