console.log('--- Loading dbTools.js ---');
import pool from '../../../shared/config/database.js';

/**
 * Exécute une requête SQL en lecture seule sur la base de données.
 */
export async function executeReadOnlyQuery(sql) {
  const sanitizedSql = sql.trim();
  if (!sanitizedSql.toUpperCase().startsWith('SELECT')) {
    throw new Error('Seules les requêtes SELECT sont autorisées pour l\'assistant IA.');
  }
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
export async function executeActionQuery(sql) {
  const sanitizedSql = sql.trim().toUpperCase();
  
  // Si c'est un SELECT, on redirige vers le moteur de lecture seule pour éviter l'erreur
  if (sanitizedSql.startsWith('SELECT')) {
    return await executeReadOnlyQuery(sql);
  }

  const allowed = sanitizedSql.startsWith('UPDATE') || sanitizedSql.startsWith('INSERT');
  const forbidden = sanitizedSql.includes('DELETE') || sanitizedSql.includes('DROP') || sanitizedSql.includes('TRUNCATE');
  
  if (!allowed || forbidden) {
    throw new Error('Action non autorisée. Seuls UPDATE, INSERT et SELECT sont permis.');
  }
  
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
export async function getDatabaseSchema() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    const schema = {};
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
      schema[tableName] = columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key
      }));
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
export async function saveChatMessage(userId, role, content, sessionId = 'default', sessionTitle = 'Nouvelle discussion') {
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
 */
export async function getChatHistory(userId, sessionId = 'default', limit = 100) {
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
export async function getChatSessions(userId) {
  try {
    const [rows] = await pool.execute(
      'SELECT sessionId, sessionTitle, MAX(created_at) as last_msg FROM ai_conversations WHERE idUsers = ? GROUP BY sessionId, sessionTitle ORDER BY last_msg DESC',
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
export async function clearUserChatHistory(userId, sessionId = null) {
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
