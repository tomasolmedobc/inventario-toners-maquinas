const express = require('express');
const router = express.Router();

const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

const { verificarSesion, permitirRolesApi } = require('../middleware/auth');

const dashboardController = require('../controllers/dashboardController');
const equiposController = require('../controllers/equiposController');
const apiController = require('../controllers/apiController');

/* ======================================================
   DASHBOARD (VISTA)
====================================================== */

router.get(
  '/historial',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  dashboardController.mostrarDashboard
);

/* ======================================================
    ENTREGAS (VISTA)
====================================================== */

router.get(
  '/entregas',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  apiController.verEntregas
);

/* ======================================================
   EQUIPOS (VISTA)
====================================================== */

router.get(
  '/equipos',
  verificarSesion,  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.verEquipos
);

/* ======================================================
   INVENTARIO (VISTA)
====================================================== */

router.get('/inventario', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), async (req, res) => {
  const productos = await Producto.find();
  res.render('inventario', { productos });
});

/* ======================================================
   MOVIMIENTOS (VISTA)
====================================================== */

router.get('/movimientos', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), async (req, res) => {
  const movimientos = await Movimiento.find()
    .populate('producto')
    .populate('usuario');

  res.render('movimientos', { movimientos });
});

/* ======================================================
   BAJO STOCK (VISTA)
====================================================== */

router.get('/bajo-stock', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), (req, res) => {
  res.render('bajo-stock');
});

module.exports = router;
