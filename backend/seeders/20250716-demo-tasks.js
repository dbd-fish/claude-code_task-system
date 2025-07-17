'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Tasks', [
      {
        title: 'Setup development environment',
        description: 'Configure development environment for the project',
        status: 'completed',
        priority: 'high',
        userId: 1,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Design database schema',
        description: 'Create database schema for user management and task tracking',
        status: 'in_progress',
        priority: 'high',
        userId: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Implement authentication',
        description: 'Add user authentication with JWT tokens',
        status: 'pending',
        priority: 'medium',
        userId: 1,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Create task management API',
        description: 'Develop REST API for task CRUD operations',
        status: 'pending',
        priority: 'medium',
        userId: 2,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Write unit tests',
        description: 'Create comprehensive unit tests for all API endpoints',
        status: 'pending',
        priority: 'low',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};