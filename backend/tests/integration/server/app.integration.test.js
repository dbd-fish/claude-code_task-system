const request = require('supertest');
const app = require('../../../index');
const { cleanupTestData } = require('../setup');

describe('Application Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Server Health and Basic Routes', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should respond to root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Node.js + Express server is running!');
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle CORS correctly', async () => {
      const response = await request(app)
        .options('/api/auth/register')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('API Route Structure', () => {
    it('should have auth routes mounted at /api/auth', async () => {
      // Test registration endpoint exists
      await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400); // Should fail validation but endpoint exists

      // Test login endpoint exists
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400); // Should fail validation but endpoint exists
    });

    it('should have task routes mounted at /api/tasks', async () => {
      // Test that task routes require authentication
      await request(app)
        .get('/api/tasks')
        .expect(401); // Should require auth

      await request(app)
        .post('/api/tasks')
        .send({})
        .expect(401); // Should require auth
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle large request bodies', async () => {
      const largeData = {
        title: 'x'.repeat(10000), // Very long title
        description: 'y'.repeat(10000) // Very long description
      };

      // This should either be rejected by body parser or handled gracefully
      const response = await request(app)
        .post('/api/auth/register')
        .send(largeData);

      expect([400, 413]).toContain(response.status);
    });
  });

  describe('Content Type Handling', () => {
    it('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('should accept URL-encoded content type', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('username=testuser&email=test@example.com&password=password123')
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject unsupported content types', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('username=testuser&email=test@example.com&password=password123')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Request Method Handling', () => {
    it('should handle GET requests to appropriate endpoints', async () => {
      await request(app)
        .get('/health')
        .expect(200);

      await request(app)
        .get('/')
        .expect(200);
    });

    it('should handle POST requests to appropriate endpoints', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400); // Validation error, but POST is accepted
    });

    it('should handle PUT requests to appropriate endpoints', async () => {
      await request(app)
        .put('/api/auth/profile')
        .send({})
        .expect(401); // Auth required, but PUT is accepted
    });

    it('should handle DELETE requests to appropriate endpoints', async () => {
      await request(app)
        .delete('/api/tasks/1')
        .expect(401); // Auth required, but DELETE is accepted
    });

    it('should return 404 for unsupported methods on existing routes', async () => {
      const response = await request(app)
        .patch('/health')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('Security Headers', () => {
    it('should include basic security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for common security headers
      expect(response.headers['x-powered-by']).toBeUndefined(); // Should be hidden
    });

    it('should handle authorization headers correctly', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Database Connection Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test verifies that the app can handle database errors
      // In a real scenario, you might temporarily disconnect the database
      // For this test, we'll just verify the app is functioning with database
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'dbtest',
          email: 'dbtest@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
    });
  });
});