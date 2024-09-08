const { Sequelize } = require('sequelize');

// Configure a instância do Sequelize
const sequelize = new Sequelize('lojasame', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// Teste a conexão com o banco de dados
try {
    sequelize.authenticate();
    console.log('Conectamos no Sequelize com sucesso');
} catch (err) {
    console.error('Não foi possível conectar:', err);
}

module.exports = sequelize;