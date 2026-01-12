const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.loginUsuario);

router.get('/register', authController.mostrarRegistro);
router.post('/register', authController.registrarUsuario);

router.get('/logout', authController.logout);

module.exports = router;
