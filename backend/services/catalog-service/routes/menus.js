const express = require('express');
const { Menu } = require('../../../shared/models');
const { authenticateToken, requireAdmin } = require('../../../shared/middleware/auth');

const router = express.Router();

// Obtenir tous les menus (public)
router.get('/', async (req, res) => {
  try {
    const { idCat } = req.query;
    const where = {};
    if (idCat) {
      where.idCat = idCat;
    }

    const menus = await Menu.findAll({
      where,
      order: [['name', 'ASC']]
    });

    // Formater les menus pour correspondre au format attendu par le frontend
    const formattedMenus = menus.map(menu => ({
      idMenu: menu.idMenu,
      numericId: menu.idMenu,
      name: menu.name,
      description: menu.description,
      price: parseFloat(menu.price),
      image: menu.image_url,
      image_url: menu.image_url,
      idCat: menu.idCat,
      created_at: menu.created_at
    }));

    res.json(formattedMenus);
  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des menus' });
  }
});

// Obtenir un menu par ID (public)
router.get('/:id', async (req, res) => {
  try {
    const menuId = req.params.id;

    const menu = await Menu.findByPk(menuId);

    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }

    res.json({
      idMenu: menu.idMenu,
      numericId: menu.idMenu,
      name: menu.name,
      description: menu.description,
      price: parseFloat(menu.price),
      image: menu.image_url,
      image_url: menu.image_url,
      idCat: menu.idCat,
      created_at: menu.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du menu:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
});

// Créer un menu (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image_url, idCat, stock_quantity, is_available } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Le nom et le prix sont requis' });
    }

    const newMenu = await Menu.create({
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      image_url: image_url || null,
      idCat: idCat || null,
      stock_quantity: parseInt(stock_quantity) || 0,
      is_available: is_available !== undefined ? is_available : true
    });

    res.status(201).json({
      id: newMenu.idMenu,
      idMenu: newMenu.idMenu,
      numericId: newMenu.idMenu,
      name: newMenu.name,
      description: newMenu.description,
      price: parseFloat(newMenu.price),
      image: newMenu.image_url,
      image_url: newMenu.image_url,
      idCat: newMenu.idCat,
      stock_quantity: newMenu.stock_quantity,
      is_available: newMenu.is_available,
      created_at: newMenu.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la création du menu:', error);
    res.status(500).json({ error: 'Erreur lors de la création du menu' });
  }
});

// Mettre à jour un menu (admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const menuId = req.params.id;
    const { name, description, price, image_url, idCat, stock_quantity, is_available } = req.body;



    const menu = await Menu.findByPk(menuId);

    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (image_url !== undefined) updates.image_url = image_url;
    if (idCat !== undefined) updates.idCat = idCat;
    if (stock_quantity !== undefined) updates.stock_quantity = stock_quantity;
    if (is_available !== undefined) updates.is_available = is_available;

    await menu.update(updates);

    res.json({
      id: menu.idMenu,
      idMenu: menu.idMenu,
      numericId: menu.idMenu,
      name: menu.name,
      description: menu.description,
      price: parseFloat(menu.price),
      image: menu.image_url,
      image_url: menu.image_url,
      idCat: menu.idCat,
      stock_quantity: menu.stock_quantity,
      is_available: menu.is_available,
      created_at: menu.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
});

// Supprimer un menu (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const menuId = req.params.id;

    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }
    await menu.destroy();

    res.json({ id: menuId, message: 'Menu supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du menu:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du menu' });
  }
});

module.exports = router;

