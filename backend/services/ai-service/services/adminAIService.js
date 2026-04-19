/**
 * 🤖 GOURMI IQ — Admin AI Service
 * 
 * Architecture DeerFlow-inspirée :
 *   [PLANNER]  → Décompose la demande en tâches SQL ciblées
 *   [EXECUTOR] → Exécute toutes les requêtes en parallèle
 *   [REPORTER] → Synthétise en rapport stratégique premium
 * 
 * Fallback : Si le planner échoue → pipeline classique 1-passe
 */

console.log('--- Loading adminAIService.js (DeerFlow Pipeline) ---');

import axios from 'axios';
import { executeReadOnlyQuery, getDatabaseSchema } from '../utils/dbTools.js';
import { planTasks, executeTasks, generateReport } from './plannerService.js';

// ─── Détecteur d'intention : analytique ou conversationnel ? ─────────────────
function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // Mots-clés conversationnels → réponse directe sans pipeline SQL
  const conversationalPatterns = [
    /^(bonjour|bonsoir|salut|hello|hi|hey|coucou)/,
    /^(merci|thanks|parfait|super|ok|ça marche|cool|génial|très bien)/,
    /^(au revoir|bye|à bientôt|bonne journée|bonne nuit)/,
    /^(comment (tu t'appelles|ça va|vas-tu))/,
    /^(oui|non|peut-être|d'accord|exactement)/,
    /^(qui es-tu|c'est quoi|qu'est-ce que|qu'est ce que|explique)/,
    /^(aide|help|aide-moi avec)/,
    /\?$/, // Questions générales courtes
  ];

  // Si message court (< 15 chars) et pas de mot analytique → conversationnel
  const analyticalKeywords = [
    'analyse', 'analyser', 'rapport', 'vente', 'ventes', 'chiffre', 'revenu',
    'stock', 'stocks', 'commande', 'commandes', 'client', 'clients', 'menu',
    'menus', 'plat', 'plats', 'catégorie', 'performance', 'audit', 'stats',
    'statistique', 'bénéfice', 'marge', 'profit', 'tendance', 'prédiction',
    'optimis', 'stratégi', 'semaine', 'mois', 'jour', 'période', 'comparais',
    'top', 'meilleur', 'pire', 'plus vendu', 'moins vendu', 'alerte', 'rupture',
    'panier', 'total', 'chiffre d\'affaires', 'ca '
  ];

  const hasAnalyticalKeyword = analyticalKeywords.some(kw => msg.includes(kw));

  // Court + pattern conversationnel → CHAT
  if (msg.length < 40 && !hasAnalyticalKeyword) {
    for (const pattern of conversationalPatterns) {
      if (pattern.test(msg)) return 'conversational';
    }
  }

  // Très court sans mot analytique = conversationnel
  if (msg.length < 20 && !hasAnalyticalKeyword) return 'conversational';

  // Sinon → analytique → pipeline complet
  return 'analytical';
}

// ─── Réponse conversationnelle rapide (sans SQL, sans pipeline) ───────────────
async function handleConversational(message, history) {
  const apiKey = process.env.COHERE_API_KEY;
  const systemPrompt = `Tu es GOURMI IQ, l'assistant stratégique premium d'un restaurant. 
Tu es expert en restauration, gestion, et data analytics.
Pour les questions conversationnelles, réponds de façon concise, chaleureuse et professionnelle.
Si la question porte sur tes capacités, explique que tu peux analyser les ventes, stocks, commandes, générer des rapports PDF, etc.
Langue : Français. Ton : Expert, Premium. Longueur max : 3 phrases.`;

  const cohereHistory = history.map(h => ({
    role: h.role === 'User' ? 'USER' : 'CHATBOT',
    message: h.content
  }));

  const response = await axios.post(
    'https://api.cohere.com/v1/chat',
    { model: 'command-r-08-2024', message, preamble: systemPrompt, chat_history: cohereHistory, temperature: 0.6 },
    { headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return response.data.text;
}


async function callCohere(message, systemPrompt, chatHistory = []) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.error('❌ COHERE_API_KEY manquante !');
    throw new Error('COHERE_API_KEY manquante');
  }

  const response = await axios.post(
    'https://api.cohere.com/v1/chat',
    {
      model: 'command-r-08-2024',
      message,
      preamble: systemPrompt,
      chat_history: chatHistory,
      temperature: 0.3,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

// ─── Pipeline principal DeerFlow ──────────────────────────────────────────────
export async function processAdminChat(message, history = []) {
  const startTime = Date.now();
  console.log('\n🚀 ═══════════════════════════════════════');
  console.log('   GOURMI IQ — Smart Router');
  console.log(`   Message: "${message.substring(0, 60)}"`);

  // ──────────────────────────────────────────────────────────────
  // ROUTEUR D'INTENTION — conversationnel vs analytique
  // ──────────────────────────────────────────────────────────────
  const intent = detectIntent(message);
  console.log(`   Intent: ${intent.toUpperCase()}`);
  console.log('═══════════════════════════════════════════\n');

  if (intent === 'conversational') {
    // ── Réponse directe rapide, sans SQL ──
    try {
      const text = await handleConversational(message, history);
      return {
        message: text,
        pipeline: { mode: 'conversational' },
        history: [...history, { role: 'User', content: message }, { role: 'Assistant', content: text }]
      };
    } catch (err) {
      console.error('Conversational error:', err.message);
      return {
        message: 'Bonjour ! Je suis GOURMI IQ, votre assistant analytique. Posez-moi une question sur vos ventes, stocks ou commandes.',
        pipeline: { mode: 'conversational_fallback' },
        history
      };
    }
  }



  try {
    // ──────────────────────────────────────────────────────────────
    // PRÉ-REQUIS : Schéma de la base de données
    // ──────────────────────────────────────────────────────────────
    console.log('📦 [0/3] Fetching database schema...');
    const schema = await getDatabaseSchema();
    if (!schema) throw new Error('Impossible de récupérer le schéma de la base de données');
    console.log('✅ Schema loaded\n');

    // ──────────────────────────────────────────────────────────────
    // ÉTAPE 1 : PLANNER — Décompose la demande en tâches SQL
    // ──────────────────────────────────────────────────────────────
    console.log('🧠 [1/3] Planning tasks...');
    const plan = await planTasks(message, schema);
    
    console.log(`\n📋 Plan "${plan.intent}" :`);
    plan.tasks.forEach((t, i) => {
      console.log(`   ${i + 1}. [${t.id}] ${t.name}`);
    });
    console.log('');

    // ──────────────────────────────────────────────────────────────
    // ÉTAPE 2 : EXECUTOR — Exécution SQL parallèle
    // ──────────────────────────────────────────────────────────────
    console.log('⚡ [2/3] Executing SQL tasks in parallel...');
    const taskResults = await executeTasks(plan.tasks);

    const successCount = taskResults.filter(r => r.success).length;
    const totalRows = taskResults.reduce((acc, r) => acc + (r.rowCount || 0), 0);
    console.log(`✅ ${successCount}/${plan.tasks.length} tasks succeeded — ${totalRows} total rows\n`);

    // ──────────────────────────────────────────────────────────────
    // ÉTAPE 3 : REPORTER — Rapport stratégique premium
    // ──────────────────────────────────────────────────────────────
    console.log('📊 [3/3] Generating premium report...');
    const reportText = await generateReport(message, plan.intent, taskResults, history);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Pipeline complete in ${elapsed}s`);
    console.log('═══════════════════════════════════════════\n');

    return {
      message: reportText,
      pipeline: {
        intent: plan.intent,
        tasksPlanned: plan.tasks.length,
        tasksSucceeded: successCount,
        totalRows,
        elapsedSeconds: parseFloat(elapsed)
      },
      history: [
        ...history,
        { role: 'User', content: message },
        { role: 'Assistant', content: reportText }
      ]
    };

  } catch (error) {
    console.error('\n❌ DeerFlow Pipeline Error:', error.message);
    console.log('⚠️  Falling back to classic 1-pass pipeline...\n');
    return await fallbackClassicPipeline(message, history);
  }
}

// ─── Fallback : Pipeline classique 1-passe (ancienne version) ─────────────────
async function fallbackClassicPipeline(message, history = []) {
  try {
    const schema = await getDatabaseSchema();
    const schemaInfo = JSON.stringify(schema || {});

    const systemPrompt = `Tu es GOURMI AGENT PREMIUM, l'intelligence stratégique de ce restaurant.

SCHÉMA DB :
- menus (idMenu, name, description, price, stock_quantity, min_stock_alert, idCat)
- categories (idCat, name)
- orders (idOrder, total, statut, timestamp, created_at)
- order_items (idOrder, idMenu, quantity, price)

RÈGLES :
- Génère des requêtes SQL via <SQL>...</SQL> pour toute analyse
- Utilise des tableaux Markdown pour présenter les données
- Ajoute <CHART type="bar|line|pie" data='...' /> après chaque tableau
- Ne jamais inventer de données — si vide, dis-le clairement

BASE DE DONNÉES :
${schemaInfo}`;

    const cohereHistory = history.map(h => ({
      role: h.role === 'User' ? 'USER' : 'CHATBOT',
      message: h.content
    }));

    let result = await callCohere(message, systemPrompt, cohereHistory);
    let text = result.text;

    // Exécuter les SQL trouvés dans la réponse
    const sqlMatches = [...text.matchAll(/<SQL>(.*?)<\/SQL>/gs)];
    if (sqlMatches.length > 0) {
      let combinedResults = '';
      for (let i = 0; i < sqlMatches.length; i++) {
        try {
          const data = await executeReadOnlyQuery(sqlMatches[i][1].trim());
          combinedResults += `\nRésultat ${i + 1}: ${JSON.stringify(data)}\n`;
        } catch (e) {
          combinedResults += `\nRésultat ${i + 1}: Erreur - ${e.message}\n`;
        }
      }

      cohereHistory.push({ role: 'USER', message });
      cohereHistory.push({ role: 'CHATBOT', message: text });

      const followUpResult = await callCohere(
        `Voici les données réelles: ${combinedResults}. Produis maintenant un rapport avec tableaux Markdown et tags <CHART />.`,
        systemPrompt,
        cohereHistory
      );
      text = followUpResult.text;
    }

    return {
      message: text,
      pipeline: { mode: 'fallback_classic' },
      history: [...history, { role: 'User', content: message }, { role: 'Assistant', content: text }]
    };

  } catch (err) {
    console.error('❌ Fallback also failed:', err.message);
    return {
      message: '⚠️ Service temporairement indisponible. Vérifiez votre connexion et la clé API Cohere.',
      pipeline: { mode: 'error' },
      history
    };
  }
}
