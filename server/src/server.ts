import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';
import app from './app.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  // Vite integration for full stack AI Studio development
  if (process.env.NODE_ENV !== 'production' && process.env.VITE_API_URL === '/') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      configFile: join(__dirname, '../../client/vite.config.ts'),
      root: join(__dirname, '../../client'),
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = join(__dirname, '../../dist/client');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
