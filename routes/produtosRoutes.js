const express = require('express');
const router = express.Router();
const ProdutoController = require('../Controllers/ProdutoController');
const { checkAuth, checkAdmin } = require('../helpers/auth');
const path = require('path');
const multer = require('multer');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/produtos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/produto/:id', ProdutoController.showProduto);
router.get('/produto/detalhes/:id', ProdutoController.detalhesProduto);
router.post('/produto/:id/delete', checkAdmin, ProdutoController.removeProduto);
router.get('/admin/dashboard', checkAdmin, ProdutoController.adminDashboard);
router.get('/dashboard', checkAuth, ProdutoController.clientDashboard);
router.get('/add', checkAdmin, ProdutoController.createProduto);
router.post('/add', checkAdmin, upload.single('image'), ProdutoController.createProdutoSave); // Middleware para upload de arquivo
router.get('/edit/:id', checkAdmin, ProdutoController.updateProduto);
router.post('/edit', checkAdmin, upload.single('image'), ProdutoController.updateProdutoSave); // Middleware para upload de arquivo
router.get('/produtos/filtro', ProdutoController.filtroProdutos);
router.post('/remove', checkAdmin, ProdutoController.removeProduto);

module.exports = router;