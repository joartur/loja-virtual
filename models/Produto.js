const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');

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
        allowNull: false,
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
    },
    priceFormatted: {
        type: DataTypes.VIRTUAL,
        get() {
            const price = this.getDataValue('price');
            return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
        }
    }
});

Produto.belongsTo(User);
User.hasMany(Produto);

module.exports = Produto;