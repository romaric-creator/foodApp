import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('COHERE_API_KEY loaded:', process.env.COHERE_API_KEY ? 'YES' : 'NO');

const app = express();
const PORT = process.env.AI_PORT || 5008;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'AI Service OK', 
    timestamp: new Date()
  });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

import recommendationsRouter from './routes/recommendations.js';
import chatRouter from './routes/chat.js';

app.use('/api/recommendations', recommendationsRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT} (Cohere API)`);
});