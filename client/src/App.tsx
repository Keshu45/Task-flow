import React, { useEffect, useState, useCallback } from 'react';
import api from './api/axios';
import { Task, TaskStats } from './types';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import TaskStatsView from './components/TaskStats';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [minImportance, setMinImportance] = useState('Any Importance');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All Status') {
        params.append('status', statusFilter.toLowerCase());
      }
      if (minImportance && minImportance.startsWith('Min Importance: ')) {
        const val = minImportance.split(': ')[1];
        params.append('minImportance', val);
      }
      
      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/tasks?${params.toString()}`),
        api.get('/tasks/stats')
      ]);
      
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, minImportance]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleUpdateTaskStatus = async (id: string, status: 'pending' | 'completed') => {
    try {
      await api.patch(`/tasks/${id}`, { status });
      fetchDashboard();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right text-sm text-gray-700 hidden sm:block">
               Admin User
             </div>
             <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
               ME
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Form */}
        <div className="w-full md:w-1/3 xl:w-1/4 flex flex-col gap-6 shrink-0">
          <TaskForm onTaskCreated={fetchDashboard} />
        </div>

        {/* Right Column: Stats & Task List */}
        <div className="flex-1 w-full flex flex-col gap-6 overflow-hidden">
          {/* Quick Stats Section */}
          <TaskStatsView stats={stats} />

          {/* Task List (The Core) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                 Tasks in Queue
                 {loading && <span className="text-blue-600 text-sm font-normal">Loading...</span>}
              </h3>
              <div className="flex gap-2">
                <select 
                  className="text-sm bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-3 py-2 outline-none hover:bg-gray-100 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
                <select 
                  className="text-sm bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-3 py-2 outline-none hover:bg-gray-100 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={minImportance}
                  onChange={(e) => setMinImportance(e.target.value)}
                >
                  <option>Any Importance</option>
                  <option>Min Importance: 3</option>
                  <option>Min Importance: 4</option>
                  <option>Min Importance: 5</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:max-h-[60vh] bg-gray-50/50">
               {error ? (
                 <div className="text-center text-red-500 p-4 font-medium">{error}</div>
               ) : tasks.length === 0 && !loading ? (
                 <div className="text-center text-gray-500 py-12">No tasks found.</div>
               ) : (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <TaskItem 
                        key={task._id} 
                        task={task} 
                        onComplete={handleUpdateTaskStatus}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
