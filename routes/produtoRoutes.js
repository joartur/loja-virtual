const express = require('express');
const router = express.Router();
const ProdutoController = require('../Controllers/ProdutoController');

router.get('/', ProdutoController.showProdutos);

module.exports = router;
