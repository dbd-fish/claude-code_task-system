import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  assignee: string;
  status: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '未開始';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      default: return status;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || data); // APIレスポンスの構造に対応
      }
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">読み込み中...</div>;
  }

  return (
    <div className="container">
      <nav className="nav">
        <ul>
          <li><Link to="/">ホーム</Link></li>
          <li><Link to="/tasks">タスク一覧</Link></li>
          <li><Link to="/tasks/new">新規タスク</Link></li>
        </ul>
      </nav>
      
      <h1>タスク一覧</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to="/tasks/new"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          新規タスク作成
        </Link>
      </div>
      
      {tasks.length === 0 ? (
        <p>タスクがありません。</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map((task) => (
            <div 
              key={task.id} 
              style={{
                border: '1px solid #ddd',
                padding: '1rem',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p><strong>期限:</strong> {task.deadline}</p>
              <p><strong>担当者:</strong> {task.assignee}</p>
              <p><strong>ステータス:</strong> {getStatusLabel(task.status)}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link 
                  to={`/tasks/${task.id}`}
                  style={{ marginRight: '1rem' }}
                >
                  詳細
                </Link>
                <Link to={`/tasks/${task.id}/edit`}>編集</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;