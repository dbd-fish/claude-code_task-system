import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import { Task } from '../types/Task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'medium',
  dueDate: '2024-01-20',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
  tags: ['tag1', 'tag2']
};

const mockProps = {
  onSave: jest.fn(),
  onCancel: jest.fn(),
  onClose: jest.fn(),
  isOpen: true,
  mode: 'create' as const
};

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create form correctly', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(screen.getByText('タスクを作成')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument();
    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/優先度/)).toBeInTheDocument();
    expect(screen.getByLabelText(/期限/)).toBeInTheDocument();
    expect(screen.getByLabelText(/タグ/)).toBeInTheDocument();
  });

  test('renders edit form correctly', () => {
    render(<TaskForm {...mockProps} task={mockTask} mode="edit" />);
    
    expect(screen.getByText('タスクを編集')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<TaskForm {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('タスクを作成')).not.toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    expect(screen.getByText('説明は必須です')).toBeInTheDocument();
    expect(screen.getByText('期限は必須です')).toBeInTheDocument();
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });

  test('validates title length', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const titleInput = screen.getByLabelText(/タイトル/);
    await user.type(titleInput, 'a'.repeat(101));
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(screen.getByText('タイトルは100文字以内で入力してください')).toBeInTheDocument();
  });

  test('validates description length', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const descriptionInput = screen.getByLabelText(/説明/);
    await user.type(descriptionInput, 'a'.repeat(501));
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(screen.getByText('説明は500文字以内で入力してください')).toBeInTheDocument();
  });

  test('validates past due date', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const dueDateInput = screen.getByLabelText(/期限/);
    await user.type(dueDateInput, '2020-01-01');
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(screen.getByText('期限は今日以降の日付を選択してください')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    await user.type(screen.getByLabelText(/タイトル/), 'New Task');
    await user.type(screen.getByLabelText(/説明/), 'New Description');
    await user.selectOptions(screen.getByLabelText(/ステータス/), 'in_progress');
    await user.selectOptions(screen.getByLabelText(/優先度/), 'high');
    await user.type(screen.getByLabelText(/期限/), '2024-12-31');
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-12-31',
      tags: []
    });
  });

  test('adds and removes tags', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const tagInput = screen.getByLabelText(/タグ/);
    const addButton = screen.getByRole('button', { name: '追加' });
    
    // Add a tag
    await user.type(tagInput, 'test-tag');
    await user.click(addButton);
    
    expect(screen.getByText('test-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
    
    // Remove the tag
    const removeButton = screen.getByRole('button', { name: '×' });
    await user.click(removeButton);
    
    expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
  });

  test('adds tag with Enter key', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const tagInput = screen.getByLabelText(/タグ/);
    await user.type(tagInput, 'enter-tag');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('enter-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  test('prevents duplicate tags', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const tagInput = screen.getByLabelText(/タグ/);
    const addButton = screen.getByRole('button', { name: '追加' });
    
    // Add first tag
    await user.type(tagInput, 'duplicate-tag');
    await user.click(addButton);
    
    // Try to add same tag again
    await user.type(tagInput, 'duplicate-tag');
    await user.click(addButton);
    
    expect(screen.getAllByText('duplicate-tag')).toHaveLength(1);
  });

  test('shows character count for title and description', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const titleInput = screen.getByLabelText(/タイトル/);
    const descriptionInput = screen.getByLabelText(/説明/);
    
    await user.type(titleInput, 'Test');
    await user.type(descriptionInput, 'Test description');
    
    expect(screen.getByText('4/100')).toBeInTheDocument();
    expect(screen.getByText('16/500')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await user.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('shows confirmation dialog when closing with unsaved changes', async () => {
    const user = userEvent;
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<TaskForm {...mockProps} />);
    
    // Make some changes
    await user.type(screen.getByLabelText(/タイトル/), 'Some text');
    
    // Try to close
    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);
    
    expect(window.confirm).toHaveBeenCalledWith('変更が保存されていません。閉じますか？');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('prevents closing when user cancels confirmation', async () => {
    const user = userEvent;
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(<TaskForm {...mockProps} />);
    
    // Make some changes
    await user.type(screen.getByLabelText(/タイトル/), 'Some text');
    
    // Try to close
    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  test('clears errors when correcting invalid input', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    // Submit to show errors
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    
    // Type in title to clear error
    const titleInput = screen.getByLabelText(/タイトル/);
    await user.type(titleInput, 'Valid title');
    
    expect(screen.queryByText('タイトルは必須です')).not.toBeInTheDocument();
  });

  test('initializes form with task data in edit mode', () => {
    render(<TaskForm {...mockProps} task={mockTask} mode="edit" />);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pending')).toBeInTheDocument();
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-20')).toBeInTheDocument();
  });

  test('disables add tag button when input is empty', () => {
    render(<TaskForm {...mockProps} />);
    
    const addButton = screen.getByRole('button', { name: '追加' });
    expect(addButton).toBeDisabled();
  });

  test('enables add tag button when input has text', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const tagInput = screen.getByLabelText(/タグ/);
    const addButton = screen.getByRole('button', { name: '追加' });
    
    await user.type(tagInput, 'test');
    
    expect(addButton).toBeEnabled();
  });

  test('prevents form submission with invalid data', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    // Only fill title, leave description empty
    await user.type(screen.getByLabelText(/タイトル/), 'Valid title');
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    expect(mockProps.onSave).not.toHaveBeenCalled();
    expect(screen.getByText('説明は必須です')).toBeInTheDocument();
  });

  test('calls onClose when clicking overlay', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const overlay = document.querySelector('.task-form-overlay');
    await user.click(overlay!);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('does not call onClose when clicking modal content', async () => {
    const user = userEvent;
    render(<TaskForm {...mockProps} />);
    
    const modal = document.querySelector('.task-form-modal');
    await user.click(modal!);
    
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
});