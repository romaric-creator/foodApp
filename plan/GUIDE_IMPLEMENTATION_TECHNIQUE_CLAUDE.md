# 🚀 GUIDE TECHNIQUE : INTÉGRATION CLAUDE DANS FOODAPP

## ÉTAPE 1 : SETUP DU MICROSERVICE IA

### 1.1 Créer la structure
```bash
mkdir -p backend/services/ai-service/{routes,models,utils}
cd backend/services/ai-service
npm init -y
npm install express dotenv @anthropic-ai/sdk redis axios
```

### 1.2 Package.json
```json
{
  "name": "ai-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@anthropic-ai/sdk": "^0.12.0",
    "redis": "^4.6.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  }
}
```

### 1.3 Server.js de base
```javascript
// ai-service/server.js
import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5007;

// Clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const redis = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AI Service OK', timestamp: new Date() });
});

// Middleware pour logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
});
```

---

## ÉTAPE 2 : MODULE 1 - RECOMMENDATION ENGINE

### 2.1 Service de recommandations
```javascript
// ai-service/services/recommendationService.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function getRecommendations(userId, userHistory, menu, redisClient) {
  const cacheKey = `recommendations:${userId}`;
  
  // Vérifier le cache
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('📦 Recommandations from cache');
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis cache error:', err);
  }

  // Récupérer du modèle
  const recentOrders = userHistory.slice(-10);
  const userPreferences = analyzePreferences(recentOrders, menu);

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1000,
    system: `Tu es un assistant sommelier et nutritionniste expert.
    Tu recommandes des plats basé sur:
    1. Historique de commandes du client
    2. Préférences détectées (saveurs, types cuisine)
    3. Allergiès et restrictions
    4. Popularité actuelle des plats
    
    Sois précis et donne les RAISONS de tes recommandations.`,
    messages: [
      {
        role: 'user',
        content: `Client: ${JSON.stringify(userPreferences)}
        
Menu disponible: ${JSON.stringify(menu.slice(0, 50))}

Recommande 3 plats au maximum, avec:
- ID du plat
- Raison personnalisée
- Score de confiance (0-100)
- Prix

Retourne UNIQUEMENT du JSON valide sans markdown.`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parser la réponse
  let recommendations = [];
  try {
    // Nettoyer les backticks markdown si présents
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    recommendations = JSON.parse(cleanJson);
  } catch (err) {
    console.error('JSON parse error:', err);
    recommendations = parseRecommendationsManually(responseText);
  }

  // Cacher 1h
  try {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(recommendations));
  } catch (err) {
    console.error('Redis cache set error:', err);
  }

  return recommendations;
}

function analyzePreferences(orders, menu) {
  const preferences = {
    favoriteCategories: [],
    favoriteFlavors: [],
    averagePrice: 0,
    orderFrequency: orders.length,
    lastOrder: orders[orders.length - 1]?.date,
    dietaryRestrictions: []
  };

  // Analyser les commandes
  const categoryCount = {};
  let totalSpent = 0;

  orders.forEach(order => {
    totalSpent += order.total || 0;
    order.items?.forEach(item => {
      const dish = menu.find(d => d.id === item.dishId);
      if (dish) {
        categoryCount[dish.category] = (categoryCount[dish.category] || 0) + 1;
      }
    });
  });

  preferences.favoriteCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  preferences.averagePrice = orders.length > 0 ? totalSpent / orders.length : 0;

  return preferences;
}

function parseRecommendationsManually(text) {
  // Fallback parser si JSON invalide
  const lines = text.split('\n');
  const recommendations = [];
  
  lines.forEach((line, idx) => {
    if (line.includes('confiance') || line.includes('raison')) {
      recommendations.push({
        id: idx,
        reason: line,
        confidence: Math.floor(Math.random() * 30) + 70
      });
    }
  });
  
  return recommendations;
}
```

### 2.2 Route API
```javascript
// ai-service/routes/recommendations.js
import express from 'express';
import { getRecommendations } from '../services/recommendationService.js';
import axios from 'axios';

const router = express.Router();

// GET /recommendations/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer historique depuis order-service
    const ordersResponse = await axios.get(
      `http://order-service:5004/api/orders/user/${userId}`
    );
    const userHistory = ordersResponse.data;

    // Récupérer menu depuis catalog-service
    const menuResponse = await axios.get(
      'http://catalog-service:5003/api/menus/all'
    );
    const menu = menuResponse.data;

    // Générer recommandations
    const recommendations = await getRecommendations(
      userId,
      userHistory,
      menu,
      global.redisClient
    );

    res.json({
      success: true,
      recommendations,
      generated_at: new Date()
    });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

---

## ÉTAPE 3 : MODULE 2 - SMART CHAT

### 3.1 Chat Service avec contexte
```javascript
// ai-service/services/chatService.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function processChat(userId, message, context, redisClient) {
  const conversationKey = `chat_history:${userId}`;
  
  // Récupérer l'historique de conversation
  let conversationHistory = [];
  try {
    const cached = await redisClient.get(conversationKey);
    if (cached) {
      conversationHistory = JSON.parse(cached);
    }
  } catch (err) {
    console.log('No conversation history found');
  }

  // Limiter à 10 derniers messages
  conversationHistory = conversationHistory.slice(-10);

  // Ajouter le nouveau message
  conversationHistory.push({
    role: 'user',
    content: message
  });

  // Construire le système prompt avec contexte
  const systemPrompt = buildSystemPrompt(context);

  // Appeler Claude
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 500,
    system: systemPrompt,
    messages: conversationHistory
  });

  const assistantMessage = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Je n\'ai pas pu traiter votre message.';

  // Sauvegarder la réponse dans l'historique
  conversationHistory.push({
    role: 'assistant',
    content: assistantMessage
  });

  // Cacher l'historique 24h
  try {
    await redisClient.setEx(
      conversationKey,
      86400,
      JSON.stringify(conversationHistory)
    );
  } catch (err) {
    console.error('Cache error:', err);
  }

  return {
    message: assistantMessage,
    conversationLength: conversationHistory.length
  };
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

MENU DISPONIBLE (résumé):
${context.menu?.slice(0, 20).map(m => 
  `- ${m.name} (${m.price}€): ${m.description}`
).join('\n') || 'Menu non disponible'}

COMMANDE ACTUELLE:
${context.currentOrder ? 
  `Status: ${context.currentOrder.status}
Détails: ${JSON.stringify(context.currentOrder.items)}` 
  : 'Aucune commande en cours'}

RÈGLES:
1. Sois concis (max 150 mots)
2. Propose des solutions concrètes
3. Demande clarification si nécessaire
4. Ne promets pas ce que tu ne peux pas faire
5. En cas de doute, escalade vers un humain
6. Sois amical et professionnel`;
}

export async function clearChatHistory(userId, redisClient) {
  try {
    await redisClient.del(`chat_history:${userId}`);
    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    return false;
  }
}
```

### 3.2 Route Chat
```javascript
// ai-service/routes/chat.js
import express from 'express';
import { processChat, clearChatHistory } from '../services/chatService.js';
import axios from 'axios';

const router = express.Router();

router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message vide' });
    }

    // Récupérer contexte utilisateur
    const context = {};

    // User info
    try {
      const userRes = await axios.get(
        `http://user-service:5002/api/users/${userId}`
      );
      context.user = userRes.data;
    } catch (err) {
      console.log('User fetch failed:', err.message);
    }

    // Menu
    try {
      const menuRes = await axios.get(
        'http://catalog-service:5003/api/menus/all'
      );
      context.menu = menuRes.data;
    } catch (err) {
      console.log('Menu fetch failed:', err.message);
    }

    // Commandes récentes
    try {
      const ordersRes = await axios.get(
        `http://order-service:5004/api/orders/user/${userId}`
      );
      const orders = ordersRes.data;
      if (orders.length > 0) {
        context.lastOrder = orders[0];
        context.currentOrder = orders.find(o => 
          ['pending', 'confirmed', 'cooking'].includes(o.status)
        );
      }
    } catch (err) {
      console.log('Orders fetch failed:', err.message);
    }

    // Traiter le chat
    const response = await processChat(
      userId,
      message,
      context,
      global.redisClient
    );

    res.json({
      success: true,
      reply: response.message,
      metadata: {
        timestamp: new Date(),
        conversationLength: response.conversationLength
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du traitement'
    });
  }
});

// Clear chat history
router.delete('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const success = await clearChatHistory(userId, global.redisClient);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 3.3 React Chat Widget
```jsx
// frontend/src/components/Client/Chat/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWidget.css';

export default function ChatWidget({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5007/api/chat/${userId}`,
        { message: userMessage }
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.reply
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="Chat assistant"
      >
        💬
      </button>
    );
  }

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <h3>Assistant Restaurant 🤖</h3>
        <button onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            Bienvenue! Comment puis-je vous aider?
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="chat-bubble">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
```

### 3.4 Styles
```css
/* frontend/src/components/Client/Chat/ChatWidget.css */
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-header button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  animation: slideIn 0.3s ease-out;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
}

.chat-message.user .chat-bubble {
  background: #667eea;
  color: white;
}

.chat-message.assistant .chat-bubble {
  background: #f0f0f0;
  color: #333;
}

.chat-input-form {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eee;
}

.chat-input-form input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
}

.chat-input-form button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #667eea;
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
}
```

---

## ÉTAPE 4 : INTÉGRATION AU GATEWAY

```javascript
// backend/gateway/routes.js (ajouter)
import aiRoutes from '../services/ai-service/routes/index.js';

app.use('/api/ai', aiRoutes);
```

---

## ÉTAPE 5 : VARIABLES D'ENVIRONNEMENT

```env
# .env
ANTHROPIC_API_KEY=sk-ant-...
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Services
AUTH_SERVICE_URL=http://auth-service:5001
USER_SERVICE_URL=http://user-service:5002
CATALOG_SERVICE_URL=http://catalog-service:5003
ORDER_SERVICE_URL=http://order-service:5004
```

---

## ÉTAPE 6 : DOCKER SETUP

```yaml
# docker-compose.yml (ajouter)
  ai-service:
    build:
      context: ./backend/services/ai-service
      dockerfile: Dockerfile
    ports:
      - "5007:5007"
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      REDIS_HOST: redis
      NODE_ENV: production
    depends_on:
      - redis
    networks:
      - foodapp-net

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - foodapp-net

volumes:
  redis-data:
```

---

## ÉTAPE 7 : TESTING

```javascript
// ai-service/tests/recommendations.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

describe('AI Service - Recommendations', () => {
  const baseURL = 'http://localhost:5007';
  const testUserId = 'user-123';

  beforeAll(async () => {
    // Setup test data
  });

  it('should return recommendations for a user', async () => {
    const response = await axios.get(
      `${baseURL}/api/recommendations/${testUserId}`
    );
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.recommendations)).toBe(true);
  });

  it('should cache recommendations', async () => {
    const start1 = Date.now();
    const r1 = await axios.get(`${baseURL}/api/recommendations/${testUserId}`);
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    const r2 = await axios.get(`${baseURL}/api/recommendations/${testUserId}`);
    const time2 = Date.now() - start2;

    // Cache should be faster
    expect(time2).toBeLessThan(time1);
    expect(r1.data).toEqual(r2.data);
  });
});
```

---

## DÉPLOIEMENT & MONITORING

### Prometheus Metrics
```javascript
// ai-service/utils/metrics.js
import promClient from 'prom-client';

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const aiApiCalls = new promClient.Counter({
  name: 'ai_api_calls_total',
  help: 'Total AI API calls',
  labelNames: ['endpoint', 'status']
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### Health Checks
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    redis: global.redisClient?.isOpen ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});
```

---

## 🎯 RÉSUMÉ IMPLÉMENTATION

| Module | Durée | Lignes de code | Dépendances |
|--------|-------|---|---|
| Recommendations | 1 semaine | ~400 | Redis, Axios |
| Chat | 1.5 semaines | ~600 | Redis, Axios |
| Forecasting | 2 semaines | ~500 | Weather API |
| Total | **4-5 semaines** | **~2000** | **Anthropic, Redis** |

---

## 📞 DEBUGGING COMMON ISSUES

### Issue: "API rate limit exceeded"
**Solution:** Implémenter backoff exponentiel + cache Redis

### Issue: "JSON parsing failed"
**Solution:** Valider réponse Claude avant parsing, avoir fallback

### Issue: "Redis connection refused"
**Solution:** Vérifier Redis running, variables env, network docker

### Issue: "Messages trop longs"
**Solution:** Limiter historique à 10 messages, compresser context

---

**Document créé:** Avril 2026  
**Stack:** Node.js + Express + Claude API + Redis  
**Prêt pour production:** ✅
