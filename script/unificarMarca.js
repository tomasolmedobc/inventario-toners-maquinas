require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function unificarMarcas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const productos = await Producto.find();

    // Agrupamos productos por clave única: tipo + modelo (ignoramos marca)
    const agrupados = {};

    productos.forEach(prod => {
      const tipo = prod.tipo?.trim();
      const modelo = prod.modelo?.trim();
      if (!tipo || !modelo) return;

      const clave = `${tipo.toLowerCase()}|${modelo.toLowerCase()}`;
      if (!agrupados[clave]) agrupados[clave] = [];
      agrupados[clave].push(prod);
    });

    for (const clave in agrupados) {
      const lista = agrupados[clave];

      for (const prod of lista) {
        const marcaNormalizada = prod.marca?.trim().toLowerCase();
        if (!marcaNormalizada) continue;

        // Capitaliza (e.g., mgn => Mgn)
        const marcaFinal = marcaNormalizada.charAt(0).toUpperCase() + marcaNormalizada.slice(1);

        if (prod.marca !== marcaFinal) {
          console.log(`Corrigiendo marca: "${prod.marca}" → "${marcaFinal}" [${prod.tipo} - ${prod.modelo}]`);
          prod.marca = marcaFinal;
          await prod.save();
        }
      }
    }

    console.log('🟢 Marcas normalizadas correctamente.');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error durante la unificación de marcas:', err);
    mongoose.disconnect();
  }
}

unificarMarcas();
