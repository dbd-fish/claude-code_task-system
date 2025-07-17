import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

const mockUser = {
  email: 'test@example.com'
};

const mockOnLogout = jest.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockOnLogout.mockClear();
  });

  test('renders dashboard header and user info', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Task Manager Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ようこそ、test@example.comさん')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  test('displays stats cards with correct information', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('総タスク数')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('未着手')).toBeInTheDocument();
    
    // Check if stats numbers are displayed
    expect(screen.getByText('5')).toBeInTheDocument(); // total tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // completed tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // in progress tasks
    expect(screen.getByText('3')).toBeInTheDocument(); // pending tasks
  });

  test('displays sample tasks', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    expect(screen.getByText('プロジェクト設計書作成')).toBeInTheDocument();
    expect(screen.getByText('データベース設計')).toBeInTheDocument();
    expect(screen.getByText('UIコンポーネント実装')).toBeInTheDocument();
    expect(screen.getByText('テストケース作成')).toBeInTheDocument();
    expect(screen.getByText('本番環境デプロイ')).toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    const user = userEvent;
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Initially shows all tasks
    expect(screen.getByText('タスクリスト (5件)')).toBeInTheDocument();
    
    // Filter by completed status
    const statusSelect = screen.getAllByDisplayValue('すべて')[0];
    await user.selectOptions(statusSelect, 'completed');
    
    expect(screen.getByText('タスクリスト (1件)')).toBeInTheDocument();
    expect(screen.getByText('データベース設計')).toBeInTheDocument();
    expect(screen.queryByText('プロジェクト設計書作成')).not.toBeInTheDocument();
  });

  test('filters tasks by priority', async () => {
    const user = userEvent;
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Filter by high priority
    const prioritySelect = screen.getAllByDisplayValue('すべて')[1];
    await user.selectOptions(prioritySelect, 'high');
    
    expect(screen.getByText('タスクリスト (2件)')).toBeInTheDocument();
    expect(screen.getByText('プロジェクト設計書作成')).toBeInTheDocument();
    expect(screen.getByText('データベース設計')).toBeInTheDocument();
    expect(screen.queryByText('UIコンポーネント実装')).not.toBeInTheDocument();
  });

  test('updates task status', async () => {
    const user = userEvent;
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Find a task with pending status
    const taskCard = screen.getByText('UIコンポーネント実装').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    // Find the status select within this task card
    const statusSelect = taskCard!.querySelector('.status-select') as HTMLSelectElement;
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect.value).toBe('pending');
    
    // Change status to completed
    await user.selectOptions(statusSelect, 'completed');
    
    // Check if status was updated
    expect(statusSelect.value).toBe('completed');
    
    // Check if stats are updated (completed should increase)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // completed tasks increased
    });
  });

  test('displays correct priority and status badges', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Check priority badges
    expect(screen.getAllByText('高')).toHaveLength(2); // high priority tasks
    expect(screen.getAllByText('中')).toHaveLength(2); // medium priority tasks
    expect(screen.getAllByText('低')).toHaveLength(1); // low priority tasks
    
    // Check status badges
    expect(screen.getAllByText('完了')).toHaveLength(1); // completed tasks
    expect(screen.getAllByText('進行中')).toHaveLength(1); // in progress tasks
    expect(screen.getAllByText('未着手')).toHaveLength(3); // pending tasks
  });

  test('displays task dates correctly', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Check if due dates are displayed
    expect(screen.getByText('期限: 2024-01-20')).toBeInTheDocument();
    expect(screen.getByText('期限: 2024-01-18')).toBeInTheDocument();
    expect(screen.getByText('期限: 2024-01-25')).toBeInTheDocument();
    
    // Check if update dates are displayed
    expect(screen.getByText('更新: 2024-01-16')).toBeInTheDocument();
    expect(screen.getByText('更新: 2024-01-18')).toBeInTheDocument();
    expect(screen.getByText('更新: 2024-01-15')).toBeInTheDocument();
  });

  test('calls onLogout when logout button is clicked', async () => {
    const user = userEvent;
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('ログアウト');
    await user.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('applies correct CSS classes to task cards', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    const taskCards = screen.getAllByTestId('task-card') || document.querySelectorAll('.task-card');
    expect(taskCards.length).toBe(5);
    
    // Check if task cards have correct classes
    taskCards.forEach(card => {
      expect(card).toHaveClass('task-card');
    });
  });

  test('responsive design elements are present', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Check if main layout elements have responsive classes
    expect(document.querySelector('.dashboard')).toBeInTheDocument();
    expect(document.querySelector('.dashboard-header')).toBeInTheDocument();
    expect(document.querySelector('.dashboard-main')).toBeInTheDocument();
    expect(document.querySelector('.stats-grid')).toBeInTheDocument();
    expect(document.querySelector('.tasks-grid')).toBeInTheDocument();
  });

  test('combined filters work correctly', async () => {
    const user = userEvent;
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    
    // Filter by pending status and high priority
    const statusSelect = screen.getAllByDisplayValue('すべて')[0];
    const prioritySelect = screen.getAllByDisplayValue('すべて')[1];
    
    await user.selectOptions(statusSelect, 'pending');
    await user.selectOptions(prioritySelect, 'high');
    
    // Should show no tasks (no pending tasks with high priority)
    expect(screen.getByText('タスクリスト (0件)')).toBeInTheDocument();
    
    // Reset and try pending with medium priority
    await user.selectOptions(statusSelect, 'pending');
    await user.selectOptions(prioritySelect, 'medium');
    
    expect(screen.getByText('タスクリスト (2件)')).toBeInTheDocument();
  });
});