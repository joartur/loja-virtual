const Sequelize = require('sequelize');
const sequelize = require('../db/conn');

const Produto = require('./Produto');
const User = require('./User');

// Relacionamentos
User.hasMany(Produto);
Produto.belongsTo(User);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Banco de dados sincronizado.');
  })
  .catch((error) => {
    console.log('Erro ao sincronizar o banco de dados:', error);
  });

module.exports = { Produto, User };
