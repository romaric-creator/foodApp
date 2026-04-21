const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.AI_PORT || 5008;

// Tentative de connexion Redis (optionnel)
try {
  const redis = require('redis');
  const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  client.connect().then(() => {
    global.redisClient = client;
    console.log('✅ Redis connecté');
  }).catch(() => console.log('⚠️ Redis non disponible, cache désactivé'));
} catch (e) {
  console.log('⚠️ Module Redis absent, cache désactivé');
}

// Rate Limiter : 20 requêtes par minute par utilisateur
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Trop de requêtes, veuillez patienter une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '50mb' }));

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'AI Service OK', 
    timestamp: new Date(),
    redis: global.redisClient ? 'connected' : 'disconnected'
  });
});

// Middleware pour les logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const recommendationsRouter = require('./routes/recommendations.js');
const chatRouter = require('./routes/chat.js');
const toolsRouter = require('./routes/tools.js');

// Appliquer le limiter sur les routes sensibles
app.use('/api/recommendations', limiter, recommendationsRouter);
app.use('/api/chat', limiter, chatRouter);
app.use('/api/tools', limiter, toolsRouter);

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT} (Cohere API - CommonJS)`);
});
