const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Order = sequelize.define('Order', {
    idOrder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idUsers: {
        type: DataTypes.INTEGER
    },
    idTab: {
        type: DataTypes.INTEGER
    },
    statut: {
        type: DataTypes.STRING,
        defaultValue: 'en cours'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Order;
