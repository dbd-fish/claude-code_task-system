const { Task, User } = require('../models');
const { Op } = require('sequelize');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }

    if (title.length > 200) {
      return res.status(400).json({ 
        error: 'Title must be 200 characters or less' 
      });
    }

    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be one of: low, medium, high, urgent' 
      });
    }

    // Parse due date if provided
    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid due date format' 
        });
      }
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      priority: priority || 'medium',
      dueDate: parsedDueDate,
      userId
    });

    // Include user info in response
    const taskWithUser = await Task.findByPk(task.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: taskWithUser
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      priority, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const whereClause = { userId };

    if (status) {
      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be one of: pending, in_progress, completed, cancelled' 
        });
      }
      whereClause.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ 
          error: 'Invalid priority. Must be one of: low, medium, high, urgent' 
        });
      }
      whereClause.priority = priority;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate', 'status'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ 
        error: `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}` 
      });
    }

    const validSortOrders = ['ASC', 'DESC'];
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Invalid sortOrder. Must be ASC or DESC' 
      });
    }

    // Pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    
    if (pageNumber < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ 
        error: 'Invalid pagination parameters' 
      });
    }

    const offset = (pageNumber - 1) * pageSize;

    // Get tasks with pagination
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: pageSize,
      offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    res.json({
      tasks,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: count,
        itemsPerPage: pageSize,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({
      where: { id, userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Find task
    const task = await Task.findOne({
      where: { id, userId }
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Validation
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title cannot be empty' 
        });
      }
      if (title.length > 200) {
        return res.status(400).json({ 
          error: 'Title must be 200 characters or less' 
        });
      }
    }

    if (status && !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be one of: pending, in_progress, completed, cancelled' 
      });
    }

    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be one of: low, medium, high, urgent' 
      });
    }

    // Parse due date if provided
    let parsedDueDate = undefined;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        parsedDueDate = null;
      } else {
        parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({ 
            error: 'Invalid due date format' 
          });
        }
      }
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (parsedDueDate !== undefined) updateData.dueDate = parsedDueDate;

    // Set completedAt if status is completed
    if (status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    } else if (status && status !== 'completed') {
      updateData.completedAt = null;
    }

    // Update task
    await task.update(updateData);

    // Get updated task with user info
    const updatedTask = await Task.findByPk(task.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({
      where: { id, userId }
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    await task.destroy();

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Task.findAll({
      where: { userId },
      attributes: [
        'status',
        [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const priorityStats = await Task.findAll({
      where: { userId },
      attributes: [
        'priority',
        [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    const totalTasks = await Task.count({ where: { userId } });
    const completedTasks = await Task.count({ where: { userId, status: 'completed' } });
    const overdueTasks = await Task.count({ 
      where: { 
        userId, 
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'completed' }
      } 
    });

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
      priorityBreakdown: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = parseInt(stat.dataValues.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
};