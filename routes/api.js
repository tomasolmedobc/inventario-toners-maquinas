const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { verificarSesion, verificarToken } = require('../middleware/auth');

// Rutas protegidas con sesión (para vistas web)
router.get('/entregas', verificarSesion, apiController.verEntregas);
router.get('/productos', verificarSesion, apiController.listarProductos);
router.post('/productos', verificarSesion, apiController.crearProducto);
router.post('/movimientos', verificarSesion, apiController.registrarMovimiento);




module.exports = router;
