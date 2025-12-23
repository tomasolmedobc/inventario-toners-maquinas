const express = require('express');
const router = express.Router();

const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

const { verificarSesion } = require('../middleware/auth');

const dashboardController = require('../controllers/dashboardController');
const equiposController = require('../controllers/equiposController');
const apiController = require('../controllers/apiController');

/* ======================================================
   DASHBOARD (VISTA)
====================================================== */

router.get(
  '/dashboard',
  verificarSesion,
  dashboardController.mostrarDashboard
);

/* ======================================================
   ENTREGAS (VISTA)
====================================================== */

router.get(
  '/entregas',
  verificarSesion,
  apiController.verEntregas
);

/* ======================================================
   EQUIPOS (VISTA)
====================================================== */

router.get(
  '/equipos',
  verificarSesion,
  equiposController.verEquipos
);

/* ======================================================
   INVENTARIO (VISTA)
====================================================== */

router.get('/inventario', verificarSesion, async (req, res) => {
  const productos = await Producto.find();
  res.render('inventario', { productos });
});

/* ======================================================
   MOVIMIENTOS (VISTA)
====================================================== */

router.get('/movimientos', verificarSesion, async (req, res) => {
  const movimientos = await Movimiento.find()
    .populate('producto')
    .populate('usuario');

  res.render('movimientos', { movimientos });
});

/* ======================================================
   BAJO STOCK (VISTA)
====================================================== */

router.get('/bajo-stock', verificarSesion, (req, res) => {
  res.render('bajo-stock');
});

module.exports = router;
