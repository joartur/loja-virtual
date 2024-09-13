const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

class AdminController {
    static async layout(req, res, next) {
        try {
            const userId = req.session.userid;
            if (!userId) {
                return next(); // Não há usuário logado
            }
    
            const user = await User.findByPk(userId);
            if (user) {
                req.session.userRole = user.role; // Armazenar o papel do usuário na sessão
                res.locals.user = user.toJSON();  // Adicionar o usuário às variáveis locais
            }
            next();
        } catch (error) {
            console.error('Erro ao carregar dados do layout:', error);
            next(error);
        }
    }

    static async dashboard(req, res) {
        try {
            const userId = req.session.userid;
            const admin = await User.findByPk(userId);
    
            if (!admin) {
                req.flash('message', 'Administrador não encontrado.');
                return res.redirect('/login');
            }
    
            // Renderizar o dashboard com os dados do admin
            res.render('admin_dashboard', { admin: admin.toJSON() });
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
        const adminId = req.session.userid;
    
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
    
            // Verificar se uma nova imagem de perfil foi fornecida
            if (req.file) {
                // Remover a imagem antiga, se existir
                if (admin.profileImage) {
                    const oldImagePath = path.join(__dirname, '../public/uploads/adm/', admin.profileImage);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath); // Apaga a imagem antiga
                    }
                }
    
                admin.profileImage = req.file.filename; // Salva o novo nome da imagem
            }
    
            // Salvar as alterações
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