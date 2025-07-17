export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface TaskFilter {
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  search?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}