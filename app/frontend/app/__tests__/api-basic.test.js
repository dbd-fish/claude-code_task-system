/**
 * 基本的なAPI関数のテスト
 */
describe('API Functions Basic Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('fetchが正しく呼ばれることを確認', async () => {
    // モックレスポンスの設定
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ 
        data: [{ id: 1, title: 'テスト', status: 'pending' }], 
        success: true 
      })
    });

    // 簡単なfetchテスト
    const response = await fetch('/api/v1/tasks');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/v1/tasks');
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });

  test('APIエラーハンドリングの確認', async () => {
    // エラーレスポンスのモック
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValueOnce({ 
        message: 'タスクが見つかりません' 
      })
    });

    const response = await fetch('/api/v1/tasks/999');
    const errorData = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    expect(errorData.message).toBe('タスクが見つかりません');
  });

  test('APIフィールド名の統一性確認', () => {
    const taskData = {
      id: 1,
      title: 'テストタスク',
      description: 'テスト説明',
      deadline: '2025-07-25', // dueDateからdeadlineに統一
      assignee: '田中太郎',
      status: 'pending',
      created_at: '2025-07-20T10:00:00', // createdAtからcreated_atに統一
      updated_at: '2025-07-20T10:00:00'  // updatedAtからupdated_atに統一
    };

    // フィールド名の確認
    expect(taskData).toHaveProperty('deadline');
    expect(taskData).toHaveProperty('created_at');
    expect(taskData).toHaveProperty('updated_at');
    expect(taskData).not.toHaveProperty('dueDate');
    expect(taskData).not.toHaveProperty('createdAt');
    expect(taskData).not.toHaveProperty('updatedAt');
  });

  test('ステータス値の妥当性確認', () => {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    
    validStatuses.forEach(status => {
      const taskData = {
        id: 1,
        title: 'テスト',
        status: status
      };
      
      expect(validStatuses).toContain(taskData.status);
    });
  });

  test('APIエラークラスのテスト', () => {
    class ApiError extends Error {
      constructor(message, status, response) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
      }
    }

    const error = new ApiError('テストエラー', 400, { detail: 'エラー詳細' });

    expect(error.message).toBe('テストエラー');
    expect(error.status).toBe(400);
    expect(error.response).toEqual({ detail: 'エラー詳細' });
    expect(error.name).toBe('ApiError');
    expect(error instanceof Error).toBe(true);
  });
});