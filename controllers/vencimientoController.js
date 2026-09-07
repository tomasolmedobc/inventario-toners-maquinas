const Vencimiento = require('../models/Vencimiento');

const normalizarTexto = (valor) => (valor || '').toString().trim();

exports.mostrarVencimientos = async (req, res) => {
  try {
    const vencimientos = await Vencimiento.find().sort({ proximoVencimiento: 1 }).lean();
    res.render('vencimientos', { vencimientos });
  } catch (error) {
    console.error('Error mostrarVencimientos:', error);
    res.status(500).send('Error al cargar vencimientos');
  }
};

exports.listarVencimientos = async (req, res) => {
  try {
    const vencimientos = await Vencimiento.find().sort({ proximoVencimiento: 1 });
    res.json(vencimientos);
  } catch (error) {
    console.error('Error listarVencimientos:', error);
    res.status(500).json({ error: 'Error al obtener vencimientos' });
  }
};

exports.crearVencimiento = async (req, res) => {
  try {
    const empresa = normalizarTexto(req.body.empresa);
    const descripcion = normalizarTexto(req.body.descripcion);
    const proximoVencimiento = req.body.proximoVencimiento;
    const pagado = req.body.pagado === true || req.body.pagado === 'true';

    if (!empresa || !proximoVencimiento || isNaN(Date.parse(proximoVencimiento))) {
      return res.status(400).json({ error: 'Empresa y próximo vencimiento son obligatorios' });
    }

    const vencimiento = await Vencimiento.create({
      empresa,
      descripcion,
      proximoVencimiento,
      pagado
    });

    res.status(201).json({ ok: true, vencimiento });
  } catch (error) {
    console.error('Error crearVencimiento:', error);
    res.status(500).json({ error: 'Error al crear el vencimiento' });
  }
};

exports.actualizarVencimiento = async (req, res) => {
  try {
    const vencimiento = await Vencimiento.findById(req.params.id);
    if (!vencimiento) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    if (req.body.empresa !== undefined) vencimiento.empresa = normalizarTexto(req.body.empresa);
    if (req.body.descripcion !== undefined) vencimiento.descripcion = normalizarTexto(req.body.descripcion);

    if (req.body.proximoVencimiento !== undefined) {
      if (isNaN(Date.parse(req.body.proximoVencimiento))) {
        return res.status(400).json({ error: 'Próximo vencimiento inválido' });
      }
      vencimiento.proximoVencimiento = req.body.proximoVencimiento;
    }

    if (req.body.ultimoVencimiento !== undefined) {
      if (req.body.ultimoVencimiento === '' || req.body.ultimoVencimiento === null) {
        vencimiento.ultimoVencimiento = null;
      } else if (isNaN(Date.parse(req.body.ultimoVencimiento))) {
        return res.status(400).json({ error: 'Último vencimiento inválido' });
      } else {
        vencimiento.ultimoVencimiento = req.body.ultimoVencimiento;
      }
    }

    if (req.body.pagado !== undefined) {
      vencimiento.pagado = req.body.pagado === true || req.body.pagado === 'true';
    }

    if (!vencimiento.empresa) {
      return res.status(400).json({ error: 'La empresa es obligatoria' });
    }

    await vencimiento.save();
    res.json({ ok: true, vencimiento });
  } catch (error) {
    console.error('Error actualizarVencimiento:', error);
    res.status(500).json({ error: 'Error al actualizar el vencimiento' });
  }
};

// Registra el pago del vencimiento actual. Si se manda `proximoVencimiento`,
// el mismo registro se recicla para el próximo ciclo en vez de duplicarlo.
exports.pagarVencimiento = async (req, res) => {
  try {
    const vencimiento = await Vencimiento.findById(req.params.id);
    if (!vencimiento) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    const nuevoProximo = normalizarTexto(req.body.proximoVencimiento);

    if (nuevoProximo && isNaN(Date.parse(nuevoProximo))) {
      return res.status(400).json({ error: 'Próximo vencimiento inválido' });
    }

    vencimiento.historialPagos.push({
      fechaPago: new Date(),
      vencimientoCubierto: vencimiento.proximoVencimiento
    });

    vencimiento.ultimoVencimiento = vencimiento.proximoVencimiento;

    if (nuevoProximo) {
      vencimiento.proximoVencimiento = nuevoProximo;
      vencimiento.pagado = false;
    } else {
      vencimiento.pagado = true;
    }

    await vencimiento.save();
    res.json({ ok: true, vencimiento });
  } catch (error) {
    console.error('Error pagarVencimiento:', error);
    res.status(500).json({ error: 'Error al registrar el pago' });
  }
};

exports.eliminarVencimiento = async (req, res) => {
  try {
    const vencimiento = await Vencimiento.findByIdAndDelete(req.params.id);
    if (!vencimiento) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error eliminarVencimiento:', error);
    res.status(500).json({ error: 'Error al eliminar el vencimiento' });
  }
};
