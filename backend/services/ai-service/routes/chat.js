const express = require('express');
const axios = require('axios');
const { processAdminChat } = require('../services/adminAIService.js');
const { processChat, processChatStream } = require('../services/chatService.js');
const { authMiddleware } = require('../middleware/auth.js');
const { 
  saveChatMessage, 
  getChatHistory, 
  getChatSessions, 
  clearUserChatHistory,
  executeActionQuery 
} = require('../utils/dbTools.js');

const router = express.Router();

/**
 * Route pour le chat client en STREAMING (Expérience Gemini)
 * GET /api/ai/chat/client/stream?message=...&userId=...
 */
router.get('/client/stream', async (req, res) => {
  const { message, userId, idtable } = req.query;

  if (!message) return res.status(400).json({ error: 'Message vide' });

  // Configuration SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let menuContext = [];
    try {
      const menuRes = await axios.get('http://localhost:5003/api/menus/all', { timeout: 3000 });
      menuContext = menuRes.data;
    } catch (e) {
      console.warn('Context menu fetch failed');
    }

    await processChatStream(
      userId || `client_${idtable || 'web'}`,
      message,
      { menu: menuContext },
      global.redisClient,
      (update) => {
        if (update.done) {
          res.write('event: end\ndata: [DONE]\n\n');
          res.end();
        } else if (update.error) {
          res.write(`event: error\ndata: ${JSON.stringify({ error: update.error })}\n\n`);
          res.end();
        } else {
          res.write(`data: ${JSON.stringify({ text: update.text })}\n\n`);
        }
      }
    );
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Route pour le chat client (public avec rate limit)
 * POST /api/ai/chat/client
 */
router.post('/client', async (req, res) => {
  const { message, userId, idtable } = req.body;
  
  if (!message) return res.status(400).json({ error: 'Message vide' });

  try {
    let menuContext = [];
    try {
      const menuRes = await axios.get('http://localhost:5003/api/menus/all', { timeout: 3000 });
      menuContext = menuRes.data;
    } catch (e) {
      console.warn('Context menu fetch failed, continuing with empty context');
    }

    let result;
    try {
      result = await processChat(
        userId || `client_${idtable || 'web'}`, 
        message, 
        { menu: menuContext }, 
        global.redisClient
      );
    } catch (chatError) {
      result = { 
        message: 'Je rencontre une difficulté technique. Veuillez réessayer dans quelques instants.', 
        error: chatError.message,
        fallback: true
      };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route pour exécuter une action SQL approuvée
 */
router.post('/action/execute', authMiddleware, async (req, res) => {
  const { sql } = req.body;
  try {
    const result = await executeActionQuery(sql);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Récupérer la liste des sessions de discussion de l'admin
 */
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = await getChatSessions(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Récupérer l'historique d'une session spécifique
 */
router.get('/history/:sessionId?', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.sessionId || 'default';
    const history = await getChatHistory(userId, sessionId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Effacer une session ou tout l'historique
 */
router.delete('/history/:sessionId?', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.sessionId;
    await clearUserChatHistory(userId, sessionId);
    res.json({ message: 'Historique effacé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Route principale du chat IQ avec gestion de session
 */
router.post('/admin/chat', authMiddleware, async (req, res) => {
  const { message, history, sessionId, sessionTitle } = req.body;
  const userId = req.user.userId;
  const sid = sessionId || 'default';

  try {
    // Sauvegarder le message utilisateur
    await saveChatMessage(userId, 'User', message, sid, sessionTitle);

    // Charger l'historique de cette session si non fourni
    // Note: getChatHistory est limité à 20 messages dans dbTools.js
    const conversationHistory = history || await getChatHistory(userId, sid);

    const result = await processAdminChat(message, conversationHistory);

    // Sauvegarder la réponse de l'assistant
    await saveChatMessage(userId, 'Assistant', result.message, sid, sessionTitle);

    res.json(result);
  } catch (error) {
    console.error('CRITICAL ERROR in /admin/chat:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
