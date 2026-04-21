const pool = require('../../../shared/config/database.js');

/**
 * Liste blanche des tables autorisées pour les requêtes IA
 */
const ALLOWED_TABLES = ['menus', 'categories', 'orders', 'order_items', 'users', 'tables', 'ai_conversations'];

/**
 * Vérifie si une table est autorisée
 */
function isTableAllowed(tableName) {
  return ALLOWED_TABLES.includes(tableName.toLowerCase());
}

/**
 * Valide que la requête ne cible que des tables autorisées
 */
function validateTableNames(sql) {
  const tablePattern = /(?:FROM|JOIN|UPDATE|INTO|TABLE)\s+`?(\w+)`?/gi;
  let match;
  while ((match = tablePattern.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase();
    if (!isTableAllowed(tableName)) {
      throw new Error(`Table '${tableName}' non autorisée. Tables permises: ${ALLOWED_TABLES.join(', ')}`);
    }
  }
}

/**
 * Exécute une requête SQL en lecture seule sur la base de données.
 */
async function executeReadOnlyQuery(sql) {
  const sanitizedSql = sql.trim();
  
  if (sanitizedSql.includes(';')) {
    throw new Error('Les requêtes multiples (;) ne sont pas autorisées pour l\'assistant IA.');
  }

  if (!sanitizedSql.toUpperCase().startsWith('SELECT')) {
    throw new Error('Seules les requêtes SELECT sont autorisées pour l\'assistant IA.');
  }

  validateTableNames(sanitizedSql);

  try {
    const [rows] = await pool.execute(sanitizedSql);
    return rows;
  } catch (error) {
    console.error('Erreur SQL Assistant IA:', error.message);
    throw new Error(`Erreur lors de l'exécution de la requête: ${error.message}`);
  }
}

/**
 * Exécute une requête d'action (UPDATE, INSERT) de manière contrôlée.
 */
async function executeActionQuery(sql) {
  const sanitizedSql = sql.trim().toUpperCase();
  
  if (sanitizedSql.includes(';')) {
    throw new Error('Les requêtes multiples (;) ne sont pas autorisées.');
  }

  if (sanitizedSql.startsWith('SELECT')) {
    return await executeReadOnlyQuery(sql);
  }

  const allowed = sanitizedSql.startsWith('UPDATE') || sanitizedSql.startsWith('INSERT');
  const forbidden = sanitizedSql.includes('DELETE') || sanitizedSql.includes('DROP') || sanitizedSql.includes('TRUNCATE');
  
  if (!allowed || forbidden) {
    throw new Error('Action non autorisée. Seuls UPDATE, INSERT et SELECT sont permis.');
  }

  validateTableNames(sql);
  
  try {
    const [result] = await pool.execute(sql);
    return result;
  } catch (error) {
    console.error('Erreur SQL Action IA:', error.message);
    throw new Error(`Échec de l'action SQL: ${error.message}`);
  }
}

/**
 * Récupère le schéma simplifié de la base de données pour aider l'IA.
 */
async function getDatabaseSchema() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    const schema = {};
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      if (!isTableAllowed(tableName)) continue;
      try {
        const [columns] = await pool.execute(`DESCRIBE \`${tableName}\``);
        schema[tableName] = columns.map(col => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key
        }));
      } catch (e) {
        console.warn(`Cannot describe table ${tableName}:`, e.message);
      }
    }
    return schema;
  } catch (error) {
    console.error('Erreur schéma DB:', error.message);
    return null;
  }
}

/**
 * Sauvegarde un message de chat dans la base de données avec support de session.
 */
async function saveChatMessage(userId, role, content, sessionId = 'default', sessionTitle = 'Nouvelle discussion') {
  try {
    await pool.execute(
      'INSERT INTO ai_conversations (idUsers, role, content, sessionId, sessionTitle) VALUES (?, ?, ?, ?, ?)',
      [userId, role, content, sessionId, sessionTitle]
    );
  } catch (error) {
    console.error('Erreur sauvegarde chat:', error.message);
  }
}

/**
 * Récupère l'historique d'une session spécifique.
 * Limité à 20 messages pour optimiser les tokens.
 */
async function getChatHistory(userId, sessionId = 'default', limit = 20) {
  try {
    const [rows] = await pool.execute(
      'SELECT role, content FROM ai_conversations WHERE idUsers = ? AND sessionId = ? ORDER BY created_at ASC LIMIT ?',
      [userId, sessionId, limit]
    );
    return rows.map(r => ({
      role: r.role,
      content: r.content
    }));
  } catch (error) {
    console.error('Erreur récup historique chat:', error.message);
    return [];
  }
}

/**
 * Récupère la liste des sessions uniques d'un utilisateur.
 */
async function getChatSessions(userId) {
  try {
    // On récupère le dernier titre et la dernière date pour chaque sessionId unique
    const [rows] = await pool.execute(
      `SELECT sessionId, sessionTitle, created_at as last_msg 
       FROM ai_conversations 
       WHERE idUsers = ? 
       AND id IN (SELECT MAX(id) FROM ai_conversations GROUP BY sessionId)
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Erreur récup sessions chat:', error.message);
    return [];
  }
}

/**
 * Efface l'historique d'une session ou tout l'historique d'un utilisateur.
 */
async function clearUserChatHistory(userId, sessionId = null) {
  try {
    if (sessionId) {
      await pool.execute('DELETE FROM ai_conversations WHERE idUsers = ? AND sessionId = ?', [userId, sessionId]);
    } else {
      await pool.execute('DELETE FROM ai_conversations WHERE idUsers = ?', [userId]);
    }
  } catch (error) {
    console.error('Erreur suppression historique chat:', error.message);
  }
}

module.exports = {
  executeReadOnlyQuery,
  executeActionQuery,
  getDatabaseSchema,
  saveChatMessage,
  getChatHistory,
  getChatSessions,
  clearUserChatHistory
};
