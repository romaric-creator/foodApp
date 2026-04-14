const express = require('express');
const { ThemeSetting } = require('../../../shared/models');
const { authenticateToken, requireAdmin } = require('../../../shared/middleware/auth');

const router = express.Router();

// Obtenir le thème du dashboard (public)
router.get('/', async (req, res) => {
  try {
    const theme = await ThemeSetting.findByPk(1);

    if (!theme) {
      // Créer le thème par défaut s'il n'existe pas
      const newTheme = await ThemeSetting.create({
        id: 1,
        primary: '#0e0c2b',
        secondary: '#7842af',
        background: '#e6dce4'
      });
      return res.json(newTheme);
    }

    res.json(theme);
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du thème' });
  }
});

// Mettre à jour le thème (admin seulement)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { primary, secondary, background } = req.body;

    if (!primary || !secondary || !background) {
      return res.status(400).json({ error: 'Toutes les couleurs sont requises' });
    }

    let theme = await ThemeSetting.findByPk(1);

    if (!theme) {
      theme = await ThemeSetting.create({
        id: 1,
        primary,
        secondary,
        background
      });
    } else {
      await theme.update({ primary, secondary, background });
    }

    res.json(theme);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du thème' });
  }
});

module.exports = router;

