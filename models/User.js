const { DataTypes } = require('sequelize');
const sequelize = require('../db/conn'); 

// Definição do modelo User
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'cliente'),
        allowNull: false,
        defaultValue: 'cliente'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    profileImage: { 
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Users',
    timestamps: true
});

module.exports = User;