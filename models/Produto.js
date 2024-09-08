const { DataTypes } = require('sequelize')
const db = require('../db/conn')
const User = require('./User')

const Produto = db.define('Produto', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        required: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        required: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    quant: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true
    }
})

Produto.belongsTo(User);
User.hasMany(Produto);

module.exports = Produto;