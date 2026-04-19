const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root1234',
        database: 'foodapp'
    });

    try {
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log(`🔐 Réinitialisation du mot de passe pour admin@foodapp.com...`);
        
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@foodapp.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Mot de passe mis à jour avec succès : admin123');
        } else {
            console.log('❌ Utilisateur non trouvé.');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();
