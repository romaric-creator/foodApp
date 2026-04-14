const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    // Si pas de token dans Authorization, regarder dans les cookies
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');

    // Vérifier que l'utilisateur existe toujours en base
    const user = await User.findByPk(decoded.userId, {
      attributes: ['idUsers', 'email', 'username', 'role']
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user.get({ plain: true });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accès refusé: droits administrateur requis' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};

