const express = require('express');
const router = express.Router();
const { verificarSesion, permitirRoles } = require('../middleware/auth');


const { consumoPorMes, exportarExcel } = require('../controllers/consumoController');
const {
    listarAreas,
    crearArea,
    editarArea,
    normalizarArea
  } = require('../controllers/filtroAreaController');
  
// Consumo
router.get('/consumo', verificarSesion, permitirRoles('jefe', 'admin'), consumoPorMes);
router.get('/consumo/exportar-excel', verificarSesion, permitirRoles('jefe', 'admin'), exportarExcel);

// VISTA
router.get('/areas', verificarSesion, permitirRoles('jefe', 'admin'), listarAreas);

// CRUD
router.post('/areas', verificarSesion, permitirRoles('admin'), crearArea);
router.post('/areas/normalizar', verificarSesion, permitirRoles('admin'), normalizarArea);
router.post('/areas/:id', verificarSesion, permitirRoles('admin'), editarArea);
module.exports = router;
