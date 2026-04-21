const express = require('express');
const { Order, OrderItem, User, Table, Menu } = require('../../../shared/models');
const { sequelize } = require('../../../shared/config/sequelize');
const { requireAdmin } = require('../../../shared/middleware/auth');

const router = express.Router();

// Helper pour émettre des événements Socket.io
// Le socketClient est connecté au gateway, donc les événements émis ici
// seront reçus par le gateway qui les diffusera à tous les clients connectés
const emitOrderUpdate = (req, event, data) => {
  const socketClient = req.app.get('socketClient');
  if (socketClient && socketClient.connected) {
    // Émettre l'événement vers le gateway
    // Le gateway écoute ces événements et les diffuse à tous les clients dans la room 'orders'
    socketClient.emit(event, data);
    console.log(`📡 Événement Socket.io émis: ${event}`, data.id || data.idOrder);
  } else {
    console.warn('⚠️ Socket.io non connecté, événement non émis:', event);
  }
};

// Obtenir toutes les commandes
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') {
      where.idUsers = req.user.idUsers;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Table, attributes: ['nom'] },
        {
          model: OrderItem,
          include: [{ model: Menu, attributes: ['name', 'image_url'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedOrders = orders.map(order => ({
      id: order.idOrder,
      idOrder: order.idOrder,
      idUsers: order.idUsers,
      idTab: order.idTab,
      statut: order.statut,
      status: order.statut,
      total: parseFloat(order.total),
      timestamp: order.timestamp,
      created_at: order.created_at,
      user_name: order.User?.name,
      user_email: order.User?.email,
      table_name: order.Table?.nom,
      items: (order.OrderItems || []).map(item => ({
        idMenu: item.idMenu,
        quantity: item.quantity,
        price: parseFloat(item.price),
        menu_name: item.Menu?.name,
        image_url: item.Menu?.image_url
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// Obtenir une commande par ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Table, attributes: ['nom'] },
        {
          model: OrderItem,
          include: [{ model: Menu, attributes: ['name', 'image_url'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.idUsers !== order.idUsers) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({
      id: order.idOrder,
      idOrder: order.idOrder,
      idUsers: order.idUsers,
      idTab: order.idTab,
      statut: order.statut,
      status: order.statut,
      total: parseFloat(order.total),
      timestamp: order.timestamp,
      created_at: order.created_at,
      user_name: order.User?.name,
      user_email: order.User?.email,
      table_name: order.Table?.nom,
      items: (order.OrderItems || []).map(item => ({
        idMenu: item.idMenu,
        quantity: item.quantity,
        price: parseFloat(item.price),
        menu_name: item.Menu?.name,
        image_url: item.Menu?.image_url
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

// Créer une commande
router.post('/', async (req, res) => {
  try {
    const { items, idTab, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Les items de commande sont requis' });
    }

    if (!idTab || !total) {
      return res.status(400).json({ error: 'La table et le total sont requis' });
    }

    const result = await sequelize.transaction(async (t) => {
      // Créer la commande
      const newOrder = await Order.create({
        idUsers: req.user.idUsers,
        idTab,
        statut: 'en cours',
        total,
        timestamp: new Date()
      }, { transaction: t });

      // Ajouter les items et décrémenter le stock
      for (const item of items) {
        // Vérifier la disponibilité et le stock
        const menu = await Menu.findByPk(item.idMenu, { transaction: t, lock: true });
        
        if (!menu) {
          throw new Error(`Le plat avec l'ID ${item.idMenu} n'existe pas.`);
        }

        if (menu.stock_quantity < item.quantity) {
          throw new Error(`Stock insuffisant pour le plat "${menu.name}". Disponible: ${menu.stock_quantity}`);
        }

        // Créer l'item de commande
        await OrderItem.create({
          idOrder: newOrder.idOrder,
          idMenu: item.idMenu,
          quantity: item.quantity || 1,
          price: item.price
        }, { transaction: t });

        // Décrémenter le stock
        const newStock = menu.stock_quantity - item.quantity;
        await menu.update({ 
          stock_quantity: newStock,
          is_available: newStock > 0
        }, { transaction: t });
      }

      // Recharger avec les items et menus pour le retour
      return await Order.findByPk(newOrder.idOrder, {
        include: [
          {
            model: OrderItem,
            include: [{ model: Menu, attributes: ['name', 'image_url'] }]
          }
        ],
        transaction: t
      });
    });

    const formattedOrder = {
      id: result.idOrder,
      idOrder: result.idOrder,
      idUsers: result.idUsers,
      idTab: result.idTab,
      statut: result.statut,
      status: result.statut,
      total: parseFloat(result.total),
      timestamp: result.timestamp,
      items: (result.OrderItems || []).map(item => ({
        idMenu: item.idMenu,
        quantity: item.quantity,
        quantite: item.quantity,
        price: parseFloat(item.price),
        menu_name: item.Menu?.name,
        image_url: item.Menu?.image_url
      }))
    };

    // Émettre un événement Socket.io
    emitOrderUpdate(req, 'new-order', formattedOrder);
    emitOrderUpdate(req, 'order-updated', formattedOrder);

    res.status(201).json(formattedOrder);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// Mettre à jour le statut d'une commande
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { statut } = req.body;

    // Accepter les statuts français et anglais
    const validStatuses = ['pending', 'confirmed', 'served', 'canceled', 'en cours', 'prêt', 'annulée'];
    if (!statut || !validStatuses.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        include: [{ model: Menu, attributes: ['name', 'image_url'] }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    await order.update({ statut });

    const updatedOrder = {
      id: order.idOrder,
      idOrder: order.idOrder,
      idUsers: order.idUsers,
      idTab: order.idTab,
      statut: order.statut,
      status: order.statut,
      total: parseFloat(order.total),
      timestamp: order.timestamp,
      items: (order.OrderItems || []).map(item => ({
        idMenu: item.idMenu,
        quantity: item.quantity,
        quantite: item.quantity,
        price: parseFloat(item.price),
        menu_name: item.Menu?.name,
        image_url: item.Menu?.image_url
      }))
    };

    // Émettre un événement Socket.io
    emitOrderUpdate(req, 'order-status-updated', updatedOrder);
    emitOrderUpdate(req, 'order-updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;

