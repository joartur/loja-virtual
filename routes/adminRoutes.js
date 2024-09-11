const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const AdminController = require('../Controllers/AdminController');
const { checkAuth, checkAdmin } = require('../helpers/auth');
const path = require('path');
const multer = require('multer');

router.use(checkAdmin);

// Configurar o local de armazenamento e o nome do arquivo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único para cada arquivo
    }
});

// Filtrar os arquivos por tipo
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Somente imagens são permitidas!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Processar a atualização (inclui o upload de imagem)
router.post('/update', upload.single('profileImage'), AdminController.updateAdmin);

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