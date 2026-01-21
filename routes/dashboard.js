const express = require('express');
const router = express.Router();
const { verificarSesion, permitirRolesApi } = require('../middleware/auth');


const { consumoPorMes, exportarExcel } = require('../controllers/consumoController');
const {
    listarAreas,
    crearArea,
    editarArea,
    normalizarArea
  } = require('../controllers/filtroAreaController');
  
// Consumo
router.get('/consumo', verificarSesion, permitirRolesApi('jefe', 'admin'), consumoPorMes);
router.get('/consumo/exportar-excel', verificarSesion, permitirRolesApi('jefe', 'admin'), exportarExcel);

// VISTA
router.get('/areas', verificarSesion, permitirRolesApi('admin'), listarAreas);

// CRUD
router.post('/areas', verificarSesion, permitirRolesApi('admin'), crearArea);
router.post('/areas/normalizar', verificarSesion, permitirRolesApi('admin'), normalizarArea);
router.post('/areas/:id', verificarSesion, permitirRolesApi('admin'), editarArea);
module.exports = router;
