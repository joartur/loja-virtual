const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const { checkAuth, checkAdmin } = require('../helpers/auth');

// Rota para a dashboard do administrador
router.get('/dashboard', checkAuth, checkAdmin, ProdutoController.dashboard);
router.get('/produtos/dashboard', ProdutoController.getAllProducts);

// Rota para criar um novo produto
router.get('/add', checkAuth, checkAdmin, ProdutoController.createProduto);
router.post('/add', checkAuth, checkAdmin, ProdutoController.createProdutoSave);

// Rota para editar um produto existente
router.get('/edit/:id', checkAdmin, ProdutoController.updateProduto);
router.post('/edit/:id', checkAdmin, ProdutoController.updateProdutoSave); 

// Rota para remover um produto
router.post('/remove', checkAuth, checkAdmin, ProdutoController.removeProduto);

module.exports = router;