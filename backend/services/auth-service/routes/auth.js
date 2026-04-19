const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../../shared/models');
const { sequelize } = require('../../../shared/config/sequelize');

const router = express.Router();

// Inscription client
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username, telephone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Un compte existe déjà avec cet email' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await User.create({
      username: username || email.split('@')[0],
      email,
      password: hashedPassword,
      name,
      telephone: telephone || null,
      role: 'client'
    });

    const userId = newUser.idUsers;

    // Générer un token JWT
    const token = jwt.sign(
      { userId, email, role: 'client' },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Initialiser le cookie (HTTP-only)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24h
      sameSite: 'lax',
      path: '/'
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: userId,
        email,
        name,
        role: 'client'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`[Auth Service] POST /api/auth/login`);
    console.log(`[Auth Service] Données reçues:`);
    console.log(`  - Email: ${email}`);
    console.log(`  - Password: ${password ? '✓ Reçu' : '✗ Manquant'}`);
    console.log(`  - Longueur password: ${password ? password.length : 0}`);
    
    if (!email || !password) {
      console.log(`[Auth Service] ✗ ERREUR: Email ou mot de passe manquant`);
      console.log(`═══════════════════════════════════════════\n`);
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    // Récupérer l'utilisateur
    console.log(`[Auth Service] 🔍 Recherche utilisateur avec email: ${email}`);
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`[Auth Service] ✗ Utilisateur NON trouvé: ${email}`);
      console.log(`═══════════════════════════════════════════\n`);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    console.log(`[Auth Service] ✓ Utilisateur trouvé:`);
    console.log(`  - ID: ${user.idUsers}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);

    // Vérifier le mot de passe
    console.log(`[Auth Service] 🔐 Vérification du mot de passe...`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`[Auth Service] Mot de passe valide: ${isValidPassword ? '✓ OUI' : '✗ NON'}`);

    if (!isValidPassword) {
      console.log(`[Auth Service] ✗ Mot de passe invalide`);
      console.log(`═══════════════════════════════════════════\n`);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer un token JWT
    console.log(`[Auth Service] 🎫 Génération du token JWT...`);
    const token = jwt.sign(
      { userId: user.idUsers, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    console.log(`[Auth Service] ✓ Token généré: ${token.substring(0, 20)}...`);

    // Initialiser le cookie (HTTP-only)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24h
      sameSite: 'lax',
      path: '/'
    });

    console.log(`[Auth Service] ✓ Connexion réussie pour: ${user.email}`);
    console.log(`═══════════════════════════════════════════\n`);
    
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.idUsers,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(`[Auth Service] ✗ ERREUR lors de la connexion:`);
    console.error(error);
    console.log(`═══════════════════════════════════════════\n`);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Vérifier le token (pour maintenir la session)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Si pas de token dans Authorization, regarder dans les cookies
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');

    // Vérifier que l'utilisateur existe toujours en base
    const user = await User.findByPk(decoded.userId, {
      attributes: ['idUsers', 'email', 'username', 'role', 'name']
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      user: {
        id: user.idUsers,
        email: user.email,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(403).json({ error: 'Token invalide' });
  }
});

// Déconnexion
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;

