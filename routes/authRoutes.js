const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { checkAdmin } = require('../helpers/auth');
const path = require('path');
const multer = require('multer');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/cliente/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/produtos/cliente_update', AuthController.editClient);
router.post('/produtos/cliente_update', upload.single('profileImage'), AuthController.updateClient);

router.get('/login', AuthController.login);
router.post('/login', AuthController.loginPost);
router.get('/register', AuthController.register);
router.post('/register', AuthController.registerPost);
router.get('/logout', AuthController.logout);

module.exports = router;