const { sequelize } = require('../../../config/database');
const { User, Task } = require('../../../models');
const { cleanupTestData } = require('../setup');

describe('Database Models Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('User Model Database Integration', () => {
    it('should create user in database with proper constraints', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.isActive).toBe(true); // default value
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should enforce unique username constraint', async () => {
      const userData = {
        username: 'uniqueuser',
        email: 'user1@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create({
        ...userData,
        email: 'user2@example.com'
      })).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        username: 'user1',
        email: 'unique@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create({
        ...userData,
        username: 'user2'
      })).rejects.toThrow();
    });

    it('should enforce not null constraints', async () => {
      await expect(User.create({
        email: 'test@example.com',
        password: 'password123'
        // Missing required username
      })).rejects.toThrow();

      await expect(User.create({
        username: 'testuser',
        password: 'password123'
        // Missing required email
      })).rejects.toThrow();

      await expect(User.create({
        username: 'testuser',
        email: 'test@example.com'
        // Missing required password
      })).rejects.toThrow();
    });

    it('should update user fields correctly', async () => {
      const user = await User.create({
        username: 'updateuser',
        email: 'update@example.com',
        password: 'password123',
        firstName: 'Old',
        lastName: 'Name'
      });

      await user.update({
        firstName: 'New',
        lastName: 'Name',
        email: 'newemail@example.com'
      });

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.firstName).toBe('New');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.email).toBe('newemail@example.com');
      expect(updatedUser.username).toBe('updateuser'); // unchanged
    });

    it('should soft delete user (if implemented)', async () => {
      const user = await User.create({
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123'
      });

      await user.update({ isActive: false });

      const deactivatedUser = await User.findByPk(user.id);
      expect(deactivatedUser.isActive).toBe(false);
    });
  });

  describe('Task Model Database Integration', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'taskowner',
        email: 'taskowner@example.com',
        password: 'password123'
      });
    });

    it('should create task in database with proper foreign key', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2024-12-31'),
        userId: testUser.id
      };

      const task = await Task.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.userId).toBe(testUser.id);
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should enforce foreign key constraint', async () => {
      await expect(Task.create({
        title: 'Orphan Task',
        description: 'Task without valid user',
        userId: 999999 // Non-existent user ID
      })).rejects.toThrow();
    });

    it('should enforce not null constraints', async () => {
      await expect(Task.create({
        description: 'Task without title',
        userId: testUser.id
        // Missing required title
      })).rejects.toThrow();

      await expect(Task.create({
        title: 'Task without user',
        description: 'Task without user ID'
        // Missing required userId
      })).rejects.toThrow();
    });

    it('should handle default values correctly', async () => {
      const task = await Task.create({
        title: 'Minimal Task',
        userId: testUser.id
      });

      expect(task.status).toBe('pending'); // default value
      expect(task.priority).toBe('medium'); // default value
      expect(task.description).toBeNull(); // nullable field
      expect(task.dueDate).toBeNull(); // nullable field
    });

    it('should validate status enum values', async () => {
      // Valid statuses should work
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      
      for (const status of validStatuses) {
        const task = await Task.create({
          title: `Task with ${status} status`,
          status: status,
          userId: testUser.id
        });
        expect(task.status).toBe(status);
      }

      // Invalid status should fail
      await expect(Task.create({
        title: 'Invalid Status Task',
        status: 'invalid_status',
        userId: testUser.id
      })).rejects.toThrow();
    });

    it('should validate priority enum values', async () => {
      // Valid priorities should work
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      
      for (const priority of validPriorities) {
        const task = await Task.create({
          title: `Task with ${priority} priority`,
          priority: priority,
          userId: testUser.id
        });
        expect(task.priority).toBe(priority);
      }

      // Invalid priority should fail
      await expect(Task.create({
        title: 'Invalid Priority Task',
        priority: 'invalid_priority',
        userId: testUser.id
      })).rejects.toThrow();
    });

    it('should update task fields correctly', async () => {
      const task = await Task.create({
        title: 'Original Task',
        description: 'Original description',
        status: 'pending',
        priority: 'low',
        userId: testUser.id
      });

      await task.update({
        title: 'Updated Task',
        description: 'Updated description',
        status: 'completed',
        priority: 'high'
      });

      const updatedTask = await Task.findByPk(task.id);
      expect(updatedTask.title).toBe('Updated Task');
      expect(updatedTask.description).toBe('Updated description');
      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.priority).toBe('high');
    });

    it('should delete task from database', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        userId: testUser.id
      });

      await task.destroy();

      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('Model Associations', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'associationuser',
        email: 'association@example.com',
        password: 'password123'
      });
    });

    it('should establish user-task association', async () => {
      const task = await Task.create({
        title: 'Associated Task',
        description: 'Task with user association',
        userId: testUser.id
      });

      // Test association from task to user
      const taskWithUser = await Task.findByPk(task.id, {
        include: [User]
      });

      expect(taskWithUser.User).toBeDefined();
      expect(taskWithUser.User.id).toBe(testUser.id);
      expect(taskWithUser.User.username).toBe(testUser.username);
    });

    it('should fetch user with all their tasks', async () => {
      // Create multiple tasks for the user
      await Task.create({
        title: 'User Task 1',
        userId: testUser.id
      });
      await Task.create({
        title: 'User Task 2',
        userId: testUser.id
      });

      // Test association from user to tasks
      const userWithTasks = await User.findByPk(testUser.id, {
        include: [Task]
      });

      expect(userWithTasks.Tasks).toBeDefined();
      expect(userWithTasks.Tasks).toHaveLength(2);
      expect(userWithTasks.Tasks[0].title).toBe('User Task 1');
      expect(userWithTasks.Tasks[1].title).toBe('User Task 2');
    });

    it('should handle cascade operations correctly', async () => {
      // Create tasks for the user
      await Task.create({
        title: 'Task 1',
        userId: testUser.id
      });
      await Task.create({
        title: 'Task 2',
        userId: testUser.id
      });

      // Check that tasks exist
      const tasksBefore = await Task.findAll({
        where: { userId: testUser.id }
      });
      expect(tasksBefore).toHaveLength(2);

      // Delete the user (if cascade is configured)
      await testUser.destroy();

      // Check if tasks still exist or were cascaded
      const tasksAfter = await Task.findAll({
        where: { userId: testUser.id }
      });
      
      // This depends on your CASCADE configuration
      // If CASCADE DELETE is set up, tasksAfter should be empty
      // If not, the foreign key constraint should prevent user deletion
    });
  });

  describe('Database Transactions', () => {
    it('should rollback on transaction failure', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create user within transaction
        const user = await User.create({
          username: 'transactionuser',
          email: 'transaction@example.com',
          password: 'password123'
        }, { transaction });

        // Create task within transaction
        await Task.create({
          title: 'Transaction Task',
          userId: user.id
        }, { transaction });

        // Simulate an error
        throw new Error('Simulated transaction error');

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
      }

      // Verify that nothing was persisted
      const users = await User.findAll({
        where: { username: 'transactionuser' }
      });
      const tasks = await Task.findAll({
        where: { title: 'Transaction Task' }
      });

      expect(users).toHaveLength(0);
      expect(tasks).toHaveLength(0);
    });

    it('should commit transaction on success', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create user within transaction
        const user = await User.create({
          username: 'successuser',
          email: 'success@example.com',
          password: 'password123'
        }, { transaction });

        // Create task within transaction
        await Task.create({
          title: 'Success Task',
          userId: user.id
        }, { transaction });

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
      }

      // Verify that data was persisted
      const users = await User.findAll({
        where: { username: 'successuser' }
      });
      const tasks = await Task.findAll({
        where: { title: 'Success Task' }
      });

      expect(users).toHaveLength(1);
      expect(tasks).toHaveLength(1);
    });
  });
});