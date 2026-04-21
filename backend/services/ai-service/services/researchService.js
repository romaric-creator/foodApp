const { callCohere } = require('./chatService');
const { searchWebForPlat } = require('./webScraperService');

/**
 * @description Effectue une recherche autonome sur Google, puis synthétise avec l'IA
 * @param {string} name - Nom du plat
 * @param {string} [category] - Catégorie optionnelle
 * @returns {Promise<Object>} Données enrichies du plat
 */
async function researchMenu(name, category = '') {
  // Base de données "recettes locales" pour garantir une précision à 100%
  const localRecipes = {
    "koki": {
      name: "Koki",
      origin: "Cameroun",
      history: "Plat traditionnel préparé à base de haricots blancs (Vigna unguiculata) pelés et broyés, cuits à la vapeur dans des feuilles de bananier.",
      ingredients_principaux: ["Haricots blancs", "Huile de palme rouge", "Eau", "Sel", "Piment (optionnel)"],
      experience_gustative: "Texture fondante, onctueuse et saveur unique liée à la cuisson dans les feuilles de bananier.",
      marketing_description: "Le Koki authentique : un gâteau traditionnel de haricots blancs, préparé dans le respect de la tradition camerounaise. Sa couleur dorée, sa texture fondante et son parfum unique font de lui un met de prestige pour vos occasions spéciales.",
      suggested_price_fcfa: 1500,
      allergens: ["Haricots"],
      nutritional_highlights: ["Riche en protéines végétales", "Sans gluten"]
    }
  };

  const normalizedName = name.toLowerCase().trim();
  if (localRecipes[normalizedName]) {
    return localRecipes[normalizedName];
  }

  // Si non trouvé dans la base locale, utiliser la recherche intelligente avec règles strictes
  const webData = await searchWebForPlat(name);

  const prompt = `Voici des données extraites du web sur le plat "${name}" :
${webData}

RÈGLES D'ANALYSE STRICTES :
1. VÉRIFICATION DES INGRÉDIENTS : Le Koki traditionnel camerounais est à base de haricots blancs pelés et huile de palme. Il ne contient PAS de pommes de terre, ni d'oignons.
2. Si le plat est camerounais, utilise uniquement les ingrédients traditionnels réels (pas de variantes "modernes" incorrectes).
3. Ne jamais inventer d'ingrédients.
4. Rédige une description premium basée sur les faits vérifiés ci-dessus.

Format de réponse (JSON strict) :
{
  "name": "${name}",
  "origin": "Pays ou région d'origine",
  "history": "Bref historique du plat (2 phrases)",
  "ingredients_principaux": ["ingrédient 1", "ingrédient 2", "..."],
  "experience_gustative": "Description des saveurs et textures réelles",
  "marketing_description": "Une description premium de 3-4 phrases pour un menu de luxe",
  "suggested_price_fcfa": 0,
  "suggested_price_euro": 0,
  "allergens": ["Allergène 1", "..."],
  "nutritional_highlights": ["Highlight 1", "..."]
}`;

  try {
    const response = await callCohere(prompt, "Tu es un historien de la gastronomie et consultant culinaire de haut vol.");
    
    // Extraction robuste du JSON
    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Aucun objet JSON trouvé dans la réponse");
    }
    
    const cleanJson = jsonMatch[0].replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('[researchService.researchMenu]', { name, error: error.message });
    throw new Error('Impossible d\'effectuer la recherche culinaire pour le moment.');
  }
}

module.exports = {
  researchMenu
};
