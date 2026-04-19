import axios from 'axios';

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_BASE_URL = 'https://api.cohere.com/v1';

async function callCohere(prompt, systemPrompt = '') {
  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-plus',
        message: prompt,
        system: systemPrompt,
        temperature: 0.7,
        max_tokens: 1000
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

export async function getRecommendations(userId, userHistory, menu, redisClient) {
  const cacheKey = `recommendations:${userId}`;

  if (redisClient?.isOpen) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log('Recommandations from cache');
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis cache error:', err);
    }
  }

  const recentOrders = userHistory.slice(-10);
  const userPreferences = analyzePreferences(recentOrders, menu);

  try {
    const response = await callCohere(
      `Client: ${JSON.stringify(userPreferences)}
Menu disponible: ${JSON.stringify(menu.slice(0, 30))}

Recommande 3 plats maximum avec:
- ID du plat
- Nom du plat
- Raison personnalisée
- Score de confiance (0-100)
- Prix

Retourne UNIQUEMENT du JSON valide sans markdown. Format: [{\"id\": 1, \"name\": \"Plat\", \"reason\": \"...\", \"confidence\": 90, \"price\": 15}]`,
      `Tu es un assistant sommelier et nutritionniste expert.
      Recommande des plats basé sur:
      1. Historique de commandes du client
      2. Préférences détectées (saveurs, types cuisine)
      3. Allergies et restrictions`
    );

    let recommendations = [];
    try {
      const cleanJson = response.text.replace(/```json\n?|\n?```/g, '').trim();
      recommendations = JSON.parse(cleanJson);
    } catch (err) {
      console.error('JSON parse error:', err);
      recommendations = parseRecommendationsManually(response.text);
    }

    if (redisClient?.isOpen) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(recommendations));
      } catch (err) {
        console.error('Redis cache set error:', err);
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Cohere API error:', error.message);
    return [];
  }
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
  const lines = text.split('\n');
  const recommendations = [];

  lines.forEach((line, idx) => {
    if (line.includes('confiance') || line.includes('raison') || line.includes('id')) {
      recommendations.push({
        id: idx,
        reason: line,
        confidence: Math.floor(Math.random() * 30) + 70
      });
    }
  });

  return recommendations;
}
