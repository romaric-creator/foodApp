const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Recherche autonome : Effectue une recherche Google et extrait les extraits textuels
 * @param {string} query - Requête de recherche
 * @returns {Promise<string>} Contenu textuel extrait
 */
async function searchWebForPlat(query) {
  try {
    // Ajout de mots-clés liés aux réseaux sociaux
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " cameroun plat traditionnel recette facebook instagram")}&hl=fr`;
    
    const { data } = await axios.get(searchUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' 
      } 
    });
    
    const $ = cheerio.load(data);
    let content = "";
    
    // Extraction des snippets textuels sous les liens Google
    $('div.VwiC3b, div.GIk6R').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) { // On filtre les résultats trop courts
        content += text + "\n";
      }
    });
    
    return content || "Aucune information détaillée trouvée.";
  } catch (err) {
    console.error('[webScraperService] Erreur scraping:', err.message);
    return "Erreur lors de la recherche automatique.";
  }
}

module.exports = { searchWebForPlat };
