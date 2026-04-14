const express = require('express');
const { Table } = require('../../../shared/models');
const { authenticateToken, requireAdmin } = require('../../../shared/middleware/auth');

const router = express.Router();

// Obtenir toutes les tables (public)
router.get('/', async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [['nom', 'ASC']]
    });

    const formattedTables = tables.map(table => ({
      id: table.idTab,
      idTab: table.idTab,
      numericId: table.idTab,
      nom: table.nom,
      created_at: table.created_at
    }));

    res.json(formattedTables);
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tables' });
  }
});

// Obtenir une table par ID (public)
router.get('/:id', async (req, res) => {
  try {
    const tableId = req.params.id;

    const table = await Table.findByPk(tableId);

    if (!table) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }

    res.json({
      id: table.idTab,
      idTab: table.idTab,
      numericId: table.idTab,
      nom: table.nom,
      created_at: table.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la table:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la table' });
  }
});

// Créer une table (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la table est requis' });
    }

    const newTable = await Table.create({ nom });

    res.status(201).json({
      id: newTable.idTab,
      idTab: newTable.idTab,
      numericId: newTable.idTab,
      nom: newTable.nom,
      created_at: newTable.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la table' });
  }
});

// Supprimer une table (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tableId = req.params.id;

    const table = await Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }
    await table.destroy();

    res.json({ id: tableId, message: 'Table supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la table:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la table' });
  }
});

module.exports = router;

