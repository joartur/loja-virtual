const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Adm = db.define('Adm', {
    cargo: {
        type: DataTypes.STRING,
        required: true
    },
    name: {
        type: DataTypes.STRING,
        required: true
    },
    email:{
        type: DataTypes.STRING,
        required: true
    },
    password:{
        type: DataTypes.STRING,
        required: true
    }
})
module.exports = Adm;