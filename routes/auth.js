const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// Máximo 15 intentos de login por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('login', {
      error: 'Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.'
    });
  }
});

router.get('/login', authController.mostrarLogin);
router.post('/login', loginLimiter, authController.loginUsuario);

router.get('/register', authController.mostrarRegistro);
router.post('/register', authController.registrarUsuario);

router.get('/logout', authController.logout);

module.exports = router;
