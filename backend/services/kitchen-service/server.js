const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const kitchenRoutes = require('./routes/kitchen');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 5006;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (authentification requise)
app.use('/api/kitchen', authenticateToken, kitchenRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'kitchen-service' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur kitchen-service:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`👨‍🍳 Kitchen Service démarré sur le port ${PORT}`);
});

