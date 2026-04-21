/**
 * 🤖 GOURMI IQ — Admin AI Service (VERSION AGENT ELITE V3 - ANALYTICS EXPERT)
 */

const axios = require('axios');
const { executeReadOnlyQuery, getDatabaseSchema } = require('../utils/dbTools.js');
const { searchImages } = require('./imageSearchService.js');
const { generateMenuDescription } = require('./toolsService.js');
const { formatTableMarkdown, formatChartData } = require('../utils/aiFormatters.js');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_BASE_URL = 'https://api.cohere.com/v1';

async function callCohere(message, systemPrompt, chatHistory = [], temperature = 0.2) {
  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      { model: 'command-r-08-2024', message, preamble: systemPrompt, chat_history: chatHistory, temperature },
      { headers: { Authorization: `Bearer ${COHERE_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (err) {
    console.error('Cohere API Error:', err.message);
    throw err;
  }
}

async function extractDishInfo(message) {
  const prompt = `Analyses la demande de création de plat. Réponds en JSON : { "dishName": "...", "searchQuery": "...", "category": "..." }`;
  const result = await callCohere(message, prompt);
  try {
    return JSON.parse(result.text.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) {
    return { dishName: "Nouveau plat", searchQuery: message, category: "Divers" };
  }
}

const queryCache = new Map();

async function processAdminChat(message, history = []) {
  let finalResponse = { message: '', pipeline: {}, history: [...history] };
  
  const cacheKey = message.trim().toLowerCase();
  // 🔥 FAST TRACK : Vérification du Cache en Mémoire (0 seconde de temps de réponse)
  if (queryCache.has(cacheKey)) {
    console.log('[AI Cache Hit] Réponse distribuée instantanément !');
    const cached = queryCache.get(cacheKey);
    return {
      message: cached.message,
      pipeline: cached.pipeline,
      history: [...history, { role: 'User', content: message }, { role: 'Assistant', content: cached.message }]
    };
  }

  const schema = await getDatabaseSchema();
  const schemaInfo = JSON.stringify(schema || {});

  try {
    // --- ÉTAPE 1 : PLANIFICATION & SQL (FAST PASS) ---
    const plannerPrompt = `Tu es GOURMI ANALYTICS ENGINE.
    Décide des outils à utiliser : ["sql", "images", "chat"].
    Si demande chiffrée, de rapport ou d'évolution -> outil "sql" OBLIGATOIRE.
    
    SCHÉMA DB : ${schemaInfo}
    EXEMPLES SQL JOINTURES :
    - Vente/Catégorie : SELECT c.name, SUM(oi.price * oi.quantity) as total FROM categories c JOIN menus m ON c.idCat = m.idCat JOIN order_items oi ON m.idMenu = oi.idMenu GROUP BY c.name
    - Évolution Mensuelle : SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue FROM orders GROUP BY month ORDER BY month
    
    Réponds DIRECTEMENT en JSON (sans markdown de code) avec cette structure : 
    { 
      "thinking": "...", 
      "tools": ["sql"], 
      "sqls": ["SELECT ...", "SELECT ..."] 
    }`;

    // On combine Planification + SQL en 1 seul appel pour diviser le temps de réponse par 2
    const plannerResult = await callCohere(message, plannerPrompt, history.slice(-2).map(h => ({ role: h.role === 'User' ? 'USER' : 'CHATBOT', message: h.content })), 0.1);
    
    let plan = { tools: ['chat'], sqls: [] };
    try { 
      let cleanJson = plannerResult.text.replace(/```json\n?|\n?```/g, '').trim();
      // Securité si Cohere a ajouté du texte avant ou après le JSON
      if(cleanJson.indexOf('{') > -1) {
        cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
      }
      plan = JSON.parse(cleanJson); 
      if(!plan.tools) plan.tools = ['chat'];
    } catch (e) {
      // Fallback très rapide basé sur des mots-clés si le JSON échoue
      if(message.toLowerCase().match(/(vente|rapport|chiffre|ca|stat|évolution)/)) {
        plan.tools = ['sql'];
        plan.sqls = ["SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue FROM orders GROUP BY month ORDER BY month", "SELECT c.name, SUM(oi.price * oi.quantity) as total FROM categories c JOIN menus m ON c.idCat = m.idCat JOIN order_items oi ON m.idMenu = oi.idMenu GROUP BY c.name"];
      }
    }

    let toolResults = { sql: null, db_evidence: [] };

    // --- ÉTAPE 2 : EXÉCUTION & AUTO-GUÉRISON (SELF-HEALING) ---
    if (plan.tools.includes('sql') && plan.sqls && plan.sqls.length > 0) {
      // Nettoyage si le LLM a mis plusieurs requêtes séparées par des points-virgules dans la même string
      let rawQueries = [];
      plan.sqls.forEach(sql => {
        sql.split(';').map(q => q.trim()).filter(q => q.length > 5).forEach(q => rawQueries.push(q));
      });

      for (const queryStr of rawQueries) {
        let currentQuery = queryStr;
        try {
          // Première tentative
          const rows = await executeReadOnlyQuery(currentQuery);
          if (rows && rows.length > 0) {
            toolResults.db_evidence.push({ query: currentQuery, data: rows.slice(0, 50) });
          }
        } catch (e) {
          console.warn('[SQL Failure]', e.message, '-> Déclenchement Auto-Guérison...');
          try {
            // 🚑 BOUCLE D'AUTO-CORRECTION (SELF-HEALING)
            const fixPrompt = `La requête SQL MySQL a échoué.\nRequête : ${currentQuery}\nErreur : ${e.message}\nCorriges la requête pour le schéma : ${schemaInfo}\nRENVOIE UNIQUEMENT LA REQUÊTE SQL CORRIGÉE sans markdown.`;
            const fixRes = await callCohere(message, fixPrompt, [], 0.1);
            let fixedQuery = fixRes.text.replace(/```sql\n?|\n?```/g, '').trim().replace(/;+$/, '');
            
            console.warn('[SQL Auto-Healing] Nouvelle tentative avec:', fixedQuery);
            const rows2 = await executeReadOnlyQuery(fixedQuery);
            if (rows2 && rows2.length > 0) {
              toolResults.db_evidence.push({ query: fixedQuery, data: rows2.slice(0, 50) });
            }
          } catch (e2) {
            console.error('[SQL Fatal Failure] Même après auto-guérison:', e2.message);
          }
        }
      }
    }

    //Images / Menu si besoin
    if (plan.tools.includes('images')) {
      const info = await extractDishInfo(message);
      toolResults.images = await searchImages(info.searchQuery, info.dishName);
    }

    // --- ÉTAPE 3 : SYNTHÈSE MATHÉMATIQUE ---
    const synthesisPrompt = `Tu es l'Analyste Stratégique de GOURMI.
    DONNÉES CLIENT RÉELLES (MYSQL) : ${JSON.stringify(toolResults.db_evidence)}
    IMAGES : ${JSON.stringify(toolResults.images || [])}
    
    DEMANDE : "${message}"
    
    CONSIGNES DE SYNTHÈSE (STRICTES) :
    1. CHIFFRES : Utilise les montants EXACTS des données ci-dessus (en FCFA). Si tu ne vois pas de données, dis "Aucune donnée trouvée".
    2. KPI : Utilise <KPI title="Titre" value="Valeur FCFA" trend="+X%" />.
    3. GRAPHIQUES : Utilise <CHART type="bar|line|pie" data='{"labels": [...], "datasets": [{"label": "...", "data": [...]}]}' />. IMPORTANT: N'utilise JAMAIS, sous AUCUN prétexte, d'apostrophe (') ou d'apostrophe échappée (\\\') dans les de noms de plats ou textes du JSON. Tu DOIS les remplacer par des espaces (ex: écris "Gateau a l Ananas", JAMAIS "Gâteau à l\\'Ananas").
    4. SMART ACTIONS : <SMART_ACTIONS actions='[{"label": "...", "cmd": "..."}]' />.
    
    TON : Élite, stratégique, factuel. NE PAS HALLUCINER.`;

    const finalPass = await callCohere(message, synthesisPrompt, history.slice(-5).map(h => ({ role: h.role === 'User' ? 'USER' : 'CHATBOT', message: h.content })), 0.3);
    
    finalResponse.message = finalPass.text;
    finalResponse.history = [...history, { role: 'User', content: message }, { role: 'Assistant', content: finalPass.text }];
    
    // 💾 Sauvegarde dans le cache (limité à 50 requêtes pour la RAM)
    queryCache.set(cacheKey, { message: finalResponse.message, pipeline: finalResponse.pipeline });
    if (queryCache.size > 50) {
      queryCache.delete(queryCache.keys().next().value);
    }

    return finalResponse;

  } catch (err) {
    console.error('Agent V3 Failure:', err);
    return { message: "⚠️ Echec de l'analyse. Vérifiez la connexion DB.", history };
  }
}

module.exports = { processAdminChat };
