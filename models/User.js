const { DataTypes } = require('sequelize');
const sequelize = require('../db/conn');
const bcrypt = require('bcryptjs');

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
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Hash da senha antes de salvar
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});


// Sincronizando o modelo com o banco de dados
sequelize.sync({ alter: true });

module.exports = User;

