import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  console.log('--- Auth Middleware Triggered ---');
  console.log('Headers authorization:', req.headers['authorization'] ? 'PRESENT' : 'MISSING');
  console.log('Cookies present:', req.headers['cookie'] ? 'YES' : 'NO');

  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({ error: 'Accès non autorisé : Token manquant' });
    }

    const secret = process.env.JWT_SECRET || 'votre_secret_jwt';
    const decoded = jwt.verify(token, secret);
    
    console.log('✅ Token verified, payload:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erreur Auth Middleware AI:', error.message);
    return res.status(403).json({ error: 'Token invalide' });
  }
};
