import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  test('renders login form elements', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('パスワードをお忘れですか？')).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    const user = userEvent;
    render(<Login onLogin={mockOnLogin} />);
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submitButton);
    
    expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('displays validation error for invalid email format', async () => {
    const user = userEvent;
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('displays validation error for short password', async () => {
    const user = userEvent;
    render(<Login onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(passwordInput, '123');
    await user.click(submitButton);
    
    expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('calls onLogin with valid credentials', async () => {
    const user = userEvent;
    mockOnLogin.mockResolvedValue(undefined);
    
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('shows loading state during login', async () => {
    const user = userEvent;
    mockOnLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText('ログイン')).toBeInTheDocument();
    });
  });

  test('handles login error gracefully', async () => {
    const user = userEvent;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockOnLogin.mockRejectedValue(new Error('Login failed'));
    
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('clears validation errors when user types', async () => {
    const user = userEvent;
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    // Submit empty form to trigger validation errors
    await user.click(submitButton);
    expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
    
    // Type in email field
    await user.type(emailInput, 'test@example.com');
    
    // Submit again to trigger validation
    await user.click(submitButton);
    
    // Email error should be cleared, but password error should remain
    expect(screen.queryByText('メールアドレスは必須です')).not.toBeInTheDocument();
    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
  });
});