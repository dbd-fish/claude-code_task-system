import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  assignee: string;
  status: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
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
    if (id) {
      fetchTask(parseInt(id));
    }
  }, [id]);

  const fetchTask = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      }
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!task || !window.confirm('本当に削除しますか？')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        window.location.href = '/tasks';
      }
    } catch (error) {
      console.error('タスクの削除に失敗しました:', error);
    }
  };

  if (loading) {
    return <div className="container">読み込み中...</div>;
  }

  if (!task) {
    return <div className="container">タスクが見つかりません。</div>;
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
      
      <h1>タスク詳細</h1>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '4px' }}>
        <h2>{task.title}</h2>
        <p><strong>説明:</strong> {task.description}</p>
        <p><strong>期限:</strong> {task.deadline}</p>
        <p><strong>担当者:</strong> {task.assignee}</p>
        <p><strong>ステータス:</strong> {getStatusLabel(task.status)}</p>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <Link 
          to={`/tasks/${task.id}/edit`}
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '1rem'
          }}
        >
          編集
        </Link>
        <button 
          onClick={deleteTask}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;