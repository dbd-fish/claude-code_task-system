const request = require('supertest');
const app = require('../../../index');
const { cleanupTestData } = require('../setup');

describe('End-to-End User Workflow Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Complete User Registration and Task Management Flow', () => {
    it('should complete full user workflow from registration to task management', async () => {
      // 1. Register a new user
      const registrationData = {
        username: 'workflowuser',
        email: 'workflow@example.com',
        password: 'password123',
        firstName: 'Workflow',
        lastName: 'User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      expect(registerResponse.body.message).toBe('User registered successfully');
      expect(registerResponse.body.user.username).toBe(registrationData.username);
      expect(registerResponse.body.token).toBeDefined();

      const authToken = registerResponse.body.token;
      const userId = registerResponse.body.user.id;

      // 2. Verify user can access their profile
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.user.id).toBe(userId);
      expect(profileResponse.body.user.username).toBe(registrationData.username);

      // 3. Create multiple tasks
      const task1Data = {
        title: 'First Task',
        description: 'Description for first task',
        priority: 'high',
        dueDate: '2024-12-31'
      };

      const task1Response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(task1Data)
        .expect(201);

      expect(task1Response.body.message).toBe('Task created successfully');
      expect(task1Response.body.task.title).toBe(task1Data.title);
      expect(task1Response.body.task.status).toBe('pending');
      expect(task1Response.body.task.userId).toBe(userId);

      const task1Id = task1Response.body.task.id;

      const task2Data = {
        title: 'Second Task',
        description: 'Description for second task',
        priority: 'medium'
      };

      const task2Response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(task2Data)
        .expect(201);

      const task2Id = task2Response.body.task.id;

      // 4. Retrieve all tasks
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(allTasksResponse.body.tasks).toHaveLength(2);
      expect(allTasksResponse.body.tasks.find(t => t.id === task1Id)).toBeDefined();
      expect(allTasksResponse.body.tasks.find(t => t.id === task2Id)).toBeDefined();

      // 5. Update first task to in_progress
      const task1UpdateData = {
        status: 'in_progress',
        description: 'Updated description for first task'
      };

      const task1UpdateResponse = await request(app)
        .put(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(task1UpdateData)
        .expect(200);

      expect(task1UpdateResponse.body.message).toBe('Task updated successfully');
      expect(task1UpdateResponse.body.task.status).toBe('in_progress');
      expect(task1UpdateResponse.body.task.description).toBe(task1UpdateData.description);

      // 6. Complete second task
      const task2UpdateData = {
        status: 'completed'
      };

      await request(app)
        .put(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(task2UpdateData)
        .expect(200);

      // 7. Check task statistics
      const statsResponse = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statsResponse.body.stats).toEqual({
        total: 2,
        pending: 0,
        in_progress: 1,
        completed: 1
      });

      // 8. Filter tasks by status
      const completedTasksResponse = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(completedTasksResponse.body.tasks).toHaveLength(1);
      expect(completedTasksResponse.body.tasks[0].id).toBe(task2Id);
      expect(completedTasksResponse.body.tasks[0].status).toBe('completed');

      const inProgressTasksResponse = await request(app)
        .get('/api/tasks?status=in_progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(inProgressTasksResponse.body.tasks).toHaveLength(1);
      expect(inProgressTasksResponse.body.tasks[0].id).toBe(task1Id);
      expect(inProgressTasksResponse.body.tasks[0].status).toBe('in_progress');

      // 9. Update user profile
      const profileUpdateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com'
      };

      const profileUpdateResponse = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileUpdateData)
        .expect(200);

      expect(profileUpdateResponse.body.message).toBe('Profile updated successfully');
      expect(profileUpdateResponse.body.user.firstName).toBe(profileUpdateData.firstName);
      expect(profileUpdateResponse.body.user.lastName).toBe(profileUpdateData.lastName);
      expect(profileUpdateResponse.body.user.email).toBe(profileUpdateData.email);

      // 10. Delete one task
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Task deleted successfully');

      // 11. Verify task was deleted
      const finalTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalTasksResponse.body.tasks).toHaveLength(1);
      expect(finalTasksResponse.body.tasks[0].id).toBe(task1Id);

      // 12. Verify deleted task returns 404
      await request(app)
        .get(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // 13. Logout user
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(logoutResponse.body.message).toBe('Logged out successfully');
    });

    it('should handle user isolation correctly', async () => {
      // Create two users
      const user1Data = {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      };

      const user2Data = {
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      };

      // Register both users
      const user1Response = await request(app)
        .post('/api/auth/register')
        .send(user1Data)
        .expect(201);

      const user2Response = await request(app)
        .post('/api/auth/register')
        .send(user2Data)
        .expect(201);

      const user1Token = user1Response.body.token;
      const user2Token = user2Response.body.token;

      // User 1 creates a task
      const user1TaskResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Task',
          description: 'Task belonging to user 1'
        })
        .expect(201);

      const user1TaskId = user1TaskResponse.body.task.id;

      // User 2 creates a task
      const user2TaskResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'User 2 Task',
          description: 'Task belonging to user 2'
        })
        .expect(201);

      const user2TaskId = user2TaskResponse.body.task.id;

      // User 1 should only see their own tasks
      const user1TasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(user1TasksResponse.body.tasks).toHaveLength(1);
      expect(user1TasksResponse.body.tasks[0].id).toBe(user1TaskId);
      expect(user1TasksResponse.body.tasks[0].title).toBe('User 1 Task');

      // User 2 should only see their own tasks
      const user2TasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user2TasksResponse.body.tasks).toHaveLength(1);
      expect(user2TasksResponse.body.tasks[0].id).toBe(user2TaskId);
      expect(user2TasksResponse.body.tasks[0].title).toBe('User 2 Task');

      // User 1 should not be able to access User 2's task
      await request(app)
        .get(`/api/tasks/${user2TaskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      // User 2 should not be able to access User 1's task
      await request(app)
        .get(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      // User 1 should not be able to update User 2's task
      await request(app)
        .put(`/api/tasks/${user2TaskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Hacked task' })
        .expect(403);

      // User 1 should not be able to delete User 2's task
      await request(app)
        .delete(`/api/tasks/${user2TaskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      // Verify task statistics are user-specific
      const user1StatsResponse = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(user1StatsResponse.body.stats.total).toBe(1);

      const user2StatsResponse = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user2StatsResponse.body.stats.total).toBe(1);
    });

    it('should handle authentication edge cases', async () => {
      // Test with expired/invalid token
      const invalidToken = 'invalid.jwt.token';

      await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ title: 'Test Task' })
        .expect(401);

      // Test with malformed authorization header
      await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      // Test with missing authorization header
      await request(app)
        .get('/api/tasks')
        .expect(401);
    });
  });
});