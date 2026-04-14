const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Table = sequelize.define('Table', {
    idTab: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'tables',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Table;
