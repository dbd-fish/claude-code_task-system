/**
 * アプリケーション全体で使用する型定義
 */

// タスクのステータス
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// タスクの基本情報
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}

// タスク作成時のフォームデータ
export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  status?: TaskStatus;
}

// タスク作成用のデータ型（APIに送信用）
export interface CreateTaskData {
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
}

// タスク更新用のデータ型（APIに送信用）
export interface UpdateTaskData {
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  status: TaskStatus;
}

// ナビゲーション用のルート定義
export interface Route {
  path: string;
  label: string;
  description?: string;
}

// アプリケーションの設定
export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
}

// エラー情報
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

// 成功メッセージ
export interface SuccessInfo {
  message: string;
  data?: any;
}