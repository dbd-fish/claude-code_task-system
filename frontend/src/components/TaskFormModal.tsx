import React from 'react';
import TaskForm from './TaskForm';
import { Task } from '../types/Task';

interface TaskFormModalProps {
  isOpen: boolean;
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onClose: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  task,
  onSave,
  onCancel,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <TaskForm
      task={task}
      onSave={onSave}
      onCancel={onCancel}
      onClose={onClose}
      isOpen={isOpen}
      mode={task ? 'edit' : 'create'}
    />
  );
};

export default TaskFormModal;