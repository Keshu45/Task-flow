import React, { useState } from 'react';
import { Task } from '../types';

interface Props {
  task: Task;
  onComplete: (id: string, status: 'pending' | 'completed') => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<Props> = ({ task, onComplete, onDelete }) => {
  const isHighPriority = task.priorityScore >= 50;
  const isCompleted = task.status === 'completed';
  const [showConfirm, setShowConfirm] = useState(false);
  
  const dueDateStr = new Date(task.dueDate).toLocaleDateString(undefined, { 
     month: 'short', day: 'numeric', year: 'numeric' 
  });

  const handleDelete = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }
    onDelete(task._id);
  };

  const handleToggle = () => {
    onComplete(task._id, isCompleted ? 'pending' : 'completed');
  };

  return (
    <div className={`bg-white rounded-lg p-4 border shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 ${isCompleted ? 'opacity-70 border-gray-200' : isHighPriority ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 hover:border-gray-300'}`}>
      
      {/* Complete Checkbox */}
      <button 
        onClick={handleToggle}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500 cursor-pointer'}`}
      >
        {isCompleted && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-1">
           <h4 className={`text-base font-semibold truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
           </h4>
           {isHighPriority && !isCompleted && (
             <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
               High Priority
             </span>
           )}
         </div>
        {task.description && (
          <p className="text-sm text-gray-500 mb-2 truncate">
             {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Due: <span className={!isCompleted && new Date(task.dueDate) < new Date() ? 'text-red-600 font-bold' : ''}>{dueDateStr}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Score: {task.priorityScore}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            Lvl {task.importance}
          </span>
        </div>
      </div>

      <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0 border-gray-100">
         <button onClick={handleDelete} className={`text-sm font-medium transition-colors p-1 cursor-pointer ${showConfirm ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-red-500'}`}>
            {showConfirm ? 'Confirm?' : 'Delete'}
         </button>
      </div>
    </div>
  );
};

export default TaskItem;
