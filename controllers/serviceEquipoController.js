const Equipo = require('../models/Equipo')
const ServiceEquipo = require('../models/ServiceEquipo')


/* ============================
   REGISTRAR ENTRADA / SALIDA
============================ */
exports.registrarService = async (req, res) => {

    try {
        const { codigoIdentificacion, tipo, descripcion } = req.body

        if (!codigoIdentificacion || !tipo || !descripcion) {
            return res.status(400).json({ error: 'Datos incompletos' })
        }

        if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo inválido' })
        }

        const ultimo = await ServiceEquipo.findOne({ codigoIdentificacion })
            .sort({ fecha: -1 })

        if (ultimo && ultimo.tipo === tipo) {
            return res.status(400).json({
                error: `No se puede registrar ${tipo} dos veces seguidas`
            })
        }
        const equipo = await Equipo.findOne({ codigoIdentificacion })
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' })
        }

        const service = await ServiceEquipo.create({
            equipo: equipo._id,
            codigoIdentificacion,
            tipo,
            descripcion,
            usuario: req.session?.usuario?.nombre || 'Sistema'
        })

        res.json({
            ok: true,
            message: 'Service registrado correctamente',
            service
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error registrando service' })
    }
}
exports.darDeBajaEquipo = async (req, res) => {
    try {
        const { equipoId, motivo } = req.body

        if (!equipoId) {
            return res.status(400).json({ error: 'ID de equipo requerido' })
        }

        if (!motivo) {
            return res.status(400).json({ error: 'Motivo de baja requerido' })
        }

        const equipo = await Equipo.findById(equipoId)

        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' })
        }

        if (equipo.estado === 'BAJA') {
            return res.status(400).json({ error: 'El equipo ya está dado de baja' })
        }

        equipo.estado = 'BAJA'
        equipo.motivoBaja = motivo
        equipo.fechaBaja = new Date()

        await equipo.save()

        res.json({ ok: true, equipo })
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Error al dar de baja el equipo' })
    }
}


/* ============================
   LISTAR HISTORIAL POR CÓDIGO
============================ */
exports.listarPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params

        const historial = await ServiceEquipo.find({ codigoIdentificacion: codigo })
            .populate({
                path: 'equipo',
                select: 'procesador ram disco ip hostname nombreApellido estado'
            })
            .sort({ fecha: -1 })

        res.json(historial)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error obteniendo historial' })
    }
}

/* ============================
   ÚLTIMO SERVICE DEL EQUIPO
============================ */
exports.ultimoService = async (req, res) => {
    try {
        const { codigo } = req.params

        const ultimo = await ServiceEquipo.findOne({ codigoIdentificacion: codigo })
            .populate({
                path: 'equipo',
                select: 'procesador ram disco ip hostname nombreApellido'
            })
            .sort({ fecha: -1 })

        res.json(ultimo)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error obteniendo último service' })
    }
}
