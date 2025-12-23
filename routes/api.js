const express = require('express');
const router = express.Router();

const { verificarSesion, isAdmin } = require('../middleware/auth');

const notaController = require('../controllers/notaController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const apiController = require('../controllers/apiController');
const equiposController = require('../controllers/equiposController');

/* ======================================================
   INVENTARIO / PRODUCTOS
====================================================== */

// 📦 Productos
router.get('/productos', verificarSesion, apiController.listarProductos);
router.post('/productos', verificarSesion, apiController.crearProducto);

// 🔄 Movimientos
router.post('/movimientos', verificarSesion, apiController.registrarMovimiento);
router.post('/movimientos-multiples', verificarSesion, apiController.registrarMultiplesMovimientos);

// ✏️ Editar entrega
router.put(
  '/entregas/:id/editar',
  verificarSesion,
  isAdmin,
  apiController.editarMovimientoEntrega
);

// ⛔ Anular entrega
router.patch(
  '/movimientos/:id/anular',
  verificarSesion,
  isAdmin,
  apiController.anularMovimiento
);

/* ======================================================
   DASHBOARD / REPORTES
====================================================== */

router.get('/grafico-toners', verificarSesion, apiController.getGraficoToners);
router.get('/toners-bajo-stock', verificarSesion, apiController.getTonersBajoStock);
router.get('/top-areas', verificarSesion, dashboardController.getTopAreas);

/* ======================================================
   NOTAS
====================================================== */

router.get('/nota-entrega/:id', verificarSesion, notaController.verNotaEntrega);

/* ======================================================
   EQUIPOS (API)
====================================================== */

// 📋 Listado
router.get('/equipos', verificarSesion, equiposController.listarEquipos);

// ➕ Crear
router.post(
  '/equipos',
  verificarSesion,
  isAdmin,
  equiposController.crearEquipo
);

// ✏️ Editar
router.patch(
  '/equipos/:id',
  verificarSesion,
  isAdmin,
  equiposController.editarEquipo
);

// 🔁 Traspaso
router.patch(
  '/equipos/:id/traspaso',
  verificarSesion,
  isAdmin,
  equiposController.traspasarEquipo
);

// 🧾 Historial de traspasos
router.get(
  '/equipos-traspasos',
  verificarSesion,
  equiposController.listarTraspasos
);

// ⛔ Baja
router.patch(
  '/equipos/:id/baja',
  verificarSesion,
  isAdmin,
  equiposController.darDeBaja
);

/* ======================================================
   USUARIOS (ADMIN)
====================================================== */

router.get(
  '/admin/usuarios',
  verificarSesion,
  isAdmin,
  adminController.listarUsuarios
);

router.post(
  '/usuarios/:id/cambiar-password',
  verificarSesion,
  isAdmin,
  dashboardController.cambiarPasswordManual
);

router.post(
  '/usuarios/:id/cambiar-rol',
  verificarSesion,
  isAdmin,
  dashboardController.cambiarRolManual
);

/* ======================================================
   UTILIDADES
====================================================== */
router.get(
  '/equipos/:id/historial',
  verificarSesion,
  equiposController.historialEquipo
);




router.get('/ping-sesion', (req, res) => {
  if (req.session) req.session.touch();
  res.sendStatus(200);
});




module.exports = router;
