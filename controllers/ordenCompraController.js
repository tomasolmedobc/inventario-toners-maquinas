const OrdenCompra = require('../models/OrdenCompra');

const normalizarTexto = (valor) => (valor || '').toString().trim();

function validarCantidadFacturas(body) {
  const cantidad = Number(body.cantidadFacturas);

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error('La cantidad de facturas tiene que ser un número entero mayor o igual a 1');
  }

  return cantidad;
}

function validarFacturas(body, cantidadFacturas) {
  const lista = Array.isArray(body.facturas) ? body.facturas : [];

  const facturas = lista.map((f) => {
    const numero = normalizarTexto(f?.numero);
    const mesAnio = f?.mesAnio;

    if (!numero) {
      throw new Error('Cada factura cargada necesita un número');
    }
    if (!mesAnio || isNaN(Date.parse(mesAnio))) {
      throw new Error('Cada factura cargada necesita un mes y año válido');
    }

    return { numero, mesAnio };
  });

  if (facturas.length > cantidadFacturas) {
    throw new Error(`No podés cargar más facturas (${facturas.length}) que la cantidad esperada (${cantidadFacturas})`);
  }

  return facturas;
}

const conEstado = (orden) => ({
  ...orden,
  estado: orden.facturas.length >= orden.cantidadFacturas ? 'Finalizado' : 'En emisión'
});

exports.mostrarOrdenesCompra = async (req, res) => {
  try {
    const ordenes = await OrdenCompra.find().sort({ fechaEmision: -1 }).lean();
    res.render('ordenes-compra', { ordenes: ordenes.map(conEstado) });
  } catch (error) {
    console.error('Error mostrarOrdenesCompra:', error);
    res.status(500).send('Error al cargar órdenes de compra');
  }
};

exports.listarOrdenesCompra = async (req, res) => {
  try {
    const ordenes = await OrdenCompra.find().sort({ fechaEmision: -1 }).lean();
    res.json(ordenes.map(conEstado));
  } catch (error) {
    console.error('Error listarOrdenesCompra:', error);
    res.status(500).json({ error: 'Error al obtener órdenes de compra' });
  }
};

exports.crearOrdenCompra = async (req, res) => {
  try {
    const numeroOrden = normalizarTexto(req.body.numeroOrden);
    const empresa = normalizarTexto(req.body.empresa);
    const fechaEmision = req.body.fechaEmision;
    const detalles = normalizarTexto(req.body.detalles);
    const fechaFinalizacion = req.body.fechaFinalizacion || null;

    if (!numeroOrden) {
      return res.status(400).json({ error: 'El número de orden de compra es obligatorio' });
    }
    if (!empresa || !fechaEmision || isNaN(Date.parse(fechaEmision))) {
      return res.status(400).json({ error: 'Empresa y fecha de emisión son obligatorias' });
    }
    if (fechaFinalizacion && isNaN(Date.parse(fechaFinalizacion))) {
      return res.status(400).json({ error: 'Fecha de finalización inválida' });
    }

    let cantidadFacturas, facturas;
    try {
      cantidadFacturas = validarCantidadFacturas(req.body);
      facturas = validarFacturas(req.body, cantidadFacturas);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const orden = await OrdenCompra.create({
      numeroOrden,
      empresa,
      fechaEmision,
      fechaFinalizacion,
      detalles,
      cantidadFacturas,
      facturas
    });

    res.status(201).json({ ok: true, orden: conEstado(orden.toObject()) });
  } catch (error) {
    console.error('Error crearOrdenCompra:', error);
    res.status(500).json({ error: 'Error al crear la orden de compra' });
  }
};

exports.actualizarOrdenCompra = async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }

    if (req.body.numeroOrden !== undefined) orden.numeroOrden = normalizarTexto(req.body.numeroOrden);
    if (req.body.empresa !== undefined) orden.empresa = normalizarTexto(req.body.empresa);
    if (req.body.detalles !== undefined) orden.detalles = normalizarTexto(req.body.detalles);

    if (req.body.fechaEmision !== undefined) {
      if (isNaN(Date.parse(req.body.fechaEmision))) {
        return res.status(400).json({ error: 'Fecha de emisión inválida' });
      }
      orden.fechaEmision = req.body.fechaEmision;
    }

    if (req.body.fechaFinalizacion !== undefined) {
      if (req.body.fechaFinalizacion === '' || req.body.fechaFinalizacion === null) {
        orden.fechaFinalizacion = null;
      } else if (isNaN(Date.parse(req.body.fechaFinalizacion))) {
        return res.status(400).json({ error: 'Fecha de finalización inválida' });
      } else {
        orden.fechaFinalizacion = req.body.fechaFinalizacion;
      }
    }

    try {
      const cantidadFinal = req.body.cantidadFacturas !== undefined
        ? validarCantidadFacturas(req.body)
        : orden.cantidadFacturas;

      if (req.body.facturas !== undefined) {
        orden.facturas = validarFacturas(req.body, cantidadFinal);
      } else if (orden.facturas.length > cantidadFinal) {
        throw new Error(`No podés bajar la cantidad de facturas por debajo de las ya cargadas (${orden.facturas.length})`);
      }

      orden.cantidadFacturas = cantidadFinal;
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    if (!orden.numeroOrden) {
      return res.status(400).json({ error: 'El número de orden de compra es obligatorio' });
    }
    if (!orden.empresa) {
      return res.status(400).json({ error: 'La empresa es obligatoria' });
    }

    await orden.save();
    res.json({ ok: true, orden: conEstado(orden.toObject()) });
  } catch (error) {
    console.error('Error actualizarOrdenCompra:', error);
    res.status(500).json({ error: 'Error al actualizar la orden de compra' });
  }
};

exports.eliminarOrdenCompra = async (req, res) => {
  try {
    const orden = await OrdenCompra.findByIdAndDelete(req.params.id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error eliminarOrdenCompra:', error);
    res.status(500).json({ error: 'Error al eliminar la orden de compra' });
  }
};
