const express = require('express');
const router = express.Router();
const CarrinhoController = require('../Controllers/CarrinhoController');
const { checkAuth } = require('../helpers/auth');

router.post('/add/:id', CarrinhoController.addProduto);
router.get('/carrinho', checkAuth, CarrinhoController.viewCarrinho);
router.post('/carrinho/add/:id', checkAuth, CarrinhoController.addProduto);
router.post('/carrinho/add', checkAuth, CarrinhoController.addToCart);
router.post('/carrinho/remover/:id', checkAuth, CarrinhoController.removeProduto);
router.post('/carrinho/atualizar/:id', CarrinhoController.atualizarProduto);
router.post('/carrinho/remover/:id', CarrinhoController.removeProduto);

module.exports = router;