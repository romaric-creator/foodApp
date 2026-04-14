const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root1234',
      database: process.env.DB_NAME || 'foodapp',
    });

    const email = process.argv[2] || 'admin@foodapp.com';
    const password = process.argv[3] || ' ';
    const name = process.argv[4] || 'Administrateur';

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'admin existe déjà
    const [existing] = await connection.execute(
      'SELECT idUsers FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      // Mettre à jour le mot de passe
      await connection.execute(
        'UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?',
        [hashedPassword, 'admin', name, email]
      );
      console.log(`✅ Compte admin mis à jour avec succès: ${email}`);
    } else {
      // Créer un nouvel admin
      await connection.execute(
        'INSERT INTO users (username, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [email.split('@')[0], email, hashedPassword, name, 'admin']
      );
      console.log(`✅ Compte admin créé avec succès: ${email}`);
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();

