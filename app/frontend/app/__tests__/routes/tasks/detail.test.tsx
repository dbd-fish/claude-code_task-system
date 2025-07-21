import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import TaskDetail from '../../../routes/tasks/detail';
import { deleteTask } from '../../../lib/api';

// API関数のモック
jest.mock('../../../lib/api', () => ({
  deleteTask: jest.fn()
}));

const mockDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;
const mockNavigate = jest.fn();

// React Routerのモック
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

/**
 * TaskDetailコンポーネントのテスト
 */
describe('TaskDetail Component', () => {
  beforeEach(() => {
    mockDeleteTask.mockClear();
    mockNavigate.mockClear();
    global.confirm = jest.fn(() => true);
    global.alert = jest.fn();
  });

  const renderTaskDetail = () => {
    return render(
      <MemoryRouter>
        <TaskDetail />
      </MemoryRouter>
    );
  };

  test('タスク詳細が正しく表示される', () => {
    renderTaskDetail();

    // タスクタイトルが表示されること
    expect(screen.getByText('React Routerの学習')).toBeInTheDocument();
    
    // ステータスが表示されること
    expect(screen.getByText('進行中')).toBeInTheDocument();
    
    // 担当者が表示されること
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    
    // 期限が表示されること
    expect(screen.getByText('2025-07-25')).toBeInTheDocument();
    
    // 説明が表示されること
    expect(screen.getByText(/React Router V7の基本機能を理解する/)).toBeInTheDocument();
  });

  test('編集ボタンが正しいリンクで表示される', () => {
    renderTaskDetail();

    const editButton = screen.getByText('編集');
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute('href', '/tasks/1/edit');
  });

  test('削除ボタンが表示される', () => {
    renderTaskDetail();

    const deleteButton = screen.getByText('削除');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton.tagName).toBe('BUTTON');
  });

  test('削除ボタンをクリックして確認後に削除処理が実行される', async () => {
    mockDeleteTask.mockResolvedValueOnce();
    renderTaskDetail();

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // 確認ダイアログが表示されることを確認
    expect(global.confirm).toHaveBeenCalledWith('このタスクを削除しますか？');

    // deleteTask APIが呼ばれることを確認
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(1);
    });

    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('タスクが削除されました');
    });

    // タスク一覧ページに遷移することを確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  test('削除処理でエラーが発生した場合エラーメッセージが表示される', async () => {
    mockDeleteTask.mockRejectedValueOnce(new Error('削除エラー'));
    renderTaskDetail();

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('タスクの削除に失敗しました');
    });

    // ナビゲーションは実行されないことを確認
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('削除確認をキャンセルした場合削除処理が実行されない', () => {
    global.confirm = jest.fn(() => false);
    renderTaskDetail();

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // 確認ダイアログが表示されることを確認
    expect(global.confirm).toHaveBeenCalledWith('このタスクを削除しますか？');

    // deleteTask APIが呼ばれないことを確認
    expect(mockDeleteTask).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('タスク一覧に戻るリンクが表示される', () => {
    renderTaskDetail();

    const backLink = screen.getByText('← タスク一覧に戻る');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/tasks');
  });

  test('存在しないタスクIDの場合エラーメッセージが表示される', () => {
    // useParamsを一時的にモック
    jest.doMock('react-router', () => ({
      ...jest.requireActual('react-router'),
      useParams: () => ({ id: '999' }),
      useNavigate: () => mockNavigate,
      Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
    }));

    renderTaskDetail();

    expect(screen.getByText('タスクが見つかりません')).toBeInTheDocument();
    expect(screen.getByText('指定されたタスクは存在しません。')).toBeInTheDocument();
    expect(screen.getByText('タスク一覧に戻る')).toHaveAttribute('href', '/tasks');
  });
});