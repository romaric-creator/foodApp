const express = require('express');
const crypto = require('crypto');
const pool = require('../../../shared/config/database');
const router = express.Router();

// Générer un QR Code avec token HMAC signé
router.get('/generate/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    
    // Vérifier que la table existe
    const [tables] = await pool.execute(
      'SELECT idTab, nom FROM tables WHERE idTab = ?',
      [tableId]
    );

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }

    const table = tables[0];
    
    // Créer un token signé avec HMAC
    const secret = process.env.QR_SECRET || 'votre_secret_qr_changez_moi';
    const timestamp = Date.now();
    const data = `${tableId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const token = hmac.digest('hex');
    
    // URL du QR Code (sera utilisé côté client)
    const serverUrl = process.env.SERVER_URL || 'http://menu.local';
    const qrUrl = `${serverUrl}/client/${tableId}?token=${token}&t=${timestamp}`;
    
    res.json({
      tableId: table.idTab,
      tableName: table.nom,
      qrUrl,
      token,
      timestamp
    });
  } catch (error) {
    console.error('Erreur lors de la génération du QR Code:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR Code' });
  }
});

// Valider un token QR Code
router.post('/validate', async (req, res) => {
  try {
    const { tableId, token, timestamp } = req.body;
    
    if (!tableId || !token || !timestamp) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    // Vérifier l'expiration (24 heures)
    const now = Date.now();
    const tokenAge = now - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ error: 'QR Code expiré' });
    }
    
    // Vérifier le token HMAC
    const secret = process.env.QR_SECRET || 'votre_secret_qr_changez_moi';
    const data = `${tableId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedToken = hmac.digest('hex');
    
    if (token !== expectedToken) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    // Vérifier que la table existe
    const [tables] = await pool.execute(
      'SELECT idTab, nom FROM tables WHERE idTab = ?',
      [tableId]
    );

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }
    
    res.json({
      valid: true,
      table: tables[0]
    });
  } catch (error) {
    console.error('Erreur lors de la validation du QR Code:', error);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
});

module.exports = router;

