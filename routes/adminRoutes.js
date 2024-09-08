const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const AdminController = require('../Controllers/AdminController');
const { checkAuth, checkAdmin } = require('../helpers/auth');

router.use(checkAdmin);

router.get('/dashboard', ProdutoController.dashboard);
router.get('/add', ProdutoController.createProduto);
router.post('/add', ProdutoController.createProdutoSave);
router.post('/produto/:id/delete', ProdutoController.removeProduto);
router.post('/remove', ProdutoController.removeProduto);
router.get('/edit/:id', ProdutoController.updateProduto);
router.post('/edit/:id', ProdutoController.updateProdutoSave);
router.get('/dashboard', AdminController.showDashboard);

// Exibir o formulário de edição
router.get('/update', AdminController.editAdmin); // Removido o ID da URL, usando ID da sessão

// Processar a atualização
router.post('/update', AdminController.updateAdmin); // Removido o ID da URL, usando ID da sessão

// Exibir o formulário de criação de administrador
router.get('/register', (req, res) => {
    res.render('auth/admin_register');
});

// Processar a criação de administrador
router.post('/register', AdminController.createAdmin);

module.exports = router;