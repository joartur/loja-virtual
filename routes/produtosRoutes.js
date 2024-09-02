const express = require('express')
const router = express.Router()
const ProdutoController = require('../Controllers/ProdutoController');
const checkAuth = require('../helpers/auth').checkAuth

router.get('/teste', ProdutoController.teste)
router.get('/add', checkAuth, ProdutoController.createProduto)
router.post('/add', checkAuth, ProdutoController.createProdutoSave)
router.get('/edit/:id', checkAuth, ProdutoController.updateProduto)
router.post('/edit', checkAuth, ProdutoController.updateProdutoSave)
router.get('/dashboard',checkAuth, ProdutoController.dashboard)
router.post('/remove', checkAuth, ProdutoController.removeProduto)
router.get('/', ProdutoController.showProdutos)

module.exports = router