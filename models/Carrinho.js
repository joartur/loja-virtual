const { DataTypes } = require('sequelize');
const conn = require('../db/conn');
const Produto = require('./Produto');
const User = require('./User');

const Carrinho = conn.define('Carrinho', {
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 1 
  },
  ProdutoId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  UserId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
});

// Relacionamentos
Carrinho.belongsTo(Produto); // Define a chave estrangeira ProdutoId
Carrinho.belongsTo(User);    // Define a chave estrangeira UserId

module.exports = Carrinho;