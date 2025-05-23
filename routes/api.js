const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { verificarSesion, verificarToken } = require('../middleware/auth');
const notaController = require('../controllers/notaController');


// Rutas protegidas con sesión (para vistas web)
router.get('/entregas', verificarSesion, apiController.verEntregas);
router.get('/productos', verificarSesion, apiController.listarProductos);
router.post('/productos', verificarSesion, apiController.crearProducto);
router.post('/movimientos', verificarSesion, apiController.registrarMovimiento);
router.get('/nota-entrega/:id', verificarSesion, notaController.verNotaEntrega);

module.exports = router;
