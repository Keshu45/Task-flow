import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',') 
  : '*'; // Open by default if not specified, making Vercel deployments easy

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
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
