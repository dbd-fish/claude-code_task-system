import React, { useState } from 'react';
import './TaskList.css';
import { Task } from '../types/Task';
import { 
  getTaskStatusColor, 
  getTaskPriorityColor, 
  formatDate, 
  isTaskOverdue 
} from '../utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onSelectAllTasks: (taskIds: string[]) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  selectedTasks,
  onSelectTask,
  onSelectAllTasks,
  viewMode,
  onViewModeChange
}) => {
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ソート処理
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
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
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        aValue = a.dueDate;
        bValue = b.dueDate;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 全選択/全解除
  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      onSelectAllTasks([]);
    } else {
      onSelectAllTasks(tasks.map(task => task.id));
    }
  };

  // ソート変更
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 一括ステータス更新
  const handleBulkStatusUpdate = (status: Task['status']) => {
    selectedTasks.forEach(taskId => {
      onUpdateTask(taskId, { status, updatedAt: new Date().toISOString().split('T')[0] });
    });
  };

  // 一括削除
  const handleBulkDelete = () => {
    if (window.confirm(`選択した${selectedTasks.length}個のタスクを削除しますか？`)) {
      selectedTasks.forEach(taskId => {
        onDeleteTask(taskId);
      });
    }
  };

  return (
    <div className="task-list">
      {/* ツールバー */}
      <div className="task-list-toolbar">
        <div className="toolbar-left">
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 3h12a1 1 0 010 2H2a1 1 0 010-2zm0 4h12a1 1 0 010 2H2a1 1 0 010-2zm0 4h12a1 1 0 010 2H2a1 1 0 010-2z"/>
              </svg>
              リスト
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"/>
              </svg>
              グリッド
            </button>
          </div>
          
          <div className="sort-controls">
            <label>並び順:</label>
            <select 
              value={sortBy} 
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
            >
              <option value="dueDate">期限日</option>
              <option value="priority">優先度</option>
              <option value="status">ステータス</option>
              <option value="title">タイトル</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="task-count">{tasks.length}件のタスク</span>
          {selectedTasks.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedTasks.length}件選択中</span>
              <button 
                className="bulk-btn status-btn"
                onClick={() => handleBulkStatusUpdate('completed')}
              >
                完了にする
              </button>
              <button 
                className="bulk-btn status-btn"
                onClick={() => handleBulkStatusUpdate('in_progress')}
              >
                進行中にする
              </button>
              <button 
                className="bulk-btn delete-btn"
                onClick={handleBulkDelete}
              >
                削除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* タスクリスト */}
      {viewMode === 'list' ? (
        <div className="task-list-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('title')}
                >
                  タイトル
                  {sortBy === 'title' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('status')}
                >
                  ステータス
                  {sortBy === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('priority')}
                >
                  優先度
                  {sortBy === 'priority' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('dueDate')}
                >
                  期限
                  {sortBy === 'dueDate' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
                <tr 
                  key={task.id} 
                  className={`task-row ${selectedTasks.includes(task.id) ? 'selected' : ''} ${isTaskOverdue(task.dueDate) ? 'overdue' : ''}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => onSelectTask(task.id)}
                    />
                  </td>
                  <td>
                    <div className="task-title-cell">
                      <span className="task-title">{task.title}</span>
                      <span className="task-description">{task.description}</span>
                    </div>
                  </td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTask(task.id, { 
                        status: e.target.value as Task['status'],
                        updatedAt: new Date().toISOString().split('T')[0]
                      })}
                      className="status-select"
                      style={{ backgroundColor: getTaskStatusColor(task.status) }}
                    >
                      <option value="pending">未着手</option>
                      <option value="in_progress">進行中</option>
                      <option value="completed">完了</option>
                    </select>
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getTaskPriorityColor(task.priority) }}
                    >
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                  </td>
                  <td>
                    <div className="due-date-cell">
                      <span className={`due-date ${isTaskOverdue(task.dueDate) ? 'overdue' : ''}`}>
                        {formatDate(task.dueDate)}
                      </span>
                      {isTaskOverdue(task.dueDate) && (
                        <span className="overdue-indicator">期限切れ</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="task-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => onEditTask(task)}
                      >
                        編集
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => {
                          if (window.confirm('このタスクを削除しますか？')) {
                            onDeleteTask(task.id);
                          }
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="task-grid">
          {sortedTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-card ${selectedTasks.includes(task.id) ? 'selected' : ''} ${isTaskOverdue(task.dueDate) ? 'overdue' : ''}`}
            >
              <div className="task-card-header">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => onSelectTask(task.id)}
                />
                <div className="task-badges">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getTaskPriorityColor(task.priority) }}
                  >
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getTaskStatusColor(task.status) }}
                  >
                    {task.status === 'completed' ? '完了' : 
                     task.status === 'in_progress' ? '進行中' : '未着手'}
                  </span>
                </div>
              </div>
              
              <div className="task-card-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                  <div className="due-date-info">
                    <span className={`due-date ${isTaskOverdue(task.dueDate) ? 'overdue' : ''}`}>
                      期限: {formatDate(task.dueDate)}
                    </span>
                    {isTaskOverdue(task.dueDate) && (
                      <span className="overdue-indicator">期限切れ</span>
                    )}
                  </div>
                  <span className="updated-date">
                    更新: {formatDate(task.updatedAt)}
                  </span>
                </div>
              </div>
              
              <div className="task-card-footer">
                <select
                  value={task.status}
                  onChange={(e) => onUpdateTask(task.id, { 
                    status: e.target.value as Task['status'],
                    updatedAt: new Date().toISOString().split('T')[0]
                  })}
                  className="status-select"
                >
                  <option value="pending">未着手</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                </select>
                
                <div className="task-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEditTask(task)}
                  >
                    編集
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => {
                      if (window.confirm('このタスクを削除しますか？')) {
                        onDeleteTask(task.id);
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空の状態 */}
      {tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>タスクがありません</h3>
          <p>新しいタスクを作成してください</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;