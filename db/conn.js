const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('lojavirtual', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})
try{
    sequelize.authenticate()
    console.log("Conectamos no sequelize com sucesso")
}catch(err){
    console.log('Não foi possível conectar: ', err)
}
module.exports = sequelize;