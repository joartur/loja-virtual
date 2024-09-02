const express = require('express');
const router = express.Router();
const { Produto } = require('../models');

// Rota para exibir os produtos
router.get('/produtos', async (req, res) => {
  const produtos = await Produto.findAll();
  res.render('cliente/produtos', { produtos });
});

// Rota para adicionar ao carrinho
router.post('/carrinho', async (req, res) => {
  const { produtoId, quantidade } = req.body;
  const produto = await Produto.findByPk(produtoId);
  if (produto && produto.quantidade >= quantidade) {
    // Adicionar ao carrinho (implementar lógica de carrinho)
    res.redirect('/cliente/carrinho');
  } else {
    res.status(400).send('Produto indisponível.');
  }
});

module.exports = router;
