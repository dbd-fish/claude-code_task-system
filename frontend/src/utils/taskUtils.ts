import { Task, TaskStats } from '../types/Task';

export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  return {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in_progress').length
  };
};

export const filterTasks = (
  tasks: Task[],
  statusFilter: string,
  priorityFilter: string,
  searchQuery?: string
): Task[] => {
  return tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    const searchMatch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && priorityMatch && searchMatch;
  });
};

export const sortTasksByDueDate = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
};

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const getTaskStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'completed': return '#2ed573';
    case 'in_progress': return '#5352ed';
    case 'pending': return '#ffa502';
    default: return '#747d8c';
  }
};

export const getTaskPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high': return '#ff4757';
    case 'medium': return '#ffa502';
    case 'low': return '#2ed573';
    default: return '#747d8c';
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isTaskOverdue = (dueDate: string): boolean => {
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const getTaskProgressPercentage = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(task => task.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};