import app from './app.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API Online', message: 'TaskFlow API is running successfully on Render!' });
  });

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        configFile: join(__dirname, '../../client/vite.config.ts'),
        root: join(__dirname, '../../client'),
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.log('Vite not found, skipping dev middleware');
    }
  } else {
    app.get('/', (req, res) => {
      res.status(200).json({ status: 'API Online', message: 'TaskFlow API is running successfully on Render!' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
