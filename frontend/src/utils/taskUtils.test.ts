import {
  calculateTaskStats,
  filterTasks,
  sortTasksByDueDate,
  sortTasksByPriority,
  getTaskStatusColor,
  getTaskPriorityColor,
  formatDate,
  isTaskOverdue,
  getTaskProgressPercentage
} from './taskUtils';
import { Task } from '../types/Task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-01-20',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'pending',
    priority: 'low',
    dueDate: '2024-01-25',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14'
  }
];

describe('taskUtils', () => {
  describe('calculateTaskStats', () => {
    test('calculates correct stats for tasks', () => {
      const stats = calculateTaskStats(mockTasks);
      expect(stats).toEqual({
        total: 3,
        completed: 1,
        pending: 1,
        inProgress: 1
      });
    });

    test('handles empty array', () => {
      const stats = calculateTaskStats([]);
      expect(stats).toEqual({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      });
    });
  });

  describe('filterTasks', () => {
    test('filters by status', () => {
      const completed = filterTasks(mockTasks, 'completed', 'all');
      expect(completed).toHaveLength(1);
      expect(completed[0].status).toBe('completed');
    });

    test('filters by priority', () => {
      const highPriority = filterTasks(mockTasks, 'all', 'high');
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].priority).toBe('high');
    });

    test('filters by search query', () => {
      const searchResults = filterTasks(mockTasks, 'all', 'all', 'Task 1');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('Task 1');
    });

    test('returns all tasks when filters are "all"', () => {
      const allTasks = filterTasks(mockTasks, 'all', 'all');
      expect(allTasks).toHaveLength(3);
    });
  });

  describe('sortTasksByDueDate', () => {
    test('sorts tasks by due date ascending', () => {
      const sorted = sortTasksByDueDate(mockTasks);
      expect(sorted[0].dueDate).toBe('2024-01-15');
      expect(sorted[1].dueDate).toBe('2024-01-20');
      expect(sorted[2].dueDate).toBe('2024-01-25');
    });

    test('does not mutate original array', () => {
      const original = [...mockTasks];
      sortTasksByDueDate(mockTasks);
      expect(mockTasks).toEqual(original);
    });
  });

  describe('sortTasksByPriority', () => {
    test('sorts tasks by priority (high to low)', () => {
      const sorted = sortTasksByPriority(mockTasks);
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    test('does not mutate original array', () => {
      const original = [...mockTasks];
      sortTasksByPriority(mockTasks);
      expect(mockTasks).toEqual(original);
    });
  });

  describe('getTaskStatusColor', () => {
    test('returns correct colors for each status', () => {
      expect(getTaskStatusColor('completed')).toBe('#2ed573');
      expect(getTaskStatusColor('in_progress')).toBe('#5352ed');
      expect(getTaskStatusColor('pending')).toBe('#ffa502');
    });

    test('returns default color for unknown status', () => {
      expect(getTaskStatusColor('unknown' as any)).toBe('#747d8c');
    });
  });

  describe('getTaskPriorityColor', () => {
    test('returns correct colors for each priority', () => {
      expect(getTaskPriorityColor('high')).toBe('#ff4757');
      expect(getTaskPriorityColor('medium')).toBe('#ffa502');
      expect(getTaskPriorityColor('low')).toBe('#2ed573');
    });

    test('returns default color for unknown priority', () => {
      expect(getTaskPriorityColor('unknown' as any)).toBe('#747d8c');
    });
  });

  describe('formatDate', () => {
    test('formats date correctly', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/2024.*1.*15/);
    });
  });

  describe('isTaskOverdue', () => {
    test('returns true for overdue tasks', () => {
      const pastDate = '2020-01-01';
      expect(isTaskOverdue(pastDate)).toBe(true);
    });

    test('returns false for future tasks', () => {
      const futureDate = '2030-01-01';
      expect(isTaskOverdue(futureDate)).toBe(false);
    });
  });

  describe('getTaskProgressPercentage', () => {
    test('calculates correct percentage', () => {
      const percentage = getTaskProgressPercentage(mockTasks);
      expect(percentage).toBe(33); // 1 completed out of 3 tasks
    });

    test('returns 0 for empty array', () => {
      const percentage = getTaskProgressPercentage([]);
      expect(percentage).toBe(0);
    });

    test('returns 100 for all completed tasks', () => {
      const allCompleted = mockTasks.map(task => ({ ...task, status: 'completed' as const }));
      const percentage = getTaskProgressPercentage(allCompleted);
      expect(percentage).toBe(100);
    });
  });
});