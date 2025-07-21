import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  checkApiConnection,
  ApiError 
} from '../../lib/api';
import type { Task, CreateTaskData, UpdateTaskData } from '../../lib/api';

// fetchのモック
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

/**
 * API関数のテスト
 */
describe('API Functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getTasks', () => {
    test('タスク一覧を正常に取得する', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'テストタスク1',
          description: 'テスト説明1',
          dueDate: '2025-07-25',
          assignee: '田中太郎',
          status: 'pending'
        },
        {
          id: 2,
          title: 'テストタスク2',
          description: 'テスト説明2',
          dueDate: '2025-07-26',
          assignee: '佐藤花子',
          status: 'in_progress'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: mockTasks, success: true })
      } as any);

      const result = await getTasks();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockTasks);
    });

    test('APIエラー時にApiErrorを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ message: 'サーバーエラー' })
      } as any);

      await expect(getTasks()).rejects.toThrow(ApiError);
    });
  });

  describe('getTask', () => {
    test('特定のタスクを正常に取得する', async () => {
      const mockTask: Task = {
        id: 1,
        title: 'テストタスク',
        description: 'テスト説明',
        dueDate: '2025-07-25',
        assignee: '田中太郎',
        status: 'pending'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: mockTask, success: true })
      } as any);

      const result = await getTask(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    test('新しいタスクを正常に作成する', async () => {
      const newTaskData: CreateTaskData = {
        title: '新しいタスク',
        description: '新しい説明',
        dueDate: '2025-07-30',
        assignee: '山田太郎'
      };

      const createdTask: Task = {
        id: 3,
        ...newTaskData,
        status: 'pending'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: createdTask, success: true })
      } as any);

      const result = await createTask(newTaskData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTaskData)
        })
      );
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    test('タスクを正常に更新する', async () => {
      const updateData: UpdateTaskData = {
        title: '更新されたタスク',
        description: '更新された説明',
        dueDate: '2025-07-31',
        assignee: '佐藤花子',
        status: 'completed'
      };

      const updatedTask: Task = {
        id: 1,
        ...updateData
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: updatedTask, success: true })
      } as any);

      const result = await updateTask(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    test('タスクを正常に削除する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: null, success: true })
      } as any);

      await deleteTask(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    test('削除失敗時にApiErrorを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce({ message: 'タスクが見つかりません' })
      } as any);

      await expect(deleteTask(999)).rejects.toThrow(ApiError);
    });
  });

  describe('checkApiConnection', () => {
    test('API接続が成功する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: 'ok' })
      } as any);

      const result = await checkApiConnection();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/health',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    test('API接続が失敗する', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ネットワークエラー'));

      const result = await checkApiConnection();

      expect(result).toBe(false);
    });
  });

  describe('ApiError', () => {
    test('ApiErrorが正しく生成される', () => {
      const error = new ApiError('テストエラー', 400, { detail: 'エラー詳細' });

      expect(error.message).toBe('テストエラー');
      expect(error.status).toBe(400);
      expect(error.response).toEqual({ detail: 'エラー詳細' });
      expect(error.name).toBe('ApiError');
    });
  });
});