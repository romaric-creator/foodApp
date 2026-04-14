const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'foodapp',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root1234',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Passer à console.log pour le debug
        define: {
            timestamps: true,
            underscored: false,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion Sequelize à MySQL établie avec succès');
    } catch (error) {
        console.error('❌ Impossible de se connecter à la base de données:', error.message);
    }
};

module.exports = { sequelize, connectDB };
