console.log('--- Loading chat.js router ---');
import express from 'express';
import { processAdminChat } from '../services/adminAIService.js';
import { callCohere, processChat } from '../services/chatService.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  saveChatMessage, 
  getChatHistory, 
  getChatSessions, 
  clearUserChatHistory,
  executeActionQuery 
} from '../utils/dbTools.js';

const router = express.Router();

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
    console.log(`Processing admin chat for Session: ${sid}`);
    
    // Sauvegarder le message
    await saveChatMessage(userId, 'User', message, sid, sessionTitle);

    // Charger l'historique de cette session si non fourni
    const conversationHistory = history || await getChatHistory(userId, sid);

    const result = await processAdminChat(message, conversationHistory);

    // Sauvegarder la réponse
    await saveChatMessage(userId, 'Assistant', result.message, sid, sessionTitle);

    res.json(result);
  } catch (error) {
    console.error('CRITICAL ERROR in /admin/chat:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;