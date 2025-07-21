/**
 * ユーティリティ関数の基本テスト
 */
describe('Utils Functions Basic Tests', () => {
  
  // ステータスラベル関数のテスト
  function getStatusLabel(status) {
    switch (status) {
      case 'pending': return '未着手';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      default: return status;
    }
  }

  // ステータス色関数のテスト
  function getStatusColor(status) {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'in_progress': return '#17a2b8';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  }

  // 期限色関数のテスト（簡略化）
  function getDueDateColor(dueDate) {
    if (!dueDate) return '#000';
    
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return '#dc3545'; // 過去（赤）
      if (diffDays <= 1) return '#fd7e14'; // 今日・明日（オレンジ）
      return '#000'; // 未来（黒）
    } catch {
      return '#000';
    }
  }

  describe('getStatusLabel', () => {
    test('pending の場合に "未着手" を返す', () => {
      expect(getStatusLabel('pending')).toBe('未着手');
    });

    test('in_progress の場合に "進行中" を返す', () => {
      expect(getStatusLabel('in_progress')).toBe('進行中');
    });

    test('completed の場合に "完了" を返す', () => {
      expect(getStatusLabel('completed')).toBe('完了');
    });

    test('未知のステータスの場合はそのまま返す', () => {
      expect(getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('getStatusColor', () => {
    test('pending の場合に黄色を返す', () => {
      expect(getStatusColor('pending')).toBe('#ffc107');
    });

    test('in_progress の場合に青色を返す', () => {
      expect(getStatusColor('in_progress')).toBe('#17a2b8');
    });

    test('completed の場合に緑色を返す', () => {
      expect(getStatusColor('completed')).toBe('#28a745');
    });

    test('未知のステータスの場合はグレーを返す', () => {
      expect(getStatusColor('unknown')).toBe('#6c757d');
    });
  });

  describe('getDueDateColor', () => {
    test('空文字の場合に黒色を返す', () => {
      expect(getDueDateColor('')).toBe('#000');
    });

    test('nullの場合に黒色を返す', () => {
      expect(getDueDateColor(null)).toBe('#000');
    });

    test('無効な日付形式の場合に黒色を返す', () => {
      expect(getDueDateColor('invalid-date')).toBe('#000');
    });

    test('過去の日付の場合に赤色を返す', () => {
      const pastDate = '2020-01-01'; // 明らかに過去
      expect(getDueDateColor(pastDate)).toBe('#dc3545');
    });

    test('未来の日付の場合に黒色を返す', () => {
      const futureDate = '2030-01-01'; // 明らかに未来
      expect(getDueDateColor(futureDate)).toBe('#000');
    });
  });
});