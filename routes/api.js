const express = require('express');
const router = express.Router();
const { verificarSesion, verificarToken, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const notaController = require('../controllers/notaController');
const dashboardController = require('../controllers/dashboardController'); 
const adminController = require('../controllers/adminController');
const apiController = require('../controllers/apiController');

// Rutas protegidas con sesión (para vistas web)
router.get('/entregas', verificarSesion, apiController.verEntregas);
router.get('/productos', verificarSesion, apiController.listarProductos);
router.post('/productos', verificarSesion, apiController.crearProducto);
router.post('/movimientos', verificarSesion, apiController.registrarMovimiento);
router.get('/nota-entrega/:id', verificarSesion, notaController.verNotaEntrega);
router.get('/top-areas', verificarSesion, dashboardController.getTopAreas);
router.get('/grafico-toners', apiController.getGraficoToners);
router.get('/admin/usuarios', verificarSesion, isAdmin, adminController.listarUsuarios);
router.post('/usuarios/:id/cambiar-password', isAdmin, dashboardController.cambiarPasswordManual);
router.post('/usuarios/:id/cambiar-rol', isAdmin, dashboardController.cambiarRolManual);
router.put('/entregas/:id/editar', verificarSesion, isAdmin, apiController.editarMovimientoEntrega);
router.post('/movimientos-multiples', verificarSesion, apiController.registrarMultiplesMovimientos);
router.patch('/movimientos/:id/anular', apiController.marcarComoAnulado);



router.get('/usuarios', isAdmin, async (req, res) => {
    try {
      const usuarios = await User.find({}, 'nombre email rol');
      res.render('usuarios', { usuarios }); // Renderiza vista usuarios.ejs
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).send('Error al obtener usuarios');
    }
  });
  

router.get('/ping-sesion', (req, res) => {
    if (req.session) req.session.touch(); // Renueva el timestamp
    res.sendStatus(200);
  });
  

module.exports = router;