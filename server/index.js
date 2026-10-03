import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { connectDB, getDbStatus } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing and JSON parsing
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Health check root
app.get('/', (req, res) => {
  const status = getDbStatus();
  res.json({
    status: 'online',
    service: 'Bennett Blockchain Club API',
    database: status
  });
});

// Boot server and establish database connection
async function startServer() {
  await connectDB(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`🚀 Bennett Blockchain Backend running on http://localhost:${PORT}`);
    console.log(`📋 API endpoints ready at http://localhost:${PORT}/api`);
  });
}

startServer();
