export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/app'],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/']
};