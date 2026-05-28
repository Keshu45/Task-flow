import app from './app.js';
import connectDB from './config/db.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'API Online', message: 'TaskFlow API is running successfully on Render!' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
