const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importCategories() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root1234',
        database: 'foodapp'
    });

    try {
        const filePath = path.join(__dirname, '../categories.json');
        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`🚀 Importation de ${categories.length} catégories...`);

        for (const cat of categories) {
            await connection.execute(
                'INSERT INTO categories (name) VALUES (?)',
                [cat.name]
            );
            console.log(`✅ Ajouté: ${cat.name}`);
        }

        console.log('🎉 Importation terminée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'importation:', error.message);
    } finally {
        await connection.end();
    }
}

importCategories();
