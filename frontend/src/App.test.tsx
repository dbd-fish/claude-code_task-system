import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the API service
jest.mock('./services/api', () => ({
  healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }),
  testConnection: jest.fn().mockResolvedValue({ message: 'Test successful' })
}));

test('renders login form initially', () => {
  render(<App />);
  const loginTitle = screen.getByText('ログイン');
  expect(loginTitle).toBeInTheDocument();
});

test('renders dashboard after successful login', async () => {
  const user = userEvent;
  render(<App />);
  
  // Initially should show login form
  expect(screen.getByText('ログイン')).toBeInTheDocument();
  
  // Fill out login form
  const emailInput = screen.getByLabelText('メールアドレス');
  const passwordInput = screen.getByLabelText('パスワード');
  const submitButton = screen.getByRole('button', { name: 'ログイン' });
  
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);
  
  // After successful login, should show dashboard
  await waitFor(() => {
    expect(screen.getByText('Task Manager Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ようこそ、test@example.comさん')).toBeInTheDocument();
  });
});

test('can logout from dashboard', async () => {
  const user = userEvent;
  render(<App />);
  
  // Login first
  const emailInput = screen.getByLabelText('メールアドレス');
  const passwordInput = screen.getByLabelText('パスワード');
  const submitButton = screen.getByRole('button', { name: 'ログイン' });
  
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);
  
  // Should be on dashboard
  await waitFor(() => {
    expect(screen.getByText('Task Manager Dashboard')).toBeInTheDocument();
  });
  
  // Click logout
  const logoutButton = screen.getByText('ログアウト');
  await user.click(logoutButton);
  
  // Should return to login
  await waitFor(() => {
    expect(screen.getByText('ログイン')).toBeInTheDocument();
  });
});