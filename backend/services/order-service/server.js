const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { io } = require('socket.io-client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const orderRoutes = require('./routes/orders');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 5004;

// Connexion Socket.io au gateway
const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:5000';
const socketClient = io(gatewayUrl, {
  transports: ['websocket', 'polling']
});

socketClient.on('connect', () => {
  console.log('✅ Order-service connecté au gateway via Socket.io');
});

socketClient.on('disconnect', () => {
  console.log('❌ Order-service déconnecté du gateway');
});

socketClient.on('connect_error', (error) => {
  console.error('Erreur de connexion Socket.io:', error.message);
});

// Exporter socketClient pour utilisation dans les routes
app.set('socketClient', socketClient);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (toutes nécessitent une authentification)
app.use('/api/orders', authenticateToken, orderRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order-service' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur order-service:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`🛒 Order Service démarré sur le port ${PORT}`);
});

