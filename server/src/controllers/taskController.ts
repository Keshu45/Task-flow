import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Task, { ITask } from '../models/Task.js';
import { calculatePriorityScore } from '../utils/priority.js';

let mockTasks: any[] = [];
let mockIdCounter = 1;

// Map DB Document to API response with calculated score
const mapTaskToResponse = (task: ITask) => {
  const score = calculatePriorityScore(task.importance, task.dueDate, task.status);
  const taskObj = typeof task.toObject === 'function' ? task.toObject() : task;
  return {
    ...taskObj,
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

    if (!process.env.MONGODB_URI) {
      const task = { _id: String(mockIdCounter++), title, description, importance, dueDate, status: 'pending', createdAt: new Date() };
      mockTasks.push(task);
      return res.status(201).json(mapTaskToResponse(task as any));
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
    
    if (!process.env.MONGODB_URI) {
       let filteredTasks = mockTasks;
       if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
       if (minImportance) filteredTasks = filteredTasks.filter(t => t.importance >= Number(minImportance));
       const mappedTasks = filteredTasks.map(t => mapTaskToResponse(t as any));
       mappedTasks.sort((a, b) => b.priorityScore - a.priorityScore);
       return res.json(mappedTasks);
    }

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
    if (!process.env.MONGODB_URI) {
      const idx = mockTasks.findIndex(t => t._id === req.params.id);
      if (idx === -1) { res.status(404); throw new Error('Task not found'); }
      mockTasks[idx] = { ...mockTasks[idx], ...req.body };
      return res.json(mapTaskToResponse(mockTasks[idx] as any));
    }

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
    if (!process.env.MONGODB_URI) {
      const idx = mockTasks.findIndex(t => t._id === req.params.id);
      if (idx === -1) { res.status(404); throw new Error('Task not found'); }
      mockTasks.splice(idx, 1);
      return res.json({ message: 'Task removed' });
    }

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
    
    if (!process.env.MONGODB_URI) {
      const pendingTasks = mockTasks.filter(t => t.status === 'pending').length;
      const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
      const overdueTasks = mockTasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < now).length;
      const totalImportance = mockTasks.reduce((sum, t) => sum + t.importance, 0);
      
      const tasksByImp: Record<number, number> = {};
      mockTasks.forEach((t) => {
        tasksByImp[t.importance] = (tasksByImp[t.importance] || 0) + 1;
      });
      const tasksByImportance = Object.entries(tasksByImp).map(([imp, count]) => ({ _id: Number(imp), count }));

      return res.json({
        totalTasks: mockTasks.length,
        pendingTasks,
        completedTasks,
        averageImportance: mockTasks.length ? (totalImportance / mockTasks.length) : 0,
        overdueTasks,
        tasksByImportance
      });
    }

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
