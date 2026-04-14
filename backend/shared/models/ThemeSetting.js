const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const ThemeSetting = sequelize.define('ThemeSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    primary: {
        type: DataTypes.STRING,
        defaultValue: '#0e0c2b'
    },
    secondary: {
        type: DataTypes.STRING,
        defaultValue: '#7842af'
    },
    background: {
        type: DataTypes.STRING,
        defaultValue: '#e6dce4'
    }
}, {
    tableName: 'theme_settings',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
});

module.exports = ThemeSetting;
