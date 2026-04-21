const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Accès non autorisé : Token manquant' });
    }

    const secret = process.env.JWT_SECRET || 'votre_secret_jwt';
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erreur Auth Middleware AI:', error.message);
    return res.status(403).json({ error: 'Token invalide' });
  }
};

module.exports = {
  authMiddleware
};
