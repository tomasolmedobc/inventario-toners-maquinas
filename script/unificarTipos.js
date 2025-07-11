require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

async function unificarTipos() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ✅ ahora sí va a leer bien

    const productos = await Producto.find();

    const agrupados = {};

    productos.forEach(prod => {
      const tipoNormalizado = prod.tipo.trim().toLowerCase();
      if (!agrupados[tipoNormalizado]) agrupados[tipoNormalizado] = [];
      agrupados[tipoNormalizado].push(prod);
    });

    for (const tipo in agrupados) {
      const lista = agrupados[tipo];

      if (lista.length > 1) {
        console.log(`Unificando ${lista.length} productos de tipo: ${tipo}`);

        const base = lista[0];
        const tipoFinal = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        base.tipo = tipoFinal;

        for (let i = 1; i < lista.length; i++) {
          base.cantidad += lista[i].cantidad;

          await Movimiento.updateMany(
            { producto: lista[i]._id },
            { $set: { producto: base._id } }
          );

          await Producto.findByIdAndDelete(lista[i]._id);
        }

        await base.save();
        console.log(`✅ Unificado como: ${tipoFinal}`);
      }
    }

    console.log('🟢 Proceso de unificación completado.');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error durante la unificación:', error);
    mongoose.disconnect();
  }
}

unificarTipos();
