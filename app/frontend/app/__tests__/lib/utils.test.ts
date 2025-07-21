import { getStatusLabel, getStatusColor, getDueDateColor } from '../../lib/utils';

/**
 * ユーティリティ関数のテスト
 */
describe('Utils Functions', () => {
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
      expect(getStatusLabel('unknown' as any)).toBe('unknown');
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
      expect(getStatusColor('unknown' as any)).toBe('#6c757d');
    });
  });

  describe('getDueDateColor', () => {
    // 現在日時を固定してテストの安定性を確保
    const mockDate = new Date('2025-07-20T00:00:00Z');
    
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test('過去の日付の場合に赤色を返す', () => {
      const pastDate = '2025-07-19'; // 昨日
      expect(getDueDateColor(pastDate)).toBe('#dc3545');
    });

    test('今日の日付の場合にオレンジ色を返す', () => {
      const today = '2025-07-20'; // 今日
      expect(getDueDateColor(today)).toBe('#fd7e14');
    });

    test('明日の日付の場合にオレンジ色を返す', () => {
      const tomorrow = '2025-07-21'; // 明日
      expect(getDueDateColor(tomorrow)).toBe('#fd7e14');
    });

    test('3日後の日付の場合に黒色を返す', () => {
      const futureDate = '2025-07-23'; // 3日後
      expect(getDueDateColor(futureDate)).toBe('#000');
    });

    test('無効な日付形式の場合に黒色を返す', () => {
      const invalidDate = 'invalid-date';
      expect(getDueDateColor(invalidDate)).toBe('#000');
    });

    test('空文字の場合に黒色を返す', () => {
      expect(getDueDateColor('')).toBe('#000');
    });
  });
});