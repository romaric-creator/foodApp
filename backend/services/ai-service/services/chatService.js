import axios from 'axios';

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_BASE_URL = 'https://api.cohere.com/v1';

export async function callCohere(prompt, systemPrompt = '') {
  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: prompt,
        preamble: systemPrompt,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Cohere API error:', error.response?.data || error.message);
    throw error;
  }
}

export async function processChat(userId, message, context, redisClient) {
  const conversationKey = `chat_history:${userId}`;
  
  let conversationHistory = [];
  
  if (redisClient?.isOpen) {
    try {
      const cached = await redisClient.get(conversationKey);
      if (cached) {
        conversationHistory = JSON.parse(cached);
      }
    } catch (err) {
      console.log('No conversation history found');
    }
  }

  conversationHistory = conversationHistory.slice(-10);

  conversationHistory.push({
    role: 'User',
    content: message
  });

  const systemPrompt = buildSystemPrompt(context);
  const prompt = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const response = await callCohere(prompt, systemPrompt);
    const assistantMessage = response.text || 'Je n ai pas pu traiter votre message.';

    conversationHistory.push({
      role: 'Assistant',
      content: assistantMessage
    });

    if (redisClient?.isOpen) {
      try {
        await redisClient.setEx(conversationKey, 86400, JSON.stringify(conversationHistory));
      } catch (err) {
        console.error('Cache error:', err);
      }
    }

    return {
      message: assistantMessage,
      conversationLength: conversationHistory.length
    };
  } catch (error) {
    console.error('Cohere chat error:', error.message);
    return {
      message: 'Desole, une erreur s est produite. Veuillez reessayer.',
      conversationLength: conversationHistory.length
    };
  }
}

function buildSystemPrompt(context) {
  return `Tu es un assistant restaurant bienveillant et utile. Tu aides les clients avec:
- Questions sur le menu et les plats
- Allergènes et restrictions alimentaires
- Statut de leur commande
- Recommandations personnalisées
- Informations générales du restaurant

CONTEXTE UTILISATEUR:
- Nom: ${context.user?.name || 'Client'}
- Email: ${context.user?.email || 'N/A'}
- Allergies: ${context.user?.allergies?.join(', ') || 'Aucune'}
- Dernière commande: ${context.lastOrder?.date || 'N/A'}

MENUS DISPONIBLES:
${context.menu?.slice(0, 20).map(m => `- ${m.name} (${m.price}€): ${m.description}`).join('\n') || 'Menu non disponible'}

COMMANDE ACTUELLE:
${context.currentOrder ? `Status: ${context.currentOrder.status}\nDétails: ${JSON.stringify(context.currentOrder.items)}` : 'Aucune commande en cours'}

RÈGLES:
1. Sois concis (max 150 mots)
2. Propose des solutions concrètes
3. Demande clarification si nécessaire
4. Ne promets pas ce que tu ne peux pas faire
5. En cas de doute, escalade vers un humain
6. Sois amical et professionnel`;
}

export async function clearChatHistory(userId, redisClient) {
  if (!redisClient?.isOpen) return false;
  try {
    await redisClient.del(`chat_history:${userId}`);
    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    return false;
  }
}