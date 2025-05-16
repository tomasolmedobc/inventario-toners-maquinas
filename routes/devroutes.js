const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');
const { verificarSesion } = require('../middleware/auth');
const { mostrarDashboard } = require('../controllers/dashboardController');

// Dashboard
router.get('/dashboard', verificarSesion, mostrarDashboard);


router.get('/inventario', verificarSesion, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.render('inventario', { productos }); // ✅ Asegurate de tener inventario.ejs
  } catch (error) {
    res.status(500).send('Error al cargar productos');
  }
});

// Crear producto (opcional, si lo usás desde un formulario)
router.post('/inventario', async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.redirect('/dev/inventario');
  } catch (error) {
    res.status(400).send('Error al crear producto');
  }
});

// Registrar movimiento
router.post('/movimientos', async (req, res) => {
  try {
    const { tipo, producto, cantidad } = req.body;
    const prod = await Producto.findById(producto);
    if (!prod) return res.status(404).send('Producto no encontrado');

    if (tipo === 'entrada') {
      prod.cantidad += cantidad;
    } else if (tipo === 'salida') {
      if (prod.cantidad < cantidad) {
        return res.status(400).send('Stock insuficiente');
      }
      prod.cantidad -= cantidad;
    }

    await prod.save();
    const nuevoMovimiento = new Movimiento(req.body);
    await nuevoMovimiento.save();

    res.redirect('/dev/dashboard');
  } catch (error) {
    res.status(400).send('Error al registrar movimiento');
  }
});

// Mostrar movimientos (si tenés movimientos.ejs)
router.get('/movimientos', verificarSesion, async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate('producto')
      .populate('usuario');
    res.render('movimientos', { movimientos });
  } catch (error) {
    res.status(500).send('Error al obtener movimientos');
  }
});
/*
funcion para limpiar registros nulls
router.get('/limpiar-movimientos-null', async (req, res) => {
  try {
    const resultado = await Movimiento.deleteMany({ usuario: null });
    res.send(`Movimientos eliminados: ${resultado.deletedCount}`);
  } catch (error) {
    console.error('Error al eliminar movimientos sin usuario:', error);
    res.status(500).send('Error al limpiar movimientos');
  }
});
*/

module.exports = router;
