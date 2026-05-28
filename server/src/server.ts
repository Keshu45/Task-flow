import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import app from './app.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();

  // Vite integration for full stack AI Studio development
  if (process.env.NODE_ENV !== 'production' && process.env.VITE_API_URL === '/') {
    try {
      // @ts-ignore - Vite is only installed at the root for dev, not in the standalone server package
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
    // Production static serving for AI Studio, or fallback API root for standalone Render deploy
    const distPath = join(__dirname, '../../dist/client');
    if (fs.existsSync(distPath)) {
      const express = (await import('express')).default;
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(join(distPath, 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.status(200).json({ status: 'API Online', message: 'TaskFlow API is running successfully on Render!' });
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
