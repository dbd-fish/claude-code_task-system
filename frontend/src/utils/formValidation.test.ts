import {
  validateField,
  validateForm,
  validateDate,
  validateTaskForm,
  validateFieldRealtime,
  commonPatterns,
  customValidators
} from './formValidation';

describe('Form Validation Utils', () => {
  describe('validateField', () => {
    test('validates required field', () => {
      const rule = { required: true };
      
      expect(validateField('', rule, 'テスト')).toBe('テストは必須です');
      expect(validateField('  ', rule, 'テスト')).toBe('テストは必須です');
      expect(validateField('value', rule, 'テスト')).toBeNull();
    });

    test('validates minimum length', () => {
      const rule = { minLength: 5 };
      
      expect(validateField('123', rule, 'テスト')).toBe('テストは5文字以上で入力してください');
      expect(validateField('12345', rule, 'テスト')).toBeNull();
      expect(validateField('123456', rule, 'テスト')).toBeNull();
    });

    test('validates maximum length', () => {
      const rule = { maxLength: 5 };
      
      expect(validateField('123456', rule, 'テスト')).toBe('テストは5文字以内で入力してください');
      expect(validateField('12345', rule, 'テスト')).toBeNull();
      expect(validateField('123', rule, 'テスト')).toBeNull();
    });

    test('validates pattern', () => {
      const rule = { pattern: /^[a-zA-Z]+$/ };
      
      expect(validateField('123', rule, 'テスト')).toBe('テストの形式が正しくありません');
      expect(validateField('abc', rule, 'テスト')).toBeNull();
      expect(validateField('ABC', rule, 'テスト')).toBeNull();
    });

    test('validates custom rule', () => {
      const rule = { custom: (value: string) => value === 'invalid' ? 'カスタムエラー' : null };
      
      expect(validateField('invalid', rule, 'テスト')).toBe('カスタムエラー');
      expect(validateField('valid', rule, 'テスト')).toBeNull();
    });

    test('combines multiple validations', () => {
      const rule = { required: true, minLength: 3, maxLength: 10 };
      
      expect(validateField('', rule, 'テスト')).toBe('テストは必須です');
      expect(validateField('12', rule, 'テスト')).toBe('テストは3文字以上で入力してください');
      expect(validateField('12345678901', rule, 'テスト')).toBe('テストは10文字以内で入力してください');
      expect(validateField('12345', rule, 'テスト')).toBeNull();
    });
  });

  describe('validateForm', () => {
    test('validates multiple fields', () => {
      const data = {
        title: '',
        description: 'valid description',
        email: 'invalid-email'
      };

      const rules = {
        title: { required: true },
        description: { required: true },
        email: { pattern: commonPatterns.email }
      };

      const labels = {
        title: 'タイトル',
        description: '説明',
        email: 'メールアドレス'
      };

      const errors = validateForm(data, rules, labels);

      expect(errors.title).toBe('タイトルは必須です');
      expect(errors.description).toBeUndefined();
      expect(errors.email).toBe('メールアドレスの形式が正しくありません');
    });

    test('returns empty object for valid data', () => {
      const data = {
        title: 'Valid Title',
        description: 'Valid Description'
      };

      const rules = {
        title: { required: true, maxLength: 50 },
        description: { required: true, maxLength: 200 }
      };

      const labels = {
        title: 'タイトル',
        description: '説明'
      };

      const errors = validateForm(data, rules, labels);

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('validateDate', () => {
    test('validates future date', () => {
      const pastDate = '2020-01-01';
      const futureDate = '2030-01-01';

      expect(validateDate(pastDate)).toBe('期限は今日以降の日付を選択してください');
      expect(validateDate(futureDate)).toBeNull();
    });

    test('returns null for empty date', () => {
      expect(validateDate('')).toBeNull();
    });
  });

  describe('validateTaskForm', () => {
    test('validates task form data', () => {
      const invalidData = {
        title: '',
        description: 'a'.repeat(501),
        dueDate: '2020-01-01'
      };

      const errors = validateTaskForm(invalidData);

      expect(errors.title).toBe('タイトルは必須です');
      expect(errors.description).toBe('説明は500文字以内で入力してください');
      expect(errors.dueDate).toBe('期限は今日以降の日付を選択してください');
    });

    test('returns no errors for valid task data', () => {
      const validData = {
        title: 'Valid Title',
        description: 'Valid Description',
        dueDate: '2030-01-01'
      };

      const errors = validateTaskForm(validData);

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('validateFieldRealtime', () => {
    test('validates only specific rules for realtime', () => {
      const rule = { required: true, maxLength: 5 };
      
      // Required rule should not be applied in realtime
      expect(validateFieldRealtime('field', '', rule, 'テスト')).toBeNull();
      
      // Max length should be applied
      expect(validateFieldRealtime('field', '123456', rule, 'テスト')).toBe('テストは5文字以内で入力してください');
    });
  });

  describe('commonPatterns', () => {
    test('validates email pattern', () => {
      expect(commonPatterns.email.test('test@example.com')).toBe(true);
      expect(commonPatterns.email.test('invalid-email')).toBe(false);
    });

    test('validates URL pattern', () => {
      expect(commonPatterns.url.test('https://example.com')).toBe(true);
      expect(commonPatterns.url.test('http://example.com')).toBe(true);
      expect(commonPatterns.url.test('example.com')).toBe(false);
    });

    test('validates phone number pattern', () => {
      expect(commonPatterns.phoneNumber.test('090-1234-5678')).toBe(true);
      expect(commonPatterns.phoneNumber.test('03-1234-5678')).toBe(true);
      expect(commonPatterns.phoneNumber.test('090-123-5678')).toBe(false);
    });

    test('validates postal code pattern', () => {
      expect(commonPatterns.postalCode.test('123-4567')).toBe(true);
      expect(commonPatterns.postalCode.test('123-456')).toBe(false);
    });
  });

  describe('customValidators', () => {
    test('validates future date', () => {
      expect(customValidators.futureDate('2020-01-01')).toBe('未来の日付を選択してください');
      expect(customValidators.futureDate('2030-01-01')).toBeNull();
    });

    test('validates past date', () => {
      expect(customValidators.pastDate('2030-01-01')).toBe('過去の日付を選択してください');
      expect(customValidators.pastDate('2020-01-01')).toBeNull();
    });

    test('validates minimum date', () => {
      const minDateValidator = customValidators.minDate('2024-01-01');
      
      expect(minDateValidator('2023-12-31')).toBe('2024-01-01以降の日付を選択してください');
      expect(minDateValidator('2024-01-02')).toBeNull();
    });

    test('validates maximum date', () => {
      const maxDateValidator = customValidators.maxDate('2024-01-01');
      
      expect(maxDateValidator('2024-01-02')).toBe('2024-01-01以前の日付を選択してください');
      expect(maxDateValidator('2023-12-31')).toBeNull();
    });
  });
});