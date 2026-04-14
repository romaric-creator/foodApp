const { sequelize } = require('../shared/config/sequelize');
const models = require('../shared/models');

async function syncModels() {
    try {
        console.log('⏳ Synchronisation des modèles Sequelize...');
        console.log('📡 Connexion à la base de données via Sequelize...');
        await sequelize.authenticate();
        console.log('✅ Authentification Sequelize réussie');

        // Synchroniser sans alter pour éviter les erreurs de clés redondantes
        await sequelize.sync({ alter: false, force: false });
        console.log('✅ Modèles synchronisés avec succès');
    } catch (error) {
        // Les tables existent déjà, ce n'est pas grave
        console.warn('⚠️  Synchronisation des modèles: Les tables existent déjà, on continue...');
        console.warn('   Message:', error.message);
    }
}

if (require.main === module) {
    syncModels();
}

module.exports = syncModels;
