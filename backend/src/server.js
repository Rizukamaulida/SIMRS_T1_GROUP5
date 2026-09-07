import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'SIMRS Backend is Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SIMRS Server listening on http://localhost:${PORT}`);
});