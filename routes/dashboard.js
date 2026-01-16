const express = require('express');
const router = express.Router();
const { verificarSesion } = require('../middleware/auth');


const { consumoPorMes, exportarExcel } = require('../controllers/consumoController');
const {
    listarAreas,
    crearArea,
    editarArea,
    normalizarArea
  } = require('../controllers/filtroAreaController');
  
// Consumo
router.get('/consumo', verificarSesion, consumoPorMes);
router.get('/consumo/exportar-excel', verificarSesion, exportarExcel);

// VISTA
router.get('/areas', verificarSesion, listarAreas);

// CRUD
router.post('/areas', verificarSesion, crearArea);
router.post('/areas/:id', verificarSesion, editarArea);
router.post('/areas/normalizar', verificarSesion, normalizarArea);
module.exports = router;
