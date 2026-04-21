const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_BASE_URL = 'https://api.cohere.com/v1';

async function callCohere(prompt, systemPrompt = '') {
  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: prompt,
        preamble: systemPrompt,
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

async function getRecommendations(userId, userHistory, menu, redisClient) {
  const cacheKey = `recommendations:${userId}`;

  if (redisClient && redisClient.isOpen) {
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

  // Préparer une version simplifiée du menu pour l'IA
  const simplifiedMenu = menu.map(m => ({ 
    id: m.idMenu || m.id, 
    name: m.name, 
    price: m.price,
    category: m.idCat 
  })).slice(0, 50);

  try {
    const response = await callCohere(
      `Client Preferences: ${JSON.stringify(userPreferences)}
Menu available (ONLY choose from this list): ${JSON.stringify(simplifiedMenu)}

INSTRUCTIONS:
1. Recommend up to 3 dishes from the "Menu available" list.
2. DO NOT invent dishes or change prices.
3. If no clear match, recommend our best rated dishes from the list.
4. Format: JSON array of objects.

JSON format: [{\"id\": \"id_du_menu\", \"name\": \"Nom exact\", \"reason\": \"Pourquoi ce choix?\", \"confidence\": 95, \"price\": 5000}]`,
      "You are a helpful restaurant assistant. You strictly recommend items from the provided menu list."
    );

    let rawRecommendations = [];
    try {
      const cleanJson = response.text.replace(/```json\n?|\n?```/g, '').trim();
      rawRecommendations = JSON.parse(cleanJson);
    } catch (err) {
      console.error('JSON parse error, falling back to manual or empty');
      rawRecommendations = [];
    }

    // VALIDATION: S'assurer que les recommandations existent vraiment dans le menu
    const validatedRecommendations = rawRecommendations
      .map(rec => {
        const dish = menu.find(d => (d.idMenu || d.id) == rec.id);
        if (dish) {
          return {
            ...rec,
            name: dish.name,   // Utiliser le nom réel
            price: dish.price, // Utiliser le prix réel
            id: dish.idMenu || dish.id
          };
        }
        return null;
      })
      .filter(rec => rec !== null);

    if (redisClient && redisClient.isOpen && validatedRecommendations.length > 0) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(validatedRecommendations));
      } catch (err) {
        console.error('Redis cache set error:', err);
      }
    }

    return validatedRecommendations;
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

module.exports = {
  getRecommendations
};
