/**
 * 🦌 GOURMI PLANNER — Inspiré de DeerFlow (ByteDance)
 * 
 * Architecture :
 *   User Message
 *       ↓
 *   [PLANNER]  → décompose en tâches SQL structurées (Cohere pass 1)
 *       ↓
 *   [EXECUTOR] → exécute toutes les requêtes SQL en parallèle
 *       ↓
 *   [REPORTER] → synthétise en rapport premium (Cohere pass 2)
 */

import axios from 'axios';
import { executeReadOnlyQuery } from '../utils/dbTools.js';

const COHERE_BASE_URL = 'https://api.cohere.com/v1';

// ───────────────────────────────────────────────
// ÉTAPE 1 : PLANNER — Décompose la question en tâches
// ───────────────────────────────────────────────
export async function planTasks(userMessage, schema) {
  const apiKey = process.env.COHERE_API_KEY;
  const schemaStr = JSON.stringify(schema);

  const plannerPrompt = `Tu es le PLANIFICATEUR de GOURMI IQ.
Ton seul rôle est de décomposer la demande utilisateur en une liste de tâches SQL à exécuter.

SCHÉMA DE LA BASE DE DONNÉES :
${schemaStr}

TABLES DISPONIBLES :
- menus (idMenu, name, description, price, stock_quantity, min_stock_alert, idCat)
- categories (idCat, name)
- orders (idOrder, idUsers, idTab, total, statut, timestamp, created_at)
- order_items (idOrder, idMenu, quantity, price)
- users (idUsers, name, email)

RÈGLES ABSOLUES :
1. Génère UNIQUEMENT un JSON valide, sans texte avant ou après.
2. Génère entre 2 et 5 tâches SQL pertinentes selon la demande.
3. Chaque requête SQL doit être un SELECT valide avec des JOIN si nécessaire.
4. Adapte les tâches selon l'intention : ventes → orders+order_items, stocks → menus, utilisateurs → users+orders.
5. Pour les analyses temporelles, utilise les 30 derniers jours par défaut si non précisé.

FORMAT DE RÉPONSE (JSON strict) :
{
  "intent": "descriptioncourte de la demande en 5 mots max",
  "tasks": [
    {
      "id": "task_1",
      "name": "Nom court de la tâche",
      "description": "Ce que cette tâche analyse",
      "sql": "SELECT ... FROM ... WHERE ... LIMIT 20"
    },
    {
      "id": "task_2",
      "name": "...",
      "description": "...",
      "sql": "SELECT ..."
    }
  ]
}

DEMANDE UTILISATEUR : "${userMessage}"

Réponds UNIQUEMENT avec le JSON.`;

  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: plannerPrompt,
        temperature: 0.1, // Faible température pour un plan déterministe
        max_tokens: 1500,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rawText = response.data.text.trim();
    console.log('🧠 Planner raw output:', rawText.substring(0, 200) + '...');

    // Parser le JSON — robuste contre les backticks markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Planner: JSON introuvable dans la réponse');

    const plan = JSON.parse(jsonMatch[0]);
    console.log(`✅ Plan généré : "${plan.intent}" — ${plan.tasks.length} tâches`);
    return plan;

  } catch (error) {
    console.error('❌ Planner error:', error.message);
    // Plan de secours minimal
    return {
      intent: 'analyse générale',
      tasks: [
        {
          id: 'task_fallback',
          name: 'Analyse générale des ventes',
          description: 'Vue d\'ensemble des 30 derniers jours',
          sql: `SELECT COUNT(*) as total_commandes, SUM(total) as chiffre_affaires, AVG(total) as panier_moyen
                FROM orders 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        }
      ]
    };
  }
}

// ───────────────────────────────────────────────
// ÉTAPE 2 : EXECUTOR — Exécute toutes les tâches SQL en parallèle
// ───────────────────────────────────────────────
export async function executeTasks(tasks) {
  console.log(`⚡ Executing ${tasks.length} tasks in parallel...`);

  const results = await Promise.allSettled(
    tasks.map(async (task) => {
      try {
        const data = await executeReadOnlyQuery(task.sql);
        return {
          taskId: task.id,
          name: task.name,
          description: task.description,
          sql: task.sql,
          data: data,
          success: true,
          rowCount: data.length
        };
      } catch (err) {
        console.error(`❌ Task ${task.id} failed:`, err.message);
        return {
          taskId: task.id,
          name: task.name,
          description: task.description,
          sql: task.sql,
          data: [],
          success: false,
          error: err.message
        };
      }
    })
  );

  return results.map(r => r.status === 'fulfilled' ? r.value : {
    taskId: 'error',
    name: 'Tâche échouée',
    data: [],
    success: false,
    error: r.reason?.message || 'Erreur inconnue'
  });
}

// ───────────────────────────────────────────────
// ÉTAPE 3 : REPORTER — Synthétise tout en rapport premium
// ───────────────────────────────────────────────
export async function generateReport(userMessage, intent, taskResults, history = []) {
  const apiKey = process.env.COHERE_API_KEY;

  // Construire le contexte consolidé de toutes les tâches exécutées
  const executionContext = taskResults.map(r => {
    if (!r.success) {
      return `\n### ${r.name}\n⚠️ Erreur: ${r.error}`;
    }
    return `\n### ${r.name}\n${r.description}\n` +
           `Résultats (${r.rowCount} lignes) : ${JSON.stringify(r.data.slice(0, 50))}`;
  }).join('\n');

  const hasData = taskResults.some(r => r.success && r.rowCount > 0);

  const reporterPrompt = `Tu es le REPORTER PREMIUM de GOURMI IQ.
Tu reçois les résultats consolidés d'une analyse multi-tâches SQL et tu dois produire un rapport stratégique de haut niveau.

DEMANDE ORIGINALE : "${userMessage}"
INTENTION ANALYSÉE : "${intent}"

DONNÉES COLLECTÉES PAR L'AGENT :
${executionContext}

${!hasData ? '⚠️ ATTENTION : Certaines ou toutes les requêtes ont retourné des tableaux vides. Informe l\'utilisateur honnêtement et suggère des actions pour générer des données.' : ''}

PROTOCOLE DE RAPPORT OBLIGATOIRE :
1. Commence par un titre H2 avec l'analyse demandée.
2. Pour CHAQUE section de données, génère :
   - Un tableau Markdown avec des alias métier élégants (pas de noms SQL bruts)
   - Immédiatement suivi de : <CHART type="bar|line|pie" data='{"labels":["..."],"datasets":[{"label":"...","data":[...]}]}' />
3. Après chaque section, donne 1-2 insights stratégiques en gras.
4. Termine avec une section "🎯 RECOMMANDATIONS" avec 3 actions concrètes numérotées.
5. Termine ABSOLUMENT par : <EXPORT type="Rapport_${intent.replace(/\s+/g, '_')}" data='{"content":"[RÉSUMÉ COMPLET DE TON RAPPORT]"}' />

TON : Expert restaurateur, premium, orienté décision. Pas de remplissage.`;

  const cohereHistory = history.map(h => ({
    role: h.role === 'User' ? 'USER' : 'CHATBOT',
    message: h.content
  }));

  try {
    const response = await axios.post(
      `${COHERE_BASE_URL}/chat`,
      {
        model: 'command-r-08-2024',
        message: reporterPrompt,
        preamble: 'Tu es GOURMI IQ, un agent analytique premium pour la gestion de restaurant. Tu fournis des rapports clairs, visuels et actionnables.',
        chat_history: cohereHistory,
        temperature: 0.4,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📊 Reporter: rapport généré avec succès');
    return response.data.text;

  } catch (error) {
    console.error('❌ Reporter error:', error.message);
    throw error;
  }
}
