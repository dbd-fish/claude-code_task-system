import { renderHook, act } from '@testing-library/react';
import { useTaskManagement } from './useTaskManagement';
import { Task } from '../types/Task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-01-20',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  }
];

describe('useTaskManagement', () => {
  test('initializes with provided tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.stats.total).toBe(2);
    expect(result.current.selectedTasks).toEqual([]);
  });

  test('adds a new task', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.addTask({
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'low',
        dueDate: '2024-01-30'
      });
    });

    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.tasks[2].title).toBe('New Task');
    expect(result.current.stats.total).toBe(3);
  });

  test('updates a task', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.updateTask('1', { status: 'completed' });
    });

    expect(result.current.tasks[0].status).toBe('completed');
    expect(result.current.stats.completed).toBe(1);
  });

  test('deletes a task', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.deleteTask('1');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('2');
    expect(result.current.stats.total).toBe(1);
  });

  test('selects and deselects tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectTask('1');
    });

    expect(result.current.selectedTasks).toEqual(['1']);

    act(() => {
      result.current.selectTask('1');
    });

    expect(result.current.selectedTasks).toEqual([]);
  });

  test('selects all tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectAllTasks(['1', '2']);
    });

    expect(result.current.selectedTasks).toEqual(['1', '2']);
  });

  test('updates selected tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectAllTasks(['1', '2']);
    });

    act(() => {
      result.current.updateSelectedTasks({ status: 'completed' });
    });

    expect(result.current.tasks[0].status).toBe('completed');
    expect(result.current.tasks[1].status).toBe('completed');
    expect(result.current.stats.completed).toBe(2);
  });

  test('deletes selected tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectAllTasks(['1', '2']);
    });

    act(() => {
      result.current.deleteSelectedTasks();
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(result.current.selectedTasks).toEqual([]);
    expect(result.current.stats.total).toBe(0);
  });

  test('deletes multiple tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.deleteMultipleTasks(['1', '2']);
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(result.current.stats.total).toBe(0);
  });

  test('clears selection', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectAllTasks(['1', '2']);
    });

    expect(result.current.selectedTasks).toEqual(['1', '2']);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedTasks).toEqual([]);
  });

  test('searches tasks', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const searchResults = result.current.searchTasks('Task 1');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe('Task 1');
  });

  test('sorts tasks by title', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const sortedTasks = result.current.sortTasks('title', 'asc');
    expect(sortedTasks[0].title).toBe('Task 1');
    expect(sortedTasks[1].title).toBe('Task 2');

    const sortedTasksDesc = result.current.sortTasks('title', 'desc');
    expect(sortedTasksDesc[0].title).toBe('Task 2');
    expect(sortedTasksDesc[1].title).toBe('Task 1');
  });

  test('sorts tasks by due date', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const sortedTasks = result.current.sortTasks('dueDate', 'asc');
    expect(sortedTasks[0].dueDate).toBe('2024-01-15');
    expect(sortedTasks[1].dueDate).toBe('2024-01-20');
  });

  test('sorts tasks by priority', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const sortedTasks = result.current.sortTasks('priority', 'desc');
    expect(sortedTasks[0].priority).toBe('high');
    expect(sortedTasks[1].priority).toBe('medium');
  });

  test('sorts tasks by status', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const sortedTasks = result.current.sortTasks('status', 'asc');
    expect(sortedTasks[0].status).toBe('pending');
    expect(sortedTasks[1].status).toBe('in_progress');
  });

  test('removes deleted task from selection', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    act(() => {
      result.current.selectTask('1');
    });

    expect(result.current.selectedTasks).toEqual(['1']);

    act(() => {
      result.current.deleteTask('1');
    });

    expect(result.current.selectedTasks).toEqual([]);
  });

  test('calculates stats correctly', () => {
    const tasksWithVariousStates: Task[] = [
      { ...mockTasks[0], status: 'pending' },
      { ...mockTasks[1], status: 'in_progress' },
      { ...mockTasks[0], id: '3', status: 'completed' }
    ];

    const { result } = renderHook(() => useTaskManagement(tasksWithVariousStates));
    
    expect(result.current.stats.total).toBe(3);
    expect(result.current.stats.pending).toBe(1);
    expect(result.current.stats.inProgress).toBe(1);
    expect(result.current.stats.completed).toBe(1);
  });

  test('handles empty search query', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const searchResults = result.current.searchTasks('');
    expect(searchResults).toEqual(mockTasks);
  });

  test('searches in description', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const searchResults = result.current.searchTasks('Description 1');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].description).toBe('Description 1');
  });

  test('search is case insensitive', () => {
    const { result } = renderHook(() => useTaskManagement(mockTasks));
    
    const searchResults = result.current.searchTasks('TASK 1');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe('Task 1');
  });
});