import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import TaskEdit from './pages/TaskEdit';
import TaskNew from './pages/TaskNew';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/new" element={<TaskNew />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/tasks/:id/edit" element={<TaskEdit />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);