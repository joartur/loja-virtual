// Script de Criação de Administrador
// Esse script deve ser executado apenas uma vez para garantir que o primeiro administrador seja criado.
// Após criar o administrador, você pode remover o script para evitar que outros administradores sejam criados acidentalmente.
// No terminal, execute o script com o Node.js: node createAdmin.js

const User = require('./models/User');
const bcrypt = require('bcrypt');
const sequelize = require('./db/conn');

async function createAdmin() {
    try {
        await sequelize.sync(); 

        console.log('Conectamos no Sequelize com sucesso');

        const admin = await User.findOne({ where: { email: 'admin@example.com' } });

        if (!admin) {
            // Criptografar a senha
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('admin123456', salt); // senha admin

            await User.create({
                name: 'Admin',
                email: 'admin@email.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Administrador criado com sucesso!');
        } else {
            console.log('Administrador já existe!');
        }
    } catch (error) {
        console.error('Erro ao criar administrador:', error);
    }
}

createAdmin();