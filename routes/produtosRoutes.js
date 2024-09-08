const express = require('express');
const router = express.Router();
const ProdutoController = require('../Controllers/ProdutoController');
const { checkAuth, checkAdmin } = require('../helpers/auth');

router.get('/produto/:id', ProdutoController.showProduto);
router.get('/produto/detalhes/:id', ProdutoController.detalhesProduto);
router.post('/produto/:id/delete', checkAdmin, ProdutoController.removeProduto);
router.get('/admin/dashboard', checkAdmin, ProdutoController.adminDashboard);
router.get('/dashboard', checkAuth, ProdutoController.clientDashboard);
router.get('/add', checkAdmin, ProdutoController.createProduto);
router.post('/add', checkAdmin, ProdutoController.createProdutoSave);
router.get('/edit/:id', checkAdmin, ProdutoController.updateProduto);
router.post('/edit', checkAdmin, ProdutoController.updateProdutoSave);
router.post('/remove', checkAdmin, ProdutoController.removeProduto);

module.exports = router;