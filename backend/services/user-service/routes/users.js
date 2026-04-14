const express = require('express');
const { User } = require('../../../shared/models');
const { requireAdmin } = require('../../../shared/middleware/auth');
const pool = require('../../../shared/config/database');

const router = express.Router();

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['idUsers', 'username', 'email', 'name', 'telephone', 'role', 'created_at'],
      order: [['created_at', 'DESC']] // Added order to match original SQL behavior
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Obtenir un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Un utilisateur peut seulement voir son propre profil sauf s'il est admin
    if (req.user.role !== 'admin' && req.user.idUsers !== parseInt(userId)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['idUsers', 'username', 'email', 'name', 'telephone', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, telephone, password, username } = req.body; // Added username to destructuring

    // Un utilisateur peut seulement modifier son propre profil sauf s'il est admin
    if (req.user.role !== 'admin' && req.user.idUsers !== parseInt(userId)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updates = {}; // Changed to object for Sequelize update

    if (name) {
      updates.name = name;
    }
    if (email) {
      updates.email = email;
    }
    if (telephone) {
      updates.telephone = telephone;
    }
    if (username) { // Added username update
      updates.username = username;
    }
    if (password) {
      const bcrypt = require('bcryptjs');
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) { // Check if updates object is empty
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await user.update(updates); // Use the updates object directly

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.execute('DELETE FROM users WHERE idUsers = ?', [userId]);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;

