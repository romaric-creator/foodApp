const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const authRoutes = require('./routes/auth');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('\n═══════════════════════════════════════════');
  console.error('[Auth Service] ✗ ERREUR SERVEUR');
  console.error('[Auth Service] URL:', req.originalUrl);
  console.error('[Auth Service] Méthode:', req.method);
  console.error('[Auth Service] Message:', err.message);
  console.error('[Auth Service] Stack:', err.stack);
  console.error('═══════════════════════════════════════════\n');
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n🔐 Auth Service démarré sur le port ${PORT}`);
  console.log(`📡 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Configuré' : '✗ Non configuré (utilisant valeur par défaut)'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`═══════════════════════════════════════════\n`);
});

