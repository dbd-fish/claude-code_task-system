const axios = require('axios');
const { spawn } = require('child_process');
const { cleanupTestData, setupTestDatabase } = require('../setup');

describe('Real API Integration Tests', () => {
  let serverProcess;
  let baseURL;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Start the server for real API testing
    baseURL = 'http://localhost:5001'; // Use different port for tests
    
    return new Promise((resolve, reject) => {
      serverProcess = spawn('node', ['index.js'], {
        env: { 
          ...process.env, 
          PORT: '5001', 
          NODE_ENV: 'test' 
        },
        stdio: 'inherit'
      });

      // Wait for server to start
      setTimeout(async () => {
        try {
          await axios.get(`${baseURL}/health`);
          resolve();
        } catch (error) {
          reject(new Error('Server failed to start'));
        }
      }, 3000);
    });
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Stop the server
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('Real API Authentication Flow', () => {
    it('should complete full authentication flow with real API', async () => {
      // Test registration
      const registrationData = {
        username: 'realuser',
        email: 'realuser@example.com',
        password: 'password123',
        firstName: 'Real',
        lastName: 'User'
      };

      const registerResponse = await axios.post(
        `${baseURL}/api/auth/register`,
        registrationData
      );

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.data.message).toBe('User registered successfully');
      expect(registerResponse.data.user.username).toBe(registrationData.username);
      expect(registerResponse.data.token).toBeDefined();

      const authToken = registerResponse.data.token;

      // Test login
      const loginResponse = await axios.post(
        `${baseURL}/api/auth/login`,
        {
          username: registrationData.username,
          password: registrationData.password
        }
      );

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.message).toBe('Login successful');
      expect(loginResponse.data.token).toBeDefined();

      const loginToken = loginResponse.data.token;

      // Test profile access
      const profileResponse = await axios.get(
        `${baseURL}/api/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${loginToken}`
          }
        }
      );

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.user.username).toBe(registrationData.username);
      expect(profileResponse.data.user.email).toBe(registrationData.email);

      // Test logout
      const logoutResponse = await axios.post(
        `${baseURL}/api/auth/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${loginToken}`
          }
        }
      );

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data.message).toBe('Logged out successfully');
    });

    it('should handle authentication errors with real API', async () => {
      // Test login with invalid credentials
      try {
        await axios.post(`${baseURL}/api/auth/login`, {
          username: 'nonexistent',
          password: 'wrongpassword'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Invalid credentials');
      }

      // Test accessing protected route without token
      try {
        await axios.get(`${baseURL}/api/auth/profile`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('No token provided');
      }

      // Test accessing protected route with invalid token
      try {
        await axios.get(`${baseURL}/api/auth/profile`, {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Invalid token');
      }
    });
  });

  describe('Real API Task Management Flow', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login a user for task tests
      const registrationData = {
        username: 'taskuser',
        email: 'taskuser@example.com',
        password: 'password123'
      };

      const registerResponse = await axios.post(
        `${baseURL}/api/auth/register`,
        registrationData
      );

      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
    });

    it('should complete full task management flow with real API', async () => {
      // Create a task
      const taskData = {
        title: 'Real API Task',
        description: 'Task created through real API',
        priority: 'high',
        dueDate: '2024-12-31'
      };

      const createResponse = await axios.post(
        `${baseURL}/api/tasks`,
        taskData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.data.message).toBe('Task created successfully');
      expect(createResponse.data.task.title).toBe(taskData.title);
      expect(createResponse.data.task.userId).toBe(userId);

      const taskId = createResponse.data.task.id;

      // Get all tasks
      const getTasksResponse = await axios.get(
        `${baseURL}/api/tasks`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(getTasksResponse.status).toBe(200);
      expect(getTasksResponse.data.tasks).toHaveLength(1);
      expect(getTasksResponse.data.tasks[0].id).toBe(taskId);

      // Get specific task
      const getTaskResponse = await axios.get(
        `${baseURL}/api/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(getTaskResponse.status).toBe(200);
      expect(getTaskResponse.data.task.id).toBe(taskId);
      expect(getTaskResponse.data.task.title).toBe(taskData.title);

      // Update task
      const updateData = {
        title: 'Updated Real API Task',
        status: 'completed',
        priority: 'medium'
      };

      const updateResponse = await axios.put(
        `${baseURL}/api/tasks/${taskId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.message).toBe('Task updated successfully');
      expect(updateResponse.data.task.title).toBe(updateData.title);
      expect(updateResponse.data.task.status).toBe(updateData.status);

      // Get task statistics
      const statsResponse = await axios.get(
        `${baseURL}/api/tasks/stats`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.data.stats.total).toBe(1);
      expect(statsResponse.data.stats.completed).toBe(1);

      // Delete task
      const deleteResponse = await axios.delete(
        `${baseURL}/api/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.message).toBe('Task deleted successfully');

      // Verify task is deleted
      try {
        await axios.get(
          `${baseURL}/api/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle task errors with real API', async () => {
      // Test creating task without title
      try {
        await axios.post(
          `${baseURL}/api/tasks`,
          {
            description: 'Task without title'
          },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Title is required');
      }

      // Test accessing non-existent task
      try {
        await axios.get(
          `${baseURL}/api/tasks/999999`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Real API Server Health', () => {
    it('should respond to health check', async () => {
      const response = await axios.get(`${baseURL}/health`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('OK');
      expect(response.data.timestamp).toBeDefined();
    });

    it('should respond to root endpoint', async () => {
      const response = await axios.get(`${baseURL}/`);

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Node.js + Express server is running!');
    });

    it('should return 404 for non-existent routes', async () => {
      try {
        await axios.get(`${baseURL}/non-existent-route`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Route not found');
      }
    });
  });

  describe('Real API Error Handling', () => {
    it('should handle malformed JSON', async () => {
      try {
        await axios.post(
          `${baseURL}/api/auth/register`,
          'invalid json string',
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle CORS properly', async () => {
      const response = await axios.options(`${baseURL}/api/auth/register`);
      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});