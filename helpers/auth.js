const User = require('../models/User');

const checkAuth = async (req, res, next) => {
    if (!req.session.userid) {
        return res.redirect('/login');
    }

    const user = await User.findByPk(req.session.userid);
    if (!user) {
        return res.redirect('/login');
    }

    req.session.userRole = user.userRole; // Armazena o papel do usuário na sessão
    next();
};

const checkAdmin = async (req, res, next) => {
    const userId = req.session.userid;

    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ where: { id: userId } });
        if (user && user.role === 'admin') {
            req.user = user; // Adicionando o usuário à solicitação
            return next();
        } else {
            return res.redirect('/produtos/admin/dashboard');
        }
    } catch (error) {
        console.error('Erro ao verificar administrador:', error);
        return res.redirect('/login');
    }
};

module.exports = { checkAuth, checkAdmin };