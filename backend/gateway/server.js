const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpProxy = require('http-proxy-middleware');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(url => url.trim());
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
});

const PORT = process.env.GATEWAY_PORT || 5000;

// Configuration des services
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001',
  users: process.env.USER_SERVICE_URL || 'http://127.0.0.1:5002',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://127.0.0.1:5003',
  orders: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:5004',
  tables: process.env.TABLE_SERVICE_URL || 'http://127.0.0.1:5005',
  kitchen: process.env.KITCHEN_SERVICE_URL || 'http://127.0.0.1:5006',
  theme: process.env.THEME_SERVICE_URL || 'http://127.0.0.1:5007',
  ai: process.env.AI_SERVICE_URL || 'http://127.0.0.1:5008',
};

const fixRequestBody = (proxyReq, req, res) => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      if (!proxyReq.headersSent) {
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
    // Priorité au token dans Authorization header (extrait du cookie)
    const authHeader = req.headers['authorization'];
    if (authHeader && !proxyReq.headersSent) {
      proxyReq.setHeader('Authorization', authHeader);
    }
    // Fallback: cookie si pas d'Authorization
    else if (req.headers['cookie'] && !proxyReq.headersSent) {
      proxyReq.setHeader('cookie', req.headers['cookie']);
    }
  } catch (err) {
    console.error('Erreur fixRequestBody:', err.message);
  }
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(url => url.trim());
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin not allowed: ${origin}`);
      callback(null, false); // Accepter que CORS bloque au niveau du navigateur, sans crasher le serveur (Evite l'erreur 500)
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Extraire token du cookie et le mettre dans Authorization
app.use((req, res, next) => {
  if (req.cookies && req.cookies.token && !req.headers['authorization']) {
    req.headers['authorization'] = `Bearer ${req.cookies.token}`;
  }
  next();
});

// Middleware pour logger les requêtes entrantes avec détails
app.use((req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const headers = req.headers;

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`[Gateway] ${new Date().toLocaleTimeString()}`);
  console.log(`[Gateway] Requête: ${method} ${url}`);
  console.log(`[Gateway] Headers: Content-Type = ${headers['content-type'] || 'none'}`);

  // Logger le body pour les requêtes POST/PUT
  if ((method === 'POST' || method === 'PUT') && req.body) {
    console.log(`[Gateway] Body:`, JSON.stringify(req.body));
  }

  // Logger le token s'il existe
  if (headers['authorization']) {
    console.log(`[Gateway] Authorization: ${headers['authorization'].substring(0, 20)}...`);
  }
  if (headers['cookie']) {
    console.log(`[Gateway] Cookie: présent (${headers['cookie'].length} chars)`);
  }

  console.log(`═══════════════════════════════════════════\n`);
  next();
});

// Proxy pour chaque service
app.use('/api/auth', httpProxy.createProxyMiddleware({
  target: services.auth,
  changeOrigin: true, onProxyReq: fixRequestBody,
  onError: (err, req, res) => {
    console.error('Erreur auth-service:', err.message);
    res.status(503).json({ error: 'Service d\'authentification indisponible' });
  }
}));

app.use('/api/users', httpProxy.createProxyMiddleware({
  target: services.users,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('Erreur user-service:', err.message);
    res.status(503).json({ error: 'Service utilisateurs indisponible' });
  }
}));

app.use('/api/categories', httpProxy.createProxyMiddleware({
  target: services.catalog,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/categories': '/api/categories'
  },
  onError: (err, req, res) => {
    console.error('Erreur catalog-service:', err.message);
    res.status(503).json({ error: 'Service catalogue indisponible' });
  }
}));

app.use('/api/menus', httpProxy.createProxyMiddleware({
  target: services.catalog,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/menus': '/api/menus'
  },
  onError: (err, req, res) => {
    console.error('Erreur catalog-service:', err.message);
    res.status(503).json({ error: 'Service catalogue indisponible' });
  }
}));

app.use('/api/orders', httpProxy.createProxyMiddleware({
  target: services.orders,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onError: (err, req, res) => {
    console.error('Erreur order-service:', err.message);
    res.status(503).json({ error: 'Service commandes indisponible' });
  }
}));

app.use('/api/tables', httpProxy.createProxyMiddleware({
  target: services.tables,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/tables': '/api/tables'
  },
  onError: (err, req, res) => {
    console.error('Erreur table-service:', err.message);
    res.status(503).json({ error: 'Service tables indisponible' });
  }
}));

app.use('/api/qrcode', httpProxy.createProxyMiddleware({
  target: services.tables,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/qrcode': '/api/qrcode'
  },
  onError: (err, req, res) => {
    console.error('Erreur table-service (qrcode):', err.message);
    res.status(503).json({ error: 'Service QR Code indisponible' });
  }
}));

app.use('/api/kitchen', httpProxy.createProxyMiddleware({
  target: services.kitchen,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/kitchen': '/api/kitchen'
  },
  onError: (err, req, res) => {
    console.error('Erreur kitchen-service:', err.message);
    res.status(503).json({ error: 'Service cuisine indisponible' });
  }
}));

app.use('/api/theme', httpProxy.createProxyMiddleware({
  target: services.theme,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/theme': '/api/theme'
  },
  onError: (err, req, res) => {
    console.error('Erreur theme-service:', err.message);
    res.status(503).json({ error: 'Service thème indisponible' });
  }
}));

app.use('/api/ai', httpProxy.createProxyMiddleware({
  target: services.ai,
  changeOrigin: true, onProxyReq: fixRequestBody,
  pathRewrite: {
    '^/api/ai': '/api'
  },
  onError: (err, req, res) => {
    console.error('Erreur ai-service:', err.message);
    res.status(503).json({ error: 'Service IA indisponible' });
  }
}));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  // Rejoindre une room pour les mises à jour de commandes
  socket.on('join-orders', () => {
    socket.join('orders');
    console.log(`Client ${socket.id} a rejoint la room 'orders'`);
  });

  // Rejoindre une room pour les mises à jour d'une commande spécifique
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Client ${socket.id} a rejoint la room 'order-${orderId}'`);
  });

  // Quitter la room orders
  socket.on('leave-orders', () => {
    socket.leave('orders');
    console.log(`Client ${socket.id} a quitté la room 'orders'`);
  });

  // Écout des événements des services (order-service, etc.)
  socket.on('new-order', (data) => {
    io.to('orders').emit('new-order', data);
  });

  socket.on('order-status-updated', (data) => {
    io.to('orders').emit('order-status-updated', data);
    io.to(`order-${data.id || data.idOrder}`).emit('order-status-updated', data);
  });

  socket.on('order-updated', (data) => {
    io.to('orders').emit('order-updated', data);
    io.to(`order-${data.id || data.idOrder}`).emit('order-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Exporter io pour utilisation dans d'autres modules
app.set('io', io);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Gateway fonctionnel',
    services: Object.keys(services)
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`API Gateway démarré sur le port ${PORT}`);
  console.log(`Routes disponibles:`);
  Object.entries(services).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });
  console.log(`Socket.io activé pour le temps réel`);
});

