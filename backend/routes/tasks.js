const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD routes
router.post('/', createTask);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;