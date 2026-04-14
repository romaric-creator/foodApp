const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const OrderItem = sequelize.define('OrderItem', {
    idOrderItem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idOrder: {
        type: DataTypes.INTEGER
    },
    idMenu: {
        type: DataTypes.INTEGER
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'order_items',
    timestamps: false
});

module.exports = OrderItem;
