const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    let connection;

    try {
        console.log('⏳ Initialisation de la base de données...');
        connection = await mysql.createConnection(connectionConfig);

        // Charger le schéma
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Exécuter le schéma
        await connection.query(schema);

        console.log('✅ Base de données initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
