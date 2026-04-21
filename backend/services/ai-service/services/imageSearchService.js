const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Recherche des images réelles d'un plat sur le web
 * @param {string} query - Nom du plat (ex: "Ndolé Cameroun")
 * @returns {Promise<string[]>} Liste de 10 URLs d'images
 */
async function searchImages(query, dishName = "") {
  try {
    // On nettoie la requête
    const cleanQuery = (dishName || query).replace(/le |la |les |un |une |du |de |des /gi, '').trim();
    
    // On ajoute des mots clés pour avoir de belles photos culinaires authentiques
    const fullQuery = encodeURIComponent(cleanQuery + " authentic dish cameroonian restaurant high quality food photography cuisine");
    const searchUrl = `https://www.bing.com/images/search?q=${fullQuery}&qft=+filterui:imagesize-large&form=HDRSC2&first=1`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const images = [];

    // Bing stocke les infos d'images dans des balises <a> avec la classe "iusc"
    $('.iusc').each((i, el) => {
      if (images.length >= 6) return;
      
      try {
        const m = $(el).attr('m');
        if (m) {
          const mData = JSON.parse(m);
          if (mData.murl && mData.murl.startsWith('http')) { 
            images.push(mData.murl);
          }
        }
      } catch (e) {}
    });

    // Fallback Unsplash si Bing échoue ou donne peu de résultats
    if (images.length < 3) {
      const unsplashUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`; // Placeholder intelligent
      images.push(unsplashUrl);
    }

    return images;
  } catch (error) {
    console.error('[imageSearchService] Error:', error.message);
    return [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
    ];
  }
}

module.exports = { searchImages };
