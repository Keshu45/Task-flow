import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task, { ITask } from '../models/Task.js';
import { calculatePriorityScore } from '../utils/priority.js';

// Map DB Document to API response with calculated score
const mapTaskToResponse = (task: ITask) => {
  const score = calculatePriorityScore(task.importance, task.dueDate, task.status);
  return {
    ...task.toObject(),
    priorityScore: score
  };
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, importance, dueDate } = req.body;
    
    if (new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      res.status(400);
      throw new Error('Due date must be in the future');
    }

    const task = await Task.create({ title, description, importance, dueDate });
    res.status(201).json(mapTaskToResponse(task));
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400);
    }
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, minImportance } = req.query;
    
    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (minImportance) filter.importance = { $gte: Number(minImportance) };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    
    // Map tasks to dynamically calculate priorityScore
    const mappedTasks = tasks.map(mapTaskToResponse);
    
    // Sort mapped tasks by priorityScore DESC
    mappedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json(mappedTasks);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid Task ID');
    }
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    
    res.json(mapTaskToResponse(task));
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400);
    }
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid Task ID');
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const statsArray = await Task.aggregate([
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                averageImportance: { $avg: '$importance' },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$status', 'pending'] },
                          { $lt: ['$dueDate', now] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          tasksByImportance: [
            {
              $group: {
                _id: '$importance',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const result = statsArray[0] || {};
    const metrics = result.metrics?.[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0
    };
    
    res.json({
      ...metrics,
      _id: undefined,
      tasksByImportance: result.tasksByImportance || []
    });
  } catch (error) {
    next(error);
  }
};
