import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/Task';
import { calculateTaskStats } from '../utils/taskUtils';

export const useTaskManagement = (initialTasks: Task[] = []) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  });

  // 統計情報の更新
  useEffect(() => {
    setStats(calculateTaskStats(tasks));
  }, [tasks]);

  // タスクの追加
  const addTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [...prev, task]);
  }, []);

  // タスクの更新
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : task
    ));
  }, []);

  // タスクの削除
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  }, []);

  // 複数タスクの削除
  const deleteMultipleTasks = useCallback((taskIds: string[]) => {
    setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
    setSelectedTasks(prev => prev.filter(id => !taskIds.includes(id)));
  }, []);

  // タスクの選択
  const selectTask = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  // 全選択/全解除
  const selectAllTasks = useCallback((taskIds: string[]) => {
    setSelectedTasks(taskIds);
  }, []);

  // 選択されたタスクの一括更新
  const updateSelectedTasks = useCallback((updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      selectedTasks.includes(task.id)
        ? { ...task, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : task
    ));
  }, [selectedTasks]);

  // 選択されたタスクの一括削除
  const deleteSelectedTasks = useCallback(() => {
    deleteMultipleTasks(selectedTasks);
  }, [selectedTasks, deleteMultipleTasks]);

  // 選択の解除
  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  // タスクの検索
  const searchTasks = useCallback((query: string) => {
    if (!query) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [tasks]);

  // タスクの並び替え
  const sortTasks = useCallback((sortBy: 'title' | 'dueDate' | 'priority' | 'status', order: 'asc' | 'desc' = 'asc') => {
    return [...tasks].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [tasks]);

  return {
    tasks,
    selectedTasks,
    stats,
    addTask,
    updateTask,
    deleteTask,
    deleteMultipleTasks,
    selectTask,
    selectAllTasks,
    updateSelectedTasks,
    deleteSelectedTasks,
    clearSelection,
    searchTasks,
    sortTasks,
    setTasks
  };
};