const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Category = sequelize.define('Category', {
    idCat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Category;
