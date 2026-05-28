import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  importance: number;
  dueDate: Date;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    importance: {
      type: Number,
      required: [true, 'Importance is required'],
      min: [1, 'Importance must be at least 1'],
      max: [5, 'Importance cannot exceed 5'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due Date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// We don't store priorityScore in DB, we calculate it on the fly
export default mongoose.model<ITask>('Task', TaskSchema);
