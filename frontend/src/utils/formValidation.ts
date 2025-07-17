export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName}は必須です`;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName}は${rules.minLength}文字以上で入力してください`;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName}は${rules.maxLength}文字以内で入力してください`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${fieldName}の形式が正しくありません`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: Record<string, any>,
  validationRules: Record<string, ValidationRule>,
  fieldLabels: Record<string, string>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    const value = data[field];
    const label = fieldLabels[field] || field;
    
    const error = validateField(value, rule, label);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// 日付のバリデーション
export const validateDate = (dateString: string): string | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return '期限は今日以降の日付を選択してください';
  }

  return null;
};

// タスクフォーム専用のバリデーション関数
export const validateTaskForm = (formData: {
  title: string;
  description: string;
  dueDate: string;
}) => {
  const validationRules = {
    title: {
      required: true,
      maxLength: 100
    },
    description: {
      required: true,
      maxLength: 500
    },
    dueDate: {
      required: true,
      custom: validateDate
    }
  };

  const fieldLabels = {
    title: 'タイトル',
    description: '説明',
    dueDate: '期限'
  };

  return validateForm(formData, validationRules, fieldLabels);
};

// リアルタイムバリデーション用
export const validateFieldRealtime = (
  field: string,
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  // リアルタイムバリデーションでは一部のルールのみ適用
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return `${fieldName}は${rules.maxLength}文字以内で入力してください`;
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return `${fieldName}の形式が正しくありません`;
  }

  return null;
};

// よく使用されるパターン
export const commonPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phoneNumber: /^\d{2,4}-\d{2,4}-\d{4}$/,
  postalCode: /^\d{3}-\d{4}$/
};

// カスタムバリデーション関数
export const customValidators = {
  futureDate: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return '未来の日付を選択してください';
    }
    return null;
  },
  
  pastDate: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date > today) {
      return '過去の日付を選択してください';
    }
    return null;
  },
  
  minDate: (minDate: string) => (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const min = new Date(minDate);
    
    if (date < min) {
      return `${minDate}以降の日付を選択してください`;
    }
    return null;
  },
  
  maxDate: (maxDate: string) => (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const max = new Date(maxDate);
    
    if (date > max) {
      return `${maxDate}以前の日付を選択してください`;
    }
    return null;
  }
};