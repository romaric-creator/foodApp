const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root1234',
  database: process.env.DB_NAME || 'foodapp',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer un pool de connexions
const pool = mysql.createPool(dbConfig);

// Tester la connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion à MySQL établie avec succès');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à MySQL:', err.message);
  });

module.exports = pool;

