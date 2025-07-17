const { sequelize } = require('../../config/database');
const { User, Task } = require('../../models');

// Test database setup and teardown
const setupTestDatabase = async () => {
  try {
    // Force sync to recreate tables
    await sequelize.sync({ force: true });
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
};

const teardownTestDatabase = async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    console.log('Test database teardown completed');
  } catch (error) {
    console.error('Test database teardown failed:', error);
  }
};

const cleanupTestData = async () => {
  try {
    // Delete all test data
    await Task.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('Test data cleanup completed');
  } catch (error) {
    console.error('Test data cleanup failed:', error);
  }
};

// Test data factories
const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'User',
    isActive: true
  };

  return await User.create({
    ...defaultUserData,
    ...userData
  });
};

const createTestTask = async (taskData = {}, user = null) => {
  if (!user) {
    user = await createTestUser();
  }

  const defaultTaskData = {
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    userId: user.id
  };

  return await Task.create({
    ...defaultTaskData,
    ...taskData
  });
};

const createMultipleTestTasks = async (count = 3, user = null) => {
  if (!user) {
    user = await createTestUser();
  }

  const tasks = [];
  for (let i = 0; i < count; i++) {
    const task = await createTestTask({
      title: `Test Task ${i + 1}`,
      description: `Test task description ${i + 1}`,
      status: ['pending', 'in_progress', 'completed'][i % 3],
      priority: ['low', 'medium', 'high'][i % 3]
    }, user);
    tasks.push(task);
  }

  return tasks;
};

// Authentication helpers
const loginUser = async (request, userData = {}) => {
  const user = await createTestUser(userData);
  
  const response = await request
    .post('/api/auth/login')
    .send({
      username: user.username,
      password: 'password123' // This should match the original password before hashing
    });

  return {
    user,
    token: response.body.token,
    loginResponse: response
  };
};

const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`
});

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  cleanupTestData,
  createTestUser,
  createTestTask,
  createMultipleTestTasks,
  loginUser,
  getAuthHeaders
};