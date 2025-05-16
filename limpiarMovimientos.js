const mongoose = require('mongoose');
const Movimiento = require('../models/Movimiento');
require('dotenv').config();
const db = require('../config/db');

async function limpiarMovimientos() {
  try {
    await db();
    const resultado = await Movimiento.deleteMany({ usuario: null });
    console.log(`Movimientos eliminados: ${resultado.deletedCount}`);
    process.exit();
  } catch (err) {
    console.error('Error al eliminar movimientos:', err);
    process.exit(1);
  }
}

limpiarMovimientos();
