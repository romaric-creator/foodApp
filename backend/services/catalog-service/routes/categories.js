const express = require('express');
const { Category } = require('../../../shared/models');
const { authenticateToken, requireAdmin } = require('../../../shared/middleware/auth');

const router = express.Router();

// Obtenir toutes les catégories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['idCat', 'name', 'created_at'],
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

// Obtenir une catégorie par ID (public)
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId, {
      attributes: ['idCat', 'name', 'created_at']
    });

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie' });
  }
});

// Créer une catégorie (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
    }

    const newCategory = await Category.create({ name });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
});

// Mettre à jour une catégorie (admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    await category.update({ name });
    res.json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie' });
  }
});

// Supprimer une catégorie (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    await category.destroy();
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
  }
});

module.exports = router;

