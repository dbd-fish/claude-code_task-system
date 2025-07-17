import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList';
import { Task } from '../types/Task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-01-20',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-25',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14'
  }
];

const mockProps = {
  tasks: mockTasks,
  onUpdateTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onEditTask: jest.fn(),
  selectedTasks: [],
  onSelectTask: jest.fn(),
  onSelectAllTasks: jest.fn(),
  viewMode: 'list' as const,
  onViewModeChange: jest.fn()
};

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task list with tasks', () => {
    render(<TaskList {...mockProps} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('3件のタスク')).toBeInTheDocument();
  });

  test('renders empty state when no tasks', () => {
    render(<TaskList {...mockProps} tasks={[]} />);
    
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(screen.getByText('新しいタスクを作成してください')).toBeInTheDocument();
  });

  test('switches between list and grid view', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Initially in list view
    expect(screen.getByText('リスト')).toHaveClass('active');
    
    // Switch to grid view
    await user.click(screen.getByText('グリッド'));
    expect(mockProps.onViewModeChange).toHaveBeenCalledWith('grid');
  });

  test('renders grid view correctly', () => {
    render(<TaskList {...mockProps} viewMode="grid" />);
    
    // Check if grid container exists
    expect(document.querySelector('.task-grid')).toBeInTheDocument();
    
    // Check if task cards are rendered
    expect(document.querySelectorAll('.task-card')).toHaveLength(3);
  });

  test('sorts tasks by different criteria', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Test sorting by priority
    const sortSelect = screen.getByDisplayValue('期限日');
    await user.selectOptions(sortSelect, 'priority');
    
    // Check if sort order button is present
    expect(screen.getByText('↑')).toBeInTheDocument();
    
    // Click sort order button
    await user.click(screen.getByText('↑'));
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('selects individual tasks', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Find and click the first task checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    const firstTaskCheckbox = checkboxes[1]; // Skip the select-all checkbox
    
    await user.click(firstTaskCheckbox);
    expect(mockProps.onSelectTask).toHaveBeenCalledWith('1');
  });

  test('selects all tasks', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Find and click the select-all checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);
    
    expect(mockProps.onSelectAllTasks).toHaveBeenCalledWith(['1', '2', '3']);
  });

  test('shows bulk actions when tasks are selected', () => {
    render(<TaskList {...mockProps} selectedTasks={['1', '2']} />);
    
    expect(screen.getByText('2件選択中')).toBeInTheDocument();
    expect(screen.getByText('完了にする')).toBeInTheDocument();
    expect(screen.getByText('進行中にする')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  test('performs bulk status update', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} selectedTasks={['1', '2']} />);
    
    await user.click(screen.getByText('完了にする'));
    
    expect(mockProps.onUpdateTask).toHaveBeenCalledWith('1', {
      status: 'completed',
      updatedAt: expect.any(String)
    });
    expect(mockProps.onUpdateTask).toHaveBeenCalledWith('2', {
      status: 'completed',
      updatedAt: expect.any(String)
    });
  });

  test('performs bulk delete with confirmation', async () => {
    const user = userEvent;
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<TaskList {...mockProps} selectedTasks={['1', '2']} />);
    
    await user.click(screen.getByText('削除'));
    
    expect(window.confirm).toHaveBeenCalledWith('選択した2個のタスクを削除しますか？');
    expect(mockProps.onDeleteTask).toHaveBeenCalledWith('1');
    expect(mockProps.onDeleteTask).toHaveBeenCalledWith('2');
  });

  test('updates task status from dropdown', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Find status select for first task
    const statusSelects = screen.getAllByDisplayValue('未着手');
    await user.selectOptions(statusSelects[0], 'completed');
    
    expect(mockProps.onUpdateTask).toHaveBeenCalledWith('1', {
      status: 'completed',
      updatedAt: expect.any(String)
    });
  });

  test('deletes individual task with confirmation', async () => {
    const user = userEvent;
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<TaskList {...mockProps} />);
    
    // Find and click delete button for first task
    const deleteButtons = screen.getAllByText('削除');
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('このタスクを削除しますか？');
    expect(mockProps.onDeleteTask).toHaveBeenCalledWith('1');
  });

  test('shows overdue indicator for overdue tasks', () => {
    const overdueTasks = [{
      ...mockTasks[0],
      dueDate: '2020-01-01' // Past date
    }];
    
    render(<TaskList {...mockProps} tasks={overdueTasks} />);
    
    expect(screen.getByText('期限切れ')).toBeInTheDocument();
  });

  test('sorts tasks correctly by title', () => {
    const unsortedTasks = [
      { ...mockTasks[0], title: 'Z Task' },
      { ...mockTasks[1], title: 'A Task' },
      { ...mockTasks[2], title: 'M Task' }
    ];
    
    render(<TaskList {...mockProps} tasks={unsortedTasks} />);
    
    // Tasks should be sorted by due date initially
    const taskTitles = screen.getAllByText(/Task/);
    expect(taskTitles[0]).toHaveTextContent('Z Task'); // First by due date
  });

  test('displays correct priority and status badges', () => {
    render(<TaskList {...mockProps} />);
    
    // Check priority badges
    expect(screen.getByText('高')).toBeInTheDocument(); // high priority
    expect(screen.getByText('中')).toBeInTheDocument(); // medium priority  
    expect(screen.getByText('低')).toBeInTheDocument(); // low priority
    
    // Check status badges (in grid view)
    render(<TaskList {...mockProps} viewMode="grid" />);
    expect(screen.getByText('未着手')).toBeInTheDocument(); // pending
    expect(screen.getByText('進行中')).toBeInTheDocument(); // in_progress
    expect(screen.getByText('完了')).toBeInTheDocument(); // completed
  });

  test('handles clicking on sortable table headers', async () => {
    const user = userEvent;
    render(<TaskList {...mockProps} />);
    
    // Click on title header to sort by title
    await user.click(screen.getByText(/タイトル/));
    
    // Should show sort indicator
    expect(screen.getByText(/タイトル ↑/)).toBeInTheDocument();
  });

  test('cancels bulk delete when user cancels confirmation', async () => {
    const user = userEvent;
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(<TaskList {...mockProps} selectedTasks={['1']} />);
    
    await user.click(screen.getByText('削除'));
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockProps.onDeleteTask).not.toHaveBeenCalled();
  });

  test('shows selected state for selected tasks', () => {
    render(<TaskList {...mockProps} selectedTasks={['1']} />);
    
    // In list view, check if row has selected class
    const taskRows = document.querySelectorAll('.task-row');
    expect(taskRows[0]).toHaveClass('selected');
  });

  test('renders task descriptions correctly', () => {
    render(<TaskList {...mockProps} />);
    
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
  });
});