import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';

const router = Router();

// GET stats must be above /:id to avoid parsing 'stats' as an ID
router.get('/stats', getTaskStats);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

export default router;
