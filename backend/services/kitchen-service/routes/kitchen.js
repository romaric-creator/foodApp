const express = require('express');
const { Order, OrderItem, User, Table, Menu } = require('../../../shared/models');
const pool = require('../../../shared/config/database');
const router = express.Router();

// Obtenir les commandes en attente (pour la cuisine)
router.get('/orders/pending', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        statut: ['en cours', 'confirmed', 'pending']
      },
      include: [
        { model: Table, attributes: ['nom'] },
        {
          model: OrderItem,
          include: [{ model: Menu, attributes: ['name', 'image_url'] }]
        }
      ],
      order: [['created_at', 'ASC']]
    });

    const formattedOrders = orders.map(order => ({
      id: order.idOrder,
      idOrder: order.idOrder,
      idTab: order.idTab,
      statut: order.statut,
      total: parseFloat(order.total),
      timestamp: order.timestamp,
      created_at: order.created_at,
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

// Obtenir toutes les commandes avec filtres
router.get('/orders', async (req, res) => {
  try {
    const { status, date } = req.query;

    let query = `
      SELECT o.idOrder, o.idUsers, o.idTab, o.statut, o.total, o.timestamp, o.created_at,
             u.name as user_name,
             t.nom as table_name
      FROM orders o
      LEFT JOIN users u ON o.idUsers = u.idUsers
      LEFT JOIN tables t ON o.idTab = t.idTab
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.statut = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(o.created_at) = ?';
      params.push(date);
    }

    query += ' ORDER BY o.created_at DESC LIMIT 100';

    const [orders] = await pool.execute(query, params);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT oi.idOrderItem, oi.idMenu, oi.quantity, oi.price,
                  m.name as menu_name
           FROM order_items oi
           LEFT JOIN menus m ON oi.idMenu = m.idMenu
           WHERE oi.idOrder = ?`,
          [order.idOrder]
        );

        return {
          id: order.idOrder,
          idOrder: order.idOrder,
          idTab: order.idTab,
          statut: order.statut,
          total: parseFloat(order.total),
          timestamp: order.timestamp,
          created_at: order.created_at,
          table_name: order.table_name,
          items: items.map(item => ({
            idMenu: item.idMenu,
            quantity: item.quantity,
            price: parseFloat(item.price),
            menu_name: item.menu_name
          }))
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// Marquer une commande comme "en préparation"
router.put('/orders/:id/prepare', async (req, res) => {
  try {
    const orderId = req.params.id;

    await pool.execute(
      'UPDATE orders SET statut = ? WHERE idOrder = ?',
      ['confirmed', orderId]
    );

    res.json({ message: 'Commande mise en préparation', idOrder: orderId });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Marquer une commande comme "servie"
router.put('/orders/:id/serve', async (req, res) => {
  try {
    const orderId = req.params.id;

    await pool.execute(
      'UPDATE orders SET statut = ? WHERE idOrder = ?',
      ['served', orderId]
    );

    res.json({ message: 'Commande servie', idOrder: orderId });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Obtenir les statistiques du jour
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        COUNT(CASE WHEN statut = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN statut = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN statut = 'served' THEN 1 END) as served_count
       FROM orders
       WHERE DATE(created_at) = ?`,
      [today]
    );

    res.json(stats[0] || {
      total_orders: 0,
      total_revenue: 0,
      pending_count: 0,
      confirmed_count: 0,
      served_count: 0
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
  }
});

module.exports = router;

