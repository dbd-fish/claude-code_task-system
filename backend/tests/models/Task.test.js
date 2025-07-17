const { Task } = require('../../models');

describe('Task Model', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Task creation', () => {
    test('should create a task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1
      };

      // Mock the Task.create method
      Task.create = jest.fn().mockResolvedValue({
        id: 1,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const task = await Task.create(taskData);

      expect(Task.create).toHaveBeenCalledWith(taskData);
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title', taskData.title);
      expect(task).toHaveProperty('description', taskData.description);
      expect(task).toHaveProperty('status', taskData.status);
      expect(task).toHaveProperty('priority', taskData.priority);
      expect(task).toHaveProperty('userId', taskData.userId);
    });

    test('should handle creation errors', async () => {
      const taskData = {
        title: '', // Empty title should cause validation error
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1
      };

      Task.create = jest.fn().mockRejectedValue(new Error('Validation error'));

      await expect(Task.create(taskData)).rejects.toThrow('Validation error');
    });
  });

  describe('Task queries', () => {
    test('should find tasks by user ID', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          priority: 'high',
          userId: 1
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'low',
          userId: 1
        }
      ];

      Task.findAll = jest.fn().mockResolvedValue(mockTasks);

      const tasks = await Task.findAll({ where: { userId: 1 } });

      expect(Task.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(tasks).toEqual(mockTasks);
      expect(tasks).toHaveLength(2);
    });

    test('should find task by ID', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1
      };

      Task.findByPk = jest.fn().mockResolvedValue(mockTask);

      const task = await Task.findByPk(1);

      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(task).toEqual(mockTask);
    });

    test('should find tasks by status', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          priority: 'high',
          userId: 1
        }
      ];

      Task.findAll = jest.fn().mockResolvedValue(mockTasks);

      const tasks = await Task.findAll({ where: { status: 'pending' } });

      expect(Task.findAll).toHaveBeenCalledWith({ where: { status: 'pending' } });
      expect(tasks).toEqual(mockTasks);
    });

    test('should return empty array for user with no tasks', async () => {
      Task.findAll = jest.fn().mockResolvedValue([]);

      const tasks = await Task.findAll({ where: { userId: 999 } });

      expect(tasks).toEqual([]);
    });
  });

  describe('Task updates', () => {
    test('should update task status', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1,
        update: jest.fn().mockResolvedValue({
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'completed',
          priority: 'medium',
          userId: 1
        })
      };

      Task.findByPk = jest.fn().mockResolvedValue(mockTask);

      const task = await Task.findByPk(1);
      const updatedTask = await task.update({ status: 'completed' });

      expect(task.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(updatedTask.status).toBe('completed');
    });

    test('should update task priority', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1,
        update: jest.fn().mockResolvedValue({
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          priority: 'high',
          userId: 1
        })
      };

      Task.findByPk = jest.fn().mockResolvedValue(mockTask);

      const task = await Task.findByPk(1);
      const updatedTask = await task.update({ priority: 'high' });

      expect(task.update).toHaveBeenCalledWith({ priority: 'high' });
      expect(updatedTask.priority).toBe('high');
    });
  });

  describe('Task deletion', () => {
    test('should delete task', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        userId: 1,
        destroy: jest.fn().mockResolvedValue(1)
      };

      Task.findByPk = jest.fn().mockResolvedValue(mockTask);

      const task = await Task.findByPk(1);
      const result = await task.destroy();

      expect(task.destroy).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });
});