const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.loginUsuario);
router.get('/register', authController.mostrarRegistro);
router.post('/register', authController.registrarUsuario);
router.get('/logout', authController.logout);

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).send('Error al cerrar sesión');
      }
      res.redirect('/auth/login'); 
    });
  });

module.exports = router;
