const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/cliente');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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

    // Função para exibir o perfil do usuário
    static async showUserProfile(req, res) {
        try {
            const userId = req.session.userid;
            const user = await User.findByPk(userId);
    
            if (!user) {
                req.flash('message', 'Usuário não encontrado!');
                return res.redirect('/');
            }
    
            // Certifique-se de que os dados estão corretos
            console.log('User CreatedAt:', user.createdAt);
            console.log('User LastLogin:', user.lastLogin || user.createdAt);
    
            res.render('/produtos/dashboard', {
                user: {
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin || user.createdAt // Se lastLogin for null, usa createdAt
                }
            });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            req.flash('message', 'Erro interno do servidor!');
            res.redirect('/');
        }
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body;
    
        // Verifica se as senhas conferem
        if (password !== confirmpassword) {
            req.flash('message', 'As senhas não conferem, tente novamente!');
            return res.render('auth/register');
        }
    
        // Verifica se o email já está em uso
        const checkUserExists = await User.findOne({ where: { email } });
    
        if (checkUserExists) {
            req.flash('message', 'O email já está em uso!');
            return res.render('auth/register');
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
            await User.create(user);
            req.flash('message', 'Cadastro realizado com sucesso! Faça login para continuar.');
            // Em vez de salvar o usuário na sessão, redirecione para a página de login
            res.redirect('/login');
        } catch (err) {
            console.error(err);
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
    
            // Atualiza a imagem de perfil se houver
            if (req.file) {
                user.profileImage = `uploads/cliente/${req.file.filename}`; // Caminho relativo ao diretório público
            }
    
            await user.save();
    
            req.flash('message', 'Dados atualizados com sucesso!');
            res.redirect('/produtos/cliente_update');
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