const { DataTypes } = require('sequelize');
const conn = require('../db/conn');
const Produto = require('./Produto');
const User = require('./User');

const Carrinho = conn.define('Carrinho', {
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

Carrinho.belongsTo(Produto);
Carrinho.belongsTo(User);

module.exports = Carrinho;