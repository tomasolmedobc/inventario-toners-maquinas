const express = require('express');
const router = express.Router();
const Area = require('../models/Area');

const { verificarSesion, permitirRolesApi } = require('../middleware/auth');

const notaController = require('../controllers/notaController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const apiController = require('../controllers/apiController');
const equiposController = require('../controllers/equiposController');

/* ======================================================
    INVENTARIO / PRODUCTOS
====================================================== */

// 📦 Productos
router.get('/productos', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.listarProductos);
router.post('/productos', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.crearProducto);

// 🔄 Movimientos
router.post('/movimientos', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.registrarMovimiento);
router.post('/movimientos-multiples', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.registrarMultiplesMovimientos);

router.get('/areas', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), async (req, res) => {
  try {
    const areas = await Area.find().sort({ nombre: 1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json([]);
  }
});

// ✏️ Editar entrega
router.put(
  '/entregas/:id/editar',
  verificarSesion, permitirRolesApi('user', 'jefe', 'admin'),
  apiController.editarMovimientoEntrega
);

// ⛔ Anular entrega
router.patch(
  '/movimientos/:id/anular',
  verificarSesion, permitirRolesApi('user', 'jefe', 'admin'),
  apiController.anularMovimiento
);

/* ======================================================
    DASHBOARD / REPORTES
====================================================== */

router.get('/grafico-toners', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.getGraficoToners);
router.get('/toners-bajo-stock', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), apiController.getTonersBajoStock);
router.get('/top-areas', verificarSesion, permitirRolesApi('jefe', 'admin'), dashboardController.getTopAreas);

/* ======================================================
  NOTAS
====================================================== */

router.get('/nota-entrega/:id', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), notaController.verNotaEntrega);

/* ======================================================
  EQUIPOS (API)
====================================================== */

// 📋 Listado
router.get('/equipos', verificarSesion, permitirRolesApi('user', 'jefe', 'admin'), equiposController.listarEquipos);

// ➕ Crear
router.post(
  '/equipos',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.crearEquipo
);

// ✏️ Editar
router.patch(
  '/equipos/:id',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.editarEquipo
);

// 🔁 Traspaso
router.patch(
  '/equipos/:id/traspaso',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.traspasarEquipo
);

// 🧾 Historial de traspasos
router.get(
  '/equipos-traspasos',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.listarTraspasos
);

// ⛔ Baja
router.patch(
  '/equipos/:id/baja',
  verificarSesion, permitirRolesApi('admin'),
  equiposController.darDeBaja
);

/* ======================================================
  USUARIOS (ADMIN)
====================================================== */

router.get(
  '/usuarios',
  verificarSesion, permitirRolesApi('admin'),
  adminController.listarUsuarios
);

router.post(
  '/usuarios/:id/cambiar-password',
  verificarSesion, permitirRolesApi('admin'),
  dashboardController.cambiarPasswordManual
);

router.post(
  '/usuarios/:id/cambiar-rol',
  verificarSesion, permitirRolesApi('admin'),
  dashboardController.cambiarRolManual
);

/* ======================================================
   UTILIDADES
====================================================== */
router.get(
  '/equipos/:id/historial',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.historialEquipo
);

router.get(
  '/equipos/filtros',
  verificarSesion,
  permitirRolesApi('user', 'jefe', 'admin'),
  equiposController.obtenerFiltros
);

/* ======================================================
Mantener sesión activa
======================================================= */

router.get('/ping-sesion', (req, res) => {
  if (req.session) req.session.touch();
  res.sendStatus(200);
});



module.exports = router;
