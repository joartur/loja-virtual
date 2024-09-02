const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Rota de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).render('login', { error: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).render('login', { error: 'Senha incorreta.' });
        }

        req.session.userid = user.id;
        req.session.isAdmin = user.isAdmin; // Armazena se o usuário é admin na sessão

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).render('login', { error: 'Erro no servidor.' });
    }
});

module.exports = router;
