const bcrypt = require('bcrypt');
const User = require('../models/User');

class AdminController {
    static async layout(req, res, next) {
        try {
            const userId = req.session.userid;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.redirect('/login'); // Redirecionar se o usuário não estiver logado
            }

            req.session.userRole = user.role; // Armazenar o papel do usuário na sessão

            res.locals.session = {
                userid: userId,
                userRole: user.role,
                user: user.toJSON() // Adicionar usuário aos locals
            };

            next(); // Continue para o próximo middleware
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            next(error); // Passar erro para o middleware de tratamento de erros
        }
    }

    static async dashboard(req, res) {
        try {
            // Obter todos os administradores ou outros dados necessários
            const admins = await User.findAll({ where: { role: 'admin' } });
            res.render('admin_dashboard', { admins });
        } catch (error) {
            console.error('Erro ao carregar o dashboard do administrador:', error);
            res.redirect('/login');
        }
    }

    static async showDashboard(req, res) {
        try {
            const userId = req.session.userid;
            const user = await User.findByPk(userId);

            if (!user) {
                req.flash('message', 'Usuário não encontrado.');
                return res.redirect('/login');
            }

            res.render('dashboard', { user }); // Passando o usuário para a view
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            req.flash('message', 'Erro ao carregar usuário.');
            res.redirect('/login');
        }
    }

    static async createAdmin(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            req.flash('message', 'As senhas não coincidem!');
            return res.redirect('/admin/register');
        }

        try {
            const existingUser = await User.findOne({ where: { email: email } });

            if (existingUser) {
                req.flash('message', 'O email já está em uso!');
                return res.redirect('/admin/register');
            }

            // Criptografar a senha
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Criar novo usuário
            await User.create({
                name: name,
                email: email,
                password: hashedPassword,
                role: 'admin' // Certifique-se de que a tabela de usuários tem a coluna 'role'
            });

            req.flash('message', 'Administrador criado com sucesso!');
            res.redirect('/produtos/admin/dashboard');
        } catch (error) {
            console.error('Erro ao criar administrador:', error);
            req.flash('message', 'Erro ao criar administrador!');
            res.redirect('/admin/register');
        }
    }

    static async editAdmin(req, res) {
        try {
            const adminId = req.session.userid; // Usando o ID da sessão
            const admin = await User.findByPk(adminId); // Buscando o administrador pelo ID

            if (!admin) {
                req.flash('message', 'Administrador não encontrado.');
                return res.redirect('/produtos/admin/dashboard');
            }

            res.render('auth/admin_update', { admin: admin.toJSON() });
        } catch (error) {
            console.error('Erro ao buscar administrador:', error);
            req.flash('message', 'Erro ao carregar administrador.');
            res.redirect('/produtos/admin/dashboard');
        }
    }

    // Atualizar o administrador
    static async updateAdmin(req, res) {
        const { name, email, password, role } = req.body;
        const adminId = req.session.userid; // Usando o ID da sessão

        try {
            const admin = await User.findByPk(adminId);

            if (!admin) {
                req.flash('message', 'Administrador não encontrado.');
                return res.redirect('/produtos/admin/dashboard');
            }

            // Atualizando os dados
            admin.name = name;
            admin.email = email;
            admin.role = role;

            // Atualizar a senha se for fornecida
            if (password) {
                const salt = bcrypt.genSaltSync(10);
                admin.password = bcrypt.hashSync(password, salt);
            }

            await admin.save();
            req.flash('message', 'Dados do administrador atualizados com sucesso.');
            res.redirect('/admin/update');
        } catch (error) {
            console.error('Erro ao atualizar administrador:', error);
            req.flash('message', 'Erro ao atualizar administrador.');
            res.redirect('/admin/update');
        }
    }
}

module.exports = AdminController;