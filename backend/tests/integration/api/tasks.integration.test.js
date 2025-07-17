const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../../index');
const { cleanupTestData, createTestUser, createTestTask, createMultipleTestTasks, getAuthHeaders } = require('../setup');

describe('Tasks API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await cleanupTestData();
    
    // Create a test user and get auth token
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await createTestUser({
      username: 'taskuser',
      email: 'taskuser@example.com',
      password: hashedPassword
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'taskuser',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        dueDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task).toHaveProperty('title', taskData.title);
      expect(response.body.task).toHaveProperty('description', taskData.description);
      expect(response.body.task).toHaveProperty('priority', taskData.priority);
      expect(response.body.task).toHaveProperty('status', 'pending');
      expect(response.body.task).toHaveProperty('userId', testUser.id);
    });

    it('should create task with minimal required data', async () => {
      const taskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(201);

      expect(response.body.task).toHaveProperty('title', taskData.title);
      expect(response.body.task).toHaveProperty('priority', 'medium'); // default
      expect(response.body.task).toHaveProperty('status', 'pending'); // default
    });

    it('should return 400 for missing title', async () => {
      const taskData = {
        description: 'Task without title'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 for empty title', async () => {
      const taskData = {
        title: '   ' // whitespace only
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 for title too long', async () => {
      const taskData = {
        title: 'a'.repeat(201) // 201 characters
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('200 characters or less');
    });

    it('should return 400 for invalid priority', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Priority must be one of');
    });

    it('should return 400 for invalid due date', async () => {
      const taskData = {
        title: 'Test Task',
        dueDate: 'invalid-date'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authToken))
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid due date format');
    });

    it('should return 401 for unauthenticated request', async () => {
      const taskData = {
        title: 'Test Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      // Create test tasks
      await createMultipleTestTasks(3, testUser);

      const response = await request(app)
        .get('/api/tasks')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.tasks[0]).toHaveProperty('title');
      expect(response.body.tasks[0]).toHaveProperty('status');
      expect(response.body.tasks[0]).toHaveProperty('priority');
      expect(response.body.tasks[0]).toHaveProperty('userId', testUser.id);
    });

    it('should return empty array for user with no tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body.tasks).toHaveLength(0);
    });

    it('should filter tasks by status', async () => {
      // Create tasks with different statuses
      await createTestTask({ title: 'Pending Task', status: 'pending' }, testUser);
      await createTestTask({ title: 'Completed Task', status: 'completed' }, testUser);
      await createTestTask({ title: 'In Progress Task', status: 'in_progress' }, testUser);

      const response = await request(app)
        .get('/api/tasks?status=completed')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0]).toHaveProperty('status', 'completed');
    });

    it('should filter tasks by priority', async () => {
      // Create tasks with different priorities
      await createTestTask({ title: 'Low Priority', priority: 'low' }, testUser);
      await createTestTask({ title: 'High Priority', priority: 'high' }, testUser);
      await createTestTask({ title: 'Medium Priority', priority: 'medium' }, testUser);

      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0]).toHaveProperty('priority', 'high');
    });

    it('should sort tasks by due date', async () => {
      // Create tasks with different due dates
      await createTestTask({ 
        title: 'Future Task', 
        dueDate: new Date('2024-12-31') 
      }, testUser);
      await createTestTask({ 
        title: 'Near Task', 
        dueDate: new Date('2024-01-15') 
      }, testUser);
      await createTestTask({ 
        title: 'Past Task', 
        dueDate: new Date('2023-12-01') 
      }, testUser);

      const response = await request(app)
        .get('/api/tasks?sortBy=dueDate')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body.tasks).toHaveLength(3);
      // Should be sorted by due date (assuming ascending order)
      expect(new Date(response.body.tasks[0].dueDate)).toBeLessThan(
        new Date(response.body.tasks[1].dueDate)
      );
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a specific task by ID', async () => {
      const task = await createTestTask({ title: 'Specific Task' }, testUser);

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toHaveProperty('task');
      expect(response.body.task).toHaveProperty('id', task.id);
      expect(response.body.task).toHaveProperty('title', 'Specific Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/999999')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 403 for task belonging to another user', async () => {
      // Create another user and their task
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: hashedPassword
      });
      const otherTask = await createTestTask({ title: 'Other User Task' }, otherUser);

      const response = await request(app)
        .get(`/api/tasks/${otherTask.id}`)
        .set(getAuthHeaders(authToken))
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('access');
    });

    it('should return 401 for unauthenticated request', async () => {
      const task = await createTestTask({ title: 'Test Task' }, testUser);

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task successfully', async () => {
      const task = await createTestTask({ 
        title: 'Original Title',
        status: 'pending',
        priority: 'medium'
      }, testUser);

      const updateData = {
        title: 'Updated Title',
        status: 'completed',
        priority: 'high',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set(getAuthHeaders(authToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(response.body.task).toHaveProperty('title', updateData.title);
      expect(response.body.task).toHaveProperty('status', updateData.status);
      expect(response.body.task).toHaveProperty('priority', updateData.priority);
      expect(response.body.task).toHaveProperty('description', updateData.description);
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/tasks/999999')
        .set(getAuthHeaders(authToken))
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 403 for task belonging to another user', async () => {
      // Create another user and their task
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherUser = await createTestUser({
        username: 'otheruser2',
        email: 'other2@example.com',
        password: hashedPassword
      });
      const otherTask = await createTestTask({ title: 'Other User Task' }, otherUser);

      const updateData = {
        title: 'Attempted Update'
      };

      const response = await request(app)
        .put(`/api/tasks/${otherTask.id}`)
        .set(getAuthHeaders(authToken))
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('access');
    });

    it('should return 401 for unauthenticated request', async () => {
      const task = await createTestTask({ title: 'Test Task' }, testUser);

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      const task = await createTestTask({ title: 'Task to Delete' }, testUser);

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');

      // Verify task is deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set(getAuthHeaders(authToken))
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/999999')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 403 for task belonging to another user', async () => {
      // Create another user and their task
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherUser = await createTestUser({
        username: 'otheruser3',
        email: 'other3@example.com',
        password: hashedPassword
      });
      const otherTask = await createTestTask({ title: 'Other User Task' }, otherUser);

      const response = await request(app)
        .delete(`/api/tasks/${otherTask.id}`)
        .set(getAuthHeaders(authToken))
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('access');
    });

    it('should return 401 for unauthenticated request', async () => {
      const task = await createTestTask({ title: 'Test Task' }, testUser);

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return task statistics for authenticated user', async () => {
      // Create tasks with different statuses
      await createTestTask({ title: 'Pending 1', status: 'pending' }, testUser);
      await createTestTask({ title: 'Pending 2', status: 'pending' }, testUser);
      await createTestTask({ title: 'Completed 1', status: 'completed' }, testUser);
      await createTestTask({ title: 'In Progress 1', status: 'in_progress' }, testUser);

      const response = await request(app)
        .get('/api/tasks/stats')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('total', 4);
      expect(response.body.stats).toHaveProperty('pending', 2);
      expect(response.body.stats).toHaveProperty('completed', 1);
      expect(response.body.stats).toHaveProperty('in_progress', 1);
    });

    it('should return zero stats for user with no tasks', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body.stats).toHaveProperty('total', 0);
      expect(response.body.stats).toHaveProperty('pending', 0);
      expect(response.body.stats).toHaveProperty('completed', 0);
      expect(response.body.stats).toHaveProperty('in_progress', 0);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});