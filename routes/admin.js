const express = require('express');
const router = express.Router();
const { Produto, User } = require('../models');
const isAuthenticatedAdmin = require('../middlewares/isAuthenticatedAdmin');

// Rota para cadastrar um produto
router.post('/produtos', isAuthenticatedAdmin, async (req, res) => {
  try {
    const { nome, descricao, preco, quantidade } = req.body;
    await Produto.create({ nome, descricao, preco, quantidade });
    res.redirect('/admin/produtos');
  } catch (error) {
    res.status(500).send('Erro ao cadastrar o produto.');
  }
});

// Rota para exibir os produtos cadastrados
router.get('/produtos', isAuthenticatedAdmin, async (req, res) => {
  const produtos = await Produto.findAll();
  res.render('admin/produtos', { produtos });
});

module.exports = router;
