const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const User = sequelize.define('User', {
    idUsers: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    },
    telephone: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.ENUM('admin', 'client', 'kitchen'),
        defaultValue: 'client'
    }
}, {
    tableName: 'users',
    timestamps: false, // Désactiver les timestamps pour éviter les conflits
    createdAt: false,
    updatedAt: false
});

module.exports = User;
