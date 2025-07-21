import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container">
      <nav className="nav">
        <ul>
          <li><Link to="/">ホーム</Link></li>
          <li><Link to="/tasks">タスク一覧</Link></li>
          <li><Link to="/tasks/new">新規タスク</Link></li>
        </ul>
      </nav>
      
      <h1>タスク管理アプリ</h1>
      <p>タスクの作成、編集、削除ができるシンプルなタスク管理アプリです。</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link 
          to="/tasks" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          タスク一覧を見る
        </Link>
      </div>
    </div>
  );
};

export default Home;