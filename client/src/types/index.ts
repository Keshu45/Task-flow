export interface Task {
  _id: string;
  title: string;
  description?: string;
  importance: number;
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  priorityScore: number;
}

export interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  averageImportance: number;
  overdueTasks: number;
  tasksByImportance: { _id: number; count: number }[];
}
