// Formula: (importance * 10) + (100 / max(daysUntilDue, 1))

export const calculatePriorityScore = (
  importance: number,
  dueDate: Date,
  status: 'pending' | 'completed'
): number => {
  if (status === 'completed') {
    return 0; // Completed tasks have 0 priority score
  }

  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // Cap at 1 to prevent division by zero or negative logic
  const maxDaysUntilDue = Math.max(daysDiff, 1);

  let priorityScore = (importance * 10) + (100 / maxDaysUntilDue);
  
  // Round to 2 decimals
  return Math.round(priorityScore * 100) / 100;
};
