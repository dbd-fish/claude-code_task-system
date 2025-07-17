import React, { useState, useEffect } from 'react';
import './TaskForm.css';
import { Task } from '../types/Task';

interface TaskFormProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onClose: () => void;
  isOpen: boolean;
  mode: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSave,
  onCancel,
  onClose,
  isOpen,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    dueDate?: string;
  }>({});

  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // タスクデータの初期化
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        tags: []
      });
    }
    setErrors({});
    setIsDirty(false);
  }, [task, mode, isOpen]);

  // フォームの変更を監視
  useEffect(() => {
    if (isOpen) {
      setIsDirty(true);
    }
  }, [formData, isOpen]);

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください';
    }

    if (!formData.description.trim()) {
      newErrors.description = '説明は必須です';
    } else if (formData.description.length > 500) {
      newErrors.description = '説明は500文字以内で入力してください';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = '期限は必須です';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = '期限は今日以降の日付を選択してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      tags: formData.tags
    });
  };

  // 入力値の変更
  const handleInputChange = (
    field: keyof typeof formData,
    value: string | Task['status'] | Task['priority'] | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // タグの追加
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  };

  // タグの削除
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Enterキーでタグ追加
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // モーダルクローズ時の確認
  const handleClose = () => {
    if (isDirty && (formData.title || formData.description)) {
      if (window.confirm('変更が保存されていません。閉じますか？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (isDirty && (formData.title || formData.description)) {
      if (window.confirm('変更が保存されていません。キャンセルしますか？')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // 文字数カウント
  const getCharacterCount = (text: string, limit: number) => {
    return `${text.length}/${limit}`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="task-form-overlay" onClick={handleClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h2>{mode === 'create' ? 'タスクを作成' : 'タスクを編集'}</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* タイトル */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              タイトル <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="タスクのタイトルを入力"
              maxLength={100}
            />
            <div className="form-footer">
              {errors.title && <span className="error-message">{errors.title}</span>}
              <span className="character-count">
                {getCharacterCount(formData.title, 100)}
              </span>
            </div>
          </div>

          {/* 説明 */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              説明 <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="タスクの詳細な説明を入力"
              rows={4}
              maxLength={500}
            />
            <div className="form-footer">
              {errors.description && <span className="error-message">{errors.description}</span>}
              <span className="character-count">
                {getCharacterCount(formData.description, 500)}
              </span>
            </div>
          </div>

          {/* ステータスと優先度 */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                ステータス
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Task['status'])}
                className="form-select"
              >
                <option value="pending">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                優先度
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Task['priority'])}
                className="form-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          {/* 期限 */}
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              期限 <span className="required">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={`form-input ${errors.dueDate ? 'error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          {/* タグ */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              タグ
            </label>
            <div className="tags-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="form-input"
                placeholder="タグを入力してEnterを押す"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="add-tag-button"
                disabled={!tagInput.trim()}
              >
                追加
              </button>
            </div>
            <div className="tags-display">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag-button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="save-button"
            >
              {mode === 'create' ? '作成' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;