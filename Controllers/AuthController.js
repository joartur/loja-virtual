const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

class AuthController {
    static login(req, res) {
        res.render('auth/login');
    }

    static async loginPost(req, res) {
        const { email, password } = req.body;

        // Verifica se há erros de validação (se estiver usando express-validator)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('message', 'Por favor, corrija os erros!');
            return res.render('auth/login', { errors: errors.array() });
        }

        try {
            // Procura o usuário no banco de dados
            const user = await User.findOne({ where: { email } });

            // Verifica se o usuário existe
            if (!user) {
                req.flash('message', 'Usuário não encontrado!');
                return res.render('auth/login');
            }

            // Verifica se a senha está correta
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (!passwordMatch) {
                req.flash('message', 'Senha inválida!');
                return res.render('auth/login');
            }

            // Atualiza a data e hora do último login
            user.lastLogin = new Date();
            await user.save();

            // Define a sessão do usuário
            req.session.userid = user.id;
            req.session.userRole = user.role; // Armazena o papel do usuário na sessão

            req.flash('message', 'Login realizado com sucesso!');

            // Salva a sessão e redireciona com base no papel do usuário
            req.session.save(() => {
                if (user.role === 'admin') {
                    res.redirect('/produtos/admin/dashboard');  // Dashboard para administradores
                } else {
                    res.redirect('/');  // Dashboard para clientes
                }
            });
        } catch (error) {
            console.error(error);
            req.flash('message', 'Erro ao realizar o login. Tente novamente.');
            res.render('auth/login');
        }
    }

    static register(req, res) {
        res.render('auth/register');
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body;
    
        // Verifica se as senhas conferem
        if (password !== confirmpassword) {
            req.flash('message', 'As senhas não conferem, tente novamente!');
            res.render('auth/register');
            return;
        }
    
        // Verifica se o email já está em uso
        const checkUserExists = await User.findOne({ where: { email } });
    
        if (checkUserExists) {
            req.flash('message', 'O email já está em uso!');
            res.render('auth/register');
            return;
        }
    
        // Criptografa a senha
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
    
        // Define o usuário como 'cliente' por padrão
        const user = {
            name,
            email,
            password: hashedPassword,
            role: 'cliente' // Defina o papel como 'cliente' por padrão
        };
    
        try {
            const createdUser = await User.create(user);
            req.flash('message', 'Cadastro realizado com sucesso!');
            req.session.userid = createdUser.id;
            req.session.save(() => {
                res.redirect('/produtos/dashboard');  // Redireciona para o dashboard de clientes
            });
        } catch (err) {
            console.log(err);
            req.flash('message', 'Erro ao criar usuário!');
            res.render('auth/register');
        }
    }

    static async editClient(req, res) {
        try {
            const userId = req.session.userid;
            const user = await User.findByPk(userId);
    
            if (!user) {
                req.flash('message', 'Usuário não encontrado!');
                return res.redirect('/');
            }
    
            res.render('produtos/cliente_update', { user: user.toJSON() });
        } catch (error) {
            console.error('Erro ao exibir formulário de edição:', error);
            req.flash('message', 'Erro ao exibir formulário de edição!');
            res.redirect('/');
        }
    }
    
    static async updateClient(req, res) {
        try {
            const userId = req.session.userid;
            const { name, email, password, confirmpassword } = req.body;
    
            const user = await User.findByPk(userId);
    
            if (!user) {
                req.flash('message', 'Usuário não encontrado!');
                return res.redirect('/');
            }
    
            if (password !== confirmpassword) {
                req.flash('message', 'As senhas não conferem!');
                return res.redirect(`/produtos/cliente_update`);
            }
    
            user.name = name;
            user.email = email;
    
            if (password) {
                const salt = bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(password, salt);
            }
    
            await user.save();
    
            req.flash('message', 'Dados atualizados com sucesso!');
            res.redirect('/');
        } catch (error) {
            console.error('Erro ao atualizar dados do cliente:', error);
            req.flash('message', 'Erro ao atualizar dados!');
            res.redirect(`/produtos/cliente_update`);
        }
    }

    static logout(req, res) {
        req.session.destroy();
        res.redirect('/login');
    }
}

module.exports = AuthController;