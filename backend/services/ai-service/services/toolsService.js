const { callCohere } = require('./chatService');

/**
 * Génère une description marketing pour un plat en analysant le nom et l'image
 */
async function generateMenuDescription(name, category, imageData = null) {
  const hasImage = imageData && imageData.length > 100;
  
  const prompt = `Tu es un expert en gastronomie africaine et consultant en marketing. Analyse et génère une description marketing premium pour ce plat :
Nom : ${name}
Catégorie : ${category || 'Non précisée'}
Positionnement : Restaurant de qualité au Cameroun.
${hasImage ? 'Note : Une image est fournie. Analyse-la pour enrichir la description.' : ''}

Instructions strictes pour éviter les hallucinations :
1. AUTHENTICITÉ : Utilise uniquement les ingrédients réels et traditionnels de ce plat. Ne pas inventer de garnitures fantaisistes.
2. EXPÉRIENCE : Décris les saveurs (épicé, fumé, braisé) de façon vendeuse.
3. PRIX RÉALISTE : Estime un prix de vente cohérent en FCFA (Cameroun) pour une portion standard.
4. ALLERGÈNES : Liste les allergènes communs (Arachides, Gluten, etc.).

Format de réponse (JSON strict) :
{
  "description": "...",
  "suggested_price_fcfa": 0,
  "suggested_price_euro": 0,
  "allergens": ["...", "..."],
  "ingredients_recherches": ["...", "..."]
}`;

  try {
    const response = await callCohere(prompt, "Tu es un Chef étoilé et expert en marketing gastronomique.", true);
    const text = response.text || response;
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating description:', error);
    return {
      description: `Découvrez notre délicieux ${name}, préparé avec passion selon la tradition.`,
      suggested_price_fcfa: 2500,
      suggested_price_euro: 4,
      allergens: [],
      ingredients_recherches: [name]
    };
  }
}

/**
 * Génère des posts pour les réseaux sociaux
 */
async function generateSocialPosts(name) {
  const prompt = `Génère 3 variantes de posts pour les réseaux sociaux (Instagram, Facebook) pour promouvoir ce plat : ${name}.
Inclus des emojis et des hashtags pertinents. 
Ton : Enthousiaste et engageant.`;

  try {
    const response = await callCohere(prompt, "Tu es un community manager expert en restauration.");
    return response.text;
  } catch (error) {
    console.error('Error generating social posts:', error);
    throw new Error('Échec de la génération des posts');
  }
}

module.exports = {
  generateMenuDescription,
  generateSocialPosts
};
