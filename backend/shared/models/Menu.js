const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Menu = sequelize.define('Menu', {
    idMenu: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING
    },
    idCat: {
        type: DataTypes.INTEGER
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'menus',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Menu;
