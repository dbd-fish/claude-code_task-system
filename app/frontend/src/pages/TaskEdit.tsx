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

const TaskEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      if (response.ok) {
        window.location.href = `/tasks/${task.id}`;
      }
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (task) {
      setTask({
        ...task,
        [e.target.name]: e.target.value,
      });
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
      
      <h1>タスク編集</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">タイトル:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description">説明:</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="deadline">期限:</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="assignee">担当者:</label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            value={task.assignee}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="status">ステータス:</label>
          <select
            id="status"
            name="status"
            value={task.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          >
            <option value="pending">未開始</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
          </select>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            type="submit"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            更新
          </button>
          <Link 
            to={`/tasks/${task.id}`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TaskEdit;