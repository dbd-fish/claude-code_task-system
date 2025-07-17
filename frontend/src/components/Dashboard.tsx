import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { Task } from '../types/Task';
import { calculateTaskStats, filterTasks } from '../utils/taskUtils';

interface DashboardProps {
  user: {
    email: string;
  };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // サンプルタスクデータ
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'プロジェクト設計書作成',
        description: '新しいプロジェクトの設計書を作成し、チームメンバーと共有する',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2024-01-20',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-16'
      },
      {
        id: '2',
        title: 'データベース設計',
        description: 'ユーザー管理システムのデータベース設計を完了する',
        status: 'completed',
        priority: 'high',
        dueDate: '2024-01-18',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        title: 'UIコンポーネント実装',
        description: 'ログイン画面とダッシュボードのUIコンポーネントを実装',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-01-25',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '4',
        title: 'テストケース作成',
        description: '単体テストとE2Eテストのテストケースを作成',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-01-30',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
      },
      {
        id: '5',
        title: '本番環境デプロイ',
        description: 'AWS環境への本番デプロイとモニタリング設定',
        status: 'pending',
        priority: 'low',
        dueDate: '2024-02-01',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
      }
    ];

    setTasks(sampleTasks);
    setStats(calculateTaskStats(sampleTasks));
  }, []);

  // フィルター処理
  const filteredTasks = filterTasks(tasks, selectedFilter, selectedPriority);

  // タスク更新
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    setStats(calculateTaskStats(updatedTasks));
  };

  // タスク削除
  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    setStats(calculateTaskStats(updatedTasks));
    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
  };

  // タスク選択
  const selectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // 全選択/全解除
  const selectAllTasks = (taskIds: string[]) => {
    setSelectedTasks(taskIds);
  };

  // 新規タスク作成
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  // タスク編集
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // タスク保存
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      // 編集の場合
      updateTask(editingTask.id, taskData);
    } else {
      // 新規作成の場合
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setStats(calculateTaskStats(updatedTasks));
    }
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  // フォームキャンセル
  const handleCancelTask = () => {
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  // フォームクローズ
  const handleCloseTask = () => {
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };


  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Manager Dashboard</h1>
          <div className="user-info">
            <span>ようこそ、{user.email}さん</span>
            <button onClick={onLogout} className="logout-btn">
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* 統計カード */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <h3>総タスク数</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
            <div className="stat-card completed">
              <h3>完了</h3>
              <p className="stat-number">{stats.completed}</p>
            </div>
            <div className="stat-card in-progress">
              <h3>進行中</h3>
              <p className="stat-number">{stats.inProgress}</p>
            </div>
            <div className="stat-card pending">
              <h3>未着手</h3>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>
        </section>

        {/* フィルター */}
        <section className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label>ステータス:</label>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">すべて</option>
                <option value="pending">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
            </div>
            <div className="filter-group">
              <label>優先度:</label>
              <select 
                value={selectedPriority} 
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">すべて</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
        </section>

        {/* タスクリスト */}
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>タスク管理</h2>
            <button 
              onClick={handleCreateTask}
              className="create-task-button"
            >
              + 新規タスク
            </button>
          </div>
          <TaskList
            tasks={filteredTasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            selectedTasks={selectedTasks}
            onSelectTask={selectTask}
            onSelectAllTasks={selectAllTasks}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </section>
      </main>

      {/* タスクフォーム */}
      <TaskForm
        task={editingTask}
        onSave={handleSaveTask}
        onCancel={handleCancelTask}
        onClose={handleCloseTask}
        isOpen={isTaskFormOpen}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Dashboard;