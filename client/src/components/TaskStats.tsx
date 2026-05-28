import { TaskStats } from '../types';

interface Props {
  stats: TaskStats | null;
}

const TaskStatsView = ({ stats }: Props) => {
  if (!stats) return <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 h-24"></div>;

  const total = stats.totalTasks || 0;
  const completed = stats.completedTasks || 0;
  const pending = stats.pendingTasks || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Total Tasks</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Completed</p>
        <p className="text-2xl font-bold text-green-600 mt-1">{completed}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Pending</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{pending}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Avg. Score</p>
        <p className="text-2xl font-bold text-amber-500 mt-1">
          {stats.averageImportance ? stats.averageImportance.toFixed(1) : '0.0'}
        </p>
      </div>
    </div>
  );
};

export default TaskStatsView;
