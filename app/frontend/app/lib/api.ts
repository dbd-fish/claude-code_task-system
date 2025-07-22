// API接続用のユーティリティ関数

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * タスクデータの型定義
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  assignee: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}

/**
 * タスク作成用のデータ型
 */
export interface CreateTaskData {
  title: string;
  description: string;
  deadline: string;
  assignee: string;
}

/**
 * タスク更新用のデータ型
 */
export interface UpdateTaskData extends CreateTaskData {
  status: Task['status'];
}

/**
 * APIレスポンス用の共通型
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * APIエラーの型定義
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 共通のAPIリクエスト関数
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // ネットワークエラーや他のエラー
    throw new ApiError(
      'ネットワークエラーが発生しました',
      0,
      error
    );
  }
}

/**
 * タスク一覧を取得
 */
export async function getTasks(): Promise<Task[]> {
  const response = await apiRequest<ApiResponse<Task[]>>('/api/v1/tasks');
  return response.data;
}

/**
 * 特定のタスクを取得
 */
export async function getTask(id: number): Promise<Task> {
  const response = await apiRequest<ApiResponse<Task>>(`/api/v1/tasks/${id}`);
  return response.data;
}

/**
 * 新しいタスクを作成
 */
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const response = await apiRequest<ApiResponse<Task>>('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  return response.data;
}

/**
 * タスクを更新
 */
export async function updateTask(id: number, taskData: UpdateTaskData): Promise<Task> {
  const response = await apiRequest<ApiResponse<Task>>(`/api/v1/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
  return response.data;
}

/**
 * タスクを削除
 */
export async function deleteTask(id: number): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/api/v1/tasks/${id}`, {
    method: 'DELETE',
  });
}

/**
 * APIの接続確認用の関数
 */
export async function checkApiConnection(): Promise<boolean> {
  try {
    await apiRequest<any>('/api/v1/health');
    return true;
  } catch (error) {
    console.error('API接続エラー:', error);
    return false;
  }
}