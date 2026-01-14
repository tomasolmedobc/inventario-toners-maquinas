const express = require('express');
const router = express.Router();
const { verificarSesion } = require('../middleware/auth');

const { consumoPorMes, exportarExcel } = require('../controllers/consumoController');

router.get('/consumo', verificarSesion, consumoPorMes);
router.get('/consumo/exportar-excel', verificarSesion, exportarExcel);

module.exports = router;
