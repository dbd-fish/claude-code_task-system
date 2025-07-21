import type { TaskStatus } from './types';

/**
 * タスクステータスの日本語ラベルを取得
 */
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return '未着手';
    case 'in_progress':
      return '進行中';
    case 'completed':
      return '完了';
    default:
      return status;
  }
}

/**
 * タスクステータスの色を取得
 */
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return '#ffc107';
    case 'in_progress':
      return '#17a2b8';
    case 'completed':
      return '#28a745';
    default:
      return '#6c757d';
  }
}

/**
 * 日付の形式を変換（YYYY-MM-DD → YYYY年MM月DD日）
 */
export function formatDateJapanese(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
}

/**
 * 現在の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 期限の状態を判定
 */
export function getDueDateStatus(deadline: string): 'overdue' | 'today' | 'soon' | 'normal' {
  const today = new Date();
  const due = new Date(deadline);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays === 0) {
    return 'today';
  } else if (diffDays <= 3) {
    return 'soon';
  } else {
    return 'normal';
  }
}

/**
 * 期限状態の色を取得
 */
export function getDueDateColor(deadline: string): string {
  const status = getDueDateStatus(deadline);
  
  switch (status) {
    case 'overdue':
      return '#dc3545';
    case 'today':
      return '#fd7e14';
    case 'soon':
      return '#ffc107';
    case 'normal':
      return '#6c757d';
    default:
      return '#6c757d';
  }
}

/**
 * フォームデータをオブジェクトに変換
 */
export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      obj[key] = value;
    }
  }
  
  return obj;
}

/**
 * エラーメッセージを安全に取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '予期しないエラーが発生しました';
}