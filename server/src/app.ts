import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin === '/' ? '*' : [allowedOrigin, 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(helmet({
  contentSecurityPolicy: false // Disabled for Vite dev server compatibility
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/bfhl/tasks', taskRoutes);

// Error Handling
app.use(errorHandler);

export default app;
