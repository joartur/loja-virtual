const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/AuthController')
const { checkAdmin } = require('../helpers/auth');

router.get('/login', AuthController.login)
router.post('/login', AuthController.loginPost)
router.get('/register', AuthController.register)
router.post('/register',AuthController.registerPost)
router.get('/register', checkAdmin, AuthController.register);
router.post('/register', checkAdmin, AuthController.registerPost);
router.get('/produtos/cliente_update', AuthController.editClient);
router.post('/produtos/cliente_update', AuthController.updateClient);

router.get('/logout', AuthController.logout)

module.exports = router;