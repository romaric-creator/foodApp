const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_BASE_URL = 'https://api.cohere.com/v1';

const COHERE_ERRORS = {
  RATE_LIMIT: 'rate_limit_exceeded',
  MODEL_UNAVAILABLE: 'model_not_found',
  INVALID_API_KEY: 'invalid_api_key',
  QUOTA_EXCEEDED: 'quota_exceeded',
};

function getCohereErrorType(error) {
  const msg = error.message || '';
  if (msg.includes('429') || msg.includes('rate limit')) return COHERE_ERRORS.RATE_LIMIT;
  if (msg.includes('404') || msg.includes('model')) return COHERE_ERRORS.MODEL_UNAVAILABLE;
  if (msg.includes('401') || msg.includes('unauthorized')) return COHERE_ERRORS.INVALID_API_KEY;
  if (msg.includes('quota') || msg.includes('429')) return COHERE_ERRORS.QUOTA_EXCEEDED;
  return 'unknown';
}

async function callCohereStream(prompt, systemPrompt, onChunk) {
  if (!COHERE_API_KEY) {
    throw new Error('Cohere API key non configurée.');
  }

  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: prompt,
        preamble: systemPrompt,
        stream: true,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    response.data.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.event_type === 'text-generation') {
            onChunk(parsed.text);
          } else if (parsed.event_type === 'stream-end') {
            onChunk(null, true); // Indicate end
          }
        } catch (e) {
          // Parfois les chunks sont coupés, on ignore les erreurs de parse partiel
        }
      }
    });

    response.data.on('error', err => {
      console.error('Stream error:', err);
      onChunk(null, false, err);
    });

  } catch (error) {
    console.error('Cohere Stream API error:', error.message);
    throw error;
  }
}

async function processChat(userId, message, context, redisClient) {
  const conversationKey = `chat_history:${userId}`;
  
  let conversationHistory = [];
  
  if (redisClient && redisClient.isOpen) {
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

    if (redisClient && redisClient.isOpen) {
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
    const errorType = getCohereErrorType(error);
    let userMessage = 'Désolé, une erreur est produite. Veuillez réessayer.';

    if (errorType === COHERE_ERRORS.RATE_LIMIT) {
      userMessage = 'Trop de requêtes. Veuillez patienter un moment avant de retenter.';
    } else if (errorType === COHERE_ERRORS.INVALID_API_KEY) {
      userMessage = 'Service temporairement indisponible. Veuillez contacter le support.';
    } else if (errorType === COHERE_ERRORS.QUOTA_EXCEEDED) {
      userMessage = 'Quota de requêtes API dépassé. Veuillez réessayer plus tard.';
    }

    console.error('Cohere chat error:', errorType, error.message);
    return {
      message: userMessage,
      conversationLength: conversationHistory.length,
      error: errorType
    };
  }
}

async function processChatStream(userId, message, context, redisClient, onUpdate) {
  const conversationKey = `chat_history:${userId}`;
  let conversationHistory = [];
  
  if (redisClient && redisClient.isOpen) {
    try {
      const cached = await redisClient.get(conversationKey);
      if (cached) conversationHistory = JSON.parse(cached);
    } catch (err) {}
  }

  conversationHistory = conversationHistory.slice(-10);
  conversationHistory.push({ role: 'User', content: message });

  const systemPrompt = buildSystemPrompt(context);
  const prompt = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');

  let fullResponse = '';
  
  await callCohereStream(prompt, systemPrompt, async (text, isDone, err) => {
    if (err) {
      onUpdate({ error: err.message });
      return;
    }

    if (isDone) {
      conversationHistory.push({ role: 'Assistant', content: fullResponse });
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(conversationKey, 86400, JSON.stringify(conversationHistory));
      }
      onUpdate({ done: true });
      return;
    }

    if (text) {
      fullResponse += text;
      onUpdate({ text: text, full: fullResponse });
    }
  });
}

function buildSystemPrompt(context) {
  return `Tu es GOURMI AI, l'assistant gastronomique premium de nouvelle génération.
Ton objectif est d'offrir une expérience conversationnelle fluide, élégante et ultra-personnalisée, similaire à Gemini.

RÈGLES D'OR DE RÉPONSE :
1. STRUCTURE : Utilise le Markdown pour structurer tes réponses (## Titres, **Gras**, Listes à puces).
2. PERSONNALISATION : Utilise les informations du client pour rendre tes conseils uniques.
3. TON : Chaleureux, expert, et haut de gamme.
4. ACTIONS : Si l'utilisateur semble vouloir commander, guide-le vers les meilleurs choix.
5. CONCISION : Va à l'essentiel mais garde un style littéraire agréable.

CONTEXTE UTILISATEUR :
- Nom : ${context.user?.name || 'Cher client'}
- Allergies : ${context.user?.allergies?.join(', ') || 'Aucune signalée'}
- Préférences : ${context.user?.preferences || 'Gastronomie variée'}

MENUS DU JOUR :
${context.menu?.slice(0, 15).map(m => `- **${m.name}** (${m.price} FCFA) : *${m.description}*`).join('\n') || 'Menu en cours de mise à jour'}

RÉPONDS TOUJOURS EN FRANÇAIS.`;
}

async function callCohere(message, systemPrompt, chatHistory = []) {
  if (!COHERE_API_KEY) {
    throw new Error('Cohere API key non configurée.');
  }

  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: message,
        preamble: systemPrompt,
        chat_history: Array.isArray(chatHistory) ? chatHistory : [],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Cohere API Call Error:', err.message);
    throw err;
  }
}

async function clearChatHistory(userId, redisClient) {
  if (!redisClient || !redisClient.isOpen) return false;
  try {
    await redisClient.del(`chat_history:${userId}`);
    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    return false;
  }
}

module.exports = {
  callCohere,
  callCohereStream,
  processChat,
  clearChatHistory
};
